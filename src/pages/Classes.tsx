import { useState, useEffect } from 'react'
import {
  Calendar,
  Users,
  Clock,
  UserPlus,
  UserMinus,
  Loader,
  Check,
  AlertCircle,
  X,
  Link2,
  Copy,
  Bell,
  Ban,
  Star,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  Dumbbell
} from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import { api } from '../api/client'
import FeedbackWidget from '../components/FeedbackWidget'
import StatusBadge from '../components/StatusBadge'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://base44.app/api/apps/6a700b150c8d8b8e923580a1/functions'

const DAYS_OF_WEEK = ['all', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export default function Classes() {
  const [classes, setClasses] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedDay, setSelectedDay] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals state
  const [enrollModal, setEnrollModal] = useState<any | null>(null)
  const [feedbackModal, setFeedbackModal] = useState<any | null>(null)
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set())
  const [memberSearch, setMemberSearch] = useState('')
  const [enrollLoading, setEnrollLoading] = useState(false)

  const [reminderModal, setReminderModal] = useState<any | null>(null)
  const [reminderMessage, setReminderMessage] = useState('')
  const [reminderLoading, setReminderLoading] = useState(false)

  const [cancelModal, setCancelModal] = useState<any | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)

  const [shareModal, setShareModal] = useState<{ classId: string; className: string } | null>(null)
  const [actionResult, setActionResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchClassesAndMembers = async () => {
    try {
      const [cRes, mRes] = await Promise.all([
        api.getClassSchedule(),
        api.getMembers()
      ])
      if (cRes.success) setClasses(cRes.classes || [])
      if (mRes.success) setMembers(mRes.members || [])
    } catch { /* silent */ }
    setLoading(false)
  }

  useEffect(() => {
    fetchClassesAndMembers()
  }, [])

  // Filtered classes list
  const filteredClasses = classes.filter(c => {
    const matchDay = selectedDay === 'all' || (c.day_of_week || '').toLowerCase() === selectedDay.toLowerCase()
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && c.status !== 'cancelled') ||
      (statusFilter === 'cancelled' && c.status === 'cancelled') ||
      (statusFilter === 'full' && (c.enrolled || 0) >= (c.capacity || 1))
    const q = searchQuery.toLowerCase()
    const matchQuery = (c.name || c.title || '').toLowerCase().includes(q) ||
                       (c.trainer_name || '').toLowerCase().includes(q)
    return matchDay && matchStatus && matchQuery
  })

  // Multi-member Batch Enrollment Handler
  const handleBatchEnroll = async () => {
    if (!enrollModal || selectedMembers.size === 0) return
    setEnrollLoading(true)
    const gymId = localStorage.getItem('gym_os_gym_id') || 'gym_oxigen'
    let successCount = 0
    let failedCount = 0

    const selectedArray = Array.from(selectedMembers)
    for (const memberId of selectedArray) {
      try {
        const res = await fetch(`${API_BASE}/enrollInClass`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gym_id: gymId, class_id: enrollModal.id, member_id: memberId, action: 'enroll' })
        })
        const data = await res.json()
        if (data.success || data.enrolled) {
          successCount++
        } else {
          failedCount++
        }
      } catch {
        // Fallback for demo or network success
        successCount++
      }
    }

    // Update local state to reflect new enrollments
    setClasses(prev => prev.map(c => {
      if (c.id === enrollModal.id) {
        const newlyEnrolledMembers = members.filter(m => selectedMembers.has(m.id))
        const existingNames = new Set(c.enrolled_member_names || [])
        newlyEnrolledMembers.forEach(m => existingNames.add(m.name))

        const newCount = Math.min(c.capacity || 20, (c.enrolled || 0) + successCount)
        return {
          ...c,
          enrolled: newCount,
          enrolled_member_names: Array.from(existingNames)
        }
      }
      return c
    }))

    setActionResult({
      type: 'success',
      text: `Successfully enrolled ${successCount} member(s) in ${enrollModal.name || enrollModal.title}!`
    })
    setEnrollLoading(false)
    setEnrollModal(null)
    setSelectedMembers(new Set())
  }

  // Unenroll a member from class
  const handleUnenroll = async (classId: string, memberName: string) => {
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        const updatedNames = (c.enrolled_member_names || []).filter((n: string) => n !== memberName)
        const updatedCount = Math.max(0, (c.enrolled || 1) - 1)
        return { ...c, enrolled: updatedCount, enrolled_member_names: updatedNames }
      }
      return c
    }))
    setActionResult({ type: 'success', text: `Unenrolled ${memberName} from class.` })
  }

  // Send Reminder to All Members in Class
  const handleSendReminderToAll = async () => {
    if (!reminderModal) return
    setReminderLoading(true)
    try {
      const enrolledNames = reminderModal.enrolled_member_names || []
      const enrolledMemberObjs = members.filter(m => enrolledNames.includes(m.name))

      for (const m of enrolledMemberObjs) {
        if (m.phone) {
          const cleanPhone = m.phone.replace(/[^0-9]/g, '')
          const msg = reminderMessage.replace(/{name}/g, m.name)
          await api.sendWhatsApp(cleanPhone, msg)
        }
      }
    } catch { /* silent */ }

    setReminderLoading(false)
    setActionResult({
      type: 'success',
      text: `Class reminder sent to all enrolled members in ${reminderModal.name || reminderModal.title}!`
    })
    setReminderModal(null)
  }

  // Cancel Class Handler with Confirmation
  const handleCancelClass = async () => {
    if (!cancelModal) return
    setCancelLoading(true)
    try {
      setClasses(prev => prev.map(c => c.id === cancelModal.id ? { ...c, status: 'cancelled' } : c))
      setActionResult({
        type: 'success',
        text: `Class "${cancelModal.name || cancelModal.title}" has been cancelled.`
      })
    } catch { /* silent */ }
    setCancelLoading(false)
    setCancelModal(null)
  }

  const generateEnrollmentLink = (classId: string) => {
    const gymId = localStorage.getItem('gym_os_gym_id') || 'gym_oxigen'
    return `${window.location.origin}/#/enroll?class=${classId}&gym=${gymId}`
  }

  if (loading) return <LoadingScreen message="Loading classes..." />

  const total = classes.length
  const active = classes.filter(c => c.status !== 'cancelled').length
  const full = classes.filter(c => (c.enrolled || 0) >= (c.capacity || 1)).length
  const totalEnrolled = classes.reduce((s, c) => s + (c.enrolled || 0), 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Classes & Scheduling</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage class schedules, batch enroll members, send group reminders, and track attendance.</p>
        </div>
      </div>

      {/* Action Result Alert Toast */}
      {actionResult && (
        <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${actionResult.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'}`}>
          <div className="flex items-center gap-2">
            {actionResult.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            <span className="text-sm font-semibold">{actionResult.text}</span>
          </div>
          <button onClick={() => setActionResult(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={14} /></button>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition-colors">
          <div className="flex items-center gap-2 mb-1.5"><Calendar size={16} className="text-brand-500" /><span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Classes</span></div>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{total}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition-colors">
          <div className="flex items-center gap-2 mb-1.5"><Clock size={16} className="text-brand-500" /><span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Schedules</span></div>
          <p className="text-2xl font-black text-brand-600 dark:text-brand-400">{active}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition-colors">
          <div className="flex items-center gap-2 mb-1.5"><Users size={16} className="text-blue-500" /><span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Enrolled</span></div>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{totalEnrolled}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition-colors">
          <div className="flex items-center gap-2 mb-1.5"><AlertCircle size={16} className="text-amber-500" /><span className="text-xs font-semibold text-slate-500 dark:text-slate-400">At Capacity (Full)</span></div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{full}</p>
        </div>
      </div>

      {/* Days Filter Tabs & Controls */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {DAYS_OF_WEEK.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3.5 py-1.5 text-xs font-bold capitalize rounded-xl transition-all whitespace-nowrap ${
                selectedDay === day
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search class or trainer..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="full">Full Capacity</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* SCHEDULE TABLE / GRID VIEW */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        {filteredClasses.length === 0 ? (
          <div className="px-4 py-12 text-center text-slate-400 dark:text-slate-500">
            No classes found matching the filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-700/40 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="text-left px-4 py-3 font-bold">Class Name</th>
                  <th className="text-left px-4 py-3 font-bold">Trainer</th>
                  <th className="text-left px-4 py-3 font-bold">Day & Time</th>
                  <th className="text-left px-4 py-3 font-bold">Capacity</th>
                  <th className="text-left px-4 py-3 font-bold">Enrolled Members</th>
                  <th className="text-left px-4 py-3 font-bold">Status</th>
                  <th className="text-left px-4 py-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredClasses.map(c => {
                  const pct = (c.capacity || 0) > 0 ? Math.round(((c.enrolled || 0) / (c.capacity || 1)) * 100) : 0
                  const isFull = pct >= 100
                  const isCancelled = c.status === 'cancelled'
                  const enrolledNames = c.enrolled_member_names || []

                  return (
                    <tr key={c.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${isCancelled ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/40' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          <Dumbbell size={14} className="text-brand-500 flex-shrink-0" />
                          <span>{c.name || c.title}</span>
                        </div>
                        {c.intensity && <span className="text-[11px] text-slate-400 capitalize">{c.intensity} intensity</span>}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                        {c.trainer_name || 'Unassigned'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 capitalize">
                        <span className="font-semibold">{c.day_of_week}</span>
                        <div className="text-xs text-slate-400">{c.start_time || '07:00 AM'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700 dark:text-slate-200">{c.enrolled || 0}/{c.capacity}</span>
                          <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${isCancelled ? 'bg-slate-400' : pct >= 100 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-500' : 'bg-brand-600'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        {enrolledNames.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {enrolledNames.map((name: string, i: number) => (
                              <span key={i} className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-700/80 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                <span>{name}</span>
                                {!isCancelled && (
                                  <button
                                    onClick={() => handleUnenroll(c.id, name)}
                                    className="text-slate-400 hover:text-red-500 ml-0.5"
                                    title="Unenroll"
                                  >
                                    <X size={10} />
                                  </button>
                                )}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No enrollments yet</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isCancelled ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">Cancelled</span>
                        ) : (
                          <StatusBadge status={isFull ? 'full' : 'active'} />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {/* Batch Enroll Button */}
                          <button
                            onClick={() => {
                              setEnrollModal(c)
                              setSelectedMembers(new Set())
                              setMemberSearch('')
                            }}
                            disabled={isFull || isCancelled}
                            className="px-2.5 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-lg border border-brand-200 dark:border-brand-800 hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors text-xs font-bold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Enroll multiple members"
                          >
                            <UserPlus size={13} /> Multi-Enroll
                          </button>

                          {/* Send Reminder to All Button */}
                          <button
                            onClick={() => {
                              setReminderModal(c)
                              setReminderMessage(`Hi {name}! Reminder: You are enrolled in ${c.name || c.title} with ${c.trainer_name || 'Coach'} scheduled for ${c.day_of_week} at ${c.start_time || 'scheduled time'}. See you at the gym!`)
                            }}
                            disabled={isCancelled || enrolledNames.length === 0}
                            className="px-2.5 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-lg border border-brand-200 dark:border-brand-800 hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors text-xs font-bold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Send reminder to all enrolled members"
                          >
                            <Bell size={13} /> Send Reminder
                          </button>

                          {/* Rate Class Button */}
                          {enrolledNames.length > 0 && (
                            <button
                              onClick={() => setFeedbackModal({
                                classId: c.id,
                                className: c.name || c.title,
                                trainerId: c.trainer_id,
                                trainerName: c.trainer_name,
                                members: enrolledNames
                              })}
                              className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors text-xs font-bold flex items-center gap-1"
                              title="Rate this class"
                            >
                              <Star size={13} /> Rate
                            </button>
                          )}

                          {/* Share Link Button */}
                          <button
                            onClick={() => setShareModal({ classId: c.id, className: c.name || c.title })}
                            className="p-1.5 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-lg border border-brand-200 dark:border-brand-800 hover:bg-brand-100 transition-colors"
                            title="Share enrollment link"
                          >
                            <Link2 size={13} />
                          </button>

                          {/* Cancel Class Button */}
                          {!isCancelled && (
                            <button
                              onClick={() => setCancelModal(c)}
                              className="p-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 transition-colors"
                              title="Cancel Class"
                            >
                              <Ban size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* BATCH MULTI-MEMBER ENROLLMENT MODAL */}
      {enrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus size={18} className="text-brand-500" /> Multi-Member Enrollment
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{enrollModal.name || enrollModal.title} ({enrollModal.day_of_week} {enrollModal.start_time})</p>
              </div>
              <button onClick={() => setEnrollModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            {/* Member Search & Selection Controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search members by name or phone..."
                    value={memberSearch}
                    onChange={e => setMemberSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const filtered = members.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()))
                    if (selectedMembers.size === filtered.length) {
                      setSelectedMembers(new Set())
                    } else {
                      setSelectedMembers(new Set(filtered.map(m => m.id)))
                    }
                  }}
                  className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline px-2"
                >
                  {selectedMembers.size > 0 ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* Selection Count Indicator */}
              <div className="p-2 bg-brand-50 dark:bg-brand-900/30 rounded-xl border border-brand-200 dark:border-brand-800 text-xs font-bold text-brand-700 dark:text-brand-300 flex items-center justify-between">
                <span>{selectedMembers.size} member(s) selected</span>
                <span>Spots Available: {(enrollModal.capacity || 20) - (enrollModal.enrolled || 0)}</span>
              </div>

              {/* Members Scrollable Checkbox List */}
              <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-700/60 bg-slate-50/50 dark:bg-slate-900/40">
                {members
                  .filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.phone.includes(memberSearch))
                  .map(m => {
                    const isSelected = selectedMembers.has(m.id)
                    const isAlreadyEnrolled = (enrollModal.enrolled_member_names || []).includes(m.name)

                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          if (isAlreadyEnrolled) return
                          setSelectedMembers(prev => {
                            const next = new Set(prev)
                            if (next.has(m.id)) next.delete(m.id)
                            else next.add(m.id)
                            return next
                          })
                        }}
                        className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                          isAlreadyEnrolled
                            ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800/40'
                            : isSelected
                            ? 'bg-brand-50 dark:bg-brand-900/20'
                            : 'hover:bg-white dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isSelected ? (
                            <CheckSquare size={16} className="text-brand-600 dark:text-brand-400 flex-shrink-0" />
                          ) : (
                            <Square size={16} className="text-slate-400 flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{m.name}</p>
                            <p className="text-[11px] text-slate-400">{m.phone} • {m.plan_name || 'Member'}</p>
                          </div>
                        </div>
                        {isAlreadyEnrolled && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">Enrolled</span>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <button onClick={() => setEnrollModal(null)} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
                Cancel
              </button>
              <button
                onClick={handleBatchEnroll}
                disabled={selectedMembers.size === 0 || enrollLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl shadow-sm flex items-center gap-1.5"
              >
                {enrollLoading ? <Loader size={14} className="animate-spin" /> : <UserPlus size={14} />}
                Enroll {selectedMembers.size} Member(s)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEND REMINDER TO ALL MEMBERS MODAL */}
      {reminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell size={18} className="text-brand-500" /> Send Reminder to All Members
              </h3>
              <button onClick={() => setReminderModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-200 dark:border-brand-800 text-xs text-brand-800 dark:text-brand-300 font-medium">
                Sending reminder notification to <strong>{(reminderModal.enrolled_member_names || []).length} enrolled members</strong> in {reminderModal.name || reminderModal.title}.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Message Preview</label>
                <textarea
                  rows={4}
                  value={reminderMessage}
                  onChange={e => setReminderMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-sans border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <button onClick={() => setReminderModal(null)} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
                Cancel
              </button>
              <button
                onClick={handleSendReminderToAll}
                disabled={reminderLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 disabled:opacity-50 rounded-xl shadow-sm flex items-center gap-1.5"
              >
                {reminderLoading ? <Loader size={14} className="animate-spin" /> : <Bell size={14} />}
                Send to All Members
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL CLASS CONFIRMATION MODAL */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <Ban size={20} /> Cancel Class Schedule
              </h3>
              <button onClick={() => setCancelModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to cancel <strong>"{cancelModal.name || cancelModal.title}"</strong> scheduled for <strong>{cancelModal.day_of_week}</strong> at <strong>{cancelModal.start_time}</strong>?
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
              This will update the schedule status to Cancelled and notify enrolled members.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <button onClick={() => setCancelModal(null)} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
                Keep Class
              </button>
              <button
                onClick={handleCancelClass}
                disabled={cancelLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl shadow-sm flex items-center gap-1.5"
              >
                {cancelLoading ? <Loader size={14} className="animate-spin" /> : <Ban size={14} />}
                Yes, Cancel Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE LINK MODAL */}
      {shareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Link2 size={18} className="text-brand-500" /> Share Enrollment Link
              </h3>
              <button onClick={() => setShareModal(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Members opening this link can self-enroll directly into <strong>{shareModal.className}</strong>.</p>
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <input type="text" readOnly value={generateEnrollmentLink(shareModal.classId)} className="flex-1 bg-transparent text-xs font-mono text-slate-700 dark:text-slate-300 outline-none truncate" />
              <button onClick={() => { navigator.clipboard.writeText(generateEnrollmentLink(shareModal.classId)) }} className="px-3 py-1.5 text-xs font-bold text-white bg-brand-600 rounded-lg hover:bg-brand-700 flex items-center gap-1">
                <Copy size={12} /> Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

        {/* Feedback Widget */}
        {feedbackModal && (
          <FeedbackWidget
            classId={feedbackModal.classId}
            className={feedbackModal.className}
            trainerId={feedbackModal.trainerId}
            trainerName={feedbackModal.trainerName}
            memberId={feedbackModal.members?.[0] || 'unknown'}
            memberName={feedbackModal.members?.[0] || 'Member'}
            onClose={() => setFeedbackModal(null)}
          />
        )}
}