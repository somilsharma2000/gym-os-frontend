import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Wallet, Target, Plus, X, Loader, Trash2 } from 'lucide-react'
import { api } from '../api/client'
import StatCard from '../components/StatCard'

const API_BASE = 'https://base44.app/api/apps/6a700b150c8d8b8e923580a1/functions'

export default function Revenue() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [expenseData, setExpenseData] = useState({ amount: '', category: 'Rent', date: new Date().toISOString().split('T')[0], description: '', recurring: false })
  const [expenses, setExpenses] = useState<any[]>([])

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 10000)
    Promise.all([
      api.getRevenue().catch(() => ({ success: false })),
      fetch(`${API_BASE}/getExpenses`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }).then(r => r.json()).catch(() => ({ success: false, expenses: [] }))
    ]).then(([revRes, expRes]: any) => {
      clearTimeout(timeout)
      if (revRes.success) setData(revRes)
      if (expRes.success && expRes.expenses) setExpenses(expRes.expenses)
      setLoading(false)
    }).catch(() => {
      clearTimeout(timeout)
      setLoading(false)
    })
    return () => clearTimeout(timeout)
  }, [])

  const formatINR = (amt: number) => `₹${(amt || 0).toLocaleString('en-IN')}`

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    const gymId = localStorage.getItem('gym_os_gym_id') || 'gym_oxigen'
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/addExpense`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...expenseData, amount: Number(expenseData.amount), gym_id: gymId })
      })
      const result = await res.json()
      if (result.success) {
        setShowAddExpense(false)
        setExpenseData({ amount: '', category: 'Rent', date: new Date().toISOString().split('T')[0], description: '', recurring: false })
        // Refresh expenses
        const expRes = await fetch(`${API_BASE}/getExpenses`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }).then(r => r.json())
        if (expRes.success && expRes.expenses) setExpenses(expRes.expenses)
      }
    } catch {}
    setSubmitting(false)
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      await fetch(`${API_BASE}/deleteExpense`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expense_id: id }) })
      setExpenses(expenses.filter(e => e.id !== id))
    } catch {}
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-500 dark:text-slate-400">Loading revenue data...</div>
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Revenue Analytics</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Financial performance, revenue streams, and expense management.</p>
          </div>
          <button onClick={() => setShowAddExpense(true)} className="px-3 py-1.5 text-sm text-white bg-brand-600 rounded-md hover:bg-brand-700 transition-colors flex items-center gap-1.5">
            <Plus size={14} /> Add Expense
          </button>
        </div>
        <div className="text-center py-20 text-slate-400 dark:text-slate-500">
          <p>No revenue data available yet. Start by recording payments and expenses.</p>
        </div>
        {expenses.length > 0 && (
          <ExpenseTable expenses={expenses} formatINR={formatINR} onDelete={handleDeleteExpense} />
        )}
      </div>
    )
  }

  const s = data.stats || data.summary || {}
  const monthlyData = data.monthly_data || []
  const recentPayments = data.recent_payments || []
  const maxRevenue = Math.max(...monthlyData.map((m: any) => Math.max(m.revenue || 0, m.expenses || 0)), 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Revenue Analytics</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Financial performance, revenue streams, and expense management.</p>
        </div>
        <button onClick={() => setShowAddExpense(true)} className="px-3 py-1.5 text-sm text-white bg-brand-600 rounded-md hover:bg-brand-700 transition-colors flex items-center gap-1.5">
          <Plus size={14} /> Add Expense
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Revenue (This Month)" value={s.monthly_revenue || s.mrr || 0} icon={<TrendingUp size={16} />} color="text-green-600 dark:text-green-400" />
        <StatCard label="Total Revenue" value={s.total_revenue || 0} icon={<TrendingDown size={16} />} color="text-slate-600 dark:text-slate-400" />
        <StatCard label="Total Expenses" value={s.total_expenses || 0} icon={<Target size={16} />} color="text-red-600 dark:text-red-400" />
        <StatCard label="Profit Margin" value={(s.profit_margin || 0) + "%"} icon={<Wallet size={16} />} color="text-blue-600 dark:text-blue-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4">Revenue by Type</h3>
          <div className="space-y-3">
            {data.revenue_by_type && Object.entries(data.revenue_by_type).length > 0 ? (
              Object.entries(data.revenue_by_type).map(([type, amount]: [string, any]) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-200">{type}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{formatINR(amount)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No revenue recorded yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4">Recent Payments</h3>
          <div className="space-y-3">
            {recentPayments.slice(0, 6).map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-slate-700 dark:text-slate-200 font-medium">{p.member_name || '—'}</span>
                  <span className="text-slate-400 ml-2">{p.type || ''}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{formatINR(p.amount)}</span>
                  <span className="ml-2 text-xs text-slate-400">{p.status}</span>
                </div>
              </div>
            ))}
            {recentPayments.length === 0 && <p className="text-sm text-slate-400">No payments recorded.</p>}
          </div>
        </div>
      </div>

      {monthlyData.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4">Monthly Revenue vs Expenses</h3>
          <div className="flex items-end justify-between gap-3 h-48">
            {monthlyData.map((m: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center gap-1.5 h-40">
                  <div className="w-1/2 bg-brand-600 rounded-t" style={{ height: `${Math.max(((m.revenue || 0) / maxRevenue) * 100, 2)}%` }} title={`Revenue: ${formatINR(m.revenue || 0)}`} />
                  <div className="w-1/2 bg-slate-300 dark:bg-slate-600 rounded-t" style={{ height: `${Math.max(((m.expenses || 0) / maxRevenue) * 100, 2)}%` }} title={`Expenses: ${formatINR(m.expenses || 0)}`} />
                </div>
                <span className="text-xs text-slate-500">{m.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-brand-600 rounded"></div><span className="text-xs text-slate-600 dark:text-slate-400">Revenue</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded"></div><span className="text-xs text-slate-600 dark:text-slate-400">Expenses</span></div>
          </div>
        </div>
      )}

      <ExpenseTable expenses={expenses} formatINR={formatINR} onDelete={handleDeleteExpense} />

      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add Expense</h2>
              <button onClick={() => setShowAddExpense(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddExpense} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₹) *</label>
                  <input type="number" required min="0" value={expenseData.amount} onChange={e => setExpenseData({...expenseData, amount: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                  <select value={expenseData.category} onChange={e => setExpenseData({...expenseData, category: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option>Rent</option><option>Equipment</option><option>Salaries</option><option>Maintenance</option>
                    <option>Marketing</option><option>Utilities</option><option>Software</option><option>Miscellaneous</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input type="date" value={expenseData.date} onChange={e => setExpenseData({...expenseData, date: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <input type="text" value={expenseData.description} onChange={e => setExpenseData({...expenseData, description: e.target.value})} placeholder="Optional notes..." className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={expenseData.recurring} onChange={e => setExpenseData({...expenseData, recurring: e.target.checked})} className="rounded" />
                Reccurring expense (monthly)
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAddExpense(false)} className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold">
                  {submitting ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />} Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function ExpenseTable({ expenses, formatINR, onDelete }: { expenses: any[]; formatINR: (a: number) => string; onDelete: (id: string) => void }) {
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0)
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Expenses Tracker</h3>
        <span className="text-xs text-slate-500">Total: <span className="font-semibold text-red-600">{formatINR(totalExpenses)}</span></span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Recurring</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {expenses.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No expenses recorded.</td></tr>
            ) : expenses.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{e.category}</td>
                <td className="px-4 py-3 font-semibold text-red-600">{formatINR(e.amount)}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{e.date}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{e.description || '—'}</td>
                <td className="px-4 py-3">{e.recurring ? <span className="px-2 py-0.5 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 rounded">Recurring</span> : <span className="px-2 py-0.5 text-xs bg-slate-50 text-slate-600 rounded">One-time</span>}</td>
                <td className="px-4 py-3"><button onClick={() => onDelete(e.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
