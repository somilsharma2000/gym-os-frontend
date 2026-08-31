import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UserCog, Dumbbell, ArrowRight, Plus } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import { api } from '../api/client'
import StatusBadge from '../components/StatusBadge'

export default function Staff() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Staff</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Front-desk, management &amp; admin accounts. For trainer profiles, schedules &amp; specialties, use the Trainers page.
          </p>
        </div>
        {/* Cross-link instead of embedding a duplicate Trainers page */}
        <Link
          to="/trainers"
          className="px-3.5 py-2 text-xs font-semibold text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors flex items-center gap-2"
        >
          <Dumbbell size={14} /> Manage Trainers <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition-colors">
          <div className="flex items-center gap-2 mb-2"><UserCog size={16} className="text-slate-600 dark:text-slate-400" /><span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Staff</span></div>
          <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">{activeStaff}/{staff.length}</p>
        </div>
        <Link to="/trainers" className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition-colors hover:border-brand-300 dark:hover:border-brand-700 group">
          <div className="flex items-center gap-2 mb-2"><Dumbbell size={16} className="text-slate-600 dark:text-slate-400" /><span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Trainers</span></div>
          <p className="text-2xl font-bold text-slate-700 dark:text-slate-200 group-hover:text-brand-600 transition-colors">{activeTrainers}/{trainers.length}</p>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><UserCog size={16} className="text-brand-500" /> General Staff Directory</h3>
        </div>
        {staff.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400 dark:text-slate-500 flex flex-col items-center gap-2">
            <UserCog size={28} className="text-slate-300 dark:text-slate-600" />
            No general staff accounts yet. Add managers, receptionists or front-desk staff via Settings → Team Accounts.
          </div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-xs sm:text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left px-4 py-2.5 font-bold text-slate-600 dark:text-slate-300">Name</th>
                <th className="text-left px-4 py-2.5 font-bold text-slate-600 dark:text-slate-300">Role</th>
                <th className="text-left px-4 py-2.5 font-bold text-slate-600 dark:text-slate-300">Phone</th>
                <th className="text-left px-4 py-2.5 font-bold text-slate-600 dark:text-slate-300">Email</th>
                <th className="text-left px-4 py-2.5 font-bold text-slate-600 dark:text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {staff.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-2.5 font-bold text-slate-700 dark:text-slate-200">{s.name}</td>
                  <td className="px-4 py-2.5 capitalize text-slate-600 dark:text-slate-300">{s.role?.replace(/_/g, ' ') || '—'}</td>
                  <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{s.phone || '—'}</td>
                  <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{s.email || '—'}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={s.is_active ? 'active' : 'expired'} /></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  )
}
