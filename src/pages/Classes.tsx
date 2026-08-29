import { useState, useEffect } from 'react'
import { Calendar, Users, Clock, UserPlus, UserMinus, Loader, Check, AlertCircle, X, QrCode, Link2, Copy } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import { api } from '../api/client'
import StatusBadge from '../components/StatusBadge'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://base44.app/api/apps/6a700b150c8d8b8e923580a1/functions'

export default function Classes() {
  const [classes, setClasses] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [enrollLoading, setEnrollLoading] = useState<string | null>(null)
  const [enrollModal, setEnrollModal] = useState<{ classId: string; className: string } | null>(null)
  const [selectedMember, setSelectedMember] = useState('')
  const [enrollResult, setEnrollResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [shareModal, setShareModal] = useState<{ classId: string; className: string } | null>(null)

  useEffect(() => {
    Promise.all([
      api.getClassSchedule().then(res => res.success ? res.classes || [] : []),
      api.getMembers().then(res => res.success ? res.members || [] : [])
    ]).then(([c, m]) => {
      setClasses(c)
      setMembers(m)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleEnroll = async () => {
    if (!enrollModal || !selectedMember) return
    setEnrollLoading(enrollModal.classId)
    try {
      const gymId = localStorage.getItem('gym_os_gym_id') || 'gym_oxigen'
      const res = await fetch(`${API_BASE}/enrollInClass`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gym_id: gymId, class_id: enrollModal.classId, member_id: selectedMember, action: 'enroll' })
      })
      const data = await res.json()
      if (data.success) {
        setEnrollResult({ type: 'success', text: `${data.message} (${data.enrolled}/${data.capacity} enrolled, ${data.spots_left} spots left)` })
        api.getClassSchedule().then(res => { if (res.success) setClasses(res.classes || []) })
      } else {
        setEnrollResult({ type: 'error', text: data.error || 'Enrollment failed' })
      }
    } catch (err) {
      setEnrollResult({ type: 'error', text: 'Network error' })
    }
    setEnrollLoading(null)
  }

  const handleUnenroll = async (classId: string, memberId: string) => {
    setEnrollLoading(classId + memberId)
    try {
      const gymId = localStorage.getItem('gym_os_gym_id') || 'gym_oxigen'
      const res = await fetch(`${API_BASE}/enrollInClass`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gym_id: gymId, class_id: classId, member_id: memberId, action: 'unenroll' })
      })
      const data = await res.json()
      if (data.success) {
        api.getClassSchedule().then(res => { if (res.success) setClasses(res.classes || []) })
      }
    } catch (err) { /* silent */ }
    setEnrollLoading(null)
  }

  const generateEnrollmentLink = (classId: string) => {
    const gymId = localStorage.getItem('gym_os_gym_id') || 'gym_oxigen'
    return `${window.location.origin}/#/enroll?class=${classId}&gym=${gymId}`
  }

  if (loading) return <LoadingScreen message="Loading classes..." />
  const total = classes.length
  const active = classes.filter(c => c.status === 'active' || c.status === 'scheduled').length
  const full = classes.filter(c => (c.enrolled || 0) >= (c.capacity || 0)).length
  const totalEnrolled = classes.reduce((s, c) => s + (c.enrolled || 0), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Classes & Bookings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage class schedule, enroll members, and share self-enrollment links.</p>
        </div>
      </div>

      {/* Enrollment result toast */}
      {enrollResult && !enrollModal && (
        <div className={`flex items-center gap-3 p-3 rounded-xl ${enrollResult.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
          {enrollResult.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span className="text-sm font-medium flex-1">{enrollResult.text}</span>
          <button onClick={() => setEnrollResult(null)}><X size={14} /></button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-colors">
          <div className="flex items-center gap-2 mb-2"><Calendar size={16} className="text-slate-600 dark:text-slate-400" /><span className="text-xs text-slate-500 dark:text-slate-400">Total Classes</span></div>
          <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">{total}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-colors">
          <div className="flex items-center gap-2 mb-2"><Clock size={16} className="text-green-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Active</span></div>
          <p className="text-2xl font-bold text-green-600">{active}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-colors">
          <div className="flex items-center gap-2 mb-2"><Users size={16} className="text-blue-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Total Enrolled</span></div>
          <p className="text-2xl font-bold text-blue-600">{totalEnrolled}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-colors">
          <div className="flex items-center gap-2 mb-2"><AlertCircle size={16} className="text-amber-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Full</span></div>
          <p className="text-2xl font-bold text-amber-600">{full}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        {classes.length === 0 ? (
          <div className="px-4 py-12 text-center text-slate-400 dark:text-slate-500">No classes scheduled.</div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Class</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Trainer</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Day</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Time</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Capacity</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Enrolled Members</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Status</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {classes.map(c => {
                const pct = (c.capacity || 0) > 0 ? Math.round(((c.enrolled || 0) / (c.capacity || 1)) * 100) : 0
                const isFull = pct >= 100
                const enrolledNames = c.enrolled_member_names || []
                const enrolledIds = (c.enrolled_members || '').split(',').filter(Boolean)
                return (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-slate-700 dark:text-slate-200">{c.name || c.title}</div>
                      {c.intensity && <span className="text-xs text-slate-400 capitalize">{c.intensity}</span>}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{c.trainer_name}</td>
                    <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 capitalize">{c.day_of_week}</td>
                    <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{c.start_time}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 dark:text-slate-300">{c.enrolled || 0}/{c.capacity}</span>
                        <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${pct >= 100 ? 'bg-red-400' : pct >= 75 ? 'bg-amber-400' : 'bg-green-400'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 max-w-xs">
                      {enrolledNames.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {enrolledNames.slice(0, 3).map((name: string, i: number) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300">{name}</span>
                          ))}
                          {enrolledNames.length > 3 && <span className="text-xs text-slate-400">+{enrolledNames.length - 3} more</span>}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">No enrollments</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5"><StatusBadge status={isFull ? 'full' : c.status} /></td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEnrollModal({ classId: c.id, className: c.name || c.title }); setSelectedMember(''); setEnrollResult(null) }}
                          disabled={isFull}
                          className="text-xs px-2 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded border border-brand-200 dark:border-brand-800 hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <UserPlus size={12} /> {isFull ? 'Full' : 'Enroll'}
                        </button>
                        <button
                          onClick={() => setShareModal({ classId: c.id, className: c.name || c.title })}
                          className="text-xs px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-1"
                          title="Share enrollment link"
                        >
                          <Link2 size={12} /> Share
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table></div>
        )}
      </div>

      {/* Enrollment Modal */}
      {enrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Enroll Member</h3>
                <p className="text-xs text-slate-500 mt-0.5">{enrollModal.className}</p>
              </div>
              <button onClick={() => setEnrollModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              {enrollResult && (
                <div className={`flex items-center gap-2 p-3 rounded-xl ${enrollResult.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                  {enrollResult.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                  <span className="text-sm">{enrollResult.text}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Member</label>
                <select value={selectedMember} onChange={e => setSelectedMember(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400">
                  <option value="">Choose a member...</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name} — {m.phone}</option>)}
                </select>
              </div>
              <button onClick={handleEnroll} disabled={!selectedMember || !!enrollLoading}
                className="w-full py-2.5 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {enrollLoading ? <Loader size={14} className="animate-spin" /> : <UserPlus size={14} />} Enroll Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Link Modal */}
      {shareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Link2 size={18} /> Enrollment Link</h3>
              <button onClick={() => setShareModal(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Share this link with members so they can self-enroll in <span className="font-medium">{shareModal.className}</span>.</p>
            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
              <input type="text" readOnly value={generateEnrollmentLink(shareModal.classId)}
                className="flex-1 bg-transparent text-sm text-slate-600 dark:text-slate-300 font-mono outline-none" />
              <button onClick={() => { navigator.clipboard.writeText(generateEnrollmentLink(shareModal.classId)) }}
                className="px-3 py-1.5 text-xs text-white bg-brand-600 rounded-md hover:bg-brand-700 flex items-center gap-1">
                <Copy size={12} /> Copy
              </button>
            </div>
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-600 dark:text-blue-400">
              Members who open this link will be able to enroll themselves in this class if spots are available.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}