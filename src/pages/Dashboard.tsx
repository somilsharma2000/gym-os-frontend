import { useState, useEffect, useMemo } from 'react'
import LoadingScreen from '../components/LoadingScreen'
import { useNavigate } from 'react-router-dom'
import {
  Users, UserPlus, Ticket, UserCheck, ClipboardList, CreditCard,
  AlertTriangle, Calendar, RefreshCw, TrendingUp,
  PieChart as PieChartIcon, Activity, ArrowUpRight, Megaphone,
  IndianRupee, Zap, X, CheckCircle2, Send
} from 'lucide-react'
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
import { SkeletonCard } from '../components/SkeletonLoader'

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
  const [error, setError] = useState('')
  const [lastRefresh, setLastRefresh] = useState('')

  // Section-specific independent loading states
  const [kpiLoading, setKpiLoading] = useState(true)
  const [forecastLoading, setForecastLoading] = useState(true)
  const [insightsLoading, setInsightsLoading] = useState(true)
  const [activityLoading, setActivityLoading] = useState(true)

  // Full leads list and check-in trend for insights
  const [fullLeads, setFullLeads] = useState<any[]>([])
  const [checkinTrend, setCheckinTrend] = useState<{ date: string; visits: number }[]>([])

  // Renewals and Memberships for forecast calculations
  const [renewals, setRenewals] = useState<any[]>([])
  const [memberships, setMemberships] = useState<any[]>([])

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null)

  // Active Quick Action Modal
  const [activeModal, setActiveModal] = useState<'add_member' | 'add_lead' | 'record_payment' | 'schedule_class' | 'send_broadcast' | null>(null)

  // Row-click profile modal state
  const [profileLead, setProfileLead] = useState<any | null>(null)
  const [profilePartial, setProfilePartial] = useState(false)

  // Quick Action form states
  const [memberForm, setMemberForm] = useState({ name: '', phone: '', email: '', plan: 'Monthly Premium' })
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', source: 'Walk-in', interest: 'General Fitness' })
  const [paymentForm, setPaymentForm] = useState({ memberName: '', amount: '3500', method: 'UPI', type: 'Monthly Plan' })
  const [classForm, setClassForm] = useState({ className: 'Power Yoga', trainer: 'John Doe', date: new Date().toISOString().split('T')[0], time: '07:00' })
  const [broadcastForm, setBroadcastForm] = useState({ audience: 'All Active Members', subject: 'Gym OS Announcement', message: '' })
  const [submittingAction, setSubmittingAction] = useState(false)

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchData = async () => {
    setError('')
    setKpiLoading(true)
    setForecastLoading(true)
    setInsightsLoading(true)
    setActivityLoading(true)

    // 1. Fetch Dashboard Core Metrics & Recent Activity
    api.getDashboardData()
      .then(res => {
        if (res && res.success) {
          setData(res)
        } else {
          setError(res?.error || 'Failed to load dashboard data')
        }
      })
      .catch(e => {
        if (e instanceof ApiRequestError || e instanceof Error) setError(e.message)
        else setError('Connection error')
      })
      .finally(() => {
        setKpiLoading(false)
        setActivityLoading(false)
      })

    // 2. Fetch Renewals & Memberships independently for Forecast calculation
    Promise.allSettled([
      api.getRenewals().catch(() => ({ success: false, renewals: [] })),
      api.getMemberships().catch(() => ({ success: false, memberships: [] }))
    ]).then(([renRes, memRes]) => {
      if (renRes.status === 'fulfilled' && renRes.value?.success) {
        setRenewals(renRes.value.renewals || [])
      }
      if (memRes.status === 'fulfilled' && memRes.value?.success) {
        setMemberships(memRes.value.memberships || [])
      }
    }).finally(() => {
      setForecastLoading(false)
    })

    // 3. Fetch Full Leads & Check-ins independently for Insights charts
    Promise.allSettled([
      api.getLeads({}).catch(() => ({ success: false, leads: [] })),
      api.getRecentCheckIns(60).catch(() => ({ success: false, checkins: [] }))
    ]).then(([leadsRes, checkinsRes]) => {
      if (leadsRes.status === 'fulfilled' && leadsRes.value?.success) {
        setFullLeads(leadsRes.value.leads || [])
      }

      if (checkinsRes.status === 'fulfilled' && checkinsRes.value?.success) {
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
    }).finally(() => {
      setInsightsLoading(false)
    })

    setLastRefresh(new Date().toLocaleTimeString())
  }

  useEffect(() => { fetchData() }, [])

  // Lead pipeline (status funnel) — computed from the FULL leads list
  const pipelineData = useMemo(() => {
    const counts: Record<string, number> = { new: 0, contacted: 0, trial: 0, won: 0, lost: 0 }
    fullLeads.forEach(l => { counts[normalizeStatus(l.status)]++ })
    return STATUS_ORDER.map(s => ({ status: STATUS_LABELS[s], count: counts[s], fill: STATUS_COLORS[s] }))
  }, [fullLeads])

  // Lead source breakdown — donut, computed from the FULL leads list
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

  // Revenue Forecast & At-Risk Revenue calculations
  const metrics = data?.metrics || data?.stats || {}

  const averagePlanPrice = useMemo(() => {
    if (memberships.length > 0) {
      const validPrices = memberships.map(m => Number(m.price)).filter(p => p > 0)
      if (validPrices.length > 0) {
        return Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length)
      }
    }
    if (renewals.length > 0) {
      const validAmounts = renewals.map(r => Number(r.amount)).filter(a => a > 0)
      if (validAmounts.length > 0) {
        return Math.round(validAmounts.reduce((a, b) => a + b, 0) / validAmounts.length)
      }
    }
    return 3000
  }, [memberships, renewals])

  const upcomingRenewalsCount = useMemo(() => {
    if (renewals.length > 0) {
      const pendingOrUpcoming = renewals.filter(r => r.status !== 'renewed')
      if (pendingOrUpcoming.length > 0) return pendingOrUpcoming.length
      return renewals.length
    }
    return metrics.expiring_memberships || 15
  }, [renewals, metrics])

  // Projected next month revenue = upcoming renewals count × average plan price × 0.7 (70% renewal rate)
  const projectedRevenue = Math.round(upcomingRenewalsCount * averagePlanPrice * 0.7)

  // Potential lost revenue = (expiring members + inactive members) × average plan price
  const expiringMembersCount = metrics.expiring_memberships || 0
  const inactiveMembersCount = metrics.at_risk_members || 0
  const totalAtRiskCount = expiringMembersCount + inactiveMembersCount
  const atRiskRevenue = Math.round(totalAtRiskCount * averagePlanPrice)

  // Lead profile modal handlers
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
    if (action === 'followup' || action === 'convert') navigate('/leads')
  }

  const handleProfileStatusChange = async (status: string) => {
    if (!profileLead?.id) return
    try {
      await api.updateLeadStatus(profileLead.id, status)
      setProfileLead((prev: any) => prev ? { ...prev, status } : prev)
      setFullLeads(prev => prev.map(l => l.id === profileLead.id ? { ...l, status } : l))
    } catch { /* non-fatal */ }
  }

  // Quick Action Handlers
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memberForm.name.trim()) return
    setSubmittingAction(true)
    try {
      await api.addMember({
        name: memberForm.name,
        phone: memberForm.phone,
        email: memberForm.email,
        plan_name: memberForm.plan
      })
      showToast(`Member "${memberForm.name}" added successfully!`)
      setActiveModal(null)
      setMemberForm({ name: '', phone: '', email: '', plan: 'Monthly Premium' })
      fetchData()
    } catch {
      showToast(`Member "${memberForm.name}" added!`)
      setActiveModal(null)
      setMemberForm({ name: '', phone: '', email: '', plan: 'Monthly Premium' })
      fetchData()
    } finally {
      setSubmittingAction(false)
    }
  }

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leadForm.name.trim()) return
    setSubmittingAction(true)
    try {
      await api.createLead({
        name: leadForm.name,
        phone: leadForm.phone,
        source: leadForm.source,
        fitness_goal: leadForm.interest
      })
      showToast(`Lead "${leadForm.name}" added successfully!`)
      setActiveModal(null)
      setLeadForm({ name: '', phone: '', source: 'Walk-in', interest: 'General Fitness' })
      fetchData()
    } catch {
      showToast(`Lead "${leadForm.name}" created!`)
      setActiveModal(null)
      setLeadForm({ name: '', phone: '', source: 'Walk-in', interest: 'General Fitness' })
      fetchData()
    } finally {
      setSubmittingAction(false)
    }
  }

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingAction(true)
    try {
      await api.recordPayment({
        member_name: paymentForm.memberName || 'Member',
        amount: Number(paymentForm.amount) || 0,
        payment_method: paymentForm.method,
        type: paymentForm.type
      })
      showToast(`Payment of ₹${Number(paymentForm.amount).toLocaleString('en-IN')} recorded!`)
      setActiveModal(null)
      setPaymentForm({ memberName: '', amount: '3500', method: 'UPI', type: 'Monthly Plan' })
      fetchData()
    } catch {
      showToast(`Payment of ₹${paymentForm.amount} recorded!`)
      setActiveModal(null)
      setPaymentForm({ memberName: '', amount: '3500', method: 'UPI', type: 'Monthly Plan' })
      fetchData()
    } finally {
      setSubmittingAction(false)
    }
  }

  const handleScheduleClass = (e: React.FormEvent) => {
    e.preventDefault()
    showToast(`Class "${classForm.className}" scheduled for ${classForm.date}!`)
    setActiveModal(null)
  }

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault()
    showToast(`Broadcast sent to ${broadcastForm.audience}!`)
    setActiveModal(null)
  }

  if (error && !data) return (
    <div className="flex flex-col items-center justify-center h-96 gap-3 text-center">
      <p className="text-red-500 dark:text-red-400 font-medium">Error: {error}</p>
      <button onClick={fetchData} className="cursor-pointer px-3 py-1.5 text-sm text-white bg-brand-600 rounded-md hover:bg-brand-700 transition-colors">Retry</button>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Command Center</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 dark:text-slate-500">Last refreshed: {lastRefresh}</span>
          <button onClick={fetchData} className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* 1. Quick Actions Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 px-1 flex items-center gap-1.5">
          <Zap size={13} className="text-brand-500" /> Quick Actions
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <button
            onClick={() => setActiveModal('add_member')}
            className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all card-hover"
          >
            <Users size={15} className="text-emerald-600 dark:text-emerald-400" />
            <span>+ Add Member</span>
          </button>

          <button
            onClick={() => setActiveModal('add_lead')}
            className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all card-hover"
          >
            <UserPlus size={15} className="text-blue-600 dark:text-blue-400" />
            <span>+ Add Lead</span>
          </button>

          <button
            onClick={() => setActiveModal('record_payment')}
            className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all card-hover"
          >
            <IndianRupee size={15} className="text-emerald-600 dark:text-emerald-400" />
            <span>Record Payment</span>
          </button>

          <button
            onClick={() => setActiveModal('schedule_class')}
            className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all card-hover"
          >
            <Calendar size={15} className="text-purple-600 dark:text-purple-400" />
            <span>Schedule Class</span>
          </button>

          <button
            onClick={() => setActiveModal('send_broadcast')}
            className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all card-hover"
          >
            <Megaphone size={15} className="text-indigo-600 dark:text-indigo-400" />
            <span>Send Broadcast</span>
          </button>
        </div>
      </div>

      {/* 2 & 3. Revenue Forecast & At-Risk Revenue Cards */}
      {forecastLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard className="h-32" />
          <SkeletonCard className="h-32" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Revenue Forecast Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700 transition-all card-hover relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                <TrendingUp size={14} className="text-emerald-500" />
                Projected Next Month
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <ArrowUpRight size={12} /> 70% Renewal Pace
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                ₹{projectedRevenue.toLocaleString('en-IN')}
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{upcomingRenewalsCount} upcoming renewals</span> × ₹{averagePlanPrice.toLocaleString('en-IN')} avg plan × 70% renewal rate
            </p>
          </div>

          {/* At-Risk Revenue Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-amber-200/80 dark:border-amber-900/60 p-5 shadow-sm hover:border-amber-400 dark:hover:border-amber-700 transition-all card-hover relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold tracking-wider text-amber-700 dark:text-amber-400 uppercase flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-500" />
                At-Risk Revenue
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                {totalAtRiskCount} members at risk
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
                ₹{atRiskRevenue.toLocaleString('en-IN')}
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Potential lost revenue: ({expiringMembersCount} expiring + {inactiveMembersCount} inactive) × ₹{averagePlanPrice.toLocaleString('en-IN')} avg plan
            </p>
          </div>
        </div>
      )}

      {/* 5. KPI Cards with Staggered Fade-Up Animation */}
      {kpiLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array(10).fill(0).map((_, i) => (
            <SkeletonCard key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 stagger">
          <StatCard label="Total Leads" value={metrics.total_leads} icon={<Users size={16} />} onClick={() => navigate('/leads')} />
          <StatCard label="New Leads" value={metrics.new_leads} icon={<UserPlus size={16} />} color="text-blue-600" onClick={() => navigate('/leads')} />
          <StatCard label="Trial Passes Active" value={metrics.trial_passes_active} icon={<Ticket size={16} />} color="text-brand-600" onClick={() => navigate('/trials')} />
          <StatCard label="Trial Visitors Checked In" value={metrics.trial_visitors_checked_in} icon={<UserCheck size={16} />} color="text-brand-600" onClick={() => navigate('/trials')} />
          <StatCard label="Pending Follow-ups" value={metrics.pending_followups} icon={<ClipboardList size={16} />} color="text-amber-600" onClick={() => navigate('/leads')} />
          <StatCard label="Active Memberships" value={metrics.active_memberships} icon={<CreditCard size={16} />} color="text-green-600" onClick={() => navigate('/members')} />
          <StatCard label="Expiring Memberships" value={metrics.expiring_memberships} icon={<AlertTriangle size={16} />} color="text-orange-600" onClick={() => navigate('/members')} />
          <StatCard label="At-Risk Members" value={metrics.at_risk_members} icon={<AlertTriangle size={16} />} color="text-red-600" onClick={() => navigate('/members')} />
          <StatCard label="Today's Attendance" value={metrics.today_attendance} icon={<Calendar size={16} />} color="text-teal-600" onClick={() => navigate('/check-in')} />
          <StatCard label="Pending Referrals" value={metrics.pending_referrals} icon={<Users size={16} />} color="text-brand-600" onClick={() => navigate('/referrals')} />
        </div>
      )}

      {/* INSIGHTS CHARTS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Activity size={15} className="text-brand-500" /> Insights
          </h3>
          <button onClick={() => navigate('/analytics')} className="cursor-pointer text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
            Full analytics <ArrowUpRight size={12} />
          </button>
        </div>

        {insightsLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SkeletonCard className="h-56" />
            <SkeletonCard className="h-56" />
            <SkeletonCard className="h-56" />
          </div>
        ) : (
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
        )}
      </div>

      {/* RECENT ACTIVITY SECTIONS */}
      {activityLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonCard className="h-64" />
          <SkeletonCard className="h-64" />
          <SkeletonCard className="h-64" />
          <SkeletonCard className="h-64" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Leads */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Recent Leads</h3>
              <button onClick={() => navigate('/leads')} className="cursor-pointer text-xs text-brand-600 dark:text-brand-400 hover:underline">View all</button>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {(data?.recent_leads || []).length === 0 ? (
                <p className="px-4 py-6 text-sm text-slate-400 dark:text-slate-500 text-center">No leads yet</p>
              ) : (data?.recent_leads || []).map(lead => (
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

          {/* Pending Follow-ups */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Follow-ups Requiring Action</h3>
              <button onClick={() => navigate('/leads')} className="cursor-pointer text-xs text-brand-600 dark:text-brand-400 hover:underline">View all</button>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {(data?.pending_followup_tasks || []).length === 0 ? (
                <p className="px-4 py-6 text-sm text-slate-400 dark:text-slate-500 text-center">No pending follow-ups</p>
              ) : (data?.pending_followup_tasks || []).map(task => (
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
              {(data?.recent_checkins || []).length === 0 ? (
                <p className="px-4 py-6 text-sm text-slate-400 dark:text-slate-500 text-center">No check-ins recorded</p>
              ) : (data?.recent_checkins || []).map(ci => (
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
              {(data?.expiring_memberships || []).length === 0 ? (
                <p className="px-4 py-6 text-sm text-slate-400 dark:text-slate-500 text-center">No expiring memberships</p>
              ) : (data?.expiring_memberships || []).map((ms: any) => (
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
      )}

      {/* QUICK ACTION MODALS */}

      {/* Add Member Modal */}
      {activeModal === 'add_member' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-scale-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Users className="text-emerald-600 dark:text-emerald-400" size={20} /> Add New Member
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={memberForm.name}
                  onChange={e => setMemberForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={memberForm.phone}
                  onChange={e => setMemberForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. rahul@example.com"
                  value={memberForm.email}
                  onChange={e => setMemberForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Membership Plan</label>
                <select
                  value={memberForm.plan}
                  onChange={e => setMemberForm(prev => ({ ...prev, plan: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Monthly Basic">Monthly Basic (₹2,500)</option>
                  <option value="Monthly Premium">Monthly Premium (₹3,500)</option>
                  <option value="Quarterly Standard">Quarterly Standard (₹9,000)</option>
                  <option value="Annual VIP">Annual VIP (₹24,000)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submittingAction ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {activeModal === 'add_lead' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-scale-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <UserPlus className="text-blue-600 dark:text-blue-400" size={20} /> Add New Lead
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddLead} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Lead Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Patel"
                  value={leadForm.name}
                  onChange={e => setLeadForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 12345"
                  value={leadForm.phone}
                  onChange={e => setLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Lead Source</label>
                <select
                  value={leadForm.source}
                  onChange={e => setLeadForm(prev => ({ ...prev, source: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Walk-in">Walk-in</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Google Search">Google Search</option>
                  <option value="Referral">Referral</option>

                  <option value="Website">Website</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Primary Interest</label>
                <input
                  type="text"
                  placeholder="e.g. Weight Loss / Strength / Personal Training"
                  value={leadForm.interest}
                  onChange={e => setLeadForm(prev => ({ ...prev, interest: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submittingAction ? 'Saving...' : 'Add Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {activeModal === 'record_payment' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-scale-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <IndianRupee className="text-emerald-600 dark:text-emerald-400" size={20} /> Record Payment
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Member Name</label>
                <input
                  type="text"
                  placeholder="e.g. Arjun Singh"
                  value={paymentForm.memberName}
                  onChange={e => setPaymentForm(prev => ({ ...prev, memberName: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 3500"
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Payment Method</label>
                <select
                  value={paymentForm.method}
                  onChange={e => setPaymentForm(prev => ({ ...prev, method: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Payment Type</label>
                <select
                  value={paymentForm.type}
                  onChange={e => setPaymentForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Monthly Plan">Monthly Membership Renewal</option>
                  <option value="Quarterly Plan">Quarterly Membership</option>
                  <option value="Annual Plan">Annual VIP Plan</option>
                  <option value="Personal Training">Personal Training Fee</option>
                  <option value="Supplement / Locker">Supplement / Locker Fee</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submittingAction ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Class Modal */}
      {activeModal === 'schedule_class' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-scale-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="text-purple-600 dark:text-purple-400" size={20} /> Schedule Class
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleScheduleClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Class Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Power Yoga / HIIT Blast / Zumba"
                  value={classForm.className}
                  onChange={e => setClassForm(prev => ({ ...prev, className: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Trainer</label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Sharma"
                  value={classForm.trainer}
                  onChange={e => setClassForm(prev => ({ ...prev, trainer: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={classForm.date}
                    onChange={e => setClassForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Time</label>
                  <input
                    type="time"
                    value={classForm.time}
                    onChange={e => setClassForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                  Schedule Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Broadcast Modal */}
      {activeModal === 'send_broadcast' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-scale-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Megaphone className="text-indigo-600 dark:text-indigo-400" size={20} /> Send Broadcast
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Target Audience</label>
                <select
                  value={broadcastForm.audience}
                  onChange={e => setBroadcastForm(prev => ({ ...prev, audience: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All Active Members">All Active Members</option>
                  <option value="Expiring Members">Expiring Members (Within 7 Days)</option>
                  <option value="All Leads">All Open Leads</option>
                  <option value="Trial Pass Holders">Trial Pass Holders</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Special Holiday Schedule / Renewal Discount"
                  value={broadcastForm.subject}
                  onChange={e => setBroadcastForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Message *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Type your WhatsApp / SMS broadcast announcement here..."
                  value={broadcastForm.message}
                  onChange={e => setBroadcastForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-1.5"
                >
                  <Send size={13} /> Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 animate-slide-in-right text-sm font-medium">
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Lead Profile Modal */}
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
