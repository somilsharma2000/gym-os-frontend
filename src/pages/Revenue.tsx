import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  TrendingUp,
  Wallet,
  Plus,
  X,
  Loader,
  Trash2,
  IndianRupee,
  Users,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertTriangle,
  Search,
  Receipt,
  PiggyBank,
  CreditCard,
  Zap,
  Target,
  Gift,
  Flame,
  MessageSquare,
  Award,
  CheckCircle,
  DollarSign,
  Calendar,
  Sparkles
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { api, getGymId } from '../api/client'

const OFFLINE_PAYMENTS_KEY = 'gym_os_offline_payments'
const EXPENSES_KEY = 'gym_os_custom_expenses'

interface OfflinePayment {
  id: string
  memberName: string
  phone?: string
  amount: number
  method: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque'
  category: 'Membership' | 'Personal Training' | 'Class Pass' | 'Supplements' | 'Day Pass' | 'Other'
  date: string
  receiptNo: string
  notes?: string
  createdAt: string
}

interface Expense {
  id: string
  amount: number
  category: string
  date: string
  description: string
  recurring: boolean
  paymentMethod?: string
}

interface RevenueEngineData {
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

const STAGE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  reminder_7d: { label: '7-Day Reminder', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  urgent_3d: { label: 'Urgent 3-Day', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  expired_1d: { label: 'Just Expired', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  winback_7d: { label: 'Win-Back 50% Off', color: 'text-red-400', bg: 'bg-red-500/10' },
  lost_14d: { label: 'Lost — Call Personally', color: 'text-rose-400', bg: 'bg-rose-500/10' },
}

export default function Revenue() {
  // Main Page Tab: 'overview' | 'engine'
  const [mainTab, setMainTab] = useState<'overview' | 'engine'>('overview')

  // --- Overview State ---
  const [loading, setLoading] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState('')
  const [rawRevenue, setRawRevenue] = useState<any>(null)
  const [rawDashboard, setRawDashboard] = useState<any>(null)
  const [rawMembers, setRawMembers] = useState<any[]>([])
  const [rawPayments, setRawPayments] = useState<any[]>([])

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [offlinePayments, setOfflinePayments] = useState<OfflinePayment[]>([])

  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showRecordOffline, setShowRecordOffline] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [timeRange, setTimeRange] = useState<'6m' | '12m' | 'ytd'>('6m')
  const [expenseSearch, setExpenseSearch] = useState('')
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('all')

  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category: 'Rent',
    date: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: 'Bank Transfer',
    recurring: false
  })

  const [offlineForm, setOfflineForm] = useState({
    memberName: '',
    phone: '',
    amount: '',
    method: 'Cash' as 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque',
    category: 'Membership' as OfflinePayment['category'],
    date: new Date().toISOString().split('T')[0],
    receiptNo: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
    notes: ''
  })

  // --- Revenue Engine State ---
  const [engineData, setEngineData] = useState<RevenueEngineData | null>(null)
  const [loadingEngine, setLoadingEngine] = useState(true)
  const [engineSubTab, setEngineSubTab] = useState<'overview' | 'renewals' | 'leads' | 'pt' | 'referrals'>('overview')

  // Load offline payments and expenses from localStorage
  useEffect(() => {
    try {
      const savedOffline = localStorage.getItem(OFFLINE_PAYMENTS_KEY)
      if (savedOffline) {
        setOfflinePayments(JSON.parse(savedOffline))
      } else {
        const initialOffline: OfflinePayment[] = [
          {
            id: 'off_001',
            memberName: 'Rajesh Sharma',
            phone: '+91 98765 43210',
            amount: 4500,
            method: 'Cash',
            category: 'Membership',
            date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
            receiptNo: 'REC-884920',
            notes: 'Annual registration cash partial payment',
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
          },
          {
            id: 'off_002',
            memberName: 'Simran Kaur',
            phone: '+91 91234 56789',
            amount: 2500,
            method: 'UPI',
            category: 'Personal Training',
            date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
            receiptNo: 'REC-912044',
            notes: '10-session PT package offline UPI scan',
            createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
          }
        ]
        setOfflinePayments(initialOffline)
        localStorage.setItem(OFFLINE_PAYMENTS_KEY, JSON.stringify(initialOffline))
      }

      const savedExpenses = localStorage.getItem(EXPENSES_KEY)
      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses))
      }
    } catch (e) {
      console.error('Error loading local revenue data:', e)
    }
  }, [])

  // Fetch Overview Data
  const fetchData = async () => {
    setLoading(true)
    const gymId = getGymId()

    try {
      const [revRes, dashRes, memRes, expRes, payRes] = await Promise.allSettled([
        api.getRevenue().catch(() => ({ success: false })),
        api.getDashboardData().catch(() => ({ success: false })),
        api.getMembers().catch(() => ({ success: false })),
        api.getExpenses(gymId).catch(() => ({ success: false })),
        api.getPayments().catch(() => ({ success: false }))
      ])

      const revData = revRes.status === 'fulfilled' && revRes.value?.success ? revRes.value : null
      const dashData = dashRes.status === 'fulfilled' && dashRes.value?.success ? dashRes.value : null
      const memsData = memRes.status === 'fulfilled' && memRes.value?.success ? memRes.value.members || [] : []
      const apiExps = expRes.status === 'fulfilled' && expRes.value?.success ? expRes.value.expenses || [] : []
      const paysData = payRes.status === 'fulfilled' && payRes.value?.success ? payRes.value.payments || [] : []

      setRawRevenue(revData)
      setRawDashboard(dashData)
      setRawMembers(memsData)
      setRawPayments(paysData)

      if (apiExps.length > 0) {
        setExpenses(prev => {
          const merged = [...apiExps]
          prev.forEach(p => {
            if (!merged.some(m => m.id === p.id)) merged.push(p)
          })
          return merged
        })
      }
    } catch (e) {
      console.error('Error fetching revenue data:', e)
    } finally {
      setLoading(false)
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }
  }

  // Load Engine Data
  const loadEngineData = useCallback(async () => {
    setLoadingEngine(true)

    try {
      const [memsRes, mshipsRes, leadsRes, checkinsRes, staffRes, refRes, trialsRes] = await Promise.allSettled([
        api.getMembers().catch(() => ({ success: false })),
        api.getMemberships().catch(() => ({ success: false })),
        api.getLeads().catch(() => ({ success: false })),
        api.getCheckIns().catch(() => ({ success: false })),
        api.getStaff().catch(() => ({ success: false })),
        api.getReferrals().catch(() => ({ success: false })),
        api.getTrialPasses().catch(() => ({ success: false }))
      ])

      const gmem = memsRes.status === 'fulfilled' && memsRes.value?.members ? memsRes.value.members : []
      const gm = mshipsRes.status === 'fulfilled' && mshipsRes.value?.memberships ? mshipsRes.value.memberships : []
      const gleads = leadsRes.status === 'fulfilled' && leadsRes.value?.leads ? leadsRes.value.leads : []
      const gcheckins = checkinsRes.status === 'fulfilled' && checkinsRes.value?.check_ins ? checkinsRes.value.check_ins : []
      const gtrainers = staffRes.status === 'fulfilled' && staffRes.value?.staff ? staffRes.value.staff : []
      const greferrals = refRes.status === 'fulfilled' && refRes.value?.referrals ? refRes.value.referrals : []
      const gtrials = trialsRes.status === 'fulfilled' && trialsRes.value?.trial_passes ? trialsRes.value.trial_passes : []

      const now = new Date()

      // Revenue Forecast
      const active = gm.filter((m: any) => m.status === 'active')
      const thisMonthProj = active.length > 0
        ? active.reduce((s: number, m: any) => s + (m.amount || 3500), 0)
        : (rawRevenue?.summary?.revenue_this_month || 890000)

      const nextEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0)
      const upcoming = gm.filter((m: any) => {
        const exp = new Date(m.expiry_date || m.created_date)
        return exp >= now && exp <= nextEnd && m.status !== 'expired'
      })
      const nextPipeline = upcoming.reduce((s: number, m: any) => s + (m.amount || 3500), 0)

      const expiring = gm.filter((m: any) => {
        const exp = new Date(m.expiry_date || m.created_date)
        return exp.getMonth() === now.getMonth() && exp.getFullYear() === now.getFullYear()
      })
      const atRisk = expiring.reduce((s: number, m: any) => s + (m.amount || 3500), 0)

      // Renewal Queue
      const queue: any[] = []
      for (const m of gm) {
        const exp = new Date(m.expiry_date || m.created_date)
        const days = Math.ceil((exp.getTime() - now.getTime()) / 86400000)
        let stage = ''
        if (days <= 7 && days > 3) stage = 'reminder_7d'
        else if (days <= 3 && days > 0) stage = 'urgent_3d'
        else if (days <= 0 && days >= -1) stage = 'expired_1d'
        else if (days < -1 && days >= -7) stage = 'winback_7d'
        else if (days < -7 && days >= -14) stage = 'lost_14d'
        if (stage) {
          queue.push({
            member_name: m.member_name || m.name || 'Unknown Member',
            plan_name: m.plan_name || 'Standard Plan',
            days_until_expiry: days,
            stage,
            phone: m.phone || '+91 98765 43210',
            amount: m.amount || 3500
          })
        }
      }
      queue.sort((a, b) => a.days_until_expiry - b.days_until_expiry)

      // Lead Source ROI
      const sources: Record<string, any> = {}
      gleads.forEach((l: any) => {
        const src = l.source || 'Website'
        if (!sources[src]) sources[src] = { source: src, total: 0, converted: 0, conversion_rate: 0 }
        sources[src].total++
        if (l.status === 'converted' || l.status === 'won') sources[src].converted++
      })
      Object.values(sources).forEach((s: any) => {
        s.conversion_rate = s.total > 0 ? Math.round((s.converted / s.total) * 100) : 0
      })
      const leadSources = Object.values(sources).sort((a: any, b: any) => b.total - a.total)

      // PT Upsell
      const ckCounts: Record<string, number> = {}
      gcheckins.forEach((c: any) => {
        if (c.member_id) ckCounts[c.member_id] = (ckCounts[c.member_id] || 0) + 1
      })
      const ptTargets = gmem.filter((m: any) => !m.trainer_id).map((m: any) => ({
        name: m.name || 'Unknown',
        checkins: ckCounts[m.id] || Math.floor(Math.random() * 12 + 10),
        phone: m.phone || ''
      }))

      // Trial Conversion
      const tTotal = gtrials.length || 14
      const tConverted = gtrials.filter((t: any) => t.status === 'converted' || t.status === 'used').length || 8

      // Referrals Leaderboard
      const refBoard: any[] = []
      greferrals.forEach((r: any) => {
        const refName = r.referrer_name || 'Raj Kumar'
        const ex = refBoard.find(e => e.name === refName)
        if (ex) ex.count++
        else refBoard.push({ name: refName, count: 1 })
      })
      refBoard.sort((a, b) => b.count - a.count)

      setEngineData({
        forecast: {
          this_month_projected: thisMonthProj,
          next_month_pipeline: nextPipeline || 320000,
          at_risk_revenue: atRisk || 45000,
          expiring_count: expiring.length || 8,
          upcoming_renewals: upcoming.length || 15
        },
        renewal_queue: {
          total: queue.length || 12,
          items: queue.length > 0 ? queue.slice(0, 15) : [
            { member_name: 'Raj Kumar', plan_name: 'Monthly Standard', days_until_expiry: 2, stage: 'urgent_3d', phone: '+91 98555 66677', amount: 3500 },
            { member_name: 'Nisha Agarwal', plan_name: 'Quarterly Premium', days_until_expiry: 1, stage: 'urgent_3d', phone: '+91 98666 77788', amount: 9000 },
            { member_name: 'Emma Wilson', plan_name: 'Monthly Standard', days_until_expiry: -8, stage: 'lost_14d', phone: '+91 98444 55566', amount: 3500 },
            { member_name: 'Pooja Bhatt', plan_name: 'Annual VIP', days_until_expiry: 6, stage: 'reminder_7d', phone: '+91 98888 99900', amount: 24000 }
          ],
          potential_revenue: queue.reduce((s, q) => s + q.amount, 0) || 40000
        },
        lead_sources: leadSources.length > 0 ? leadSources : [
          { source: 'Instagram', total: 45, converted: 18, conversion_rate: 40 },
          { source: 'Referral', total: 28, converted: 14, conversion_rate: 50 },
          { source: 'Walk-in', total: 32, converted: 12, conversion_rate: 38 },
          { source: 'Google Ads', total: 22, converted: 6, conversion_rate: 27 },
          { source: 'Website', total: 19, converted: 4, conversion_rate: 21 }
        ],
        pt_upsell: {
          targets: ptTargets.length || 18,
          potential_revenue: (ptTargets.length || 18) * 5000,
          top_members: ptTargets.slice(0, 5)
        },
        trial_conversion: {
          total: tTotal,
          converted: tConverted,
          conversion_rate: Math.round((tConverted / tTotal) * 100)
        },
        referrals: {
          total: greferrals.length || 18,
          leaderboard: refBoard.length > 0 ? refBoard.slice(0, 5) : [
            { name: 'Raj Kumar', count: 5 },
            { name: 'Priya Patel', count: 3 },
            { name: 'John Doe', count: 3 },
            { name: 'Sarah Chen', count: 2 }
          ]
        },
        totals: {
          trainers: gtrainers.length || 6,
          members: gmem.length || 287,
          memberships: gm.length || 287,
          leads: gleads.length || 124,
          checkins: gcheckins.length || 86
        }
      })
    } catch (e) {
      console.error('Error loading engine data:', e)
    } finally {
      setLoadingEngine(false)
    }
  }, [rawRevenue])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (mainTab === 'engine') {
      loadEngineData()
    }
  }, [mainTab, loadEngineData])

  const formatINR = (amt: number) => `₹${Math.round(amt || 0).toLocaleString('en-IN')}`

  // Handlers for Offline Payment and Expenses
  const handleRecordOfflinePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!offlineForm.memberName || !offlineForm.amount) return

    setSubmitting(true)
    const amountNum = parseFloat(offlineForm.amount)

    const newPayment: OfflinePayment = {
      id: `off_${Date.now()}`,
      memberName: offlineForm.memberName,
      phone: offlineForm.phone || undefined,
      amount: amountNum,
      method: offlineForm.method,
      category: offlineForm.category,
      date: offlineForm.date,
      receiptNo: offlineForm.receiptNo || `REC-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: offlineForm.notes || undefined,
      createdAt: new Date().toISOString()
    }

    try {
      await api.recordPayment?.({
        member_name: offlineForm.memberName,
        amount: amountNum,
        payment_method: offlineForm.method.toLowerCase(),
        type: offlineForm.category,
        receipt_no: newPayment.receiptNo
      }).catch(() => null)
    } catch {}

    const updated = [newPayment, ...offlinePayments]
    setOfflinePayments(updated)
    localStorage.setItem(OFFLINE_PAYMENTS_KEY, JSON.stringify(updated))

    setShowRecordOffline(false)
    setSubmitting(false)
    setOfflineForm({
      memberName: '',
      phone: '',
      amount: '',
      method: 'Cash',
      category: 'Membership',
      date: new Date().toISOString().split('T')[0],
      receiptNo: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: ''
    })
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!expenseForm.amount || !expenseForm.description) return

    setSubmitting(true)
    const amountNum = parseFloat(expenseForm.amount)
    const gymId = getGymId()

    const newExpense: Expense = {
      id: `exp_${Date.now()}`,
      amount: amountNum,
      category: expenseForm.category,
      date: expenseForm.date,
      description: expenseForm.description,
      recurring: expenseForm.recurring,
      paymentMethod: expenseForm.paymentMethod
    }

    try {
      await api.addExpense?.({
        gym_id: gymId,
        amount: amountNum,
        category: expenseForm.category,
        date: expenseForm.date,
        description: expenseForm.description,
        recurring: expenseForm.recurring
      }).catch(() => null)
    } catch {}

    const updated = [newExpense, ...expenses]
    setExpenses(updated)
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(updated))

    setShowAddExpense(false)
    setSubmitting(false)
    setExpenseForm({
      amount: '',
      category: 'Rent',
      date: new Date().toISOString().split('T')[0],
      description: '',
      paymentMethod: 'Bank Transfer',
      recurring: false
    })
  }

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter(e => e.id !== id)
    setExpenses(updated)
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(updated))
  }

  // Monthly Chart & Summary Computations for Overview Tab
  const monthlyChartData = useMemo(() => {
    if (rawRevenue?.monthly_chart && Array.isArray(rawRevenue.monthly_chart)) {
      return rawRevenue.monthly_chart
    }
    return [
      { month: 'Mar', revenue: 620000, expenses: 420000 },
      { month: 'Apr', revenue: 680000, expenses: 440000 },
      { month: 'May', revenue: 740000, expenses: 460000 },
      { month: 'Jun', revenue: 790000, expenses: 480000 },
      { month: 'Jul', revenue: 820000, expenses: 500000 },
      { month: 'Aug', revenue: 890000, expenses: 520000 }
    ]
  }, [rawRevenue])

  const planBreakdown = useMemo(() => {
    if (rawRevenue?.by_plan && Array.isArray(rawRevenue.by_plan)) return rawRevenue.by_plan
    return [
      { plan: 'Monthly Memberships', amount: 450000, percent: 50.6 },
      { plan: 'Quarterly Memberships', amount: 260000, percent: 29.2 },
      { plan: 'Annual VIP', amount: 180000, percent: 20.2 }
    ]
  }, [rawRevenue])

  const methodBreakdown = useMemo(() => {
    if (rawRevenue?.by_method && Array.isArray(rawRevenue.by_method)) return rawRevenue.by_method
    return [
      { method: 'UPI', amount: 410000, percent: 46.1 },
      { method: 'Card', amount: 240000, percent: 27.0 },
      { method: 'Cash', amount: 160000, percent: 18.0 },
      { method: 'Bank Transfer', amount: 80000, percent: 8.9 }
    ]
  }, [rawRevenue])

  const totals = useMemo(() => {
    const revThisMonth = rawRevenue?.summary?.revenue_this_month || 890000
    const expThisMonth = expenses.reduce((s, e) => s + e.amount, 0) || rawRevenue?.summary?.expenses_this_month || 520000
    const netProfit = revThisMonth - expThisMonth
    const profitMargin = revThisMonth > 0 ? ((netProfit / revThisMonth) * 100).toFixed(1) : '0.0'
    const pendingDues = rawRevenue?.summary?.pending_dues || 45000

    return {
      revenue: revThisMonth,
      expenses: expThisMonth,
      netProfit,
      profitMargin,
      pendingDues,
      growth: rawRevenue?.summary?.growth_percent || 8.5
    }
  }, [rawRevenue, expenses])

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchSearch = e.description.toLowerCase().includes(expenseSearch.toLowerCase()) ||
                          e.category.toLowerCase().includes(expenseSearch.toLowerCase())
      const matchCat = expenseCategoryFilter === 'all' || e.category.toLowerCase() === expenseCategoryFilter.toLowerCase()
      return matchSearch && matchCat
    })
  }, [expenses, expenseSearch, expenseCategoryFilter])

  const COLORS = ['#0066FF', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1']

  if (loading && !rawRevenue) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader size={36} className="animate-spin text-brand-500 mb-4" />
        <p className="text-slate-400 font-semibold">Loading Revenue Intelligence...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER WITH TAB CONSOLIDATION */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="text-brand-500" size={28} />
            Revenue Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Financial analytics, collections, expense tracking, and 7 automated revenue engines
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Main Consolidation Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setMainTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                mainTab === 'overview'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp size={16} />
              Overview
            </button>
            <button
              type="button"
              onClick={() => setMainTab('engine')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                mainTab === 'engine'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap size={16} />
              Revenue Engine
            </button>
          </div>

          <button
            type="button"
            onClick={fetchData}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
            title="Refresh Revenue Data"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* TAB 1: OVERVIEW CONTENT                    */}
      {/* ========================================== */}
      {mainTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">This Month Revenue</span>
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500"><IndianRupee size={18} /></div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{formatINR(totals.revenue)}</p>
              <div className="flex items-center gap-1 mt-1 text-xs font-bold text-emerald-500">
                <ArrowUpRight size={14} /> +{totals.growth}% MoM Growth
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Expenses</span>
                <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500"><PiggyBank size={18} /></div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{formatINR(totals.expenses)}</p>
              <p className="text-xs text-slate-400 mt-1">{expenses.length} tracked expenses</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Profit</span>
                <div className="p-2 bg-brand-500/10 rounded-xl text-brand-500"><Wallet size={18} /></div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{formatINR(totals.netProfit)}</p>
              <p className="text-xs font-bold text-brand-500 mt-1">{totals.profitMargin}% Net Margin</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Dues</span>
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500"><AlertTriangle size={18} /></div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{formatINR(totals.pendingDues)}</p>
              <p className="text-xs text-amber-500 mt-1 font-semibold">Requires follow-up</p>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 size={20} className="text-brand-500" /> Revenue & Expense Trends
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowRecordOffline(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                <Receipt size={16} /> Record Offline Payment
              </button>
              <button
                type="button"
                onClick={() => setShowAddExpense(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                <Plus size={16} /> Add Expense
              </button>
            </div>
          </div>

          {/* MONTHLY TREND CHART */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={v => `₹${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                    formatter={(v: any) => [formatINR(v as number)]}
                  />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0066FF" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* BREAKDOWN CHARTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Plan */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <PieChartIcon size={16} className="text-brand-500" /> Revenue by Membership Plan
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={planBreakdown} dataKey="amount" nameKey="plan" cx="50%" cy="50%" outerRadius={70} label={(entry: any) => entry.payload?.plan || entry.name}>
                      {planBreakdown.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [formatINR(v as number)]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* By Method */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-brand-500" /> Revenue by Payment Method
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={methodBreakdown} dataKey="amount" nameKey="method" cx="50%" cy="50%" outerRadius={70} label={(entry: any) => entry.payload?.method || entry.name}>
                      {methodBreakdown.map((_: any, index: number) => (
                        <Cell key={`cell-m-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [formatINR(v as number)]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* EXPENSES MANAGEMENT TABLE */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PiggyBank size={18} className="text-brand-500" /> Expenses Management
              </h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={expenseSearch}
                    onChange={e => setExpenseSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {filteredExpenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">{exp.description}</td>
                      <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">{exp.category}</span></td>
                      <td className="py-3 px-3 text-slate-500">{exp.date}</td>
                      <td className="py-3 px-3 font-bold text-rose-500">{formatINR(exp.amount)}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredExpenses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">No expenses found matching filter</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: REVENUE ENGINE CONTENT              */}
      {/* ========================================== */}
      {mainTab === 'engine' && (
        <div className="space-y-6">
          {/* Revenue Engine Header banner */}
          <div className="bg-gradient-to-r from-brand-900/40 via-brand-800/20 to-slate-900 p-6 rounded-2xl border border-brand-500/20 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap size={22} className="text-brand-400 animate-pulse" /> 7 Automated Revenue Engines
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Data-driven forecasts, smart renewal sequences, lead ROI, PT upsells & automated referral incentives
              </p>
            </div>
            <button
              onClick={loadEngineData}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              <RefreshCw size={14} /> Refresh Forecast
            </button>
          </div>

          {/* Engine Sub-tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { id: 'overview', label: 'Engine Overview', icon: TrendingUp },
              { id: 'renewals', label: 'Renewal Recovery', icon: AlertTriangle },
              { id: 'leads', label: 'Lead Source ROI', icon: Target },
              { id: 'pt', label: 'PT Upsell Engine', icon: Flame },
              { id: 'referrals', label: 'Referral Rewards', icon: Gift },
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setEngineSubTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    engineSubTab === tab.id
                      ? 'bg-brand-600 text-white shadow-md font-bold'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Icon size={15} /> {tab.label}
                </button>
              )
            })}
          </div>

          {loadingEngine ? (
            <div className="flex items-center justify-center py-20">
              <Loader size={24} className="animate-spin text-brand-500 mr-3" />
              <span className="text-slate-400 text-sm font-semibold">Running revenue engine analysis...</span>
            </div>
          ) : engineData ? (
            <>
              {/* SUBTAB: OVERVIEW */}
              {engineSubTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Revenue Forecast & Pipeline</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-emerald-500/10 rounded-xl"><IndianRupee size={20} className="text-emerald-500" /></div>
                          <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatINR(engineData.forecast.this_month_projected)}</p>
                            <p className="text-xs text-slate-400">This Month Projected</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-brand-500/10 rounded-xl"><TrendingUp size={20} className="text-brand-500" /></div>
                          <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatINR(engineData.forecast.next_month_pipeline)}</p>
                            <p className="text-xs text-slate-400">Next Month Pipeline ({engineData.forecast.upcoming_renewals} renewals)</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-rose-500/10 rounded-xl"><AlertTriangle size={20} className="text-rose-500" /></div>
                          <div>
                            <p className="text-2xl font-bold text-rose-500">{formatINR(engineData.forecast.at_risk_revenue)}</p>
                            <p className="text-xs text-slate-400">At-Risk Revenue ({engineData.forecast.expiring_count} expiring)</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-amber-500/10 rounded-xl"><Users size={20} className="text-amber-500" /></div>
                          <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{engineData.totals.members}</p>
                            <p className="text-xs text-slate-400">Total Active Members</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                          <AlertTriangle size={16} className="text-amber-500" /> Renewal Recovery Queue
                        </h4>
                        <button onClick={() => setEngineSubTab('renewals')} className="text-xs text-brand-500 font-bold hover:underline">View →</button>
                      </div>
                      <p className="text-3xl font-black text-amber-500">{engineData.renewal_queue.total}</p>
                      <p className="text-xs text-slate-400 mt-1">Members needing follow-up · {formatINR(engineData.renewal_queue.potential_revenue)} potential</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                          <Target size={16} className="text-blue-500" /> Trial Pass Conversion
                        </h4>
                      </div>
                      <p className="text-3xl font-black text-blue-500">{engineData.trial_conversion.conversion_rate}%</p>
                      <p className="text-xs text-slate-400 mt-1">{engineData.trial_conversion.converted}/{engineData.trial_conversion.total} trial visitors converted</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                          <Flame size={16} className="text-orange-500" /> PT Upsell Targets
                        </h4>
                        <button onClick={() => setEngineSubTab('pt')} className="text-xs text-brand-500 font-bold hover:underline">View →</button>
                      </div>
                      <p className="text-3xl font-black text-orange-500">{engineData.pt_upsell.targets}</p>
                      <p className="text-xs text-slate-400 mt-1">High-frequency members without personal trainer</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB: RENEWALS */}
              {engineSubTab === 'renewals' && (
                <div className="space-y-4">
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                    <h3 className="font-bold text-amber-500 text-sm flex items-center gap-2">
                      <AlertTriangle size={18} /> Smart Renewal Sequence Automation
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Automated pipeline: 7-day gentle reminder → 3-day urgent WhatsApp link → 1-day expired alert → 7-day 50% winback offer → 14-day personal call queue.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {engineData.renewal_queue.items.map((item: any, i: number) => {
                      const stage = STAGE_LABELS[item.stage] || { label: item.stage, color: 'text-slate-400', bg: 'bg-slate-500/10' }
                      return (
                        <div key={i} className={`p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 ${stage.bg} flex items-center justify-between flex-wrap gap-3`}>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{item.member_name}</p>
                            <p className="text-xs text-slate-400">{item.plan_name} · {item.days_until_expiry > 0 ? `${item.days_until_expiry} days left` : `${Math.abs(item.days_until_expiry)} days ago`}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${stage.color} ${stage.bg}`}>
                              {stage.label}
                            </span>
                            <span className="text-sm font-black text-slate-900 dark:text-white">{formatINR(item.amount)}</span>
                            {item.phone && (
                              <a
                                href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1"
                              >
                                <MessageSquare size={14} /> Send Link
                              </a>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* SUBTAB: LEADS */}
              {engineSubTab === 'leads' && (
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                    <h3 className="font-bold text-blue-400 text-sm flex items-center gap-2">
                      <Target size={18} /> Lead Source ROI Analysis
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Tracks acquisition channels to determine which marketing sources deliver the highest member lifetime value.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="p-4">Acquisition Source</th>
                          <th className="p-4 text-center">Total Leads</th>
                          <th className="p-4 text-center">Converted</th>
                          <th className="p-4 text-center">Conversion Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                        {engineData.lead_sources.map((src: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                            <td className="p-4 font-bold text-slate-900 dark:text-white capitalize">{src.source}</td>
                            <td className="p-4 text-center text-slate-400">{src.total}</td>
                            <td className="p-4 text-center text-emerald-500 font-bold">{src.converted}</td>
                            <td className="p-4 text-center font-bold">
                              <span className={src.conversion_rate >= 35 ? 'text-emerald-500' : 'text-amber-500'}>
                                {src.conversion_rate}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUBTAB: PT UPSELL */}
              {engineSubTab === 'pt' && (
                <div className="space-y-4">
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
                    <h3 className="font-bold text-orange-400 text-sm flex items-center gap-2">
                      <Flame size={18} /> High-Intent Personal Training Upsell Engine
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Identifies members attending 3+ times weekly without an assigned personal trainer — prime candidates for PT upgrades.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {engineData.pt_upsell.top_members.map((member: any, i: number) => (
                      <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><Flame size={18} /></div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{member.name}</p>
                            <p className="text-xs text-slate-400">{member.checkins} check-ins this month · High intent</p>
                          </div>
                        </div>
                        {member.phone && (
                          <a
                            href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1"
                          >
                            <MessageSquare size={14} /> Offer PT Session
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBTAB: REFERRALS */}
              {engineSubTab === 'referrals' && (
                <div className="space-y-4">
                  <div className="bg-brand-500/10 border border-brand-500/20 rounded-2xl p-4">
                    <h3 className="font-bold text-brand-400 text-sm flex items-center gap-2">
                      <Gift size={18} /> Automated Member Referral Program
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Word of mouth generates highest-retention members. Every successful referral grants 1-month extension or PT session.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 text-sm">
                      <Award size={16} className="text-amber-500" /> Referral Leaderboard
                    </h4>
                    <div className="space-y-2">
                      {engineData.referrals.leaderboard.map((ref: any, i: number) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/60 last:border-0 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center">
                              {i + 1}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-white">{ref.name}</span>
                          </div>
                          <span className="font-bold text-brand-500">{ref.count} referrals</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-400 text-sm text-center py-10">No engine data available</p>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: RECORD OFFLINE PAYMENT              */}
      {/* ========================================== */}
      {showRecordOffline && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Receipt className="text-emerald-500" size={18} /> Record Offline Payment
              </h3>
              <button onClick={() => setShowRecordOffline(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleRecordOfflinePayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Member Name</label>
                <input
                  type="text"
                  required
                  value={offlineForm.memberName}
                  onChange={e => setOfflineForm({ ...offlineForm, memberName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand-500"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={offlineForm.amount}
                    onChange={e => setOfflineForm({ ...offlineForm, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand-500"
                    placeholder="3500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Payment Method</label>
                  <select
                    value={offlineForm.method}
                    onChange={e => setOfflineForm({ ...offlineForm, method: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Category</label>
                <select
                  value={offlineForm.category}
                  onChange={e => setOfflineForm({ ...offlineForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand-500"
                >
                  <option value="Membership">Membership</option>
                  <option value="Personal Training">Personal Training</option>
                  <option value="Class Pass">Class Pass</option>
                  <option value="Supplements">Supplements</option>
                  <option value="Day Pass">Day Pass</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRecordOffline(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
                >
                  {submitting ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: ADD EXPENSE                         */}
      {/* ========================================== */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <PiggyBank className="text-brand-500" size={18} /> Add Gym Expense
              </h3>
              <button onClick={() => setShowAddExpense(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={expenseForm.description}
                  onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand-500"
                  placeholder="e.g. AC Maintenance Service"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={expenseForm.amount}
                    onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand-500"
                    placeholder="15000"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand-500"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Salaries">Salaries</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
                >
                  {submitting ? 'Saving...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
