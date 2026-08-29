import { useState, useEffect } from 'react'
import { Plus, X, Loader, Phone, MessageCircle, Mail, Instagram, Facebook, Globe, Users as UsersIcon, FileSpreadsheet, Zap, Check, Calendar, TrendingUp, Star, Download } from 'lucide-react'
import { api } from '../api/client'
import { exportToCSV } from '../utils/csvExport'
import StatusBadge from '../components/StatusBadge'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://base44.app/api/apps/6a8949954092729194579577/functions'

const sourceConfig: Record<string, { icon: any; color: string; label: string }> = {
  instagram: { icon: Instagram, color: 'text-pink-600 bg-pink-50 dark:bg-pink-900/30', label: 'Instagram' },
  facebook: { icon: Facebook, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30', label: 'Facebook' },
  whatsapp: { icon: MessageCircle, color: 'text-green-600 bg-green-50 dark:bg-green-900/30', label: 'WhatsApp' },
  website: { icon: Globe, color: 'text-brand-600 bg-brand-50 dark:bg-brand-900/30', label: 'Website' },
  walk_in: { icon: UsersIcon, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30', label: 'Walk-in' },
  phone: { icon: Phone, color: 'text-slate-600 bg-slate-50 dark:bg-slate-700/30', label: 'Phone' },
  referral: { icon: UsersIcon, color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/30', label: 'Referral' },
  google_ads: { icon: TrendingUp, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30', label: 'Google Ads' },
  spreadsheet: { icon: FileSpreadsheet, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30', label: 'Spreadsheet' },
  other: { icon: Zap, color: 'text-slate-600 bg-slate-50 dark:bg-slate-700/30', label: 'Other' },
}

export default function Leads() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [filter, setFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const res = await api.getLeads({})
      if (res.success) setLeads(res.leads || [])
    } catch (e) { /* silent */ }
    setLoading(false)
  }

  useEffect(() => { fetchLeads() }, [])

  const filtered = leads.filter(l => {
    const matchSearch = (l.name || '').toLowerCase().includes(search.toLowerCase()) || (l.phone || '').includes(search)
    const matchStatus = filter === 'all' || l.status === filter
    const matchSource = sourceFilter === 'all' || l.source === sourceFilter
    return matchSearch && matchStatus && matchSource
  })

  // Lead stats by source
  const sourceStats = Object.keys(sourceConfig).map(key => ({
    key,
    label: sourceConfig[key].label,
    count: leads.filter(l => l.source === key).length
  })).filter(s => s.count > 0)

  const statusCounts = {
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    trial: leads.filter(l => l.status === 'trial' || l.status === 'trial_scheduled').length,
    won: leads.filter(l => l.status === 'won' || l.status === 'converted').length,
    lost: leads.filter(l => l.status === 'lost').length,
  }

  const cardCls = "bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4"

  const handleQuickAction = async (lead: any, action: string) => {
    if (action === 'call') window.open(`tel:${lead.phone}`)
    if (action === 'whatsapp') {
      const phone = (lead.phone || '').replace(/[^0-9]/g, '')
      const msg = `Hi ${lead.name}, thanks for your interest in our gym! How can we help you achieve your fitness goals?`
      if (phone) await api.sendWhatsApp(phone, msg)
    }
    if (action === 'email' && lead.email) window.open(`mailto:${lead.email}`)
  }

  const updateLeadStatus = async (leadId: string, status: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Lead CRM</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Multi-source lead aggregation with real-time tracking.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowImport(true)} className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5">
            <FileSpreadsheet size={14} /> Import
          </button>
          <button onClick={() => exportToCSV('leads.csv', ['Name', 'Phone', 'Email', 'Source', 'Status', 'Interest', 'Fitness Goal', 'Date', 'Notes'], leads.map(l => [l.name || '', l.phone || '', l.email || '', l.source || '', l.status || '', l.interest || '', l.fitness_goal || '', l.created_date || '', l.notes || '']))} className="px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5 mr-2">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => setShowAdd(true)} className="px-3 py-1.5 text-sm text-white bg-brand-600 rounded-md hover:bg-brand-700 transition-colors flex items-center gap-1.5">
            <Plus size={14} /> Add Lead
          </button>
        </div>
      </div>

      {/* Lead funnel stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className={cardCls}><div className="flex items-center gap-2 mb-2"><Star size={16} className="text-blue-600" /><span className="text-xs text-slate-500">New</span></div><p className="text-2xl font-bold text-blue-600">{statusCounts.new}</p></div>
        <div className={cardCls}><div className="flex items-center gap-2 mb-2"><Phone size={16} className="text-amber-600" /><span className="text-xs text-slate-500">Contacted</span></div><p className="text-2xl font-bold text-amber-600">{statusCounts.contacted}</p></div>
        <div className={cardCls}><div className="flex items-center gap-2 mb-2"><Calendar size={16} className="text-purple-600" /><span className="text-xs text-slate-500">Trial</span></div><p className="text-2xl font-bold text-purple-600">{statusCounts.trial}</p></div>
        <div className={cardCls}><div className="flex items-center gap-2 mb-2"><Check size={16} className="text-green-600" /><span className="text-xs text-slate-500">Won</span></div><p className="text-2xl font-bold text-green-600">{statusCounts.won}</p></div>
        <div className={cardCls}><div className="flex items-center gap-2 mb-2"><X size={16} className="text-red-600" /><span className="text-xs text-slate-500">Lost</span></div><p className="text-2xl font-bold text-red-600">{statusCounts.lost}</p></div>
      </div>

      {/* Source breakdown */}
      {sourceStats.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Lead Sources</h3>
          <div className="flex flex-wrap gap-2">
            {sourceStats.map(s => {
              const cfg = sourceConfig[s.key]
              const Icon = cfg.icon
              return (
                <div key={s.key} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${cfg.color} text-xs`}>
                  <Icon size={14} /> <span className="font-medium">{cfg.label}</span> <span className="opacity-60">{s.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <input type="text" placeholder="Search name or phone..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:border-brand-400" />
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md">
          <option value="all">All Status</option>
          <option value="new">New</option><option value="contacted">Contacted</option><option value="trial">Trial</option><option value="won">Won</option><option value="lost">Lost</option>
        </select>
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md">
          <option value="all">All Sources</option>
          {Object.entries(sourceConfig).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
        </select>
      </div>

      {/* Leads table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-slate-400">No leads found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Name</th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Phone</th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Source</th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Interest</th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Follow-up</th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {filtered.map(l => {
                  const srcCfg = sourceConfig[l.source || 'other'] || sourceConfig.other
                  const SrcIcon = srcCfg.icon
                  return (
                    <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-200">{l.name}</td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{l.phone}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${srcCfg.color}`}>
                          <SrcIcon size={11} /> {srcCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{l.interest || l.fitness_goal || '\u2014'}</td>
                      <td className="px-4 py-2.5">
                        <select value={l.status || 'new'} onChange={e => updateLeadStatus(l.id, e.target.value)}
                          className="text-xs px-2 py-1 border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-900">
                          <option value="new">New</option><option value="contacted">Contacted</option><option value="trial">Trial</option><option value="won">Won</option><option value="lost">Lost</option>
                        </select>
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 text-xs">{l.next_follow_up_date || '\u2014'}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleQuickAction(l, 'call')} className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded hover:bg-blue-100" title="Call"><Phone size={13} /></button>
                          <button onClick={() => handleQuickAction(l, 'whatsapp')} className="p-1.5 bg-green-50 dark:bg-green-900/30 text-green-600 rounded hover:bg-green-100" title="WhatsApp"><MessageCircle size={13} /></button>
                          {l.email && <button onClick={() => handleQuickAction(l, 'email')} className="p-1.5 bg-slate-50 dark:bg-slate-700/30 text-slate-600 rounded hover:bg-slate-100" title="Email"><Mail size={13} /></button>}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {showAdd && (
        <AddLeadModal
          onClose={() => setShowAdd(false)}
          onAdded={() => { setShowAdd(false); fetchLeads() }}
        />
      )}

      {/* Import Modal */}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImported={() => { setShowImport(false); fetchLeads() }}
        />
      )}
    </div>
  )
}

function AddLeadModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [source, setSource] = useState('walk_in')
  const [interest, setInterest] = useState('')
  const [fitnessGoal, setFitnessGoal] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone) { setError('Name and phone are required'); return }
    if (!consent) { setError('Consent is required to add a lead (GDPR compliance)'); return }
    setSubmitting(true)
    try {
      const gymId = localStorage.getItem('gym_os_gym_id') || 'gym_oxigen'
      const res = await fetch(`${API_BASE}/createLeadWithConsent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gym_id: gymId, name, phone, email, source, interest, fitness_goal: fitnessGoal, notes, status: 'new', consent_status: 'granted' })
      })
      const data = await res.json()
      if (data.success) onAdded()
      else setError(data.error || 'Failed to add lead')
    } catch (e) { setError('Network error') }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Lead</h3>
          <button onClick={onClose} className="text-slate-400"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded text-sm text-red-600">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Name *" value={name} onChange={e => setName(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md" />
            <input type="text" placeholder="Phone *" value={phone} onChange={e => setPhone(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md" />
            <select value={source} onChange={e => setSource(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md">
              {Object.entries(sourceConfig).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Interest" value={interest} onChange={e => setInterest(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md" />
            <input type="text" placeholder="Fitness Goal" value={fitnessGoal} onChange={e => setFitnessGoal(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md" />
          </div>
          <textarea placeholder="Notes..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md resize-none" />
          <label className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5" required />
            <span>I consent to having this contact information collected and stored by this gym for follow-up communication, in accordance with the gym's privacy policy (GDPR/CCPA compliant).</span>
          </label>
          <button type="submit" disabled={submitting} className="w-full py-2.5 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50">
            {submitting ? 'Adding...' : 'Add Lead'}
          </button>
        </form>
      </div>
    </div>
  )
}

function ImportModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [csvText, setCsvText] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ added: number; failed: number } | null>(null)

  const handleImport = async () => {
    if (!csvText.trim()) return
    setImporting(true)
    const lines = csvText.trim().split('\n')
    let added = 0, failed = 0
    const gymId = localStorage.getItem('gym_os_gym_id') || 'gym_oxigen'
    
    for (const line of lines) {
      const [name, phone, email, source, interest] = line.split(',').map(s => s.trim())
      if (!name || !phone) { failed++; continue }
      try {
        const res = await fetch(`${API_BASE}/createLead`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gym_id: gymId, name, phone, email: email || '', source: source || 'spreadsheet', interest: interest || '', status: 'new' })
        })
        const data = await res.json()
        if (data.success) added++; else failed++
      } catch { failed++ }
    }
    setResult({ added, failed })
    setImporting(false)
    if (added > 0) setTimeout(onImported, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Import Leads from Spreadsheet</h3>
          <button onClick={onClose} className="text-slate-400"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          {result ? (
            <div className="text-center py-4">
              <Check size={32} className="mx-auto text-green-600 mb-2" />
              <p className="text-sm font-medium text-slate-700">Imported {result.added} leads{result.failed > 0 ? `, ${result.failed} failed` : ''}</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400">Paste CSV data from your spreadsheet. Format: <span className="font-mono text-xs">name, phone, email, source, interest</span></p>
              <textarea value={csvText} onChange={e => setCsvText(e.target.value)} rows={6} placeholder="John Doe, 9876543210, john@email.com, walk_in, Weight Loss&#10;Jane Smith, 9876543211, , instagram, Muscle Building"
                className="w-full px-3 py-2 text-sm font-mono border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md resize-none" />
              <button onClick={handleImport} disabled={importing || !csvText.trim()}
                className="w-full py-2.5 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {importing ? <Loader size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />} Import Leads
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}