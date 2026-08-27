import { useState, useEffect } from 'react'
import { Share2, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import { api } from '../api/client'
import StatusBadge from '../components/StatusBadge'

export default function Referrals() {
  const [referrals, setReferrals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getReferrals().then(res => { if (res.success) setReferrals(res.referrals || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <LoadingScreen message="Loading referrals..." />
  const total = referrals.length
  const converted = referrals.filter(r => r.status === 'converted').length
  const pending = referrals.filter(r => r.status === 'pending').length
  const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0

  const cardCls = "bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-colors"

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Referrals</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={cardCls}><div className="flex items-center gap-2 mb-2"><Share2 size={16} className="text-slate-600 dark:text-slate-400" /><span className="text-xs text-slate-500 dark:text-slate-400">Total Referrals</span></div><p className="text-2xl font-bold text-slate-700 dark:text-slate-200">{total}</p></div>
        <div className={cardCls}><div className="flex items-center gap-2 mb-2"><CheckCircle size={16} className="text-green-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Converted</span></div><p className="text-2xl font-bold text-green-600">{converted}</p></div>
        <div className={cardCls}><div className="flex items-center gap-2 mb-2"><Clock size={16} className="text-amber-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Pending</span></div><p className="text-2xl font-bold text-amber-600">{pending}</p></div>
        <div className={cardCls}><div className="flex items-center gap-2 mb-2"><TrendingUp size={16} className="text-blue-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Conversion Rate</span></div><p className="text-2xl font-bold text-blue-600">{conversionRate}%</p></div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        {referrals.length === 0 ? (
          <div className="px-4 py-12 text-center text-slate-400 dark:text-slate-500">No referrals yet.</div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
              <tr><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Referrer</th><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Referred</th><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Code</th><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Status</th><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Converted Date</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {referrals.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-200">{r.referrer_name}</td>
                  <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{r.referred_name}</td>
                  <td className="px-4 py-2.5"><span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 px-2 py-0.5 rounded">{r.referral_code}</span></td>
                  <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-2.5 text-slate-400 dark:text-slate-500">{r.conversion_date || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  )
}
