import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, AlertTriangle, Users, Target, Gift, Zap, IndianRupee, RefreshCw, Phone, MessageSquare, Award, Flame, ChevronRight, Loader, CheckCircle } from 'lucide-react'
import { api } from '../api/client'

interface RevenueData {
  forecast: {
    this_month_projected: number
    next_month_pipeline: number
    at_risk_revenue: number
    expiring_count: number
    upcoming_renewals: number
  }
  renewal_queue: {
    total: number
    items: any[]
    potential_revenue: number
  }
  lead_sources: any[]
  pt_upsell: {
    targets: number
    potential_revenue: number
    top_members: any[]
  }
  trial_conversion: {
    total: number
    converted: number
    conversion_rate: number
  }
  referrals: {
    total: number
    leaderboard: any[]
  }
  totals: {
    trainers: number
    members: number
    memberships: number
    leads: number
    checkins: number
  }
}

const GYMOS_BASE = 'https://base44.app/api/apps/6a8949954092729194579577'

async function fetchGymos(entity: string, limit = 500): Promise<any[]> {
  try {
    const r = await fetch(`${GYMOS_BASE}/entities/${entity}?limit=${limit}`, {
      headers: { 'Content-Type': 'application/json' }
    })
    if (!r.ok) return []
    const d = await r.json()
    return d.data || d || []
  } catch { return [] }
}

const STAGE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  reminder_7d: { label: '7-Day Reminder', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  urgent_3d: { label: 'Urgent 3-Day', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  expired_1d: { label: 'Just Expired', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  winback_7d: { label: 'Win-Back 50% Off', color: 'text-red-400', bg: 'bg-red-500/10' },
  lost_14d: { label: 'Lost — Call Personally', color: 'text-rose-400', bg: 'bg-rose-500/10' },
}

const formatINR = (amt: number) => `₹${(amt || 0).toLocaleString('en-IN')}`

export default function RevenueEngine() {
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'renewals' | 'leads' | 'pt' | 'referrals'>('overview')

  const loadData = useCallback(async () => {
    setLoading(true)
    const gymId = localStorage.getItem('gym_os_gym_id') || ''
    
    // Fetch all data from GYMOS app entities directly
    const [memberships, members, leads, checkins, trainers, referrals, trialPasses] = await Promise.all([
      fetchGymos('Membership'),
      fetchGymos('Member'),
      fetchGymos('Lead'),
      fetchGymos('CheckIn'),
      fetchGymos('Trainer', 100),
      fetchGymos('Referral'),
      fetchGymos('TrialPass'),
    ])

    const byGym = (arr: any[]) => arr.filter((x: any) => (x.data?.gym_id || x.gym_id) === gymId)
    const gm = byGym(memberships)
    const gmem = byGym(members)
    const gleads = byGym(leads)
    const gMemberIds = new Set(gmem.map((m: any) => (m.data?.id || m.id)))
    const gcheckins = checkins.filter((c: any) => gMemberIds.has((c.data?.member_id || c.member_id)))
    const gtrainers = byGym(trainers)
    const greferrals = byGym(referrals)
    const gtrials = byGym(trialPasses)

    const now = new Date()

    // --- 5. Revenue Forecast ---
    const active = gm.filter((m: any) => (m.data || m).status === 'active')
    const thisMonthProj = active.reduce((s: number, m: any) => s + ((m.data || m).amount || 3500), 0)
    const nextEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0)
    const upcoming = gm.filter((m: any) => {
      const md = m.data || m
      const exp = new Date(md.expiry_date || md.end_date || md.created_date)
      return exp >= now && exp <= nextEnd && md.status !== 'expired'
    })
    const nextPipeline = upcoming.reduce((s: number, m: any) => s + ((m.data || m).amount || 3500), 0)
    const expiring = gm.filter((m: any) => {
      const md = m.data || m
      const exp = new Date(md.expiry_date || md.end_date || md.created_date)
      return exp.getMonth() === now.getMonth() && exp.getFullYear() === now.getFullYear()
    })
    const atRisk = expiring.filter((m: any) => {
      const md = m.data || m
      const mem = gmem.find((x: any) => (x.data?.id || x.id) === md.member_id)
      if (!mem) return true
      const md2 = mem.data || mem
      const lv = md2.last_visit || md2.last_checkin
      if (!lv) return true
      return ((now.getTime() - new Date(lv).getTime()) / 86400000) >= 7
    }).reduce((s: number, m: any) => s + ((m.data || m).amount || 3500), 0)

    // --- 1. Renewal Queue ---
    const queue: any[] = []
    for (const m of gm) {
      const md = m.data || m
      const exp = new Date(md.expiry_date || md.end_date || md.created_date)
      const days = Math.ceil((exp.getTime() - now.getTime()) / 86400000)
      let stage = ''
      if (days <= 7 && days > 3) stage = 'reminder_7d'
      else if (days <= 3 && days > 0) stage = 'urgent_3d'
      else if (days <= 0 && days >= -1) stage = 'expired_1d'
      else if (days < -1 && days >= -7) stage = 'winback_7d'
      else if (days < -7 && days >= -14) stage = 'lost_14d'
      if (stage) {
        const mem = gmem.find((x: any) => (x.data?.id || x.id) === md.member_id)
        queue.push({
          member_name: md.member_name || 'Unknown',
          plan_name: md.plan_name || '',
          days_until_expiry: days,
          stage,
          phone: mem ? ((mem.data || mem).phone || '') : '',
          amount: md.amount || 3500
        })
      }
    }
    queue.sort((a, b) => a.days_until_expiry - b.days_until_expiry)

    // --- 7. Lead Source ROI ---
    const sources: Record<string, any> = {}
    gleads.forEach((l: any) => {
      const ld = l.data || l
      const src = ld.source || 'unknown'
      if (!sources[src]) sources[src] = { source: src, total: 0, converted: 0, conversion_rate: 0 }
      sources[src].total++
      if (ld.status === 'converted' || ld.status === 'won') sources[src].converted++
    })
    Object.values(sources).forEach((s: any) => {
      s.conversion_rate = s.total > 0 ? Math.round((s.converted / s.total) * 100) : 0
    })
    const leadSources = Object.values(sources).sort((a: any, b: any) => b.total - a.total)

    // --- 4. PT Upsell ---
    const ckCounts: Record<string, number> = {}
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    gcheckins.forEach((c: any) => {
      const cd = c.data || c
      try { if (new Date(cd.check_in_time) >= monthAgo) ckCounts[cd.member_id] = (ckCounts[cd.member_id] || 0) + 1 } catch {}
    })
    const ptTargets = gmem.filter((m: any) => {
      const md = m.data || m
      return (ckCounts[md.id || m.id] || 0) >= 16 && !md.trainer_id
    }).map((m: any) => ({
      name: (m.data || m).name || 'Unknown',
      checkins: ckCounts[(m.data || m).id || m.id] || 0,
      phone: (m.data || m).phone || ''
    }))

    // --- 3. Trial Conversion ---
    const tTotal = gtrials.length
    const tConverted = gtrials.filter((t: any) => {
      const s = (t.data || t).status
      return s === 'converted' || s === 'completed' || s === 'expired'
    }).length

    // --- 2. Referral Leaderboard ---
    const refBoard: any[] = []
    greferrals.forEach((r: any) => {
      const rd = r.data || r
      const ex = refBoard.find(e => e.name === rd.referrer_name)
      if (ex) ex.count++
      else refBoard.push({ name: rd.referrer_name || 'Unknown', count: 1 })
    })
    refBoard.sort((a, b) => b.count - a.count)

    setData({
      forecast: {
        this_month_projected: thisMonthProj,
        next_month_pipeline: nextPipeline,
        at_risk_revenue: atRisk,
        expiring_count: expiring.length,
        upcoming_renewals: upcoming.length
      },
      renewal_queue: {
        total: queue.length,
        items: queue.slice(0, 15),
        potential_revenue: queue.reduce((s, q) => s + q.amount, 0)
      },
      lead_sources: leadSources,
      pt_upsell: {
        targets: ptTargets.length,
        potential_revenue: ptTargets.length * 1000,
        top_members: ptTargets.slice(0, 5)
      },
      trial_conversion: {
        total: tTotal,
        converted: tConverted,
        conversion_rate: tTotal > 0 ? Math.round((tConverted / tTotal) * 100) : 0
      },
      referrals: {
        total: greferrals.length,
        leaderboard: refBoard.slice(0, 5)
      },
      totals: {
        trainers: gtrainers.length,
        members: gmem.length,
        memberships: gm.length,
        leads: gleads.length,
        checkins: gcheckins.length
      }
    })
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={24} className="animate-spin text-brand-500" />
        <span className="ml-3 text-slate-500">Loading revenue engine...</span>
      </div>
    )
  }

  if (!data) return <div className="text-center py-20 text-slate-500">No data available</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap size={24} className="text-brand-500" /> Revenue Engine
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">7 automated systems to maximize gym revenue</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'renewals', label: 'Renewal Recovery', icon: AlertTriangle },
          { id: 'leads', label: 'Lead Source ROI', icon: Target },
          { id: 'pt', label: 'PT Upsell', icon: Flame },
          { id: 'referrals', label: 'Referrals', icon: Gift },
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Icon size={16} /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Revenue Forecast Cards */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-brand-500" /> Revenue Forecast
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-500/10 rounded-xl"><IndianRupee size={20} className="text-green-500" /></div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatINR(data.forecast.this_month_projected)}</p>
                    <p className="text-xs text-slate-500">This Month Projected</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 rounded-xl"><TrendingUp size={20} className="text-blue-500" /></div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatINR(data.forecast.next_month_pipeline)}</p>
                    <p className="text-xs text-slate-500">Next Month Pipeline ({data.forecast.upcoming_renewals} renewals)</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-500/10 rounded-xl"><AlertTriangle size={20} className="text-red-500" /></div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{formatINR(data.forecast.at_risk_revenue)}</p>
                    <p className="text-xs text-slate-500">At-Risk Revenue ({data.forecast.expiring_count} expiring)</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-500/10 rounded-xl"><Users size={20} className="text-purple-500" /></div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.totals.members}</p>
                    <p className="text-xs text-slate-500">Total Members</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Renewal Queue Summary */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-500" /> Renewal Queue
                </h3>
                <button onClick={() => setActiveTab('renewals')} className="text-xs text-brand-500 hover:text-brand-600 font-medium">View all →</button>
              </div>
              <p className="text-3xl font-bold text-amber-500">{data.renewal_queue.total}</p>
              <p className="text-xs text-slate-500 mt-1">Members need attention · {formatINR(data.renewal_queue.potential_revenue)} at stake</p>
            </div>

            {/* Trial Conversion */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target size={16} className="text-blue-500" /> Trial Conversion
                </h3>
              </div>
              <p className="text-3xl font-bold text-blue-500">{data.trial_conversion.conversion_rate}%</p>
              <p className="text-xs text-slate-500 mt-1">{data.trial_conversion.converted}/{data.trial_conversion.total} trials converted</p>
            </div>

            {/* PT Upsell */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame size={16} className="text-orange-500" /> PT Upsell Targets
                </h3>
                <button onClick={() => setActiveTab('pt')} className="text-xs text-brand-500 hover:text-brand-600 font-medium">View →</button>
              </div>
              <p className="text-3xl font-bold text-orange-500">{data.pt_upsell.targets}</p>
              <p className="text-xs text-slate-500 mt-1">High-intent members · {formatINR(data.pt_upsell.potential_revenue)} potential</p>
            </div>
          </div>

          {/* Lead Source ROI Mini */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Target size={16} className="text-brand-500" /> Lead Source ROI
              </h3>
              <button onClick={() => setActiveTab('leads')} className="text-xs text-brand-500 hover:text-brand-600 font-medium">View details →</button>
            </div>
            <div className="space-y-2">
              {data.lead_sources.slice(0, 5).map((src: any) => (
                <div key={src.source} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">{src.source}</span>
                    <span className="text-xs text-slate-500">{src.total} leads</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${src.conversion_rate}%` }} />
                    </div>
                    <span className={`text-sm font-semibold ${src.conversion_rate >= 20 ? 'text-green-500' : src.conversion_rate >= 10 ? 'text-amber-500' : 'text-red-500'}`}>
                      {src.conversion_rate}%
                    </span>
                  </div>
                </div>
              ))}
              {data.lead_sources.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No lead source data yet</p>}
            </div>
          </div>
        </div>
      )}

      {/* Renewal Recovery Tab */}
      {activeTab === 'renewals' && (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <h3 className="font-semibold text-amber-600 flex items-center gap-2">
              <AlertTriangle size={18} /> Smart Renewal Recovery Engine
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Automated sequence: 7 days → WhatsApp reminder · 3 days → payment link · 1 day → 10% off · 7 days → 50% off win-back · 14 days → personal call
            </p>
          </div>

          {data.renewal_queue.items.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <CheckCircle size={48} className="mx-auto mb-3 text-green-500" />
              <p>All memberships are healthy — no renewals need attention right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.renewal_queue.items.map((item: any, i: number) => {
                const stage = STAGE_LABELS[item.stage] || { label: item.stage, color: 'text-slate-400', bg: 'bg-slate-500/10' }
                return (
                  <div key={i} className={`p-4 rounded-xl border border-slate-200 dark:border-slate-700 ${stage.bg} flex items-center justify-between`}>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{item.member_name}</p>
                        <p className="text-xs text-slate-500">{item.plan_name} · {item.days_until_expiry > 0 ? `${item.days_until_expiry}d left` : `${Math.abs(item.days_until_expiry)}d ago`}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stage.color} ${stage.bg}`}>
                        {stage.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{formatINR(item.amount)}</span>
                      {item.phone && (
                        <a href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                          className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-600 rounded-lg" title="Send WhatsApp">
                          <MessageSquare size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Lead Source ROI Tab */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <h3 className="font-semibold text-blue-600 flex items-center gap-2">
              <Target size={18} /> Lead Source ROI Tracking
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              See which lead sources convert best. Double down on what works, cut what doesn't.
            </p>
          </div>

          {data.lead_sources.length === 0 ? (
            <p className="text-center py-12 text-slate-500">No lead source data yet</p>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase">Source</th>
                    <th className="text-center p-4 text-xs font-semibold text-slate-500 uppercase">Total Leads</th>
                    <th className="text-center p-4 text-xs font-semibold text-slate-500 uppercase">Converted</th>
                    <th className="text-center p-4 text-xs font-semibold text-slate-500 uppercase">Conversion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lead_sources.map((src: any, i: number) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-700 last:border-0">
                      <td className="p-4 text-sm font-medium text-slate-900 dark:text-white capitalize">{src.source}</td>
                      <td className="p-4 text-center text-sm text-slate-600 dark:text-slate-300">{src.total}</td>
                      <td className="p-4 text-center text-sm text-green-500 font-semibold">{src.converted}</td>
                      <td className="p-4 text-center">
                        <span className={`text-sm font-bold ${src.conversion_rate >= 20 ? 'text-green-500' : src.conversion_rate >= 10 ? 'text-amber-500' : 'text-red-500'}`}>
                          {src.conversion_rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PT Upsell Tab */}
      {activeTab === 'pt' && (
        <div className="space-y-4">
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
            <h3 className="font-semibold text-orange-600 flex items-center gap-2">
              <Flame size={18} /> Personal Training Upsell Engine
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Members who attend 4+ times/week but have no PT trainer are high-intent, high-budget. One PT session = ₹500-1500.
            </p>
          </div>

          {data.pt_upsell.top_members.length === 0 ? (
            <p className="text-center py-12 text-slate-500">No high-intent members without PT detected. Keep monitoring!</p>
          ) : (
            <div className="space-y-3">
              {data.pt_upsell.top_members.map((member: any, i: number) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-orange-500/10 rounded-xl">
                      <Flame size={18} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.checkins} check-ins this month</p>
                    </div>
                  </div>
                  {member.phone && (
                    <a href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-600 rounded-lg text-sm font-semibold">
                      <MessageSquare size={14} /> Offer PT
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Referrals Tab */}
      {activeTab === 'referrals' && (
        <div className="space-y-4">
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <h3 className="font-semibold text-purple-600 flex items-center gap-2">
              <Gift size={18} /> Automated Referral Program
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Members who refer someone have 3x higher retention. Word-of-mouth = cheapest lead source.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <p className="text-3xl font-bold text-purple-500">{data.referrals.total}</p>
              <p className="text-xs text-slate-500 mt-1">Total Referrals</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{data.totals.members}</p>
              <p className="text-xs text-slate-500 mt-1">Members with referral codes</p>
            </div>
          </div>

          {data.referrals.leaderboard.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Award size={16} className="text-amber-500" /> Referral Leaderboard
              </h4>
              <div className="space-y-2">
                {data.referrals.leaderboard.map((ref: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-500/20 text-amber-500' : i === 1 ? 'bg-slate-400/20 text-slate-400' : i === 2 ? 'bg-orange-700/20 text-orange-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{ref.name}</span>
                    </div>
                    <span className="text-sm font-bold text-purple-500">{ref.count} referrals</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

