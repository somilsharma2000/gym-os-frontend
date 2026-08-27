import { useState, useEffect } from 'react'
import { AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import { api } from '../api/client'
import StatusBadge from '../components/StatusBadge'

export default function AtRisk() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getMembers().then(res => { if (res.success) setMembers(res.members || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <LoadingScreen message="Loading at-risk members..." />
  const atRisk = members.filter(m => m.risk_status && m.risk_status !== 'none' && m.risk_status !== 'healthy' && m.risk_status !== '')
  const high = atRisk.filter(m => m.risk_status === 'high' || m.risk_status === 'critical').length
  const medium = atRisk.filter(m => m.risk_status === 'medium' || m.risk_status === 'at_risk').length
  const healthy = members.filter(m => !m.risk_status || m.risk_status === 'none' || m.risk_status === 'healthy').length

  const cardCls = "bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-colors"

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">At-Risk Members</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={cardCls}><div className="flex items-center gap-2 mb-2"><AlertCircle size={16} className="text-red-600" /><span className="text-xs text-slate-500 dark:text-slate-400">High Risk</span></div><p className="text-2xl font-bold text-red-600">{high}</p></div>
        <div className={cardCls}><div className="flex items-center gap-2 mb-2"><AlertTriangle size={16} className="text-amber-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Medium</span></div><p className="text-2xl font-bold text-amber-600">{medium}</p></div>
        <div className={cardCls}><div className="flex items-center gap-2 mb-2"><ShieldCheck size={16} className="text-green-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Healthy</span></div><p className="text-2xl font-bold text-green-600">{healthy}</p></div>
        <div className={cardCls}><div className="flex items-center gap-2 mb-2"><AlertTriangle size={16} className="text-slate-600 dark:text-slate-400" /><span className="text-xs text-slate-500 dark:text-slate-400">Total Tracked</span></div><p className="text-2xl font-bold text-slate-700 dark:text-slate-200">{members.length}</p></div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        {atRisk.length === 0 ? (
          <div className="px-4 py-12 text-center text-slate-400 dark:text-slate-500">
            <ShieldCheck size={32} className="mx-auto mb-2 text-green-400" />
            No at-risk members detected. All members are healthy.
          </div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
              <tr><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Member</th><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Phone</th><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Risk Level</th><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Reason</th><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Membership</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {atRisk.map(m => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-200">{m.name}</td>
                  <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{m.phone}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={m.risk_status} /></td>
                  <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 max-w-xs truncate">{m.risk_reason || '—'}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={m.membership_status} /></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  )
}
