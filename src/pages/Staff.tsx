import { useState, useEffect } from 'react'
import { UserCog, Dumbbell } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import { api } from '../api/client'
import StatusBadge from '../components/StatusBadge'

export default function Staff() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'staff' | 'trainers'>('staff')

  useEffect(() => {
    api.getStaff().then(res => {
      if (res.success) setData(res)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <LoadingScreen message="Loading staff..." />
  const staff: any[] = data?.staff || []
  const trainers: any[] = data?.trainers || []
  const activeStaff = staff.filter((s: any) => s.is_active).length
  const activeTrainers = trainers.filter((t: any) => t.is_active).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Staff & Trainers</h2>
        <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 px-2 py-1 rounded">[ DEMO MODE ACTIVE ]</span>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('staff')} className={`px-4 py-1.5 text-sm rounded-md flex items-center gap-2 ${tab === 'staff' ? 'bg-brand-700 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
          <UserCog size={16} /> Staff ({staff.length})
        </button>
        <button onClick={() => setTab('trainers')} className={`px-4 py-1.5 text-sm rounded-md flex items-center gap-2 ${tab === 'trainers' ? 'bg-brand-700 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
          <Dumbbell size={16} /> Trainers ({trainers.length})
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2"><UserCog size={16} className="text-slate-600" /><span className="text-xs text-slate-500">Active Staff</span></div>
          <p className="text-2xl font-bold text-slate-700">{activeStaff}/{staff.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2"><Dumbbell size={16} className="text-slate-600" /><span className="text-xs text-slate-500">Active Trainers</span></div>
          <p className="text-2xl font-bold text-slate-700">{activeTrainers}/{trainers.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {tab === 'staff' ? (
          <div className="overflow-x-auto"><table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Name</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Role</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Phone</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Email</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staff.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-medium text-slate-700">{s.name}</td>
                  <td className="px-4 py-2.5"><span className="capitalize text-slate-600">{s.role?.replace(/_/g, ' ') || '—'}</span></td>
                  <td className="px-4 py-2.5 text-slate-500">{s.phone || '—'}</td>
                  <td className="px-4 py-2.5 text-slate-500">{s.email || '—'}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={s.is_active ? 'active' : 'expired'} /></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Name</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Specialization</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Phone</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Email</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {trainers.map((t: any) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-medium text-slate-700">{t.name}</td>
                  <td className="px-4 py-2.5 text-slate-600">{t.specialization || '—'}</td>
                  <td className="px-4 py-2.5 text-slate-500">{t.phone || '—'}</td>
                  <td className="px-4 py-2.5 text-slate-500">{t.email || '—'}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={t.is_active ? 'active' : 'expired'} /></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  )
}
