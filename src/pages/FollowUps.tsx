import { useState, useEffect, useMemo } from 'react'
import {
  PhoneCall,
  MessageCircle,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  Filter,
  Search,
  Plus,
  AlertCircle,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Tag
} from 'lucide-react'
import { api } from '../api/client'

const FOLLOWUPS_KEY = 'gym_os_followups_data'

interface FollowUpItem {
  id: string
  entityName: string
  entityId?: string
  entityType: 'Lead' | 'Member' | 'Trial Visitor' | 'Expired Member'
  phone: string
  email?: string
  taskType: 'Lead Follow-Up' | 'Member Retention' | 'Payment Reminder' | 'Trial Feedback' | 'General Check-In'
  dueDate: string
  dueTime?: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'Pending' | 'Completed' | 'Snoozed'
  notes: string
  lastContacted?: string
}

export default function FollowUps() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<FollowUpItem[]>([])
  
  // Filters & Views
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('pending')

  // Selected Item Detail Modal State
  const [selectedItem, setSelectedItem] = useState<FollowUpItem | null>(null)

  // Reschedule / Next FollowUp Modal State
  const [rescheduleItem, setRescheduleItem] = useState<FollowUpItem | null>(null)
  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    newTime: '11:00',
    newPriority: 'Medium' as 'High' | 'Medium' | 'Low',
    note: ''
  })

  // Add New FollowUp Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({
    entityName: '',
    phone: '',
    email: '',
    entityType: 'Lead' as FollowUpItem['entityType'],
    taskType: 'Lead Follow-Up' as FollowUpItem['taskType'],
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '10:00',
    priority: 'High' as FollowUpItem['priority'],
    notes: ''
  })

  // Load API & Local Storage Followups
  useEffect(() => {
    fetchFollowUps()
  }, [])

  const fetchFollowUps = async () => {
    setLoading(true)
    try {
      // 1. Try local storage first
      const saved = localStorage.getItem(FOLLOWUPS_KEY)
      let list: FollowUpItem[] = saved ? JSON.parse(saved) : []

      if (list.length === 0) {
        // Initial sample comprehensive dataset
        list = [
          {
            id: 'fu_001',
            entityName: 'Priya Patel',
            entityId: 'lead_002',
            entityType: 'Lead',
            phone: '+91 98765 12345',
            email: 'priya@email.com',
            taskType: 'Lead Follow-Up',
            dueDate: new Date().toISOString().split('T')[0],
            dueTime: '16:00',
            priority: 'High',
            status: 'Pending',
            notes: 'Asked about quarterly membership pricing during walk-in visit.'
          },
          {
            id: 'fu_002',
            entityName: 'Vikram Reddy',
            entityId: 'lead_005',
            entityType: 'Lead',
            phone: '+91 98765 99988',
            email: 'vikram@email.com',
            taskType: 'Lead Follow-Up',
            dueDate: new Date().toISOString().split('T')[0],
            dueTime: '18:30',
            priority: 'High',
            status: 'Pending',
            notes: 'Clicked Google ad for Personal Trainer package. Sent WhatsApp brochure.'
          },
          {
            id: 'fu_003',
            entityName: 'Ananya Iyer',
            entityId: 'lead_006',
            entityType: 'Trial Visitor',
            phone: '+91 87654 32109',
            email: 'ananya@email.com',
            taskType: 'Trial Feedback',
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            dueTime: '11:00',
            priority: 'Medium',
            status: 'Pending',
            notes: 'Attended HIIT class yesterday. Call for trial feedback and plan conversion.'
          },
          {
            id: 'fu_004',
            entityName: 'Raj Kumar',
            entityId: 'mem_008',
            entityType: 'Expired Member',
            phone: '+91 98112 23344',
            email: 'raj.k@email.com',
            taskType: 'Payment Reminder',
            dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
            dueTime: '12:00',
            priority: 'High',
            status: 'Pending',
            notes: 'Membership expires in 3 days. Send early renewal 10% discount coupon.'
          },
          {
            id: 'fu_005',
            entityName: 'Meera Joshi',
            entityId: 'lead_012',
            entityType: 'Lead',
            phone: '+91 81100 99887',
            email: 'meera@email.com',
            taskType: 'Member Retention',
            dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            dueTime: '10:00',
            priority: 'Low',
            status: 'Pending',
            notes: 'Has not checked in for 10 days. Send motivational check-in message.'
          }
        ]
        localStorage.setItem(FOLLOWUPS_KEY, JSON.stringify(list))
      }

      setItems(list)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const saveItems = (updated: FollowUpItem[]) => {
    setItems(updated)
    localStorage.setItem(FOLLOWUPS_KEY, JSON.stringify(updated))
  }

  // Mark Completed
  const handleMarkDone = (id: string) => {
    const updated = items.map(item =>
      item.id === id
        ? {
            ...item,
            status: 'Completed' as const,
            lastContacted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        : item
    )
    saveItems(updated)
    if (selectedItem?.id === id) setSelectedItem(null)
  }

  // Submit Reschedule / Schedule Next
  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rescheduleItem) return

    const updated = items.map(item =>
      item.id === rescheduleItem.id
        ? {
            ...item,
            dueDate: rescheduleForm.newDate,
            dueTime: rescheduleForm.newTime,
            priority: rescheduleForm.newPriority,
            status: 'Pending' as const,
            notes: rescheduleForm.note ? `${item.notes}\n[Rescheduled]: ${rescheduleForm.note}` : item.notes
          }
        : item
    )
    saveItems(updated)
    setRescheduleItem(null)
  }

  // Submit Add FollowUp
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!addForm.entityName || !addForm.phone) return

    const newItem: FollowUpItem = {
      id: `fu_${Date.now()}`,
      entityName: addForm.entityName,
      phone: addForm.phone,
      email: addForm.email || undefined,
      entityType: addForm.entityType,
      taskType: addForm.taskType,
      dueDate: addForm.dueDate,
      dueTime: addForm.dueTime,
      priority: addForm.priority,
      status: 'Pending',
      notes: addForm.notes
    }

    saveItems([newItem, ...items])
    setShowAddModal(false)
    setAddForm({
      entityName: '',
      phone: '',
      email: '',
      entityType: 'Lead',
      taskType: 'Lead Follow-Up',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '10:00',
      priority: 'High',
      notes: ''
    })
  }

  // Filtered Items Memo
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch =
        item.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.phone.includes(searchQuery) ||
        item.notes.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = typeFilter === 'all' || item.taskType.toLowerCase().replace(/ /g, '_') === typeFilter.toLowerCase()
      const matchesPriority = priorityFilter === 'all' || item.priority.toLowerCase() === priorityFilter.toLowerCase()
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'pending' && item.status === 'Pending') ||
        (statusFilter === 'completed' && item.status === 'Completed')

      return matchesSearch && matchesType && matchesPriority && matchesStatus
    })
  }, [items, searchQuery, typeFilter, priorityFilter, statusFilter])

  // Priority Badge Color Helper
  const getPriorityBadge = (priority: FollowUpItem['priority']) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'Low':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700'
    }
  }

  // WhatsApp Pre-filled URL Generator
  const getWhatsAppUrl = (phone: string, name: string, taskType: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    let msg = `Hi ${name}! Greetings from Oxigen Fitness.`
    if (taskType === 'Lead Follow-Up') {
      msg += ` We noticed your interest in our gym. Would you like to drop by for a free workout trial today?`
    } else if (taskType === 'Payment Reminder') {
      msg += ` This is a friendly reminder regarding your upcoming membership renewal.`
    } else if (taskType === 'Trial Feedback') {
      msg += ` Hope you enjoyed your trial session! Let us know if you'd like to check out our special membership offers today.`
    } else {
      msg += ` How are your workouts going? Let us know if you need any assistance from our fitness team!`
    }
    return `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(msg)}`
  }

  return (
    <div className="space-y-6 pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-600/10 border border-brand-500/20 rounded-xl text-brand-400">
            <PhoneCall size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Follow-Ups & Lead Tasks
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Actionable caller CRM for leads, member retention, payment renewals & trial visits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('list')}
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'calendar' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Calendar
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="cursor-pointer px-3.5 py-2.5 bg-brand-600 hover:bg-brand-500 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-brand-600/20"
          >
            <Plus size={15} />
            <span>Schedule Follow-Up</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, phone, or task note..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500"
          >
            <option value="pending">Pending ({items.filter(i => i.status === 'Pending').length})</option>
            <option value="completed">Completed ({items.filter(i => i.status === 'Completed').length})</option>
            <option value="all">All Statuses</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Task Types</option>
            <option value="lead_follow-up">Lead Follow-Up</option>
            <option value="member_retention">Member Retention</option>
            <option value="payment_reminder">Payment Reminder</option>
            <option value="trial_feedback">Trial Feedback</option>
          </select>
        </div>
      </div>

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
              No follow-up tasks found matching your filters.
            </div>
          ) : (
            filteredItems.map(item => (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all group"
              >
                {/* ENTITY INFO */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{item.entityName}</span>
                      <ExternalLink size={13} className="text-slate-500 group-hover:text-brand-400" />
                    </button>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPriorityBadge(item.priority)}`}>
                      {item.priority} Priority
                    </span>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {item.entityType}
                    </span>

                    <span className="text-[10px] font-semibold text-brand-400 bg-brand-600/10 px-2 py-0.5 rounded border border-brand-500/20">
                      {item.taskType}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed truncate max-w-2xl">{item.notes}</p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-slate-500" /> Due: {item.dueDate} {item.dueTime ? `at ${item.dueTime}` : ''}
                    </span>
                    <span>• Phone: {item.phone}</span>
                    {item.lastContacted && <span className="text-brand-400">• Last contact: {item.lastContacted}</span>}
                  </div>
                </div>

                {/* ACTION BUTTONS (CALL, WHATSAPP, EMAIL, NEXT FOLLOW-UP, MARK DONE) */}
                <div className="flex items-center gap-2 flex-wrap self-end md:self-auto flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {/* PHONE CALL BUTTON */}
                  <a
                    href={`tel:${item.phone.replace(/[^0-9+]/g, '')}`}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-brand-400 rounded-xl transition-colors border border-slate-700"
                    title={`Call ${item.entityName}`}
                  >
                    <PhoneCall size={16} />
                  </a>

                  {/* WHATSAPP BUTTON */}
                  <a
                    href={getWhatsAppUrl(item.phone, item.entityName, item.taskType)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-brand-600/10 hover:bg-brand-600/20 text-brand-400 rounded-xl transition-colors border border-brand-500/20"
                    title={`Send WhatsApp to ${item.entityName}`}
                  >
                    <MessageCircle size={16} />
                  </a>

                  {/* EMAIL BUTTON */}
                  {item.email && (
                    <a
                      href={`mailto:${item.email}?subject=${encodeURIComponent(`Oxigen Fitness Update for ${item.entityName}`)}`}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl transition-colors border border-slate-700"
                      title={`Email ${item.entityName}`}
                    >
                      <Mail size={16} />
                    </a>
                  )}

                  {/* SCHEDULE NEXT FOLLOW-UP */}
                  <button
                    onClick={() => {
                      setRescheduleItem(item)
                      setRescheduleForm({
                        newDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                        newTime: '11:00',
                        newPriority: item.priority,
                        note: ''
                      })
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 border border-slate-700 cursor-pointer"
                  >
                    <Calendar size={13} />
                    <span>Next Follow-up</span>
                  </button>

                  {/* MARK AS DONE */}
                  {item.status === 'Pending' ? (
                    <button
                      onClick={() => handleMarkDone(item.id)}
                      className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 size={13} />
                      <span>Mark Done</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-brand-400 flex items-center gap-1 px-2.5 py-1 bg-brand-600/10 rounded-xl border border-brand-500/20">
                      <CheckCircle2 size={13} /> Completed
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar size={18} className="text-brand-400" />
            Upcoming Follow-Up Schedule
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Today', 'Tomorrow', 'Later This Week'].map((dayGroup, idx) => {
              const targetDate =
                idx === 0
                  ? new Date().toISOString().split('T')[0]
                  : idx === 1
                  ? new Date(Date.now() + 86400000).toISOString().split('T')[0]
                  : null

              const groupItems = items.filter(item => {
                if (idx === 0) return item.dueDate === targetDate
                if (idx === 1) return item.dueDate === targetDate
                return item.dueDate > (targetDate || '')
              })

              return (
                <div key={dayGroup} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-200 uppercase">{dayGroup}</span>
                    <span className="text-xs font-bold text-brand-400 bg-brand-600/10 px-2 py-0.5 rounded-full">
                      {groupItems.length} Tasks
                    </span>
                  </div>

                  <div className="space-y-2">
                    {groupItems.length === 0 ? (
                      <p className="text-[11px] text-slate-500 py-4 text-center">No tasks scheduled</p>
                    ) : (
                      groupItems.map(gi => (
                        <div
                          key={gi.id}
                          onClick={() => setSelectedItem(gi)}
                          className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 cursor-pointer space-y-1 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{gi.entityName}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getPriorityBadge(gi.priority)}`}>
                              {gi.priority}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">{gi.notes}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* RESCHEDULE / NEXT FOLLOW-UP MODAL */}
      {rescheduleItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Schedule Next Follow-Up</h3>
              <button onClick={() => setRescheduleItem(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-slate-400">Target Contact:</span>
                <p className="text-sm font-bold text-white">{rescheduleItem.entityName} ({rescheduleItem.phone})</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">New Date *</label>
                  <input
                    type="date"
                    required
                    value={rescheduleForm.newDate}
                    onChange={e => setRescheduleForm({ ...rescheduleForm, newDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority Level</label>
                  <select
                    value={rescheduleForm.newPriority}
                    onChange={e => setRescheduleForm({ ...rescheduleForm, newPriority: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Follow-Up Note / Outcome</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Spoke on phone, requested evening batch time slots"
                  value={rescheduleForm.note}
                  onChange={e => setRescheduleForm({ ...rescheduleForm, note: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRescheduleItem(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 text-slate-950 rounded-xl text-xs font-bold"
                >
                  Update Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD FOLLOW-UP MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create New Follow-Up Task</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={addForm.entityName}
                  onChange={e => setAddForm({ ...addForm, entityName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={addForm.phone}
                    onChange={e => setAddForm({ ...addForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Task Type</label>
                  <select
                    value={addForm.taskType}
                    onChange={e => setAddForm({ ...addForm, taskType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="Lead Follow-Up">Lead Follow-Up</option>
                    <option value="Member Retention">Member Retention</option>
                    <option value="Payment Reminder">Payment Reminder</option>
                    <option value="Trial Feedback">Trial Feedback</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={addForm.dueDate}
                    onChange={e => setAddForm({ ...addForm, dueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={addForm.priority}
                    onChange={e => setAddForm({ ...addForm, priority: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Task Notes</label>
                <textarea
                  rows={2}
                  placeholder="Task details and call objective..."
                  value={addForm.notes}
                  onChange={e => setAddForm({ ...addForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 text-slate-950 rounded-xl text-xs font-bold"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SELECTED ITEM PROFILE MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <User size={18} className="text-brand-400" />
                <h3 className="text-base font-bold text-white">{selectedItem.entityName} Profile</h3>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Contact Phone:</span>
                  <span className="font-bold text-white">{selectedItem.phone}</span>
                </div>
                {selectedItem.email && (
                  <div className="flex justify-between text-slate-300">
                    <span>Email:</span>
                    <span className="font-bold text-white">{selectedItem.email}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-300">
                  <span>Entity Category:</span>
                  <span className="font-bold text-brand-400">{selectedItem.entityType}</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-400 block mb-1">Follow-Up History & Notes:</span>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 leading-relaxed font-mono">
                  {selectedItem.notes}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
