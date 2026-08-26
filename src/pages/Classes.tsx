import { useState, useEffect } from 'react'
import { Calendar, Users, Clock } from 'lucide-react'
import { api } from '../api/client'
import StatusBadge from '../components/StatusBadge'

export default function Classes() {
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getClassSchedule().then(res => {
      if (res.success) setClasses(res.classes || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="px-4 py-12 text-center text-slate-400">Loading classes...</div>
  const total = classes.length
  const active = classes.filter(c => c.status === 'active' || c.status === 'scheduled').length
  const full = classes.filter(c => c.booked_count >= c.capacity).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Classes & Bookings</h2>
        <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 px-2 py-1 rounded">[ DEMO MODE ACTIVE ]</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2"><Calendar size={16} className="text-slate-600" /><span className="text-xs text-slate-500">Total Classes</span></div>
          <p className="text-2xl font-bold text-slate-700">{total}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2"><Clock size={16} className="text-green-600" /><span className="text-xs text-slate-500">Active</span></div>
          <p className="text-2xl font-bold text-green-600">{active}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2"><Users size={16} className="text-amber-600" /><span className="text-xs text-slate-500">Full</span></div>
          <p className="text-2xl font-bold text-amber-600">{full}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {classes.length === 0 ? (
          <div className="px-4 py-12 text-center text-slate-400">No classes scheduled.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Class</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Trainer</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Day</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Time</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Capacity</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {classes.map(c => {
                const pct = c.capacity > 0 ? Math.round((c.booked_count / c.capacity) * 100) : 0
                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-medium text-slate-700">{c.title}</td>
                    <td className="px-4 py-2.5 text-slate-500">{c.trainer_name}</td>
                    <td className="px-4 py-2.5 text-slate-500 capitalize">{c.day_of_week}</td>
                    <td className="px-4 py-2.5 text-slate-500">{c.start_time} • {c.duration_minutes}min</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">{c.booked_count}/{c.capacity}</span>
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${pct >= 100 ? 'bg-red-400' : pct >= 75 ? 'bg-amber-400' : 'bg-green-400'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5"><StatusBadge status={c.status} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
