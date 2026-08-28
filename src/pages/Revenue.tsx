import { TrendingUp, TrendingDown, Wallet, Target, Plus } from 'lucide-react'
import { demoRevenue } from '../data/demoData'
import StatCard from '../components/StatCard'

export default function Revenue() {
  const s = demoRevenue.summary
  const formatINR = (amt: number) => `\u20B9${amt.toLocaleString('en-IN')}`
  const maxRevenue = Math.max(...demoRevenue.monthly_chart.map(m => Math.max(m.revenue, m.expenses)))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Revenue Analytics</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Financial performance, plan breakdowns, revenue streams, and expense management.</p>
        </div>
        <button className="px-3 py-1.5 text-sm text-white bg-brand-600 rounded-md hover:bg-brand-700 transition-colors flex items-center gap-1.5">
          <Plus size={14} /> Add Expense
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Revenue (This Month)" value={s.revenue_this_month} icon={<TrendingUp size={16} />} color="text-green-600 dark:text-green-400" />
        <StatCard label="Last Month" value={s.revenue_last_month} icon={<TrendingDown size={16} />} color="text-slate-600 dark:text-slate-400" />
        <StatCard label="Growth" value={s.growth_percent} icon={<Target size={16} />} color="text-blue-600 dark:text-blue-400" />
        <StatCard label="Projected Annual" value={s.projected_annual} icon={<Wallet size={16} />} color="text-purple-600 dark:text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4">Revenue by Plan Type</h3>
          <div className="space-y-4">
            {demoRevenue.by_plan.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-700 dark:text-slate-200">{item.plan}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{formatINR(item.amount)} ({item.percent}%)</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-600 rounded-full" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4">Revenue by Payment Method</h3>
          <div className="space-y-4">
            {demoRevenue.by_method.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-700 dark:text-slate-200">{item.method}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{formatINR(item.amount)} ({item.percent}%)</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4">Monthly Revenue vs Expenses (6 Months)</h3>
        <div className="flex items-end justify-between gap-3 h-48">
          {demoRevenue.monthly_chart.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center gap-1.5 h-40">
                <div className="w-1/2 bg-brand-600 rounded-t" style={{ height: `${(m.revenue / maxRevenue) * 100}%` }} title={`Revenue: ${formatINR(m.revenue)}`} />
                <div className="w-1/2 bg-slate-300 dark:bg-slate-600 rounded-t" style={{ height: `${(m.expenses / maxRevenue) * 100}%` }} title={`Expenses: ${formatINR(m.expenses)}`} />
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

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Expenses Tracker</h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Total: <span className="font-semibold text-slate-700 dark:text-slate-200">{formatINR(s.expenses_this_month)}</span></span>
            <span className="text-slate-500 dark:text-slate-400">Net Profit: <span className="font-semibold text-green-600 dark:text-green-400">{formatINR(s.net_profit)}</span></span>
            <span className="text-slate-500 dark:text-slate-400">Margin: <span className="font-semibold text-blue-600 dark:text-blue-400">{s.profit_margin}%</span></span>
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
              {demoRevenue.expenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{e.category}</td>
                  <td className="px-4 py-3 font-semibold text-red-600 dark:text-red-400">{formatINR(e.amount)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{e.date}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{e.description}</td>
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
