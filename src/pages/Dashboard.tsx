import { useState, useEffect } from 'react'
import LoadingScreen from '../components/LoadingScreen'
import { useNavigate } from 'react-router-dom'
import { Users, UserPlus, Ticket, UserCheck, ClipboardList, CreditCard, AlertTriangle, Calendar, RefreshCw } from 'lucide-react'
import { api, ApiRequestError } from '../api/client'
import type { DashboardData } from '../types'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastRefresh, setLastRefresh] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.getDashboardData()
      if (res.success) setData(res)
      else setError(res.error || 'Failed to load dashboard data')
    } catch (e: unknown) {
      if (e instanceof ApiRequestError) {
        setError(e.message)
      } else if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('Connection error')
      }
    }
    setLoading(false)
    setLastRefresh(new Date().toLocaleTimeString())
  }

  useEffect(() => { fetchData() }, [])

  if (loading) return <LoadingScreen message="Loading dashboard..." />
  if (error) return (
    <div className="flex flex-col items-center justify-center h-96 gap-3 text-center">
      <p className="text-red-500 dark:text-red-400 font-medium">Error: {error}</p>
      <button onClick={fetchData} className="px-3 py-1.5 text-sm text-white bg-brand-600 rounded-md hover:bg-brand-700 transition-colors">Retry</button>
    </div>
  )
  if (!data) return <div className="flex items-center justify-center h-96 text-slate-400 dark:text-slate-500">No data</div>

  const m = data.metrics

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Command Center</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 dark:text-slate-500">Last refreshed: {lastRefresh}</span>
          <button onClick={fetchData} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total Leads" value={m.total_leads} icon={<Users size={16} />} onClick={() => navigate('/leads')} />
        <StatCard label="New Leads" value={m.new_leads} icon={<UserPlus size={16} />} color="text-blue-600" onClick={() => navigate('/leads')} />
        <StatCard label="Trial Passes Active" value={m.trial_passes_active} icon={<Ticket size={16} />} color="text-purple-600" onClick={() => navigate('/trials')} />
        <StatCard label="Trial Visitors Checked In" value={m.trial_visitors_checked_in} icon={<UserCheck size={16} />} color="text-cyan-600" onClick={() => navigate('/trials')} />
        <StatCard label="Pending Follow-ups" value={m.pending_followups} icon={<ClipboardList size={16} />} color="text-amber-600" onClick={() => navigate('/leads')} />
        <StatCard label="Active Memberships" value={m.active_memberships} icon={<CreditCard size={16} />} color="text-green-600" onClick={() => navigate('/members')} />
        <StatCard label="Expiring Memberships" value={m.expiring_memberships} icon={<AlertTriangle size={16} />} color="text-orange-600" onClick={() => navigate('/members')} />
        <StatCard label="At-Risk Members" value={m.at_risk_members} icon={<AlertTriangle size={16} />} color="text-red-600" onClick={() => navigate('/members')} />
        <StatCard label="Today's Attendance" value={m.today_attendance} icon={<Calendar size={16} />} color="text-teal-600" onClick={() => navigate('/check-in')} />
        <StatCard label="Pending Referrals" value={m.pending_referrals} icon={<Users size={16} />} color="text-indigo-600" onClick={() => navigate('/referrals')} />
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Leads */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Recent Leads</h3>
            <button onClick={() => navigate('/leads')} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">View all</button>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {(data.recent_leads || []).length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-400 dark:text-slate-500 text-center">No leads yet</p>
            ) : (data.recent_leads || []).map(lead => (
              <div key={lead.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{lead.name}</p>
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
            <button onClick={() => navigate('/leads')} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">View all</button>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {(data.pending_followup_tasks || []).length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-400 dark:text-slate-500 text-center">No pending follow-ups</p>
            ) : (data.pending_followup_tasks || []).map(task => (
              <div key={task.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{task.entity_name || 'Unknown'}</p>
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
            <button onClick={() => navigate('/check-in')} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">View all</button>
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
            <button onClick={() => navigate('/members')} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">View all</button>
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
    </div>
  )
}
