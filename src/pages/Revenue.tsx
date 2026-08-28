import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Wallet, Target, Plus } from 'lucide-react'
import { api } from '../api/client'
import StatCard from '../components/StatCard'

export default function Revenue() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getRevenue().then(res => {
      if (res.success) setData(res)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const formatINR = (amt: number) => `\u20B9${(amt || 0).toLocaleString('en-IN')}`

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-500 dark:text-slate-400">Loading revenue data...</div>
  }

  if (!data) {
    return <div className="flex items-center justify-center py-20 text-slate-500 dark:text-slate-400">No revenue data available.</div>
  }

  const s = data.summary || {}
  const monthlyData = data.monthly_data || []
  const categoryBreakdown = data.category_breakdown || []
  const expenses = data.expenses || []
  const recentPayments = data.recent_payments || []

  const maxRevenue = Math.max(...monthlyData.map((m: any) => Math.max(m.revenue || 0, m.expenses || 0)), 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Revenue Analytics</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Financial performance, revenue streams, and expense management.</p>
        </div>
        <button className="px-3 py-1.5 text-sm text-white bg-brand-600 rounded-md hover:bg-brand-700 transition-colors flex items-center gap-1.5">
          <Plus size={14} /> Add Expense
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Revenue (This Month)" value={s.monthly_revenue || 0} icon={<TrendingUp size={16} />} color="text-green-600 dark:text-green-400" />
        <StatCard label="Total Revenue" value={s.total_revenue || 0} icon={<TrendingDown size={16} />} color="text-slate-600 dark:text-slate-400" />
        <StatCard label="Net Revenue" value={s.net_revenue || 0} icon={<Target size={16} />} color="text-blue-600 dark:text-blue-400" />
        <StatCard label="Profit Margin" value={(s.profit_margin || 0) + "%"} icon={<Wallet size={16} />} color="text-purple-600 dark:text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4">Expenses by Category</h3>
          <div className="space-y-4">
            {categoryBreakdown.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">No expenses recorded.</p>
            ) : categoryBreakdown.map((item: any, i: number) => {
              const total = categoryBreakdown.reduce((sum: number, c: any) => sum + (c.amount || 0), 0)
              const percent = total > 0 ? Math.round((item.amount / total) * 100) : 0
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-slate-700 dark:text-slate-200">{item.category}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{formatINR(item.amount)} ({percent}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-600 rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4">Recent Payments</h3>
          <div className="space-y-3">
            {recentPayments.slice(0, 6).map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-slate-700 dark:text-slate-200 font-medium">{p.member_name || '—'}</span>
                  <span className="text-slate-400 dark:text-slate-500 ml-2">{p.type || ''}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{formatINR(p.amount)}</span>
                  <span className="ml-2 text-xs text-slate-400">{p.status}</span>
                </div>
              </div>
            ))}
            {recentPayments.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500">No payments recorded.</p>}
          </div>
        </div>
      </div>

      {monthlyData.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4">Monthly Revenue vs Expenses (6 Months)</h3>
          <div className="flex items-end justify-between gap-3 h-48">
            {monthlyData.map((m: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center gap-1.5 h-40">
                  <div className="w-1/2 bg-brand-600 rounded-t" style={{ height: `${((m.revenue || 0) / maxRevenue) * 100}%` }} title={`Revenue: ${formatINR(m.revenue || 0)}`} />
                  <div className="w-1/2 bg-slate-300 dark:bg-slate-600 rounded-t" style={{ height: `${((m.expenses || 0) / maxRevenue) * 100}%` }} title={`Expenses: ${formatINR(m.expenses || 0)}`} />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">{m.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-brand-600 rounded"></div>
              <span className="text-xs text-slate-600 dark:text-slate-400">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded"></div>
              <span className="text-xs text-slate-600 dark:text-slate-400">Expenses</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Expenses Tracker</h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Total: <span className="font-semibold text-slate-700 dark:text-slate-200">{formatINR(s.total_expenses || 0)}</span></span>
            <span className="text-slate-500 dark:text-slate-400">Net: <span className="font-semibold text-green-600 dark:text-green-400">{formatINR(s.net_revenue || 0)}</span></span>
            <span className="text-slate-500 dark:text-slate-400">Margin: <span className="font-semibold text-blue-600 dark:text-blue-400">{s.profit_margin || 0}%</span></span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 text-left text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Recurring</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {expenses.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">No expenses recorded.</td></tr>
              ) : expenses.map((e: any) => (
                <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{e.category || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-red-600 dark:text-red-400">{formatINR(e.amount)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{e.date || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{e.description || '—'}</td>
                  <td className="px-4 py-3">
                    {e.recurring ? (
                      <span className="px-2 py-0.5 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded border border-blue-200 dark:border-blue-800">Recurring</span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-600">One-time</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
