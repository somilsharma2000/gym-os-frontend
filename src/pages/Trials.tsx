import { useState, useEffect } from 'react'
import { Plus, X, Copy, Check, Clock, AlertCircle, UserCheck, Zap } from 'lucide-react'
import { api } from '../api/client'
import type { TrialPass, Lead } from '../types'
import StatusBadge from '../components/StatusBadge'
import DataTable, { type Column } from '../components/DataTable'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://base44.app/api/apps/6a8949954092729194579577/functions'

const statusOptions = ['all', 'active', 'checked_in', 'completed', 'expired']

export default function Trials() {
  const [passes, setPasses] = useState<TrialPass[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [showIssue, setShowIssue] = useState(false)
  const [selectedPass, setSelectedPass] = useState<TrialPass | null>(null)
  const [copiedToken, setCopiedToken] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchPasses = async () => {
    setLoading(true)
    try {
      const res = await api.getTrialPasses({ status: statusFilter })
      if (res.success) setPasses(res.trial_passes || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const fetchLeads = async () => {
    try {
      const res = await api.getLeads({})
      if (res.success) setLeads(res.leads || [])
    } catch (e) { console.error(e) }
  }

  useEffect(() => { fetchPasses() }, [statusFilter])

  // Real-time sync: poll every 30 seconds for fresh trial data
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      fetchPasses()
    }, 30000)
    return () => clearInterval(interval)
  }, [autoRefresh, statusFilter])

  // Check for expired trials (48hr logic)
  const now = new Date()
  const activeTrials = passes.filter(p => p.status === 'active')
  const expiredCount = passes.filter(p => {
    if (p.status !== 'active') return false
    if (!p.valid_until) return false
    return new Date(p.valid_until) < now
  }).length
  const checkedInCount = passes.filter(p => p.status === 'checked_in').length
  const completedCount = passes.filter(p => p.status === 'completed').length

  // Calculate 48hr trial stats
  const last48hrTrials = passes.filter(p => {
    if (!p.created_date) return false
    const created = new Date(p.created_date)
    const hoursAgo = (now.getTime() - created.getTime()) / (1000 * 60 * 60)
    return hoursAgo <= 48
  }).length

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
    { key: 'status', header: 'Status', sortable: true, render: (p) => {
      // Dynamic status check for 48hr expiry
      let displayStatus = p.status
      if (p.status === 'active' && p.valid_until) {
        const expiry = new Date(p.valid_until)
        const hoursLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60))
        if (hoursLeft <= 0) displayStatus = 'expired'
        else if (hoursLeft <= 12) displayStatus = 'expiring'
      }
      return <StatusBadge status={displayStatus} />
    }},
    { key: 'valid_until', header: 'Valid Until', sortable: true, sortValue: (p) => p.valid_until || '', render: (p) => {
      if (!p.valid_until) return <span className="text-slate-400">—</span>
      const expiry = new Date(p.valid_until)
      const hoursLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60))
      const isExpired = hoursLeft <= 0
      const isExpiring = hoursLeft > 0 && hoursLeft <= 12
      return (
        <div>
          <span className={isExpired ? 'text-red-500' : isExpiring ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}>
            {p.valid_until?.split('T')[0]}
          </span>
          {!isExpired && isExpiring && (
            <span className="text-xs text-amber-500 ml-1">({hoursLeft}h left)</span>
          )}
        </div>
      )
    }},
    { key: 'created_date', header: 'Issued', sortable: true, sortValue: (p) => p.created_date || '', render: (p) => <span className="text-slate-400 dark:text-slate-500">{p.created_date?.split('T')[0]}</span> },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Trial Engine</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">48-hour trial passes with real-time expiry tracking and QR check-in.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${autoRefresh ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}
          >
            {autoRefresh ? 'Auto-sync ON' : 'Auto-sync OFF'}
          </button>
          <button onClick={() => { fetchLeads(); setShowIssue(true) }} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 transition-colors">
            <Plus size={16} /> Issue Trial Pass
          </button>
        </div>
      </div>

      {/* 48hr Trial Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2"><Zap size={16} className="text-brand-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Last 48hr Issued</span></div>
          <p className="text-2xl font-bold text-brand-600">{last48hrTrials}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2"><Clock size={16} className="text-green-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Active</span></div>
          <p className="text-2xl font-bold text-green-600">{activeTrials.length - expiredCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2"><UserCheck size={16} className="text-blue-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Checked In</span></div>
          <p className="text-2xl font-bold text-blue-600">{checkedInCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2"><Check size={16} className="text-brand-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Completed</span></div>
          <p className="text-2xl font-bold text-brand-600">{completedCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2"><AlertCircle size={16} className="text-red-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Expired</span></div>
          <p className="text-2xl font-bold text-red-600">{expiredCount}</p>
        </div>
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
  const [validityDays, setValidityDays] = useState(2) // Default 48hr = 2 days
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leadId) { setError('Please select a lead'); return }
    setSubmitting(true)
    setError('')
    try {
      // Force 48hr = 2 days default for member trials
      const res = await api.createTrialPass(leadId, visitPeriod, validityDays)
      if (res.success) { setResult(res); const t = setTimeout(onIssued, 3000); return () => clearTimeout(t) }
      else setError(res.error || 'Failed to issue trial pass')
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Unknown error") }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Issue Trial Pass</h3>
            <p className="text-xs text-slate-500 mt-0.5">48-hour trial pass with QR check-in</p>
          </div>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        {result ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-700 dark:text-green-400 font-medium">Trial pass issued successfully!</p>
              <p className="text-xs text-green-600 dark:text-green-500 mt-1">Valid for {validityDays} day(s) from issue date</p>
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
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Validity (days) — Default: 2 days (48hr)</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={1} max={14} value={validityDays} onChange={e => setValidityDays(Number(e.target.value))} className="flex-1" />
                  <span className="text-sm font-medium text-brand-600 min-w-[80px]">{validityDays} day(s) ({validityDays * 24}hr)</span>
                </div>
              </div>
              <button type="submit" disabled={submitting} className="w-full py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50 transition-colors">{submitting ? 'Issuing...' : 'Issue Trial Pass'}</button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

function PassDetailDrawer({ pass, onClose }: { pass: TrialPass; onClose: () => void }) {
  const now = new Date()
  const expiry = pass.valid_until ? new Date(pass.valid_until) : null
  const hoursLeft = expiry ? Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60)) : null
  const isExpired = hoursLeft !== null && hoursLeft <= 0
  const isExpiring = hoursLeft !== null && hoursLeft > 0 && hoursLeft <= 12

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
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
              <div className="text-xs text-slate-400">Status</div>
              <StatusBadge status={isExpired ? 'expired' : pass.status} />
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
              <div className="text-xs text-slate-400">Time Left</div>
              <div className={`font-medium ${isExpired ? 'text-red-500' : isExpiring ? 'text-amber-500' : 'text-green-500'}`}>
                {isExpired ? 'Expired' : hoursLeft !== null ? `${hoursLeft}h left` : '—'}
              </div>
            </div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
            <div className="text-xs text-slate-400 mb-1">QR Token</div>
            <div className="font-mono text-sm text-brand-600 dark:text-brand-400">{pass.qr_token}</div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
            <div className="text-xs text-slate-400 mb-1">Phone</div>
            <div className="text-slate-600 dark:text-slate-300">{pass.member_phone}</div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
            <div className="text-xs text-slate-400 mb-1">Valid Period</div>
            <div className="text-slate-600 dark:text-slate-300">{pass.valid_from?.split('T')[0]} → {pass.valid_until?.split('T')[0]}</div>
          </div>
        </div>
      </div>
    </div>
  )
}