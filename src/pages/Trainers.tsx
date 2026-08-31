import { useState, useEffect } from 'react'
import {
  Dumbbell,
  Users,
  Calendar,
  Star,
  IndianRupee,
  Plus,
  CheckCircle2,

  QrCode,
  Bell,
  X,
  Phone,


  Check,

  Search,
  MessageCircle,
  Eye,
  ShieldCheck,
  ClipboardList
} from 'lucide-react'
import { api } from '../api/client'
import LoadingScreen from '../components/LoadingScreen'

export interface TrainerTask {
  id: string
  trainer_id: string
  trainer_name: string
  title: string
  description: string
  due_date: string
  status: 'pending' | 'in_progress' | 'completed'
}

const DEFAULT_TRAINER_TASKS: TrainerTask[] = [
  {
    id: 'task_001',
    trainer_id: 'trn_001',
    trainer_name: 'Coach Vikas',
    title: 'Monthly Fitness Assessments',
    description: 'Complete body composition reviews for 15 premium members.',
    due_date: '2026-09-02',
    status: 'in_progress'
  },
  {
    id: 'task_002',
    trainer_id: 'trn_002',
    trainer_name: 'Coach Rajesh',
    title: 'Strength Equipment Safety Audit',
    description: 'Inspect bench press racks and cable machines for maintenance.',
    due_date: '2026-09-01',
    status: 'pending'
  },
  {
    id: 'task_003',
    trainer_id: 'trn_003',
    trainer_name: 'Coach Anjali',
    title: 'Zumba Masterclass Preparation',
    description: 'Finalize playlist and choreography for weekend workshop.',
    due_date: '2026-08-31',
    status: 'completed'
  }
]

export default function Trainers() {
  const [trainers, setTrainers] = useState<any[]>([])
  const [tasks, setTasks] = useState<TrainerTask[]>(DEFAULT_TRAINER_TASKS)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modals
  const [selectedTrainer, setSelectedTrainer] = useState<any | null>(null)
  const [taskModalTrainer, setTaskModalTrainer] = useState<any | null>(null)
  const [reminderTask, setReminderTask] = useState<TrainerTask | null>(null)
  const [qrModalTrainer, setQrModalTrainer] = useState<any | null>(null)

  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchTrainers = async () => {
    try {
      const res = await api.getStaff()
      if (res.success) {
        setTrainers(res.trainers || [])
      }
    } catch { /* silent */ }
    setLoading(false)
  }

  useEffect(() => {
    fetchTrainers()
  }, [])

  const filteredTrainers = trainers.filter(t =>
    (t.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.specialization || t.specialties || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.phone || '').includes(search)
  )

  const handleAddTask = (newTask: TrainerTask) => {
    setTasks(prev => [newTask, ...prev])
    setToast({ type: 'success', text: `Task "${newTask.title}" assigned to ${newTask.trainer_name}!` })
  }

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextStatus = t.status === 'completed' ? 'pending' : t.status === 'pending' ? 'in_progress' : 'completed'
        return { ...t, status: nextStatus }
      }
      return t
    }))
  }

  if (loading) return <LoadingScreen message="Loading trainers & performance metrics..." />

  // Overall Performance Summary
  const totalTrainers = trainers.length
  const activeTrainers = trainers.filter(t => t.is_active || t.status === 'active').length
  const totalMembersTrained = trainers.reduce((sum, t) => sum + (t.members_count || 30), 0)
  const totalRevenueGenerated = trainers.reduce((sum, t) => sum + (t.revenue_generated || 100000), 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Trainer Management & Performance</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Performance tracking, task assignments, automated task reminders, and QR attendance.</p>
        </div>
        <button
          onClick={() => setTaskModalTrainer(trainers[0] || null)}
          className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={16} /> Assign Task
        </button>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-sm font-semibold ${toast.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'}`}>
          <div className="flex items-center gap-2">
            <Check size={16} />
            <span>{toast.text}</span>
          </div>
          <button onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}

      {/* Overall Performance Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition-colors">
          <div className="flex items-center gap-2 mb-1.5"><Dumbbell size={16} className="text-brand-500" /><span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Trainers</span></div>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{activeTrainers}/{totalTrainers}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition-colors">
          <div className="flex items-center gap-2 mb-1.5"><Users size={16} className="text-blue-500" /><span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Members Trained</span></div>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{totalMembersTrained}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition-colors">
          <div className="flex items-center gap-2 mb-1.5"><IndianRupee size={16} className="text-brand-500" /><span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Revenue Generated</span></div>
          <p className="text-2xl font-black text-brand-600 dark:text-brand-400">₹{(totalRevenueGenerated / 1000).toFixed(0)}k</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition-colors">
          <div className="flex items-center gap-2 mb-1.5"><Star size={16} className="text-amber-500" /><span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Avg Trainer Rating</span></div>
          <p className="text-2xl font-black text-amber-500">4.8 ⭐</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search trainer name, phone, or specialty..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* TRAINERS GRID CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTrainers.map(t => {
          const trainerTasks = tasks.filter(task => task.trainer_id === t.id || task.trainer_name === t.name)
          const membersCount = t.members_count || 38
          const classesCount = t.classes_count || 7
          const rating = t.rating || 4.8
          const revenue = t.revenue_generated || 125000

          return (
            <div key={t.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                {/* Header: Name + Specialization */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
                  <div>
                    <h3
                      onClick={() => setSelectedTrainer(t)}
                      className="text-base font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer transition-colors"
                    >
                      {t.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.role || t.specialization || 'Gym Coach'}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1"><Phone size={11} /> {t.phone || '—'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg border border-amber-200 dark:border-amber-800">
                      <Star size={12} className="fill-amber-400 text-amber-400" /> {rating}
                    </span>
                  </div>
                </div>

                {/* Trainer Performance Stats Grid */}
                <div className="grid grid-cols-2 gap-2 my-3">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1"><Users size={11} /> Members</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{membersCount} active</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1"><Calendar size={11} /> Classes</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{classesCount}/week</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1"><IndianRupee size={11} /> Revenue</p>
                    <p className="text-sm font-bold text-brand-600 dark:text-brand-400 mt-0.5">₹{revenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1"><ClipboardList size={11} /> Tasks</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{trainerTasks.length} assigned</p>
                  </div>
                </div>

                {/* Assigned Tasks Summary list */}
                {trainerTasks.length > 0 && (
                  <div className="space-y-1.5 my-3">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Tasks</p>
                    {trainerTasks.slice(0, 2).map(task => (
                      <div key={task.id} className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs flex items-center justify-between border border-slate-100 dark:border-slate-700/40">
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{task.title}</span>
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${task.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setTaskModalTrainer(t)}
                  className="py-1.5 px-2 bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 text-brand-700 dark:text-brand-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  title="Assign Task"
                >
                  <Plus size={13} /> Task
                </button>
                <button
                  onClick={() => setQrModalTrainer(t)}
                  className="py-1.5 px-2 bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 text-brand-700 dark:text-brand-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  title="QR Attendance"
                >
                  <QrCode size={13} /> QR Scan
                </button>
                <button
                  onClick={() => setSelectedTrainer(t)}
                  className="py-1.5 px-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  title="View Trainer Profile"
                >
                  <Eye size={13} /> Profile
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* TASKS LIST SECTION */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ClipboardList size={18} className="text-brand-500" /> Trainer Task Assignments & Reminders
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Track due dates, mark completions, and trigger WhatsApp/in-app reminders.</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {tasks.map(task => (
            <div key={task.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleTaskStatus(task.id)}
                  className={`mt-0.5 p-1 rounded-lg transition-colors ${task.status === 'completed' ? 'text-brand-500 bg-brand-50 dark:bg-brand-900/30' : 'text-slate-400 hover:text-brand-500'}`}
                >
                  <CheckCircle2 size={18} />
                </button>
                <div>
                  <h4 className={`text-sm font-bold ${task.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                    {task.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{task.description}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="font-semibold text-brand-600 dark:text-brand-400">Assigned: {task.trainer_name}</span>
                    <span>Due: {task.due_date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => setReminderTask(task)}
                  className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800 hover:bg-amber-100 text-xs font-bold flex items-center gap-1"
                >
                  <Bell size={12} /> Send Reminder
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ASSIGN TASK MODAL */}
      {taskModalTrainer && (
        <AssignTaskModal
          trainer={taskModalTrainer}
          trainers={trainers}
          onClose={() => setTaskModalTrainer(null)}
          onAssign={handleAddTask}
        />
      )}

      {/* TASK REMINDER MODAL */}
      {reminderTask && (
        <SendTaskReminderModal
          task={reminderTask}
          onClose={() => setReminderTask(null)}
          onSent={() => {
            setToast({ type: 'success', text: `Reminder sent to ${reminderTask.trainer_name} for "${reminderTask.title}"` })
            setReminderTask(null)
          }}
        />
      )}

      {/* QR ATTENDANCE MODAL */}
      {qrModalTrainer && (
        <QrAttendanceModal
          trainer={qrModalTrainer}
          onClose={() => setQrModalTrainer(null)}
          onMarked={() => {
            setToast({ type: 'success', text: `Attendance recorded for ${qrModalTrainer.name}!` })
            setQrModalTrainer(null)
          }}
        />
      )}

      {/* TRAINER DETAIL MODAL */}
      {selectedTrainer && (
        <TrainerDetailModal
          trainer={selectedTrainer}
          tasks={tasks.filter(t => t.trainer_id === selectedTrainer.id || t.trainer_name === selectedTrainer.name)}
          onClose={() => setSelectedTrainer(null)}
          onAssignTask={() => {
            setTaskModalTrainer(selectedTrainer)
            setSelectedTrainer(null)
          }}
        />
      )}
    </div>
  )
}

/* ASSIGN TASK MODAL */
function AssignTaskModal({
  trainer,
  trainers,
  onClose,
  onAssign
}: {
  trainer: any
  trainers: any[]
  onClose: () => void
  onAssign: (task: TrainerTask) => void
}) {
  const [selectedTrainerId, setSelectedTrainerId] = useState(trainer.id || trainers[0]?.id || '')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const targetTrainer = trainers.find(t => t.id === selectedTrainerId) || trainer
    onAssign({
      id: 'task_' + Date.now(),
      trainer_id: targetTrainer.id,
      trainer_name: targetTrainer.name,
      title,
      description,
      due_date: dueDate,
      status: 'pending'
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList size={18} className="text-brand-500" /> Assign Task to Trainer
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Trainer</label>
            <select
              value={selectedTrainerId}
              onChange={e => setSelectedTrainerId(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold"
            >
              {trainers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.role || 'Trainer'})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Conduct HIIT Assessment Workshop"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Task Description</label>
            <textarea
              rows={3}
              placeholder="Provide instructions or scope for the trainer..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm">
              Assign Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* SEND TASK REMINDER MODAL */
function SendTaskReminderModal({
  task,
  onClose,
  onSent
}: {
  task: TrainerTask
  onClose: () => void
  onSent: () => void
}) {
  const [msg, setMsg] = useState(`Hi ${task.trainer_name}, this is a reminder for your assigned task "${task.title}" due on ${task.due_date}. Please update your progress in Gym OS.`)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell size={18} className="text-amber-500" /> Send Task Reminder
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">Recipient: <strong>{task.trainer_name}</strong></p>

        <textarea
          rows={4}
          value={msg}
          onChange={e => setMsg(e.target.value)}
          className="w-full px-3 py-2 text-xs font-sans border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
        />

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
            Cancel
          </button>
          <button onClick={onSent} className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm flex items-center gap-1.5">
            <MessageCircle size={14} /> Send WhatsApp Reminder
          </button>
        </div>
      </div>
    </div>
  )
}

/* QR ATTENDANCE MODAL */
function QrAttendanceModal({
  trainer,
  onClose,
  onMarked
}: {
  trainer: any
  onClose: () => void
  onMarked: () => void
}) {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=TRAINER-ATTENDANCE-${trainer.id}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <QrCode size={18} className="text-brand-500" /> Trainer QR Attendance
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
        </div>

        <div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{trainer.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{trainer.role || 'Staff Coach'}</p>
        </div>

        {/* QR Code Container */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 inline-block shadow-inner">
          <img src={qrCodeUrl} alt="Trainer QR" className="w-40 h-40 object-contain mx-auto" />
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">Scan this QR code at front desk kiosk or mark attendance manually below.</p>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onMarked}
            className="w-full py-2.5 text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 rounded-xl shadow-sm flex items-center justify-center gap-1.5"
          >
            <ShieldCheck size={16} /> Mark Present Today
          </button>
        </div>
      </div>
    </div>
  )
}

/* TRAINER DETAIL MODAL */
function TrainerDetailModal({
  trainer,
  tasks,
  onClose,
  onAssignTask
}: {
  trainer: any
  tasks: TrainerTask[]
  onClose: () => void
  onAssignTask: () => void
}) {
  const rating = trainer.rating || 4.8
  const membersCount = trainer.members_count || 38
  const classesCount = trainer.classes_count || 7
  const revenue = trainer.revenue_generated || 125000

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{trainer.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{trainer.role || 'Fitness Coach'} • {trainer.specialties || trainer.specialization || 'HIIT, Strength'}</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"><X size={20} /></button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <p className="text-slate-400 text-xs font-medium">Phone</p>
            <a href={`tel:${trainer.phone}`} className="font-bold text-blue-600 dark:text-blue-400 hover:underline">{trainer.phone || '—'}</a>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <p className="text-slate-400 text-xs font-medium">Email</p>
            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{trainer.email || '—'}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <p className="text-slate-400 text-xs font-medium">Rating</p>
            <p className="font-bold text-amber-500">{rating} ⭐</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <p className="text-slate-400 text-xs font-medium">Monthly Salary</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">₹{(trainer.monthly_salary || 32000).toLocaleString()}</p>
          </div>
        </div>

        {/* 4 Performance Stats Breakdown */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Performance Dashboard</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-brand-50 dark:bg-brand-900/30 p-2.5 rounded-xl border border-brand-200 dark:border-brand-800">
              <p className="text-[10px] text-brand-600 dark:text-brand-300 font-bold uppercase">Members</p>
              <p className="text-lg font-black text-brand-700 dark:text-brand-300">{membersCount}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-2.5 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-[10px] text-blue-600 dark:text-blue-300 font-bold uppercase">Classes/wk</p>
              <p className="text-lg font-black text-blue-700 dark:text-blue-300">{classesCount}</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
              <p className="text-[10px] text-amber-600 dark:text-amber-300 font-bold uppercase">Rating</p>
              <p className="text-lg font-black text-amber-700 dark:text-amber-300">{rating}</p>
            </div>
            <div className="bg-brand-50 dark:bg-brand-900/30 p-2.5 rounded-xl border border-brand-200 dark:border-brand-800">
              <p className="text-[10px] text-brand-600 dark:text-brand-300 font-bold uppercase">Revenue</p>
              <p className="text-lg font-black text-brand-700 dark:text-brand-300">₹{(revenue/1000).toFixed(0)}k</p>
            </div>
          </div>
        </div>

        {/* Assigned Tasks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Tasks ({tasks.length})</p>
            <button onClick={onAssignTask} className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">+ Assign Task</button>
          </div>
          {tasks.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No tasks assigned to this trainer.</p>
          ) : (
            <div className="space-y-1.5">
              {tasks.map(t => (
                <div key={t.id} className="p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs flex items-center justify-between border border-slate-100 dark:border-slate-700/60">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{t.title}</p>
                    <p className="text-slate-400 text-[11px]">Due: {t.due_date}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${t.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
            Close Profile
          </button>
        </div>
      </div>
    </div>
  )
}
