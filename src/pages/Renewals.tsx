import { useState, useEffect } from 'react'
import { RefreshCw, AlertCircle, XCircle } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import { api } from '../api/client'

const stageColors: Record<string, string> = {
  safe: 'bg-green-50 text-green-700 border-green-200',
  notice: 'bg-blue-50 text-blue-700 border-blue-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  urgent: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
  expired: 'bg-red-100 text-red-800 border-red-300',
  win_back: 'bg-purple-50 text-purple-700 border-purple-200',
  follow_up: 'bg-amber-50 text-amber-700 border-amber-200'
}

export default function Renewals() {
  const [renewals, setRenewals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getRenewals().then(res => {
      if (res.success) setRenewals(res.renewals || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <LoadingScreen message="Loading renewal pipeline..." />
  const critical = renewals.filter(r => r.days_to_expiry < 7 && r.days_to_expiry >= 0).length
  const expiredCount = renewals.filter(r => r.days_to_expiry < 0).length
  const warning = renewals.filter(r => r.days_to_expiry >= 7 && r.days_to_expiry < 30).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Renewal Pipeline</h2>
        <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 px-2 py-1 rounded">[ DEMO MODE ACTIVE ]</span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2"><RefreshCw size={16} className="text-slate-600" /><span className="text-xs text-slate-500">Total</span></div>
          <p className="text-2xl font-bold text-slate-700">{renewals.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2"><AlertCircle size={16} className="text-red-600" /><span className="text-xs text-slate-500">Critical (&lt;7d)</span></div>
          <p className="text-2xl font-bold text-red-600">{critical}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2"><AlertCircle size={16} className="text-amber-600" /><span className="text-xs text-slate-500">Warning (&lt;30d)</span></div>
          <p className="text-2xl font-bold text-amber-600">{warning}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2"><XCircle size={16} className="text-red-700" /><span className="text-xs text-slate-500">Expired</span></div>
          <p className="text-2xl font-bold text-red-700">{expiredCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {renewals.length === 0 ? (
          <div className="px-4 py-12 text-center text-slate-400">No renewals in pipeline.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Member</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Plan</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Expiry</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Days Left</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Stage</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Assigned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {renewals.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-medium text-slate-700">{r.member_name}</td>
                  <td className="px-4 py-2.5 text-slate-500">{r.plan_name}</td>
                  <td className="px-4 py-2.5 text-slate-400">{r.expiry_date}</td>
                  <td className="px-4 py-2.5">
                    <span className={`font-semibold ${r.days_to_expiry < 0 ? 'text-red-600' : r.days_to_expiry < 7 ? 'text-red-500' : r.days_to_expiry < 30 ? 'text-amber-500' : 'text-slate-600'}`}>
                      {r.days_to_expiry < 0 ? `${Math.abs(r.days_to_expiry)}d overdue` : `${r.days_to_expiry}d`}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium capitalize ${stageColors[r.stage] || stageColors.safe}`}>
                      {r.stage.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{r.assigned_to || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
