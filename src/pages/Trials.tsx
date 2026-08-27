import { useState, useEffect } from 'react'
import { Plus, X, Copy, Check } from 'lucide-react'
import { api } from '../api/client'
import type { TrialPass, Lead } from '../types'
import StatusBadge from '../components/StatusBadge'
import DataTable, { type Column } from '../components/DataTable'

const statusOptions = ['all', 'active', 'checked_in', 'completed', 'expired']

export default function Trials() {
  const [passes, setPasses] = useState<TrialPass[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [showIssue, setShowIssue] = useState(false)
  const [selectedPass, setSelectedPass] = useState<TrialPass | null>(null)
  const [copiedToken, setCopiedToken] = useState('')

  const fetchPasses = async () => {
    setLoading(true)
    try {
      const res = await api.getTrialPasses({ status: statusFilter })
      if (res.success) setPasses(res.trial_passes)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const fetchLeads = async () => {
    try {
      const res = await api.getLeads({})
      if (res.success) setLeads(res.leads)
    } catch (e) { console.error(e) }
  }

  useEffect(() => { fetchPasses() }, [statusFilter])

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(''), 2000)
  }

  const columns: Column<TrialPass>[] = [
    { key: 'member_name', header: 'Lead Name', sortable: true, render: (p) => <span className="font-medium text-slate-700 dark:text-slate-200">{p.member_name}</span> },
    { key: 'member_phone', header: 'Phone', sortable: true, render: (p) => <span className="text-slate-500 dark:text-slate-400">{p.member_phone}</span> },
    { key: 'qr_token', header: 'QR Token', render: (p) => (
      <button onClick={(e) => { e.stopPropagation(); copyToken(p.qr_token) }} className="font-mono text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
        {p.qr_token}{copiedToken === p.qr_token ? <Check size={12} /> : <Copy size={12} />}
      </button>
    )},
    { key: 'status', header: 'Status', sortable: true, render: (p) => <StatusBadge status={p.status} /> },
    { key: 'valid_until', header: 'Valid Until', sortable: true, sortValue: (p) => p.valid_until || '', render: (p) => <span className="text-slate-400 dark:text-slate-500">{p.valid_until?.split('T')[0]}</span> },
    { key: 'created_date', header: 'Issued', sortable: true, sortValue: (p) => p.created_date || '', render: (p) => <span className="text-slate-400 dark:text-slate-500">{p.created_date?.split('T')[0]}</span> },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Trial Engine</h2>
        <button onClick={() => { fetchLeads(); setShowIssue(true) }} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 transition-colors">
          <Plus size={16} /> Issue Trial Pass
        </button>
      </div>

      <div className="flex items-center gap-3">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400">
          {statusOptions.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <DataTable data={passes} columns={columns} loading={loading} emptyMessage='No trial passes issued yet. Click "Issue Trial Pass" to create one.' pageSize={15} onRowClick={setSelectedPass} />

      {showIssue && <IssuePassModal leads={leads} onClose={() => setShowIssue(false)} onIssued={() => { setShowIssue(false); fetchPasses() }} />}
      {selectedPass && <PassDetailDrawer pass={selectedPass} onClose={() => setSelectedPass(null)} />}
    </div>
  )
}

function IssuePassModal({ leads, onClose, onIssued }: { leads: Lead[]; onClose: () => void; onIssued: () => void }) {
  const [leadId, setLeadId] = useState('')
  const [visitPeriod, setVisitPeriod] = useState('morning')
  const [validityDays, setValidityDays] = useState(7)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leadId) { setError('Please select a lead'); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await api.createTrialPass(leadId, visitPeriod, validityDays)
      if (res.success) { setResult(res); setTimeout(onIssued, 3000) }
      else setError(res.error || 'Failed to issue trial pass')
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Unknown error") }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Issue Trial Pass</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        {result ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-700 dark:text-green-400 font-medium">Trial pass issued successfully!</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg space-y-2">
              <div className="text-sm text-slate-600 dark:text-slate-300"><span className="text-slate-400 dark:text-slate-500">QR Token:</span> <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{result.qr_token}</span></div>
              <div className="text-sm text-slate-600 dark:text-slate-300"><span className="text-slate-400 dark:text-slate-500">Status:</span> <span className="font-medium">{result.status}</span></div>
              <div className="text-sm text-slate-600 dark:text-slate-300"><span className="text-slate-400 dark:text-slate-500">Valid From:</span> {result.valid_from?.split('T')[0]}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300"><span className="text-slate-400 dark:text-slate-500">Valid Until:</span> {result.valid_until?.split('T')[0]}</div>
            </div>
            <div className="flex justify-center">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${result.qr_token}`} alt="QR Code" className="rounded-lg border border-slate-200 dark:border-slate-700" />
            </div>
          </div>
        ) : (
          <>
            {error && <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <select value={leadId} onChange={e => setLeadId(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400">
                <option value="">Select a lead...</option>
                {leads.map(l => <option key={l.id} value={l.id}>{l.name} — {l.phone}</option>)}
              </select>
              <select value={visitPeriod} onChange={e => setVisitPeriod(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400">
                <option value="morning">Morning</option><option value="afternoon">Afternoon</option><option value="evening">Evening</option><option value="weekend">Weekend</option>
              </select>
              <input type="number" min={1} max={30} value={validityDays} onChange={e => setValidityDays(Number(e.target.value))} placeholder="Validity (days)" className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400" />
              <button type="submit" disabled={submitting} className="w-full py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50 transition-colors">{submitting ? 'Issuing...' : 'Issue Trial Pass'}</button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

function PassDetailDrawer({ pass, onClose }: { pass: TrialPass; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 w-full max-w-md h-full overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{pass.member_name}</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="flex justify-center mb-4">
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${pass.qr_token}`} alt="QR Code" className="rounded-lg border border-slate-200 dark:border-slate-700" />
        </div>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div><span className="text-slate-400 dark:text-slate-500">Phone:</span> <span className="font-medium text-slate-700 dark:text-slate-200">{pass.member_phone}</span></div>
            <div><span className="text-slate-400 dark:text-slate-500">Status:</span> <StatusBadge status={pass.status} /></div>
            <div><span className="text-slate-400 dark:text-slate-500">Valid From:</span> <span className="text-slate-700 dark:text-slate-200">{pass.valid_from?.split('T')[0]}</span></div>
            <div><span className="text-slate-400 dark:text-slate-500">Valid Until:</span> <span className="text-slate-700 dark:text-slate-200">{pass.valid_until?.split('T')[0]}</span></div>
            <div><span className="text-slate-400 dark:text-slate-500">QR Token:</span> <span className="font-mono text-xs text-slate-700 dark:text-slate-200">{pass.qr_token}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
