import { useState, useEffect } from 'react'
import {
  Plus,
  X,
  Loader,
  Phone,
  MessageCircle,
  Mail,
  Instagram,
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
  Clock,
  Target,
  LayoutGrid,
  List,
  Kanban
} from 'lucide-react'
import { api } from '../api/client'
import { exportToCSV } from '../utils/csvExport'
import StatusBadge from '../components/StatusBadge'
import LeadProfileModal, { sourceConfig } from '../components/LeadProfileModal'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://base44.app/api/apps/6a8949954092729194579577/functions'

function getDaysAgo(dateString?: string): string {
  if (!dateString) return '0d ago'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '0d ago'
  const diffTime = Math.max(0, Date.now() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1d ago'
  return `${diffDays}d ago`
}

function getLeadValue(lead: any): string {
  const val = lead.value || lead.estimated_value || 3500
  return `₹${Number(val).toLocaleString('en-IN')}`
}

const KANBAN_COLUMNS = [
  {
    id: 'new',
    title: 'New',
    statusKey: 'new',
    headerBg: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
    badgeBg: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200',
    borderAccent: 'border-l-blue-500',
    headerDot: 'bg-blue-500',
    columnBg: 'bg-blue-50/30 dark:bg-slate-800/80 border-blue-100/80 dark:border-slate-700/60',
    matches: (s: string) => !s || s === 'new'
  },
  {
    id: 'contacted',
    title: 'Contacted',
    statusKey: 'contacted',
    headerBg: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200',
    borderAccent: 'border-l-indigo-500',
    headerDot: 'bg-indigo-500',
    columnBg: 'bg-indigo-50/30 dark:bg-slate-800/60 border-indigo-100/80 dark:border-slate-700/60',
    matches: (s: string) => s === 'contacted' || s === 'follow_up'
  },
  {
    id: 'trial_booked',
    title: 'Trial Booked',
    statusKey: 'trial_booked',
    headerBg: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200',
    borderAccent: 'border-l-amber-500',
    headerDot: 'bg-amber-500',
    columnBg: 'bg-amber-50/30 dark:bg-slate-800/80 border-amber-100/80 dark:border-slate-700/60',
    matches: (s: string) => s === 'trial_booked' || s === 'trial' || s === 'trial_scheduled'
  },
  {
    id: 'trial_completed',
    title: 'Trial Completed',
    statusKey: 'trial_completed',
    headerBg: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
    badgeBg: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200',
    borderAccent: 'border-l-purple-500',
    headerDot: 'bg-purple-500',
    columnBg: 'bg-purple-50/30 dark:bg-slate-800/60 border-purple-100/80 dark:border-slate-700/60',
    matches: (s: string) => s === 'trial_completed'
  },
  {
    id: 'member',
    title: 'Member',
    statusKey: 'member',
    headerBg: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200',
    borderAccent: 'border-l-emerald-500',
    headerDot: 'bg-emerald-500',
    columnBg: 'bg-emerald-50/30 dark:bg-slate-800/80 border-emerald-100/80 dark:border-slate-700/60',
    matches: (s: string) => s === 'member' || s === 'won' || s === 'converted'
  },
  {
    id: 'lost',
    title: 'Lost',
    statusKey: 'lost',
    headerBg: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60',
    badgeBg: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200',
    borderAccent: 'border-l-red-500',
    headerDot: 'bg-red-500',
    columnBg: 'bg-red-50/30 dark:bg-slate-800/60 border-red-100/80 dark:border-slate-700/60',
    matches: (s: string) => s === 'lost'
  }
]

export default function Leads() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [filter, setFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'kanban' | 'cards' | 'table'>('kanban')

  // Carousel index for mobile slider
  const [carouselIndex, setCarouselIndex] = useState(0)

  // Drag and drop states for Kanban
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null)
  const [dragOverColId, setDragOverColId] = useState<string | null>(null)

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
    new: leads.filter(l => !l.status || l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted' || l.status === 'follow_up').length,
    trial: leads.filter(l => l.status === 'trial' || l.status === 'trial_booked' || l.status === 'trial_scheduled').length,
    won: leads.filter(l => l.status === 'won' || l.status === 'converted' || l.status === 'member').length,
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

  // Source ROI data calculation
  const roiSources = [
    { key: 'instagram', label: 'Instagram', icon: Instagram, barColor: 'bg-gradient-to-r from-pink-500 to-purple-600' },
    { key: 'walk_in', label: 'Walk-in', icon: UsersIcon, barColor: 'bg-gradient-to-r from-blue-500 to-indigo-600' },
    { key: 'referral', label: 'Referral', icon: Zap, barColor: 'bg-gradient-to-r from-amber-500 to-orange-600' },
    { key: 'website', label: 'Website', icon: Globe, barColor: 'bg-gradient-to-r from-emerald-500 to-teal-600' },
    { key: 'google_ads', label: 'Google Ads', icon: Target, barColor: 'bg-gradient-to-r from-red-500 to-rose-600' },
  ]

  const sourceRoiData = roiSources.map(s => {
    const totalLeads = leads.filter(l => l.source === s.key).length
    const convertedLeads = leads.filter(l => l.source === s.key && ['won', 'converted', 'member'].includes(l.status)).length
    const rate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0
    return { ...s, totalLeads, convertedLeads, rate }
  })

  // Funnel steps calculation
  const bookedCount = leads.filter(l => ['trial', 'trial_booked', 'trial_scheduled', 'trial_completed', 'won', 'converted', 'member'].includes(l.status)).length || (leads.length > 0 ? Math.ceil(leads.length * 0.6) : 0)
  const showedUpCount = leads.filter(l => ['trial_completed', 'won', 'converted', 'member'].includes(l.status)).length + Math.max(0, Math.floor(leads.filter(l => l.status === 'trial_booked' || l.status === 'trial').length * 0.7)) || Math.ceil(bookedCount * 0.75)
  const completedCount = leads.filter(l => ['trial_completed', 'won', 'converted', 'member'].includes(l.status)).length || Math.ceil(showedUpCount * 0.8)
  const convertedCount = leads.filter(l => ['won', 'converted', 'member'].includes(l.status)).length || Math.ceil(completedCount * 0.65)

  const funnelMax = Math.max(bookedCount, 1)

  const funnelSteps = [
    {
      stage: 'Booked',
      label: 'Trial Booked',
      count: bookedCount,
      pct: 100,
      widthPct: 100,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      stage: 'Showed Up',
      label: 'Showed Up',
      count: showedUpCount,
      pct: Math.round((showedUpCount / funnelMax) * 100),
      widthPct: Math.max(15, Math.round((showedUpCount / funnelMax) * 100)),
      color: 'bg-gradient-to-r from-indigo-500 to-indigo-600'
    },
    {
      stage: 'Completed',
      label: 'Trial Completed',
      count: completedCount,
      pct: Math.round((completedCount / funnelMax) * 100),
      widthPct: Math.max(10, Math.round((completedCount / funnelMax) * 100)),
      color: 'bg-gradient-to-r from-purple-500 to-purple-600'
    },
    {
      stage: 'Converted',
      label: 'Converted to Member',
      count: convertedCount,
      pct: Math.round((convertedCount / funnelMax) * 100),
      widthPct: Math.max(5, Math.round((convertedCount / funnelMax) * 100)),
      color: 'bg-gradient-to-r from-emerald-500 to-emerald-600'
    }
  ]

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
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <Kanban size={14} /> Kanban
          </button>
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
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="space-y-6">
          <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
            <div className="flex gap-4 min-w-[1200px] items-start">
              {KANBAN_COLUMNS.map(col => {
                const colLeads = filtered.filter(l => col.matches(l.status))
                const isDragOver = dragOverColId === col.id

                return (
                  <div
                    key={col.id}
                    onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
                      e.preventDefault()
                      e.dataTransfer.dropEffect = 'move'
                      if (dragOverColId !== col.id) setDragOverColId(col.id)
                    }}
                    onDragLeave={(e: React.DragEvent<HTMLDivElement>) => {
                      if (e.currentTarget.contains(e.relatedTarget as Node)) return
                      setDragOverColId(null)
                    }}
                    onDrop={(e: React.DragEvent<HTMLDivElement>) => {
                      e.preventDefault()
                      setDragOverColId(null)
                      const leadId = e.dataTransfer.getData('text/plain') || draggingLeadId
                      if (leadId) {
                        updateLeadStatus(leadId, col.statusKey)
                      }
                    }}
                    className={`flex-1 min-w-[200px] rounded-2xl border p-3 flex flex-col transition-all duration-200 ${col.columnBg} ${isDragOver ? 'ring-2 ring-brand-500/60 shadow-lg scale-[1.01]' : ''}`}
                  >
                    {/* Column Header */}
                    <div className={`flex items-center justify-between px-3 py-2 rounded-xl border font-bold text-xs mb-3 shadow-xs ${col.headerBg}`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${col.headerDot}`} />
                        <span>{col.title}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${col.badgeBg}`}>
                        {colLeads.length}
                      </span>
                    </div>

                    {/* Column Lead Cards Container */}
                    <div className="space-y-2.5 flex-1 min-h-[160px]">
                      {colLeads.length === 0 ? (
                        <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-400 dark:text-slate-500 text-xs text-center p-4">
                          <span>No leads</span>
                        </div>
                      ) : (
                        colLeads.map(lead => (
                          <KanbanCard
                            key={lead.id}
                            lead={lead}
                            columnAccent={col.borderAccent}
                            onSelect={setSelectedLead}
                            onAction={handleQuickAction}
                            isDragging={draggingLeadId === lead.id}
                            onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                              e.dataTransfer.setData('text/plain', lead.id)
                              e.dataTransfer.effectAllowed = 'move'
                              setDraggingLeadId(lead.id)
                            }}
                            onDragEnd={() => {
                              setDraggingLeadId(null)
                              setDragOverColId(null)
                            }}
                          />
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* KANBAN ANALYTICS FOOTER: SOURCE ROI & CONVERSION FUNNEL */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700/80">
            {/* Source ROI Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2.5">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <TrendingUp size={16} className="text-brand-500" /> Source ROI &amp; Conversion Rate
                </h3>
                <span className="text-xs text-slate-400 font-medium">By Lead Channel</span>
              </div>
              <div className="space-y-3">
                {sourceRoiData.map(s => {
                  const Icon = s.icon
                  return (
                    <div key={s.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                          <Icon size={13} className="text-slate-400" /> {s.label}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 font-mono">
                          {s.rate}% <span className="text-[10px] text-slate-400 font-normal">({s.convertedLeads}/{s.totalLeads} converted)</span>
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${s.barColor} transition-all duration-500 rounded-full`}
                          style={{ width: `${Math.max(s.rate, s.totalLeads > 0 ? 5 : 0)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Trial Conversion Funnel Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2.5">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Target size={16} className="text-indigo-500" /> Trial Conversion Funnel
                </h3>
                <span className="text-xs text-slate-400 font-medium">Stage Progression</span>
              </div>
              <div className="space-y-3">
                {funnelSteps.map((step, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-200">
                        {idx + 1}. {step.label}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono">
                        {step.count} leads <span className="text-[10px] text-slate-400">({step.pct}%)</span>
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden flex items-center">
                      <div
                        className={`h-full ${step.color} transition-all duration-500 rounded-full`}
                        style={{ width: `${step.widthPct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
                  <th className="text-right px-2 sm:px-4 py-2 sm:py-3 font-semibold whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filtered.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                      <button onClick={() => setSelectedLead(l)} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                        {l.name}
                      </button>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">{l.phone || '—'}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                      <span className="capitalize text-slate-600 dark:text-slate-400 font-medium">{l.source || 'Other'}</span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap truncate max-w-[160px]">{l.fitness_goal || l.interest || '—'}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap"><StatusBadge status={l.status || 'new'} /></td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{l.next_follow_up_date || '—'}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleQuickAction(l, 'call')} className="p-1 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors" title="Call"><Phone size={14} /></button>
                        <button onClick={() => handleQuickAction(l, 'whatsapp')} className="p-1 rounded-md text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors" title="WhatsApp"><MessageCircle size={14} /></button>
                        <button onClick={() => handleQuickAction(l, 'followup')} className="p-1 rounded-md text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors" title="Schedule Follow-up"><Calendar size={14} /></button>
                        <button onClick={() => handleQuickAction(l, 'convert')} className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors" title="Convert to Member"><UserCheck size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        <div>
          {/* MOBILE CAROUSEL (< 768px) */}
          <div className="md:hidden">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
              {/* Slider Header */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
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
        <LeadProfileModal
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
          onConverted={() => {
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

/* KANBAN CARD COMPONENT */
function KanbanCard({
  lead,
  columnAccent,
  onSelect,
  onAction,
  isDragging,
  onDragStart,
  onDragEnd
}: {
  lead: any
  columnAccent: string
  onSelect: (lead: any) => void
  onAction: (lead: any, action: string) => void
  isDragging?: boolean
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void
  onDragEnd: () => void
}) {
  const srcCfg = sourceConfig[lead.source || 'other'] || sourceConfig.other
  const SrcIcon = srcCfg.icon
  const daysAgo = getDaysAgo(lead.created_date)
  const leadVal = getLeadValue(lead)

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 p-3 shadow-sm hover:shadow-md hover:scale-[1.02] cursor-grab active:cursor-grabbing transition-all duration-200 border-l-4 ${columnAccent} ${isDragging ? 'opacity-40 scale-95 ring-2 ring-brand-500' : ''}`}
    >
      <div className="flex items-start justify-between gap-1.5 mb-2">
        <h4
          onClick={() => onSelect(lead)}
          className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer truncate transition-colors leading-tight"
        >
          {lead.name}
        </h4>
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${srcCfg.color}`}>
          <SrcIcon size={10} /> {srcCfg.label}
        </span>
      </div>

      <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 mb-2.5">
        <p className="flex items-center gap-1.5 truncate">
          <Phone size={11} className="text-slate-400 flex-shrink-0" />
          <span className="truncate">{lead.phone || 'No phone'}</span>
        </p>
      </div>

      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-slate-700/60 text-slate-500 dark:text-slate-400">
        <span className="font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/70 px-2 py-0.5 rounded-md">
          {leadVal}
        </span>
        <span className="flex items-center gap-1 text-slate-400 font-medium">
          <Clock size={11} /> {daysAgo}
        </span>
      </div>

      {/* Quick Action Icons */}
      <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onAction(lead, 'call'); }}
          className="p-1 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
          title="Call"
        >
          <Phone size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onAction(lead, 'whatsapp'); }}
          className="p-1 rounded-md text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors"
          title="WhatsApp"
        >
          <MessageCircle size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onAction(lead, 'followup'); }}
          className="p-1 rounded-md text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
          title="Schedule Follow-up"
        >
          <Calendar size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onAction(lead, 'convert'); }}
          className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
          title="Convert to Member"
        >
          <UserCheck size={12} />
        </button>
      </div>
    </div>
  )
}

/* LEAD CARD COMPONENT (FOR GRID CARDS VIEW) */
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
  const initial = (lead.name || '?').charAt(0).toUpperCase()

  const statusStyles: Record<string, string> = {
    new: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    contacted: 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300',
    trial: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
    won: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
    lost: 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
  }
  const currentStatus = lead.status || 'new'

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-black/20 hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700/60 transition-all duration-200 flex flex-col justify-between h-full">
      <div>
        {/* Header: Avatar + Name + Source */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm flex-shrink-0 ring-1 ring-brand-100 dark:ring-brand-800/50">
              {initial}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h3
                onClick={() => onSelect(lead)}
                className="text-sm font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer truncate transition-colors leading-tight"
              >
                {lead.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
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
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${srcCfg.color}`}>
            <SrcIcon size={11} /> {srcCfg.label}
          </span>
        </div>

        {/* Status Badge Select & Fitness Goal */}
        <div className="space-y-2 my-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 font-medium">Status</span>
            <select
              value={currentStatus}
              onChange={e => onStatusChange(lead.id, e.target.value)}
              className={`text-xs font-bold px-2.5 py-1 border rounded-full appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400/40 ${statusStyles[currentStatus] || statusStyles.new}`}
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
              <Target size={12} /> Goal
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[140px]">
              {lead.fitness_goal || lead.interest || 'General Fitness'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Clock size={12} /> Follow-Up
            </span>
            <span className="font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
              {lead.next_follow_up_date || lead.created_date?.split('T')[0] || 'Not set'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-4 gap-1.5">
        <button
          onClick={() => onAction(lead, 'call')}
          className="cursor-pointer py-1.5 px-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:scale-[1.03] text-blue-600 dark:text-blue-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all duration-150"
          title="Call Lead"
        >
          <Phone size={13} />
          <span className="hidden sm:inline">Call</span>
        </button>
        <button
          onClick={() => onAction(lead, 'whatsapp')}
          className="cursor-pointer py-1.5 px-2 bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 dark:hover:bg-brand-900/50 hover:scale-[1.03] text-brand-600 dark:text-brand-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all duration-150"
          title="WhatsApp Lead"
        >
          <MessageCircle size={13} />
          <span className="hidden sm:inline">WhatsApp</span>
        </button>
        <button
          onClick={() => onAction(lead, 'followup')}
          className="cursor-pointer py-1.5 px-2 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:scale-[1.03] text-amber-600 dark:text-amber-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all duration-150"
          title="Schedule Follow-up"
        >
          <Calendar size={13} />
          <span className="hidden sm:inline">Follow-up</span>
        </button>
        <button
          onClick={() => onAction(lead, 'convert')}
          className="cursor-pointer py-1.5 px-2 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:scale-[1.03] text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all duration-150"
          title="Convert to Member"
        >
          <UserCheck size={13} />
          <span className="hidden sm:inline">Convert</span>
        </button>
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
      const gymId = localStorage.getItem('gym_os_gym_id') || ''
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
            This will create an active member profile for <strong>{lead.name}</strong> ({lead.phone}) and update lead status to Won.
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
      const gymId = localStorage.getItem('gym_os_gym_id') || ''
      const res = await fetch(`${API_BASE}/createLeadWithConsent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gym_id: gymId, name, phone, email, source, interest, fitness_goal: fitnessGoal, notes, consent_status: 'granted'
        })
      })
      const data = await res.json()
      if (data.success) {
        onAdded()
      } else {
        setError(data.error || 'Failed to add lead')
      }
    } catch {
      setError('Network error adding lead')
    }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Plus size={18} className="text-brand-500" /> Add New Lead</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
        </div>

        {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-xs">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" placeholder="Full Name *" value={name} onChange={e => setName(e.target.value)} className="px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-xl" required />
            <input type="text" placeholder="Phone Number *" value={phone} onChange={e => setPhone(e.target.value)} className="px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-xl" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-xl" />
            <select value={source} onChange={e => setSource(e.target.value)} className="px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-xl">
              {Object.entries(sourceConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
    const gymId = localStorage.getItem('gym_os_gym_id') || ''

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
