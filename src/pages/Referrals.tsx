import { useState, useEffect } from 'react'
import { Share2, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import { api } from '../api/client'
import StatusBadge from '../components/StatusBadge'

export default function Referrals() {
  const [referrals, setReferrals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getReferrals().then(res => {
      if (res.success) setReferrals(res.referrals || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <LoadingScreen message="Loading referrals..." />
  const total = referrals.length
  const converted = referrals.filter(r => r.status === 'converted').length
  const pending = referrals.filter(r => r.status === 'pending').length
  const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Referrals</h2>
        <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 px-2 py-1 rounded">[ DEMO MODE ACTIVE ]</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2"><Share2 size={16} className="text-slate-600" /><span className="text-xs text-slate-500">Total Referrals</span></div>
          <p className="text-2xl font-bold text-slate-700">{total}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2"><CheckCircle size={16} className="text-green-600" /><span className="text-xs text-slate-500">Converted</span></div>
          <p className="text-2xl font-bold text-green-600">{converted}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2"><Clock size={16} className="text-amber-600" /><span className="text-xs text-slate-500">Pending</span></div>
          <p className="text-2xl font-bold text-amber-600">{pending}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={16} className="text-blue-600" /><span className="text-xs text-slate-500">Conversion Rate</span></div>
          <p className="text-2xl font-bold text-blue-600">{conversionRate}%</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {referrals.length === 0 ? (
          <div className="px-4 py-12 text-center text-slate-400">No referrals yet.</div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Referrer</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Referred</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Code</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Converted Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {referrals.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-medium text-slate-700">{r.referrer_name}</td>
                  <td className="px-4 py-2.5 text-slate-600">{r.referred_name}</td>
                  <td className="px-4 py-2.5"><span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded">{r.referral_code}</span></td>
                  <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-2.5 text-slate-400">{r.conversion_date || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  )
}
