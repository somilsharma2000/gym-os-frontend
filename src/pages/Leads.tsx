import { useState, useEffect } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { api } from '../api/client'
import type { Lead } from '../types'
import StatusBadge from '../components/StatusBadge'
import DataTable, { type Column } from '../components/DataTable'

const statusOptions = ['all', 'new', 'contacted', 'trial_booked', 'trial_checked_in', 'trial_completed', 'follow_up', 'joined', 'lost']
const sourceOptions = ['all', 'website', 'website_trial', 'walk_in', 'referral', 'social_media', 'phone']

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const res = await api.getLeads({ status: statusFilter, source: sourceFilter, search })
      if (res.success) setLeads(res.leads || [])
      else setError(res.error)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error")
    }
    setLoading(false)
  }

  useEffect(() => {
    const debounce = setTimeout(fetchLeads, 300)
    return () => clearTimeout(debounce)
  }, [search, statusFilter, sourceFilter])

  const columns: Column<Lead>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (lead) => <span className="font-medium text-slate-700 dark:text-slate-200">{lead.name}</span>,
    },
    {
      key: 'phone',
      header: 'Phone',
      sortable: true,
      render: (lead) => <span className="text-slate-500 dark:text-slate-400">{lead.phone}</span>,
    },
    {
      key: 'source',
      header: 'Source',
      sortable: true,
      render: (lead) => <span className="text-slate-500 dark:text-slate-400">{lead.source}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (lead) => <StatusBadge status={lead.status} />,
    },
    {
      key: 'preferred_visit_period',
      header: 'Visit Period',
      render: (lead) => <span className="text-slate-500 dark:text-slate-400 capitalize">{lead.preferred_visit_period || '—'}</span>,
    },
    {
      key: 'created_date',
      header: 'Created',
      sortable: true,
      sortValue: (lead) => lead.created_date || '',
      render: (lead) => <span className="text-slate-400 dark:text-slate-500">{lead.created_date?.split('T')[0]}</span>,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Lead CRM</h2>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 transition-colors">
          <Plus size={16} /> Create Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400">
          {statusOptions.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400">
          {sourceOptions.map(s => <option key={s} value={s}>{s === 'all' ? 'All Sources' : s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <DataTable
        data={leads}
        columns={columns}
        loading={loading}
        error={error}
        emptyMessage="No leads found. Create your first lead to get started."
        pageSize={15}
        onRowClick={setSelectedLead}
      />

      {/* Create Lead Modal */}
      {showCreate && <CreateLeadModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchLeads() }} />}

      {/* Lead Detail Drawer */}
      {selectedLead && <LeadDetailDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />}
    </div>
  )
}

function CreateLeadModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', fitness_goal: '', source: 'website', preferred_visit_period: 'morning', consent: false })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.consent) { setError('Consent is required to create a lead'); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await api.createLead({
        name: form.name,
        phone: form.phone,
        email: form.email,
        fitness_goal: form.fitness_goal,
        source: form.source,
        preferred_visit_period: form.preferred_visit_period,
        consent_status: 'granted'
      })
      if (res.success) {
        setSuccess('Lead created successfully!')
        const t = setTimeout(onCreated, 1000); return () => clearTimeout(t)
      } else if (res.duplicate) {
        setError(`Duplicate: ${res.message} — Existing lead: ${res.existing_lead_name} (${res.existing_lead_status})`)
      } else {
        setError(res.error || 'Failed to create lead')
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error")
    }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Create Lead</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        {error && <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">{error}</div>}
        {success && <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm text-green-600 dark:text-green-400">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required placeholder="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400" />
          <input required placeholder="Phone *" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400" />
          <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400" />
          <input placeholder="Fitness Goal" value={form.fitness_goal} onChange={e => setForm({ ...form, fitness_goal: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400" />
          <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400">
            <option value="website">Website</option>
            <option value="walk_in">Walk-in</option>
            <option value="referral">Referral</option>
            <option value="social_media">Social Media</option>
            <option value="phone">Phone</option>
          </select>
          <select value={form.preferred_visit_period} onChange={e => setForm({ ...form, preferred_visit_period: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400">
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
            <option value="weekend">Weekend</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.consent} onChange={e => setForm({ ...form, consent: e.target.checked })} className="rounded" />
            <span className="text-slate-600 dark:text-slate-400">I consent to be contacted about gym services</span>
          </label>
          <button type="submit" disabled={submitting} className="w-full py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50 transition-colors">
            {submitting ? 'Creating...' : 'Create Lead'}
          </button>
        </form>
      </div>
    </div>
  )
}

function LeadDetailDrawer({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 w-full max-w-md h-full overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{lead.name}</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-400 dark:text-slate-500">Phone:</span> <span className="font-medium text-slate-700 dark:text-slate-200">{lead.phone}</span></div>
            <div><span className="text-slate-400 dark:text-slate-500">Email:</span> <span className="font-medium text-slate-700 dark:text-slate-200">{lead.email || '—'}</span></div>
            <div><span className="text-slate-400 dark:text-slate-500">Source:</span> <span className="font-medium text-slate-700 dark:text-slate-200">{lead.source}</span></div>
            <div><span className="text-slate-400 dark:text-slate-500">Status:</span> <StatusBadge status={lead.status} /></div>
            <div><span className="text-slate-400 dark:text-slate-500">Fitness Goal:</span> <span className="font-medium text-slate-700 dark:text-slate-200">{lead.fitness_goal || '—'}</span></div>
            <div><span className="text-slate-400 dark:text-slate-500">Visit Period:</span> <span className="font-medium text-slate-700 dark:text-slate-200 capitalize">{lead.preferred_visit_period || '—'}</span></div>
            <div><span className="text-slate-400 dark:text-slate-500">Created:</span> <span className="font-medium text-slate-700 dark:text-slate-200">{lead.created_date?.split('T')[0]}</span></div>
          </div>
          {lead.notes && (
            <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-md text-sm">
              <p className="text-slate-400 dark:text-slate-500 mb-1">Notes</p>
              <p className="text-slate-700 dark:text-slate-200">{lead.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
