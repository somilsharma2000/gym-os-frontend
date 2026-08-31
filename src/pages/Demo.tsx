import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  UserCheck,
  TrendingUp,
  IndianRupee,
  Ticket,
  AlertTriangle,
  ArrowUpRight,
  Search,
  ChevronRight,
  Sparkles,
  QrCode,


  BarChart2,

  Phone,
  Mail,
  CheckCircle2,
  Clock,

  Building2,
  Lock,
  MessageSquare
} from 'lucide-react'
import { demoDashboardData, demoLeads, demoRevenue } from '../data/demoData'

// Custom count-up hook for animated statistics
function useCountUp(endValue: number, duration: number = 1000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out quad
      const easedProgress = 1 - (1 - progress) * (1 - progress);
      setCount(Math.floor(easedProgress * endValue));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(endValue);
      }
    };
    window.requestAnimationFrame(step);
  }, [endValue, duration]);

  return count;
}

function StatTile({
  title,
  value,
  prefix = '',
  suffix = '',
  change,
  changeType = 'positive',
  icon: Icon,
  description,
  onClick
}: {
  title: string
  value: number
  prefix?: string
  suffix?: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: any
  description?: string
  onClick?: () => void
}) {
  const animatedValue = useCountUp(value, 1200)

  return (
    <div
      onClick={onClick}
      className="bg-slate-800/80 backdrop-blur border border-slate-700/70 hover:border-brand-500/50 rounded-2xl p-5 shadow-lg hover:shadow-brand-600/10 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
          <div className="p-2.5 rounded-xl bg-brand-600/10 text-brand-400 group-hover:bg-brand-600 group-hover:text-slate-900 transition-colors duration-300">
            <Icon size={20} />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-extrabold text-white tracking-tight">
            {prefix}{animatedValue.toLocaleString()}{suffix}
          </h3>
          {change && (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                changeType === 'positive'
                  ? 'bg-brand-600/20 text-brand-400'
                  : changeType === 'negative'
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              <ArrowUpRight size={12} className={changeType === 'negative' ? 'rotate-90' : ''} />
              {change}
            </span>
          )}
        </div>
      </div>
      {description && (
        <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-700/50">{description}</p>
      )}
    </div>
  )
}

export default function Demo() {
  const navigate = useNavigate()
  const [leadFilter, setLeadFilter] = useState<'all' | 'new' | 'follow_up' | 'won'>('all')
  const [searchTerm, setSearchLead] = useState('')
  const [selectedLead, setSelectedLead] = useState<any | null>(null)
  const [activeChartTab, setActiveChartTab] = useState<'revenue' | 'sources'>('revenue')

  // Filtered Leads
  const filteredLeads = demoLeads.filter(lead => {
    const matchesFilter = leadFilter === 'all' ? true : lead.status === leadFilter
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.interest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.source.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-brand-600 selection:text-slate-900">
      {/* TOP DEMO BANNER */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-brand-600 via-brand-700 to-brand-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <span className="text-xs sm:text-sm font-bold tracking-wide uppercase bg-black/20 px-2 py-0.5 rounded text-brand-100">
              Interactive Demo
            </span>
            <span className="text-xs sm:text-sm font-medium hidden md:inline text-brand-50">
              Demo Mode — Explore with sample data
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="cursor-pointer px-4 py-1.5 bg-slate-900 hover:bg-black text-brand-400 hover:text-brand-300 text-xs sm:text-sm font-bold rounded-lg transition-all transform hover:scale-105 shadow-md flex items-center gap-1.5 border border-brand-500/30"
            >
              <span>Sign Up Your Gym</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* DEMO HEADER / NAVBAR */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between sticky top-[41px] z-40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}brand/beyond-pixells-logo.png`}
              alt="Beyond Pixells"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white">GYM OS</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-600/10 text-brand-400 border border-brand-500/30 rounded-full uppercase">
                  Preview
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Building2 size={12} className="text-brand-400" /> Pulse Fitness (Sample Branch)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-slate-300">
            <Lock size={13} className="text-brand-400" /> Read-Only Explorer Mode
          </div>
          <button
            onClick={() => navigate('/login')}
            className="cursor-pointer px-4 py-2 bg-brand-600 hover:bg-brand-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-brand-600/20 hover:shadow-brand-600/30"
          >
            Launch Full Dashboard
          </button>
        </div>
      </header>

      {/* MAIN DEMO DASHBOARD BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-8">
        {/* HERO INTRO BAR */}
        <div className="bg-gradient-to-r from-slate-800/90 via-slate-800 to-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-600/10 border border-brand-500/30 text-brand-400 text-xs font-semibold">
              <Sparkles size={14} /> Next-Gen Gym Operating System
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Control your leads, members, and revenue in <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-300">one unified platform</span>.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Experience GYM OS live with simulated real-time data. Filter leads, inspect member check-ins, view revenue engine analytics, and see how simple gym automation can be.
            </p>
          </div>
        </div>

        {/* METRICS GRID WITH COUNT-UP ANIMATIONS */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <BarChart2 size={16} className="text-brand-400" /> Key Performance Indicators
            </h3>
            <span className="text-xs text-slate-500">Live sample sync</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatTile
              title="Total Leads"
              value={demoDashboardData.metrics.total_leads}
              change="+12% this mo"
              changeType="positive"
              icon={Users}
              description="12 new leads captured this week"
            />
            <StatTile
              title="Active Members"
              value={demoDashboardData.metrics.active_memberships}
              change="+8% vs last mo"
              changeType="positive"
              icon={UserCheck}
              description="156 current paid subscriptions"
            />
            <StatTile
              title="Today Check-ins"
              value={demoDashboardData.metrics.today_attendance}
              change="Live"
              changeType="neutral"
              icon={QrCode}
              description="43 members checked in today"
            />
            <StatTile
              title="Monthly Revenue"
              value={demoRevenue.summary.revenue_this_month}
              prefix="₹"
              change="+7% growth"
              changeType="positive"
              icon={IndianRupee}
              description="Target: ₹1,00,000 for August"
            />
            <StatTile
              title="Trial Passes"
              value={demoDashboardData.metrics.trial_passes_active}
              icon={Ticket}
              description="8 trial sessions scheduled"
            />
            <StatTile
              title="At-Risk Members"
              value={demoDashboardData.metrics.at_risk_members}
              change="7 Need Contact"
              changeType="negative"
              icon={AlertTriangle}
              description="Absent >14 days"
            />
          </div>
        </section>

        {/* MIDDLE SECTION: MINI CHART & RECENT CHECK-INS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* REVENUE & ANALYTICS MINI CHART */}
          <div className="lg:col-span-2 bg-slate-800/80 backdrop-blur border border-slate-700/70 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp size={20} className="text-brand-400" /> Revenue & Performance Growth
                  </h3>
                  <p className="text-xs text-slate-400">Monthly financial summary and revenue tracking</p>
                </div>
                <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-700 text-xs">
                  <button
                    onClick={() => setActiveChartTab('revenue')}
                    className={`cursor-pointer px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      activeChartTab === 'revenue'
                        ? 'bg-brand-600 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Revenue vs Expenses
                  </button>
                  <button
                    onClick={() => setActiveChartTab('sources')}
                    className={`cursor-pointer px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      activeChartTab === 'sources'
                        ? 'bg-brand-600 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Payment Methods
                  </button>
                </div>
              </div>

              {activeChartTab === 'revenue' ? (
                <div className="space-y-6">
                  {/* BAR CHART GRAPH */}
                  <div className="h-56 flex items-end justify-between gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-slate-700/60">
                    {demoRevenue.monthly_chart.map((item, idx) => {
                      const maxVal = 100000;
                      const revHeight = (item.revenue / maxVal) * 100;
                      const expHeight = (item.expenses / maxVal) * 100;

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                          {/* Tooltip */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-brand-400 text-[11px] font-bold px-2 py-1 rounded shadow-lg border border-slate-700 pointer-events-none mb-1 text-center whitespace-nowrap z-20">
                            <div>{item.month}: ₹{(item.revenue/1000).toFixed(0)}k</div>
                            <div className="text-rose-400 font-normal">Exp: ₹{(item.expenses/1000).toFixed(0)}k</div>
                          </div>

                          <div className="w-full flex items-end justify-center gap-1.5 h-full">
                            {/* Revenue Bar */}
                            <div
                              style={{ height: `${revHeight}%` }}
                              className="w-1/2 bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-md group-hover:from-brand-500 group-hover:to-brand-300 transition-all duration-300 shadow-md shadow-brand-600/20"
                            />
                            {/* Expense Bar */}
                            <div
                              style={{ height: `${expHeight}%` }}
                              className="w-1/3 bg-slate-700/80 rounded-t-md group-hover:bg-slate-600 transition-all duration-300"
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-400 group-hover:text-brand-400 transition-colors">
                            {item.month}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 px-2 pt-2">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-brand-500 inline-block" /> Monthly Revenue
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-slate-700 inline-block" /> Expenses
                      </span>
                    </div>
                    <span className="text-brand-400 font-semibold">+7% Revenue Growth YoY</span>
                  </div>
                </div>
              ) : (
                <div className="py-4 space-y-4">
                  <p className="text-xs text-slate-400">Distribution of member payments by channel</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {demoRevenue.by_method.map((method, i) => (
                      <div key={i} className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-400 font-medium">{method.method}</p>
                          <p className="text-lg font-bold text-white mt-0.5">₹{method.amount.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold px-2 py-1 rounded bg-brand-600/10 text-brand-400 border border-brand-500/20">
                            {method.percent}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">Net Profit this month: <strong className="text-brand-400 font-bold">₹11,000 (13.1%)</strong></span>
              <button
                onClick={() => navigate('/login')}
                className="cursor-pointer text-xs text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1 group"
              >
                <span>Explore Revenue Engine</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* RECENT CHECK-INS CARD */}
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/70 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <QrCode size={20} className="text-brand-400" /> Live Attendance
                  </h3>
                  <p className="text-xs text-slate-400">Recent check-ins at main turnstile</p>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-brand-400 bg-brand-600/10 border border-brand-500/20 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" /> Live
                </span>
              </div>

              <div className="space-y-3 max-h-[310px] overflow-y-auto pr-1">
                {demoDashboardData.recent_check_ins.map((cin) => (
                  <div
                    key={cin.id}
                    className="p-3 bg-slate-900/70 hover:bg-slate-900 rounded-xl border border-slate-700/50 hover:border-brand-500/30 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-600/10 text-brand-400 font-bold flex items-center justify-center text-xs border border-brand-500/20 group-hover:bg-brand-600 group-hover:text-slate-950 transition-colors">
                        {cin.member_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">
                          {cin.member_name}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock size={11} className="text-slate-500" />
                          {new Date(cin.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {cin.duration_minutes} min workout
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {cin.entry_method}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="cursor-pointer w-full mt-4 py-2.5 bg-slate-900 hover:bg-slate-950 border border-slate-700 text-slate-300 hover:text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <QrCode size={14} className="text-brand-400" />
              <span>Test Fast QR Scan Scanner</span>
            </button>
          </div>
        </div>

        {/* RECENT LEADS CRM TABLE */}
        <section className="bg-slate-800/80 backdrop-blur border border-slate-700/70 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users size={20} className="text-brand-400" /> Recent Lead Inquiries (CRM)
              </h3>
              <p className="text-xs text-slate-400">Real-time incoming leads from Instagram, WhatsApp & Website</p>
            </div>

            {/* CONTROLS & FILTER TABS */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchLead(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 w-48 transition-colors"
                />
              </div>

              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs">
                {(['all', 'new', 'follow_up', 'won'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setLeadFilter(st)}
                    className={`cursor-pointer px-3 py-1 rounded-lg capitalize font-semibold transition-all ${
                      leadFilter === st
                        ? 'bg-brand-600 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* LEADS TABLE */}
          <div className="overflow-x-auto rounded-xl border border-slate-700/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-700/60">
                <tr>
                  <th className="p-3.5">Lead Name</th>
                  <th className="p-3.5">Interest</th>
                  <th className="p-3.5">Source</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Est. Value</th>
                  <th className="p-3.5">Captured</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 bg-slate-900/40">
                {filteredLeads.slice(0, 7).map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-slate-800/80 transition-colors cursor-pointer group"
                  >
                    <td className="p-3.5 font-semibold text-white group-hover:text-brand-300 transition-colors">
                      <div>{lead.name}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{lead.phone}</div>
                    </td>
                    <td className="p-3.5 text-slate-300">
                      <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[11px]">
                        {lead.interest}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{lead.source}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          lead.status === 'new'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : lead.status === 'follow_up'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : lead.status === 'won'
                            ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {lead.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-200">₹{lead.value?.toLocaleString() || '3,500'}</td>
                    <td className="p-3.5 text-slate-400">{new Date(lead.created_date).toLocaleDateString()}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                        }}
                        className="cursor-pointer px-2.5 py-1 bg-slate-800 hover:bg-brand-600 hover:text-slate-950 text-brand-400 rounded-lg font-semibold transition-all border border-slate-700"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* LEAD DETAILS MODAL */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <h4 className="text-lg font-bold text-white">{selectedLead.name}</h4>
                  <p className="text-xs text-slate-400">{selectedLead.interest} • {selectedLead.source}</p>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="cursor-pointer p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-brand-400" />
                  <span>{selectedLead.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-brand-400" />
                  <span>{selectedLead.email}</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/60">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Lead Notes</p>
                  <p className="mt-1 text-slate-200">{selectedLead.notes || 'No extra notes recorded.'}</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelectedLead(null)}
                  className="cursor-pointer px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="cursor-pointer px-4 py-2 bg-brand-600 hover:bg-brand-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <MessageSquare size={14} /> Send WhatsApp Demo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM CALL TO ACTION BANNER */}
        <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 rounded-3xl p-8 sm:p-10 shadow-2xl text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-brand-400/30">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider">
              Start Free Today
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to power your gym with GYM OS?
            </h3>
            <p className="text-brand-100 text-sm leading-relaxed">
              Automate WhatsApp check-in alerts, manage memberships, track attendance, and boost renewal retention effortlesssly.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-brand-100 pt-2">
              <span className="flex items-center gap-1"><CheckCircle2 size={15} className="text-white" /> Zero Setup Fees</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={15} className="text-white" /> Instant QR Engine</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={15} className="text-white" /> Multi-Branch Support</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => navigate('/login')}
              className="cursor-pointer w-full sm:w-auto px-8 py-4 bg-slate-950 hover:bg-black text-brand-400 hover:text-brand-300 font-extrabold text-base rounded-2xl transition-all transform hover:scale-105 shadow-2xl flex items-center justify-center gap-2 border border-brand-500/40"
            >
              <span>Sign Up Your Gym</span>
              <ArrowUpRight size={20} />
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500 space-y-2">
        <p>GYM OS by Beyond Pixells — Professional Gym & Fitness Software</p>
        <p className="text-[11px] text-slate-600">Demo Mode with sample dataset. Live system requires subscription.</p>
      </footer>
    </div>
  )
}
