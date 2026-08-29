import React, { useState, useRef } from 'react'
import {
  X,
  Upload,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Users
} from 'lucide-react'
import { api } from '../api/client'

export interface ParsedCsvMember {
  id: string
  name: string
  phone: string
  email: string
  membership_type: string
  join_date: string
  isValid: boolean
  error?: string
}

interface BulkUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function parseCsvContent(text: string): ParsedCsvMember[] {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0)
  if (lines.length < 2) return []

  const parseLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ''))
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim().replace(/^"|"$/g, ''))
    return result
  }

  const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, '_'))

  const nameIdx = headers.findIndex(h => h.includes('name'))
  const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('tel'))
  const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('mail'))
  const typeIdx = headers.findIndex(h => h.includes('type') || h.includes('status') || h.includes('plan') || h.includes('membership'))
  const dateIdx = headers.findIndex(h => h.includes('date') || h.includes('join'))

  const members: ParsedCsvMember[] = []

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i])
    if (cols.every(c => !c)) continue

    const name = nameIdx !== -1 ? cols[nameIdx] || '' : cols[0] || ''
    const phone = phoneIdx !== -1 ? cols[phoneIdx] || '' : cols[1] || ''
    const email = emailIdx !== -1 ? cols[emailIdx] || '' : (cols[2] || '')
    const membership_type = typeIdx !== -1 ? cols[typeIdx] || 'active' : (cols[3] || 'active')
    const join_date = dateIdx !== -1 ? cols[dateIdx] || new Date().toISOString().split('T')[0] : (cols[4] || new Date().toISOString().split('T')[0])

    let isValid = true
    let error = ''

    if (!name.trim()) {
      isValid = false
      error = 'Name is missing'
    } else if (!phone.trim()) {
      isValid = false
      error = 'Phone is missing'
    } else if (phone.replace(/[^0-9+]/g, '').length < 7) {
      isValid = false
      error = 'Invalid phone format'
    }

    members.push({
      id: `row-${i}-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      membership_type: (membership_type.trim().toLowerCase() || 'active'),
      join_date: join_date.trim() || new Date().toISOString().split('T')[0],
      isValid,
      error
    })
  }

  return members
}

export default function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'uploading' | 'summary'>('upload')
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState('')
  const [parsedMembers, setParsedMembers] = useState<ParsedCsvMember[]>([])
  const [parseError, setParseError] = useState('')

  // Progress & summary state
  const [progress, setProgress] = useState(0)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [results, setResults] = useState<{ success: number; failed: number; errors: { name: string; error: string }[] }>({
    success: 0,
    failed: 0,
    errors: []
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const resetModal = () => {
    setStep('upload')
    setDragActive(false)
    setFileName('')
    setParsedMembers([])
    setParseError('')
    setProgress(0)
    setCurrentIdx(0)
    setResults({ success: 0, failed: 0, errors: [] })
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const downloadTemplate = () => {
    const csvContent =
      'name,phone,email,membership_type,join_date\n' +
      'John Doe,+15551234567,john.doe@example.com,active,2026-01-15\n' +
      'Jane Smith,+15559876543,jane.smith@example.com,active,2026-02-01\n' +
      'Alex Johnson,+15554567890,alex.j@example.com,expiring,2026-03-10\n' +
      'Michael Brown,+15552345678,michael.b@example.com,frozen,2025-11-20\n'

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'gym_members_bulk_upload_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const processFile = (file: File) => {
    if (!file) return
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      setParseError('Please upload a valid CSV file (.csv)')
      return
    }

    setFileName(file.name)
    setParseError('')

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const members = parseCsvContent(text)
        if (members.length === 0) {
          setParseError('The uploaded CSV is empty or has no data rows after the header.')
          return
        }
        setParsedMembers(members)
        setStep('preview')
      } catch (err) {
        setParseError('Failed to parse CSV file. Please check the file formatting.')
      }
    }
    reader.readAsText(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const validMembers = parsedMembers.filter(m => m.isValid)

  const startUpload = async () => {
    if (validMembers.length === 0) return

    setStep('uploading')
    setProgress(0)
    setCurrentIdx(0)

    let successCount = 0
    let failedCount = 0
    const uploadErrors: { name: string; error: string }[] = []

    for (let i = 0; i < validMembers.length; i++) {
      const member = validMembers[i]
      setCurrentIdx(i + 1)
      setProgress(Math.round(((i + 1) / validMembers.length) * 100))

      try {
        await api.addMember({
          name: member.name,
          phone: member.phone,
          email: member.email,
          membership_status: member.membership_type || 'active',
          joined_date: member.join_date,
          created_date: new Date().toISOString()
        })
        successCount++
      } catch (err: any) {
        failedCount++
        uploadErrors.push({
          name: member.name,
          error: err?.message || 'Failed to import member record'
        })
      }
    }

    setResults({
      success: successCount,
      failed: failedCount,
      errors: uploadErrors
    })

    setStep('summary')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Bulk Member CSV Upload</h2>
              <p className="text-xs text-slate-400 mt-0.5">Import multiple gym members from a CSV file</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Content based on step */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: UPLOAD / DRAG & DROP */}
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Template Banner */}
              <div className="flex items-center justify-between p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-3">
                  <FileText className="text-emerald-400" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Need the standard CSV format?</p>
                    <p className="text-xs text-slate-400">Download our sample template with required headers</p>
                  </div>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <Download size={14} /> Download Template
                </button>
              </div>

              {/* Drag and drop zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                  dragActive
                    ? 'border-emerald-500 bg-emerald-500/10 scale-[0.99]'
                    : 'border-slate-700/80 hover:border-emerald-500/50 bg-slate-800/40 hover:bg-slate-800/80'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv,application/vnd.ms-excel"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-inner">
                  <Upload size={28} />
                </div>
                <p className="text-base font-medium text-slate-200">
                  <span className="text-emerald-400 font-semibold">Click to upload</span> or drag and drop CSV file here
                </p>
                <p className="text-xs text-slate-400 mt-1.5">
                  Supported format: <code className="text-emerald-300 bg-slate-900 px-1.5 py-0.5 rounded">.csv</code> (Columns: name, phone, email, membership_type, join_date)
                </p>
              </div>

              {parseError && (
                <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PREVIEW TABLE */}
          {step === 'preview' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="text-emerald-400" size={18} />
                  <span className="text-sm font-medium text-slate-200">File: <span className="text-white font-semibold">{fileName}</span></span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md border border-slate-700">Total: {parsedMembers.length}</span>
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-md font-medium">Valid: {validMembers.length}</span>
                  {parsedMembers.length - validMembers.length > 0 && (
                    <span className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-md font-medium">
                      Invalid: {parsedMembers.length - validMembers.length}
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/80">
                <div className="max-h-[320px] overflow-y-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="sticky top-0 bg-slate-800 text-slate-300 uppercase font-semibold tracking-wider text-[11px] border-b border-slate-700/80">
                      <tr>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Join Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {parsedMembers.map((m) => (
                        <tr key={m.id} className={m.isValid ? 'hover:bg-slate-800/40' : 'bg-red-950/20 hover:bg-red-950/30'}>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            {m.isValid ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                                <CheckCircle2 size={14} /> Ready
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-400 font-medium" title={m.error}>
                                <AlertCircle size={14} /> {m.error}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 font-semibold text-white">{m.name || '—'}</td>
                          <td className="px-4 py-2.5 text-slate-300 font-mono">{m.phone || '—'}</td>
                          <td className="px-4 py-2.5 text-slate-400">{m.email || '—'}</td>
                          <td className="px-4 py-2.5">
                            <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 capitalize">
                              {m.membership_type}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-slate-400">{m.join_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: UPLOADING PROGRESS */}
          {step === 'uploading' && (
            <div className="py-12 space-y-6 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto animate-pulse">
                <Loader2 size={36} className="animate-spin" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Importing Members...</h3>
                <p className="text-xs text-slate-400 mt-1">Processing row {currentIdx} of {validMembers.length}</p>
              </div>

              {/* Progress bar */}
              <div className="max-w-md mx-auto space-y-2">
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700 p-0.5">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs font-semibold text-emerald-400">{progress}% Completed</p>
              </div>
            </div>
          )}

          {/* STEP 4: SUMMARY */}
          {step === 'summary' && (
            <div className="space-y-6 py-2">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">Import Completed</h3>
                <p className="text-xs text-slate-400">Bulk upload process finished</p>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-center">
                  <p className="text-xs text-emerald-400 font-medium">Successfully Imported</p>
                  <p className="text-3xl font-extrabold text-emerald-400 mt-1">{results.success}</p>
                </div>
                <div className={`p-4 rounded-xl text-center border ${
                  results.failed > 0
                    ? 'bg-red-950/30 border-red-800/40'
                    : 'bg-slate-800/40 border-slate-800'
                }`}>
                  <p className="text-xs text-slate-400 font-medium">Failed / Skipped</p>
                  <p className={`text-3xl font-extrabold mt-1 ${results.failed > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                    {results.failed}
                  </p>
                </div>
              </div>

              {/* Errors list if any */}
              {results.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-red-400">Failed Records:</p>
                  <div className="max-h-36 overflow-y-auto border border-red-900/40 bg-red-950/20 rounded-xl p-3 space-y-1.5 text-xs text-red-300">
                    {results.errors.map((err, idx) => (
                      <div key={idx} className="flex justify-between items-center py-0.5">
                        <span className="font-semibold">{err.name}</span>
                        <span className="text-red-400">{err.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          {step === 'upload' && (
            <div className="flex justify-end w-full gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {step === 'preview' && (
            <>
              <button
                onClick={() => setStep('upload')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <RefreshCw size={14} /> Choose Different File
              </button>
              <button
                onClick={startUpload}
                disabled={validMembers.length === 0}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/30"
              >
                <Upload size={14} /> Confirm & Upload {validMembers.length} Members
              </button>
            </>
          )}

          {step === 'summary' && (
            <div className="flex justify-end w-full">
              <button
                onClick={() => {
                  onSuccess()
                  handleClose()
                }}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-900/30"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
