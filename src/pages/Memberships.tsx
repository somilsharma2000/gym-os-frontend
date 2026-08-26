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
    api.getMemberships().then(res => {
      if (res.success) setData(res)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <LoadingScreen message="Loading memberships..." />
  const memberships = data?.memberships || []
  const plans = data?.plans || []
  const filtered = filter === 'all' ? memberships : memberships.filter((m: any) => m.status === filter)
  const active = memberships.filter((m: any) => m.status === 'active').length
  const expiring = memberships.filter((m: any) => m.status === 'expiring').length
  const expired = memberships.filter((m: any) => m.status === 'expired').length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Memberships</h2>
        <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 px-2 py-1 rounded">[ DEMO MODE ACTIVE ]</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={CreditCard} label="Total" value={memberships.length} color="text-slate-700" />
        <StatCard icon={CheckCircle} label="Active" value={active} color="text-green-600" />
        <StatCard icon={AlertCircle} label="Expiring" value={expiring} color="text-amber-600" />
        <StatCard icon={XCircle} label="Expired" value={expired} color="text-red-600" />
      </div>

      <div className="flex gap-2">
        {['all', 'active', 'expiring', 'expired'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 text-xs rounded-md border ${filter === s ? 'bg-brand-700 text-white border-brand-700' : 'bg-white text-slate-600 border-slate-200'}`}>
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-slate-400">No memberships found.</div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Member</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Plan</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Start</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Expiry</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Payment</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((m: any) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-medium text-slate-700">{m.member_name}</td>
                  <td className="px-4 py-2.5 text-slate-500">{m.plan_name}</td>
                  <td className="px-4 py-2.5 text-slate-400">{m.start_date}</td>
                  <td className="px-4 py-2.5 text-slate-400">{m.expiry_date}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={m.payment_status} /></td>
                  <td className="px-4 py-2.5"><StatusBadge status={m.status} /></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      {plans.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Available Plans</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {plans.map((p: any) => (
              <div key={p.id} className="border border-slate-200 rounded-md p-3">
                <p className="font-medium text-slate-700">{p.name}</p>
                <p className="text-xs text-slate-400 mt-1">{p.duration_days} days</p>
                <p className="text-sm font-semibold text-slate-600 mt-1">₹{p.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={color} />
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-700">{value}</p>
    </div>
  )
}
