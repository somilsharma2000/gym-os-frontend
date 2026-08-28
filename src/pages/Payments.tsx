import { useState, useMemo } from 'react'
import { IndianRupee, Clock, CheckCircle, AlertCircle, Plus, Send } from 'lucide-react'
import { demoPayments } from '../data/demoData'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'

export default function Payments() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    return demoPayments.filter(p => {
      const matchSearch = p.member_name.toLowerCase().includes(search.toLowerCase()) || p.invoice_number.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || p.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [search, statusFilter])

  const totalRevenue = demoPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const pendingAmount = demoPayments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
  const overdueAmount = demoPayments.filter(p => p.status === 'overdue').reduce((s, p) => s + p.amount, 0)
  const collectedThisMonth = demoPayments.filter(p => p.status === 'paid' && p.date.startsWith('2026-08')).reduce((s, p) => s + p.amount, 0)

  const formatINR = (amt: number) => `\u20B9${amt.toLocaleString('en-IN')}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Payments & Billing</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage member billing, track pending payments, and issue invoices.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5">
            <Send size={14} /> Send Reminder
          </button>
          <button className="px-3 py-1.5 text-sm text-white bg-brand-600 rounded-md hover:bg-brand-700 transition-colors flex items-center gap-1.5">
            <Plus size={14} /> Record Payment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Revenue" value={totalRevenue} icon={<IndianRupee size={16} />} color="text-green-600 dark:text-green-400" />
        <StatCard label="Pending" value={pendingAmount} icon={<Clock size={16} />} color="text-amber-600 dark:text-amber-400" />
        <StatCard label="Collected (Aug)" value={collectedThisMonth} icon={<CheckCircle size={16} />} color="text-blue-600 dark:text-blue-400" />
        <StatCard label="Overdue" value={overdueAmount} icon={<AlertCircle size={16} />} color="text-red-600 dark:text-red-400" />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search member or invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[180px] px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:border-brand-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:border-brand-400"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 text-left text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{p.member_name}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.type}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{formatINR(p.amount)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.date}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.method}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">{p.invoice_number}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.status !== 'paid' && (
                        <button className="text-xs px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors">
                          Mark Paid
                        </button>
                      )}
                      <button className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                        Invoice
                      </button>
                    </div>
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
