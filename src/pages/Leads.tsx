import { useState, useEffect } from 'react'
import {
  Plus,
  X,
  Loader,
  Phone,
  MessageCircle,
  Mail,
  Instagram,
  Facebook,
  Globe,
  Users as UsersIcon,
  FileSpreadsheet,
  Zap,
  Check,
  Calendar,
  TrendingUp,
  Star,
  Download,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  Target,
  LayoutGrid,
  List
} from 'lucide-react'
import { api } from '../api/client'
import { exportToCSV } from '../utils/csvExport'
import StatusBadge from '../components/StatusBadge'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://base44.app/api/apps/6a8949954092729194579577/functions'

const sourceConfig: Record<string, { icon: any; color: string; label: string }> = {
  instagram: { icon: Instagram, color: 'text-brand-600 bg-brand-50 dark:bg-brand-900/30', label: 'Instagram' },
  facebook: { icon: Facebook, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30', label: 'Facebook' },
  whatsapp: { icon: MessageCircle, color: 'text-green-600 bg-green-50 dark:bg-green-900/30', label: 'WhatsApp' },
  website: { icon: Globe, color: 'text-brand-600 bg-brand-50 dark:bg-brand-900/30', label: 'Website' },
  walk_in: { icon: UsersIcon, color: 'text-brand-600 bg-brand-50 dark:bg-brand-900/30', label: 'Walk-in' },
  phone: { icon: Phone, color: 'text-slate-600 bg-slate-50 dark:bg-slate-700/30', label: 'Phone' },
  referral: { icon: UsersIcon, color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/30', label: 'Referral' },
  google_ads: { icon: TrendingUp, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30', label: 'Google Ads' },
  spreadsheet: { icon: FileSpreadsheet, color: 'text-brand-600 bg-brand-50 dark:bg-brand-900/30', label: 'Spreadsheet' },
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
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')

  // Carousel index for mobile slider
  const [carouselIndex, setCarouselIndex] = useState(0)

  // Modals state
  const [selectedLead, setSelectedLead] = useState<any | null>(null)
  const [followUpLead, setFollowUpLead] = useState<any | null>(null)
  const [convertLead, setConvertLead] = useState<any | null>(null)
  const [actionResult, setActionResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const res = await api.getLeads({})
      if (res.success) setLeads(res.leads || [])
    } catch { /* silent */ }
    setLoading(false)
  }

  useEffect(() => { fetchLeads() }, [])

  const filtered = leads.filter(l => {
    const q = search.toLowerCase()
    const matchSearch = (l.name || '').toLowerCase().includes(q) ||
                        (l.phone || '').includes(q) ||
                        (l.email || '').toLowerCase().includes(q)
    const matchStatus = filter === 'all' || l.status === filter
    const matchSource = sourceFilter === 'all' || l.source === sourceFilter
    return matchSearch && matchStatus && matchSource
  })

  // Keep carousel index in bounds when filtering
  useEffect(() => {
    if (carouselIndex >= filtered.length && filtered.length > 0) {
      setCarouselIndex(filtered.length - 1)
    }
  }, [filtered.length, carouselIndex])

  const sourceStats = Object.keys(sourceConfig).map(key => ({
    key,
    label: sourceConfig[key].label,
    count: leads.filter(l => l.source === key).length
  })).filter(s => s.count > 0)

  const statusCounts = {
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted' || l.status === 'follow_up').length,
    trial: leads.filter(l => l.status === 'trial' || l.status === 'trial_scheduled').length,
    won: leads.filter(l => l.status === 'won' || l.status === 'converted').length,
    lost: leads.filter(l => l.status === 'lost').length,
  }

  const cardCls = "bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm transition-colors"

  const handleQuickAction = async (lead: any, action: string) => {
    if (action === 'call') window.open(`tel:${lead.phone}`)
    if (action === 'whatsapp') {
      const phone = (lead.phone || '').replace(/[^0-9]/g, '')
      const msg = `Hi ${lead.name}, thanks for reaching out to Gym OS! How can we help you reach your fitness goals?`
      if (phone) window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
    }
    if (action === 'followup') setFollowUpLead(lead)
    if (action === 'convert') setConvertLead(lead)
  }

  const updateLeadStatus = async (leadId: string, status: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l))
    try {
      await api.updateLeadStatus(leadId, status)
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Lead CRM</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Multi-source lead aggregation, automated follow-ups, and conversion tracking.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowImport(true)} className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors">
            <FileSpreadsheet size={14} /> Import
          </button>
          <button onClick={() => exportToCSV('leads.csv', ['Name', 'Phone', 'Email', 'Source', 'Status', 'Interest', 'Fitness Goal', 'Follow-Up', 'Date', 'Notes'], leads.map(l => [l.name || '', l.phone || '', l.email || '', l.source || '', l.status || '', l.interest || '', l.fitness_goal || '', l.next_follow_up_date || '', l.created_date || '', l.notes || '']))} className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5">
            <Download size={14} /> Export
          </button>
          <button onClick={() => setShowAdd(true)} className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm">
            <Plus size={14} /> Add Lead
          </button>
        </div>
      </div>

      {/* Result Alert Toast */}
      {actionResult && (
        <div className={`p-3 rounded-xl flex items-center justify-between text-sm ${actionResult.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'}`}>
          <span>{actionResult.text}</span>
          <button onClick={() => setActionResult(null)}><X size={14} /></button>
        </div>
      )}

      {/* Lead funnel stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        <div className={cardCls}><div className="flex items-center gap-2 mb-1.5"><Star size={16} className="text-blue-600" /><span className="text-xs font-semibold text-slate-500 dark:text-slate-400">New Leads</span></div><p className="text-lg sm:text-2xl font-black text-blue-600">{statusCounts.new}</p></div>
        <div className={cardCls}><div className="flex items-center gap-2 mb-1.5"><Phone size={16} className="text-amber-600" /><span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Contacted</span></div><p className="text-lg sm:text-2xl font-black text-amber-600">{statusCounts.contacted}</p></div>
        <div className={cardCls}><div className="flex items-center gap-2 mb-1.5"><Calendar size={16} className="text-brand-600" /><span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Trial Scheduled</span></div><p className="text-lg sm:text-2xl font-black text-brand-600">{statusCounts.trial}</p></div>
        <div className={cardCls}><div className="flex items-center gap-2 mb-1.5"><Check size={16} className="text-brand-600" /><span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Converted (Won)</span></div><p className="text-lg sm:text-2xl font-black text-brand-600">{statusCounts.won}</p></div>
        <div className={cardCls}><div className="flex items-center gap-2 mb-1.5"><X size={16} className="text-red-600" /><span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Lost</span></div><p className="text-lg sm:text-2xl font-black text-red-600">{statusCounts.lost}</p></div>
      </div>

      {/* Source breakdown */}
      {sourceStats.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Sources Overview</p>
          <div className="flex flex-wrap gap-2">
            {sourceStats.map(s => {
              const cfg = sourceConfig[s.key] || sourceConfig.other
              const Icon = cfg.icon
              return (
                <div key={s.key} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${cfg.color} text-xs font-medium`}>
                  <Icon size={13} /> <span>{cfg.label}</span> <span className="opacity-70 font-bold">({s.count})</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <input type="text" placeholder="Search lead name, phone, email..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="trial">Trial</option>
            <option value="won">Won / Converted</option>
            <option value="lost">Lost</option>
          </select>
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="all">All Sources</option>
            {Object.entries(sourceConfig).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
          </select>
        </div>

        {/* View Switcher toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-end sm:self-auto border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${viewMode === 'cards' ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <LayoutGrid size={14} /> Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <List size={14} /> Table
          </button>
        </div>
      </div>

      {/* LEADS LIST CONTENT */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center gap-2">
          <Loader size={24} className="animate-spin text-brand-500" />
          <span>Loading lead CRM data...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          No leads matching filters found.
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/40 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-semibold whitespace-nowrap">Name</th>
                  <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-semibold whitespace-nowrap">Phone</th>
                  <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-semibold whitespace-nowrap">Source</th>
                  <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-semibold whitespace-nowrap">Fitness Goal / Interest</th>
                  <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-semibold whitespace-nowrap">Status</th>
                  <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-semibold whitespace-nowrap">Follow-up</th>
                  <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-semibold whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filtered.map(l => {
                  const srcCfg = sourceConfig[l.source || 'other'] || sourceConfig.other
                  const SrcIcon = srcCfg.icon
                  return (
                    <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3 font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer" onClick={() => setSelectedLead(l)}>
                        {l.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{l.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${srcCfg.color}`}>
                          <SrcIcon size={12} /> {srcCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{l.fitness_goal || l.interest || '—'}</td>
                      <td className="px-4 py-3">
                        <select
                          value={l.status || 'new'}
                          onChange={e => updateLeadStatus(l.id, e.target.value)}
                          className="text-xs font-semibold px-2 py-1 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="trial">Trial</option>
                          <option value="won">Won / Converted</option>
                          <option value="lost">Lost</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                        {l.next_follow_up_date || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => handleQuickAction(l, 'call')} className="p-1.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100" title="Call">
                            <Phone size={14} />
                          </button>
                          <button onClick={() => handleQuickAction(l, 'whatsapp')} className="p-1.5 bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 rounded-lg hover:bg-brand-100" title="WhatsApp">
                            <MessageCircle size={14} />
                          </button>
                          <button onClick={() => handleQuickAction(l, 'followup')} className="p-1.5 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-100" title="Set Follow-up">
                            <Calendar size={14} />
                          </button>
                          {l.status !== 'won' && l.status !== 'converted' && (
                            <button onClick={() => handleQuickAction(l, 'convert')} className="p-1.5 bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 rounded-lg hover:bg-brand-100" title="Convert to Member">
                              <UserCheck size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW - Responsive: Slider/Carousel on small screens (< 768px), Grid on larger screens (>= 768px) */
        <div className="space-y-4">
          {/* SMALL SCREENS SLIDER / CAROUSEL (< 768px) */}
          <div className="block md:hidden">
            <div className="relative bg-slate-900/40 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-400">
                  Lead {carouselIndex + 1} of {filtered.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCarouselIndex(prev => Math.max(0, prev - 1))}
                    disabled={carouselIndex === 0}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCarouselIndex(prev => Math.min(filtered.length - 1, prev + 1))}
                    disabled={carouselIndex >= filtered.length - 1}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Active Card */}
              {filtered[carouselIndex] && (
                <LeadCard
                  lead={filtered[carouselIndex]}
                  onSelect={setSelectedLead}
                  onAction={handleQuickAction}
                  onStatusChange={updateLeadStatus}
                />
              )}

              {/* Slider Dots */}
              <div className="flex items-center justify-center gap-1.5 py-3 overflow-x-auto px-2">
                {filtered.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCarouselIndex(idx)}
                    className={`h-2 rounded-full transition-all ${idx === carouselIndex ? 'w-6 bg-brand-500' : 'w-2 bg-slate-700'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* LARGE SCREENS GRID (>= 768px) */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(lead => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onSelect={setSelectedLead}
                onAction={handleQuickAction}
                onStatusChange={updateLeadStatus}
              />
            ))}
          </div>
        </div>
      )}

      {/* LEAD DETAIL MODAL */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onAction={handleQuickAction}
          onStatusChange={(status) => {
            updateLeadStatus(selectedLead.id, status)
            setSelectedLead({ ...selectedLead, status })
          }}
        />
      )}

      {/* FOLLOW-UP MODAL */}
      {followUpLead && (
        <FollowUpModal
          lead={followUpLead}
          onClose={() => setFollowUpLead(null)}
          onSave={async (leadId, date, notes) => {
            setLeads(prev => prev.map(l => l.id === leadId ? { ...l, next_follow_up_date: date, notes: notes || l.notes, status: 'contacted' } : l))
            setFollowUpLead(null)
            setActionResult({ type: 'success', text: `Follow-up scheduled for ${date}` })
          }}
        />
      )}

      {/* CONVERT TO MEMBER MODAL */}
      {convertLead && (
        <ConvertToMemberModal
          lead={convertLead}
          onClose={() => setConvertLead(null)}
          onConverted={(member) => {
            updateLeadStatus(convertLead.id, 'won')
            setConvertLead(null)
            setActionResult({ type: 'success', text: `Successfully converted ${convertLead.name} to member!` })
          }}
        />
      )}

      {/* ADD LEAD MODAL */}
      {showAdd && (
        <AddLeadModal
          onClose={() => setShowAdd(false)}
          onAdded={() => { setShowAdd(false); fetchLeads() }}
        />
      )}

      {/* IMPORT MODAL */}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImported={() => { setShowImport(false); fetchLeads() }}
        />
      )}
    </div>
  )
}

/* LEAD CARD COMPONENT */
function LeadCard({
  lead,
  onSelect,
  onAction,
  onStatusChange
}: {
  lead: any
  onSelect: (lead: any) => void
  onAction: (lead: any, action: string) => void
  onStatusChange: (id: string, status: string) => void
}) {
  const srcCfg = sourceConfig[lead.source || 'other'] || sourceConfig.other
  const SrcIcon = srcCfg.icon

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
      <div>
        {/* Header: Name + Source */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <h3
              onClick={() => onSelect(lead)}
              className="text-base font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer truncate transition-colors"
            >
              {lead.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Phone size={11} className="flex-shrink-0" />
              <span className="truncate">{lead.phone || 'No phone'}</span>
            </p>
            {lead.email && (
              <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                <Mail size={11} className="flex-shrink-0" />
                <span className="truncate">{lead.email}</span>
              </p>
            )}
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold flex-shrink-0 ${srcCfg.color}`}>
            <SrcIcon size={12} /> {srcCfg.label}
          </span>
        </div>

        {/* Status Badge Select & Fitness Goal */}
        <div className="space-y-2 my-3 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={lead.status || 'new'}
              onChange={e => onStatusChange(lead.id, e.target.value)}
              className="text-xs font-semibold px-2 py-1 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="trial">Trial</option>
              <option value="won">Won / Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Target size={12} /> Goal:
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[140px]">
              {lead.fitness_goal || lead.interest || 'General Fitness'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Clock size={12} /> Follow-Up:
            </span>
            <span className="font-medium text-amber-600 dark:text-amber-400">
              {lead.next_follow_up_date || lead.created_date?.split('T')[0] || 'Not set'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-4 gap-1.5">
        <button
          onClick={() => onAction(lead, 'call')}
          className="py-1.5 px-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
          title="Call Lead"
        >
          <Phone size={13} />
          <span className="hidden sm:inline">Call</span>
        </button>
        <button
          onClick={() => onAction(lead, 'whatsapp')}
          className="py-1.5 px-2 bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 text-brand-600 dark:text-brand-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
          title="WhatsApp Lead"
        >
          <MessageCircle size={13} />
          <span className="hidden sm:inline">WhatsApp</span>
        </button>
        <button
          onClick={() => onAction(lead, 'followup')}
          className="py-1.5 px-2 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
          title="Schedule Follow-up"
        >
          <Calendar size={13} />
          <span className="hidden sm:inline">Follow-up</span>
        </button>
        <button
          onClick={() => onAction(lead, 'convert')}
          className="py-1.5 px-2 bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 text-brand-600 dark:text-brand-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
          title="Convert to Member"
        >
          <UserCheck size={13} />
          <span className="hidden sm:inline">Convert</span>
        </button>
      </div>
    </div>
  )
}

/* LEAD DETAIL MODAL */
function LeadDetailModal({
  lead,
  onClose,
  onAction,
  onStatusChange
}: {
  lead: any
  onClose: () => void
  onAction: (lead: any, action: string) => void
  onStatusChange: (status: string) => void
}) {
  const srcCfg = sourceConfig[lead.source || 'other'] || sourceConfig.other
  const SrcIcon = srcCfg.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{lead.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Lead Profile & History</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <p className="text-slate-400 text-xs font-medium">Phone</p>
            <a href={`tel:${lead.phone}`} className="font-bold text-blue-600 dark:text-blue-400 hover:underline">{lead.phone || '—'}</a>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <p className="text-slate-400 text-xs font-medium">Email</p>
            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{lead.email || '—'}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <p className="text-slate-400 text-xs font-medium">Source</p>
            <span className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded text-xs font-semibold ${srcCfg.color}`}>
              <SrcIcon size={12} /> {srcCfg.label}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <p className="text-slate-400 text-xs font-medium">Status</p>
            <select
              value={lead.status || 'new'}
              onChange={e => onStatusChange(e.target.value)}
              className="mt-1 text-xs font-bold px-2 py-1 border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="trial">Trial Pass</option>
              <option value="won">Won / Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 text-xs sm:text-sm">
          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <p className="text-slate-400 text-xs font-medium">Fitness Goal / Interest</p>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{lead.fitness_goal || lead.interest || 'Not specified'}</p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <p className="text-slate-400 text-xs font-medium">Next Follow-Up Date</p>
            <p className="font-semibold text-amber-600 dark:text-amber-400 mt-0.5">{lead.next_follow_up_date || 'No follow-up date set'}</p>
          </div>

          {lead.notes && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <p className="text-slate-400 text-xs font-medium">Notes & Activity</p>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5 whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2">
          <button
            onClick={() => { onClose(); onAction(lead, 'call') }}
            className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
          >
            <Phone size={14} /> Call Lead
          </button>
          <button
            onClick={() => { onClose(); onAction(lead, 'whatsapp') }}
            className="py-2 px-3 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
          >
            <MessageCircle size={14} /> WhatsApp
          </button>
          <button
            onClick={() => { onClose(); onAction(lead, 'followup') }}
            className="py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
          >
            <Calendar size={14} /> Set Follow-Up
          </button>
          <button
            onClick={() => { onClose(); onAction(lead, 'convert') }}
            className="py-2 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
          >
            <UserCheck size={14} /> Convert to Member
          </button>
        </div>
      </div>
    </div>
  )
}

/* FOLLOW-UP MODAL */
function FollowUpModal({
  lead,
  onClose,
  onSave
}: {
  lead: any
  onClose: () => void
  onSave: (id: string, date: string, notes: string) => void
}) {
  const [date, setDate] = useState(lead.next_follow_up_date || new Date(Date.now() + 86400000).toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar size={18} className="text-amber-500" /> Schedule Follow-Up: {lead.name}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Follow-Up Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Follow-Up Notes</label>
            <textarea
              rows={3}
              placeholder="e.g. Call back regarding annual plan trial pass..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
            Cancel
          </button>
          <button
            onClick={() => onSave(lead.id, date, notes)}
            className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm"
          >
            Save Follow-Up
          </button>
        </div>
      </div>
    </div>
  )
}

/* CONVERT TO MEMBER MODAL */
function ConvertToMemberModal({
  lead,
  onClose,
  onConverted
}: {
  lead: any
  onClose: () => void
  onConverted: (member: any) => void
}) {
  const [plan, setPlan] = useState('Monthly Standard')
  const [submitting, setSubmitting] = useState(false)

  const handleConvert = async () => {
    setSubmitting(true)
    try {
      const gymId = localStorage.getItem('gym_os_gym_id') || 'gym_oxigen'
      const res = await api.convertLeadToMember(gymId, lead.id, {
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        plan_name: plan,
        membership_status: 'active'
      })
      if (res.success) {
        onConverted(res.member || { name: lead.name })
      } else {
        alert(res.error || 'Conversion failed')
      }
    } catch {
      alert('Error converting lead')
    }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck size={20} className="text-brand-600" /> Convert {lead.name} to Member
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 text-xs sm:text-sm">
          <p className="text-slate-600 dark:text-slate-300">
            This will create a active member profile for <strong>{lead.name}</strong> ({lead.phone}) and update lead status to Won.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Membership Plan</label>
            <select
              value={plan}
              onChange={e => setPlan(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium"
            >
              <option value="Monthly Standard">Monthly Standard (₹3,500/mo)</option>
              <option value="Quarterly Premium">Quarterly Premium (₹9,000/qtr)</option>
              <option value="Annual VIP">Annual VIP Pass (₹24,000/yr)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
            Cancel
          </button>
          <button
            onClick={handleConvert}
            disabled={submitting}
            className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl shadow-sm flex items-center gap-1.5"
          >
            {submitting ? <Loader size={14} className="animate-spin" /> : <UserCheck size={14} />} Confirm Conversion
          </button>
        </div>
      </div>
    </div>
  )
}

/* ADD LEAD MODAL */
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
    } catch { setError('Network error') }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Lead</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Name *" value={name} onChange={e => setName(e.target.value)} className="px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-xl" />
            <input type="text" placeholder="Phone *" value={phone} onChange={e => setPhone(e.target.value)} className="px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-xl" />
            <select value={source} onChange={e => setSource(e.target.value)} className="px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-xl">
              {Object.entries(sourceConfig).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Interest (e.g. Yoga)" value={interest} onChange={e => setInterest(e.target.value)} className="px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-xl" />
            <input type="text" placeholder="Fitness Goal" value={fitnessGoal} onChange={e => setFitnessGoal(e.target.value)} className="px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-xl" />
          </div>
          <textarea placeholder="Notes..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-xl resize-none" />
          <label className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 rounded text-brand-600" required />
            <span>I consent to having this contact information stored for follow-up communications (GDPR/CCPA compliant).</span>
          </label>
          <button type="submit" disabled={submitting} className="w-full py-2.5 text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors disabled:opacity-50">
            {submitting ? 'Adding Lead...' : 'Add Lead'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* IMPORT MODAL */
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
        const res = await fetch(`${API_BASE}/createLeadWithConsent`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gym_id: gymId, name, phone, email: email || '', source: source || 'spreadsheet', interest: interest || '', fitness_goal: interest || '', status: 'new', consent_status: 'granted' })
        })
        const data = await res.json()
        if (data.success) added++
        else failed++
      } catch { failed++ }
    }
    setResult({ added, failed })
    setImporting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><FileSpreadsheet size={18} className="text-brand-500" /> Import CSV Leads</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Paste CSV lines in format: <code>Name, Phone, Email, Source, Interest</code></p>
        <textarea rows={6} value={csvText} onChange={e => setCsvText(e.target.value)} placeholder="Rahul Sharma, +91 98765 43210, rahul@email.com, website, Weight Loss" className="w-full px-3 py-2 text-xs font-mono border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-xl" />

        {result && (
          <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200">
            Imported: {result.added} success, {result.failed} failed.
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
          <button onClick={result ? onImported : onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
            {result ? 'Done' : 'Cancel'}
          </button>
          {!result && (
            <button onClick={handleImport} disabled={importing || !csvText.trim()} className="px-4 py-2 text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5">
              {importing ? <Loader size={14} className="animate-spin" /> : <Download size={14} />} Import Leads
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
