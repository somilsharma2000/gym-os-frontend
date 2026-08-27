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
    api.getStaff().then(res => { if (res.success) setData(res); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <LoadingScreen message="Loading staff..." />
  const staff: any[] = data?.staff || []
  const trainers: any[] = data?.trainers || []
  const activeStaff = staff.filter((s: any) => s.is_active).length
  const activeTrainers = trainers.filter((t: any) => t.is_active).length

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Staff & Trainers</h2>

      <div className="flex gap-2">
        <button onClick={() => setTab('staff')} className={`px-4 py-1.5 text-sm rounded-md flex items-center gap-2 transition-colors ${tab === 'staff' ? 'bg-brand-700 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
          <UserCog size={16} /> Staff ({staff.length})
        </button>
        <button onClick={() => setTab('trainers')} className={`px-4 py-1.5 text-sm rounded-md flex items-center gap-2 transition-colors ${tab === 'trainers' ? 'bg-brand-700 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
          <Dumbbell size={16} /> Trainers ({trainers.length})
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-colors">
          <div className="flex items-center gap-2 mb-2"><UserCog size={16} className="text-slate-600 dark:text-slate-400" /><span className="text-xs text-slate-500 dark:text-slate-400">Active Staff</span></div>
          <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">{activeStaff}/{staff.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-colors">
          <div className="flex items-center gap-2 mb-2"><Dumbbell size={16} className="text-slate-600 dark:text-slate-400" /><span className="text-xs text-slate-500 dark:text-slate-400">Active Trainers</span></div>
          <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">{activeTrainers}/{trainers.length}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        {tab === 'staff' ? (
          <div className="overflow-x-auto"><table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
              <tr><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Name</th><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Role</th><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Phone</th><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Email</th><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {staff.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-200">{s.name}</td>
                  <td className="px-4 py-2.5 capitalize text-slate-600 dark:text-slate-300">{s.role?.replace(/_/g, ' ') || '—'}</td>
                  <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{s.phone || '—'}</td>
                  <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{s.email || '—'}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={s.is_active ? 'active' : 'expired'} /></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
              <tr><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Name</th><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Specialization</th><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Phone</th><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Email</th><th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {trainers.map((t: any) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-200">{t.name}</td>
                  <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{t.specialization || '—'}</td>
                  <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{t.phone || '—'}</td>
                  <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{t.email || '—'}</td>
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
