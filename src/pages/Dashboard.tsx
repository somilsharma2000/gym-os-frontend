import { useState, useEffect, useMemo } from 'react'
import LoadingScreen from '../components/LoadingScreen'
import { useNavigate } from 'react-router-dom'
import { Users, UserPlus, Ticket, UserCheck, ClipboardList, CreditCard, AlertTriangle, Calendar, RefreshCw, TrendingUp, PieChart as PieChartIcon, Activity, ArrowUpRight } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'
import { api, ApiRequestError } from '../api/client'
import type { DashboardData } from '../types'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import LeadProfileModal from '../components/LeadProfileModal'

const STATUS_ORDER = ['new', 'contacted', 'trial', 'won', 'lost']
const STATUS_LABELS: Record<string, string> = { new: 'New', contacted: 'Contacted', trial: 'Trial', won: 'Won', lost: 'Lost' }
const STATUS_COLORS: Record<string, string> = { new: '#3b82f6', contacted: '#8b5cf6', trial: '#f59e0b', won: '#10b981', lost: '#94a3b8' }
const SOURCE_COLORS = ['#0066FF', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#94a3b8']

function normalizeStatus(status?: string) {
  const s = (status || 'new').toLowerCase()
  if (s.includes('trial')) return 'trial'
  if (s.includes('won') || s.includes('convert') || s.includes('join')) return 'won'
  if (s.includes('lost')) return 'lost'
  if (s.includes('contact')) return 'contacted'
  if (s === 'new') return 'new'
  return 'new'
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastRefresh, setLastRefresh] = useState('')

  // Full leads list — powers the click-to-profile lookups AND the pipeline/source charts.
  // (recent_leads / pending_followup_tasks on the dashboard payload are capped previews)
  const [fullLeads, setFullLeads] = useState<any[]>([])
  const [checkinTrend, setCheckinTrend] = useState<{ date: string; visits: number }[]>([])

  // Row-click profile modal state
  const [profileLead, setProfileLead] = useState<any | null>(null)
  const [profilePartial, setProfilePartial] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [dashRes, leadsRes, checkinsRes] = await Promise.allSettled([
        api.getDashboardData(),
        api.getLeads({}).catch(() => ({ success: false, leads: [] })),
        api.getRecentCheckIns(60).catch(() => ({ success: false, checkins: [] }))
      ])

      if (dashRes.status === 'fulfilled' && dashRes.value.success) {
        setData(dashRes.value)
      } else {
        const reason: any = dashRes.status === 'rejected' ? dashRes.reason : null
        setError((dashRes.status === 'fulfilled' && dashRes.value.error) || reason?.message || 'Failed to load dashboard data')
      }

      if (leadsRes.status === 'fulfilled' && leadsRes.value.success) {
        setFullLeads(leadsRes.value.leads || [])
      }

      if (checkinsRes.status === 'fulfilled' && checkinsRes.value.success) {
        const list = checkinsRes.value.checkins || []
        const byDay: Record<string, number> = {}
        list.forEach((ci: any) => {
          const day = ci.check_in_time?.split('T')?.[0]
          if (day) byDay[day] = (byDay[day] || 0) + 1
        })
        const sortedDays = Object.keys(byDay).sort().slice(-7)
        setCheckinTrend(sortedDays.map(d => ({
          date: d.slice(5).split('-').reverse().join('/'),
          visits: byDay[d]
        })))
      }
    } catch (e: unknown) {
      if (e instanceof ApiRequestError) setError(e.message)
      else if (e instanceof Error) setError(e.message)
      else setError('Connection error')
    }
    setLoading(false)
    setLastRefresh(new Date().toLocaleTimeString())
  }

  useEffect(() => { fetchData() }, [])

  // Lead pipeline (status funnel) — computed from the FULL leads list, not the 5-item preview.
  const pipelineData = useMemo(() => {
    const counts: Record<string, number> = { new: 0, contacted: 0, trial: 0, won: 0, lost: 0 }
    fullLeads.forEach(l => { counts[normalizeStatus(l.status)]++ })
    return STATUS_ORDER.map(s => ({ status: STATUS_LABELS[s], count: counts[s], fill: STATUS_COLORS[s] }))
  }, [fullLeads])

  // Lead source breakdown — donut, computed from the FULL leads list.
  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {}
    fullLeads.forEach(l => {
      const src = (l.source || 'other').replace(/_/g, ' ')
      counts[src] = (counts[src] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }))
  }, [fullLeads])

  const totalLeadsForCharts = fullLeads.length

  // Resolve a lead by id for click-through; falls back to a partial object built
  // from the row's own fields (recent_leads / follow-up tasks) if not found.
  const openLeadProfile = (rowId: string, fallback: Record<string, any>) => {
    const found = fullLeads.find(l => l.id === rowId)
    if (found) {
      setProfileLead(found)
      setProfilePartial(false)
    } else {
      setProfileLead({ id: rowId, ...fallback })
      setProfilePartial(true)
    }
  }

  const handleProfileAction = (lead: any, action: string) => {
    if (action === 'call' && lead.phone) window.open(`tel:${lead.phone}`)
    if (action === 'whatsapp' && lead.phone) {
      const phone = (lead.phone || '').replace(/[^0-9]/g, '')
      const msg = `Hi ${lead.name}, thanks for reaching out to Gym OS! How can we help you reach your fitness goals?`
      if (phone) window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
    }
    // Follow-up scheduling & conversion have richer flows on the Leads page — send them there.
    if (action === 'followup' || action === 'convert') navigate('/leads')
  }

  const handleProfileStatusChange = async (status: string) => {
    if (!profileLead?.id) return
    try {
      await api.updateLeadStatus(profileLead.id, status)
      setProfileLead((prev: any) => prev ? { ...prev, status } : prev)
      setFullLeads(prev => prev.map(l => l.id === profileLead.id ? { ...l, status } : l))
    } catch { /* non-fatal — status just won't visually update */ }
  }

  if (loading) return <LoadingScreen message="Loading dashboard..." />
  if (error) return (
    <div className="flex flex-col items-center justify-center h-96 gap-3 text-center">
      <p className="text-red-500 dark:text-red-400 font-medium">Error: {error}</p>
      <button onClick={fetchData} className="cursor-pointer px-3 py-1.5 text-sm text-white bg-brand-600 rounded-md hover:bg-brand-700 transition-colors">Retry</button>
    </div>
  )
  if (!data) return <div className="flex items-center justify-center h-96 text-slate-400 dark:text-slate-500">No data</div>

  const m = data.metrics || data.stats || {}
  const axisColor = 'currentColor'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Command Center</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 dark:text-slate-500">Last refreshed: {lastRefresh}</span>
          <button onClick={fetchData} className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total Leads" value={m.total_leads} icon={<Users size={16} />} onClick={() => navigate('/leads')} />
        <StatCard label="New Leads" value={m.new_leads} icon={<UserPlus size={16} />} color="text-blue-600" onClick={() => navigate('/leads')} />
        <StatCard label="Trial Passes Active" value={m.trial_passes_active} icon={<Ticket size={16} />} color="text-brand-600" onClick={() => navigate('/trials')} />
        <StatCard label="Trial Visitors Checked In" value={m.trial_visitors_checked_in} icon={<UserCheck size={16} />} color="text-brand-600" onClick={() => navigate('/trials')} />
        <StatCard label="Pending Follow-ups" value={m.pending_followups} icon={<ClipboardList size={16} />} color="text-amber-600" onClick={() => navigate('/leads')} />
        <StatCard label="Active Memberships" value={m.active_memberships} icon={<CreditCard size={16} />} color="text-green-600" onClick={() => navigate('/members')} />
        <StatCard label="Expiring Memberships" value={m.expiring_memberships} icon={<AlertTriangle size={16} />} color="text-orange-600" onClick={() => navigate('/members')} />
        <StatCard label="At-Risk Members" value={m.at_risk_members} icon={<AlertTriangle size={16} />} color="text-red-600" onClick={() => navigate('/members')} />
        <StatCard label="Today's Attendance" value={m.today_attendance} icon={<Calendar size={16} />} color="text-teal-600" onClick={() => navigate('/check-in')} />
        <StatCard label="Pending Referrals" value={m.pending_referrals} icon={<Users size={16} />} color="text-brand-600" onClick={() => navigate('/referrals')} />
      </div>

      {/* INSIGHTS — real-data charts, no fabricated numbers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Activity size={15} className="text-brand-500" /> Insights
          </h3>
          <button onClick={() => navigate('/analytics')} className="cursor-pointer text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
            Full analytics <ArrowUpRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Lead Pipeline */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
              <TrendingUp size={13} /> Lead Pipeline {totalLeadsForCharts > 0 && <span className="text-slate-400 font-normal">· {totalLeadsForCharts} total</span>}
            </p>
            {totalLeadsForCharts === 0 ? (
              <div className="h-[160px] flex items-center justify-center text-xs text-slate-400">No leads yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={pipelineData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--tw-border-opacity, #e2e8f0)" vertical={false} opacity={0.3} />
                  <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} cursor={{ fill: 'rgba(0,102,255,0.06)' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {pipelineData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Lead Sources */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
              <PieChartIcon size={13} /> Lead Sources
            </p>
            {sourceData.length === 0 ? (
              <div className="h-[160px] flex items-center justify-center text-xs text-slate-400">No leads yet</div>
            ) : (
              <div className="flex items-center gap-3">
                <ResponsiveContainer width="55%" height={160}>
                  <PieChart>
                    <Pie data={sourceData} dataKey="value" nameKey="name" innerRadius={38} outerRadius={62} paddingAngle={2} strokeWidth={0}>
                      {sourceData.map((_, i) => <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5 min-w-0">
                  {sourceData.slice(0, 5).map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between gap-2 text-xs">
                      <span className="flex items-center gap-1.5 min-w-0 text-slate-600 dark:text-slate-300 capitalize truncate">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: SOURCE_COLORS[i % SOURCE_COLORS.length] }} />
                        <span className="truncate">{s.name}</span>
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-200 flex-shrink-0">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Attendance Trend */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
              <Calendar size={13} /> Attendance Trend
            </p>
            {checkinTrend.length === 0 ? (
              <div className="h-[160px] flex items-center justify-center text-xs text-slate-400">No check-ins recorded yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={checkinTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0066FF" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0066FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  <Area type="monotone" dataKey="visits" stroke="#0066FF" strokeWidth={2} fill="url(#attendanceFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Leads — clickable rows open the full profile modal */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Recent Leads</h3>
            <button onClick={() => navigate('/leads')} className="cursor-pointer text-xs text-brand-600 dark:text-brand-400 hover:underline">View all</button>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {(data.recent_leads || []).length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-400 dark:text-slate-500 text-center">No leads yet</p>
            ) : (data.recent_leads || []).map(lead => (
              <div
                key={lead.id}
                onClick={() => openLeadProfile(lead.id, lead)}
                className="cursor-pointer flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">{lead.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{lead.phone} · {lead.source}</p>
                </div>
                <StatusBadge status={lead.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Pending Follow-ups — clickable rows open the full profile modal */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Follow-ups Requiring Action</h3>
            <button onClick={() => navigate('/leads')} className="cursor-pointer text-xs text-brand-600 dark:text-brand-400 hover:underline">View all</button>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {(data.pending_followup_tasks || []).length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-400 dark:text-slate-500 text-center">No pending follow-ups</p>
            ) : (data.pending_followup_tasks || []).map(task => (
              <div
                key={task.id}
                onClick={() => openLeadProfile(task.id, { name: task.entity_name, next_follow_up_date: task.due_date, status: 'contacted' })}
                className="cursor-pointer flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">{task.entity_name || 'Unknown'}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{task.task_type} · Due: {task.due_date?.split('T')[0] || 'N/A'}</p>
                </div>
                <StatusBadge status={task.priority} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Check-ins */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Recent Check-ins</h3>
            <button onClick={() => navigate('/check-in')} className="cursor-pointer text-xs text-brand-600 dark:text-brand-400 hover:underline">View all</button>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {(data.recent_checkins || []).length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-400 dark:text-slate-500 text-center">No check-ins recorded</p>
            ) : (data.recent_checkins || []).map(ci => (
              <div key={ci.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{ci.member_name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{ci.entry_method} · {ci.check_in_time?.split('T')[1]?.split('.')[0] || ''}</p>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500">{ci.check_in_time?.split('T')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expiring Memberships */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Memberships Expiring Soon</h3>
            <button onClick={() => navigate('/members')} className="cursor-pointer text-xs text-brand-600 dark:text-brand-400 hover:underline">View all</button>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {(data.expiring_memberships || []).length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-400 dark:text-slate-500 text-center">No expiring memberships</p>
            ) : (data.expiring_memberships || []).map((ms: any) => (
              <div key={ms.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{ms.member_name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{ms.plan_name} · Expires: {ms.expiry_date}</p>
                </div>
                <StatusBadge status={ms.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Profile Modal — opened from Recent Leads / Follow-ups rows above */}
      {profileLead && (
        <LeadProfileModal
          lead={profileLead}
          partial={profilePartial}
          onClose={() => setProfileLead(null)}
          onAction={handleProfileAction}
          onStatusChange={handleProfileStatusChange}
        />
      )}
    </div>
  )
}
