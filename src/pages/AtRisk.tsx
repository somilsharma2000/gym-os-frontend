import { useState, useEffect } from 'react'
import { AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react'
import { api } from '../api/client'
import StatusBadge from '../components/StatusBadge'

export default function AtRisk() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getMembers().then(res => {
      if (res.success) setMembers(res.members || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="px-4 py-12 text-center text-slate-400">Loading at-risk members...</div>
  const atRisk = members.filter(m => m.risk_status && m.risk_status !== 'none' && m.risk_status !== 'healthy' && m.risk_status !== '')
  const high = atRisk.filter(m => m.risk_status === 'high' || m.risk_status === 'critical').length
  const medium = atRisk.filter(m => m.risk_status === 'medium' || m.risk_status === 'at_risk').length
  const healthy = members.filter(m => !m.risk_status || m.risk_status === 'none' || m.risk_status === 'healthy').length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">At-Risk Members</h2>
        <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 px-2 py-1 rounded">[ DEMO MODE ACTIVE ]</span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2"><AlertCircle size={16} className="text-red-600" /><span className="text-xs text-slate-500">High Risk</span></div>
          <p className="text-2xl font-bold text-red-600">{high}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle size={16} className="text-amber-600" /><span className="text-xs text-slate-500">Medium</span></div>
          <p className="text-2xl font-bold text-amber-600">{medium}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2"><ShieldCheck size={16} className="text-green-600" /><span className="text-xs text-slate-500">Healthy</span></div>
          <p className="text-2xl font-bold text-green-600">{healthy}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle size={16} className="text-slate-600" /><span className="text-xs text-slate-500">Total Tracked</span></div>
          <p className="text-2xl font-bold text-slate-700">{members.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {atRisk.length === 0 ? (
          <div className="px-4 py-12 text-center text-slate-400">
            <ShieldCheck size={32} className="mx-auto mb-2 text-green-400" />
            No at-risk members detected. All members are healthy.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Member</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Phone</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Risk Level</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Reason</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Membership</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {atRisk.map(m => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-medium text-slate-700">{m.name}</td>
                  <td className="px-4 py-2.5 text-slate-500">{m.phone}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={m.risk_status} /></td>
                  <td className="px-4 py-2.5 text-slate-500 max-w-xs truncate">{m.risk_reason || '—'}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={m.membership_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
