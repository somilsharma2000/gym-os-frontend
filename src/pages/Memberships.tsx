import { useState, useEffect } from 'react'
import { CreditCard, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import { api } from '../api/client'
import StatusBadge from '../components/StatusBadge'

export default function Memberships() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.getMemberships().then(res => { if (res.success) setData(res); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <LoadingScreen message="Loading memberships..." />
  const memberships = data?.memberships || []
  const plans = data?.plans || []
  const filtered = filter === 'all' ? memberships : memberships.filter((m: any) => m.status === filter)
  const active = memberships.filter((m: any) => m.status === 'active').length
  const expiring = memberships.filter((m: any) => m.status === 'expiring').length
  const expired = memberships.filter((m: any) => m.status === 'expired').length

  const cardCls = "bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-colors"

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Memberships</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={cardCls}><div className="flex items-center gap-2 mb-2"><CreditCard size={16} className="text-slate-600 dark:text-slate-400" /><span className="text-xs text-slate-500 dark:text-slate-400">Total</span></div><p className="text-2xl font-bold text-slate-700 dark:text-slate-200">{memberships.length}</p></div>
        <div className={cardCls}><div className="flex items-center gap-2 mb-2"><CheckCircle size={16} className="text-green-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Active</span></div><p className="text-2xl font-bold text-green-600">{active}</p></div>
        <div className={cardCls}><div className="flex items-center gap-2 mb-2"><AlertCircle size={16} className="text-amber-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Expiring</span></div><p className="text-2xl font-bold text-amber-600">{expiring}</p></div>
        <div className={cardCls}><div className="flex items-center gap-2 mb-2"><XCircle size={16} className="text-red-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Expired</span></div><p className="text-2xl font-bold text-red-600">{expired}</p></div>
      </div>

      <div className="flex gap-2">
        {['all', 'active', 'expiring', 'expired'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${filter === s ? 'bg-brand-700 text-white border-brand-700' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>{s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        {filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-slate-400 dark:text-slate-500">No memberships found.</div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
              <tr><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Member</th><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Plan</th><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Start</th><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Expiry</th><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Payment</th><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {filtered.map((m: any) => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-200">{m.member_name}</td>
                  <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{m.plan_name}</td>
                  <td className="px-4 py-2.5 text-slate-400 dark:text-slate-500">{m.start_date}</td>
                  <td className="px-4 py-2.5 text-slate-400 dark:text-slate-500">{m.expiry_date}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={m.payment_status} /></td>
                  <td className="px-4 py-2.5"><StatusBadge status={m.status} /></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      {plans.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-colors">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Available Plans</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {plans.map((p: any) => (
              <div key={p.id} className="border border-slate-200 dark:border-slate-700 rounded-md p-3">
                <p className="font-medium text-slate-700 dark:text-slate-200">{p.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{p.duration_days} days</p>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">₹{p.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
