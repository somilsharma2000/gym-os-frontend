import { useState, useEffect } from 'react'
import QrCodeThemed from '../components/QrCodeThemed'
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
  Mail,
  Check,
  Search,
  MessageCircle,
  Eye,
  ShieldCheck,
  ClipboardList,
  LayoutGrid,
  Table as TableIcon,
  Filter,
  UserPlus,
  Activity,
  Award
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

export interface Trainer {
  id: string
  name: string
  phone: string
  email: string
  specialization: string
  role: string
  monthly_salary: number
  rating: number
  members_count: number
  classes_count: number
  revenue_generated: number
  is_active: boolean
}

const DEFAULT_TRAINERS: Trainer[] = [
  {
    id: 'trn_001',
    name: 'Vikas Sharma',
    phone: '+91 98765 43210',
    email: 'vikas@gymos.com',
    specialization: 'Strength & Conditioning',
    role: 'Head Trainer',
    monthly_salary: 45000,
    rating: 4.9,
    members_count: 42,
    classes_count: 10,
    revenue_generated: 185000,
    is_active: true
  },
  {
    id: 'trn_002',
    name: 'Rajesh Kumar',
    phone: '+91 98123 45678',
    email: 'rajesh@gymos.com',
    specialization: 'CrossFit & Functional',
    role: 'Senior Coach',
    monthly_salary: 38000,
    rating: 4.8,
    members_count: 35,
    classes_count: 8,
    revenue_generated: 140000,
    is_active: true
  },
  {
    id: 'trn_003',
    name: 'Anjali Verma',
    phone: '+91 99887 76655',
    email: 'anjali@gymos.com',
    specialization: 'Yoga & Pilates',
    role: 'Group Instructor',
    monthly_salary: 35000,
    rating: 4.9,
    members_count: 50,
    classes_count: 12,
    revenue_generated: 165000,
    is_active: true
  },
  {
    id: 'trn_004',
    name: 'Rohan Mehta',
    phone: '+91 97654 32109',
    email: 'rohan@gymos.com',
    specialization: 'HIIT & Cardio',
    role: 'Junior Coach',
    monthly_salary: 28000,
    rating: 4.6,
    members_count: 24,
    classes_count: 6,
    revenue_generated: 95000,
    is_active: true
  },
  {
    id: 'trn_005',
    name: 'Priya Nair',
    phone: '+91 98989 89898',
    email: 'priya@gymos.com',
    specialization: 'Nutrition & Wellness',
    role: 'Dietician & Coach',
    monthly_salary: 32000,
    rating: 4.7,
    members_count: 28,
    classes_count: 5,
    revenue_generated: 110000,
    is_active: false
  }
]

const DEFAULT_TRAINER_TASKS: TrainerTask[] = [
  {
    id: 'task_001',
    trainer_id: 'trn_001',
    trainer_name: 'Vikas Sharma',
    title: 'Monthly Fitness Assessments',
    description: 'Complete body composition reviews for 15 premium members.',
    due_date: '2026-09-02',
    status: 'in_progress'
  },
  {
    id: 'task_002',
    trainer_id: 'trn_002',
    trainer_name: 'Rajesh Kumar',
    title: 'Strength Equipment Safety Audit',
    description: 'Inspect bench press racks and cable machines for maintenance.',
    due_date: '2026-09-01',
    status: 'pending'
  },
  {
    id: 'task_003',
    trainer_id: 'trn_003',
    trainer_name: 'Anjali Verma',
    title: 'Zumba Masterclass Preparation',
    description: 'Finalize playlist and choreography for weekend workshop.',
    due_date: '2026-08-31',
    status: 'completed'
  }
]

const SPECIALIZATIONS = [
  'All Specializations',
  'Strength & Conditioning',
  'CrossFit & Functional',
  'Yoga & Pilates',
  'HIIT & Cardio',
  'Nutrition & Wellness',
  'Personal Training'
]

const AVATAR_BG_COLORS = [
  'bg-blue-600 text-white',
  'bg-emerald-600 text-white',
  'bg-purple-600 text-white',
  'bg-amber-600 text-white',
  'bg-indigo-600 text-white',
  'bg-rose-600 text-white',
  'bg-cyan-600 text-white'
]

function getInitials(name: string): string {
  if (!name) return 'TR'
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getAvatarColor(index: number): string {
  return AVATAR_BG_COLORS[index % AVATAR_BG_COLORS.length]
}

export default function Trainers() {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [tasks, setTasks] = useState<TrainerTask[]>(DEFAULT_TRAINER_TASKS)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [specializationFilter, setSpecializationFilter] = useState('All Specializations')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null)
  const [taskModalTrainer, setTaskModalTrainer] = useState<Trainer | null>(null)
  const [reminderTask, setReminderTask] = useState<TrainerTask | null>(null)
  const [qrModalTrainer, setQrModalTrainer] = useState<Trainer | null>(null)

  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchTrainers = async () => {
    try {
      const res = await api.getStaff()
      if (res.success && res.trainers && res.trainers.length > 0) {
        // Map backend staff to Trainer interface
        const mapped: Trainer[] = res.trainers.map((t: any, idx: number) => ({
          id: t.id || `trn_${idx + 100}`,
          name: t.name || 'Coach',
          phone: t.phone || '+91 98000 00000',
          email: t.email || `${(t.name || 'trainer').toLowerCase().replace(/\s+/g, '')}@gymos.com`,
          specialization: t.specialization || t.specialties || 'Strength & Conditioning',
          role: t.role || 'Fitness Coach',
          monthly_salary: t.monthly_salary || t.salary || 35000,
          rating: t.rating || 4.8,
          members_count: t.members_count || 32,
          classes_count: t.classes_count || 8,
          revenue_generated: t.revenue_generated || 120000,
          is_active: t.is_active !== undefined ? t.is_active : (t.status === 'inactive' ? false : true)
        }))
        setTrainers(mapped)
      } else {
        setTrainers(DEFAULT_TRAINERS)
      }
    } catch {
      setTrainers(DEFAULT_TRAINERS)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTrainers()
  }, [])

  const filteredTrainers = trainers.filter(t => {
    const matchesSearch =
      (t.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.specialization || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.phone || '').includes(search) ||
      (t.role || '').toLowerCase().includes(search.toLowerCase())

    const matchesSpec =
      specializationFilter === 'All Specializations' ||
      (t.specialization || '').toLowerCase() === specializationFilter.toLowerCase()

    return matchesSearch && matchesSpec
  })

  const handleAddTrainer = (newTrainerData: Omit<Trainer, 'id' | 'rating' | 'members_count' | 'classes_count' | 'revenue_generated' | 'is_active'>) => {
    const newTrainer: Trainer = {
      ...newTrainerData,
      id: 'trn_' + Date.now(),
      rating: 5.0,
      members_count: 0,
      classes_count: 0,
      revenue_generated: 0,
      is_active: true
    }
    setTrainers(prev => [newTrainer, ...prev])
    setToast({ type: 'success', text: `Trainer ${newTrainer.name} added successfully!` })
  }

  const handleAddTask = (newTask: TrainerTask) => {
    setTasks(prev => [newTask, ...prev])
    setToast({ type: 'success', text: `Task "${newTask.title}" assigned to ${newTask.trainer_name}!` })
  }

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const nextStatus =
            t.status === 'completed'
              ? 'pending'
              : t.status === 'pending'
              ? 'in_progress'
              : 'completed'
          return { ...t, status: nextStatus }
        }
        return t
      })
    )
  }

  if (loading) return <LoadingScreen message="Loading trainers & performance metrics..." />

  // Performance Summary
  const totalTrainers = trainers.length
  const activeTrainers = trainers.filter(t => t.is_active).length
  const totalMembersTrained = trainers.reduce((sum, t) => sum + (t.members_count || 0), 0)
  const totalRevenueGenerated = trainers.reduce((sum, t) => sum + (t.revenue_generated || 0), 0)
  const avgRating = trainers.length > 0
    ? (trainers.reduce((sum, t) => sum + (t.rating || 4.8), 0) / trainers.length).toFixed(1)
    : '4.8'

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Award className="text-brand-500" size={22} />
            Trainer Management & Performance
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage gym coaches, view performance metrics, assign tasks, and track QR attendance.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <UserPlus size={16} /> Add Trainer
          </button>
          <button
            onClick={() => setTaskModalTrainer(trainers[0] || null)}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-all flex items-center gap-1.5"
          >
            <Plus size={16} /> Assign Task
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div
          className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border text-sm font-semibold shadow-sm ${
            toast.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Check size={16} />
            <span>{toast.text}</span>
          </div>
          <button onClick={() => setToast(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Overall Performance Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 transition-colors">
          <div className="flex items-center gap-2 mb-1.5">
            <Dumbbell size={16} className="text-brand-500" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Trainers</span>
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
            {activeTrainers}/{totalTrainers} <span className="text-xs font-normal text-emerald-500">Active</span>
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 transition-colors">
          <div className="flex items-center gap-2 mb-1.5">
            <Users size={16} className="text-blue-500" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Members Trained</span>
          </div>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{totalMembersTrained}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 transition-colors">
          <div className="flex items-center gap-2 mb-1.5">
            <IndianRupee size={16} className="text-brand-500" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Revenue Generated</span>
          </div>
          <p className="text-2xl font-black text-brand-600 dark:text-brand-400">
            ₹{(totalRevenueGenerated / 1000).toFixed(0)}k
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 transition-colors">
          <div className="flex items-center gap-2 mb-1.5">
            <Star size={16} className="text-amber-500" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Avg Trainer Rating</span>
          </div>
          <p className="text-2xl font-black text-amber-500">{avgRating} ⭐</p>
        </div>
      </div>

      {/* SEARCH & FILTER BAR WITH VIEW TOGGLE */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search trainer name, phone, or specialty..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Specialization Filter Dropdown */}
          <div className="relative w-full sm:w-56">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Filter size={14} />
            </div>
            <select
              value={specializationFilter}
              onChange={e => setSpecializationFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {SPECIALIZATIONS.map(spec => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Toggle Button */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 self-end md:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'cards'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <LayoutGrid size={14} /> Grid
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'table'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <TableIcon size={14} /> Table
          </button>
        </div>
      </div>

      {/* TRAINERS CONTENT: CARDS OR TABLE */}
      {filteredTrainers.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <Dumbbell size={40} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No trainers found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try adjusting your search terms or specialization filter.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrainers.map((t, idx) => {
            const trainerTasks = tasks.filter(
              task => task.trainer_id === t.id || task.trainer_name === t.name
            )
            const initials = getInitials(t.name)
            const avatarColorClass = getAvatarColor(idx)

            return (
              <div
                key={t.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Avatar Initials + Name + Rating + Status Badge */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-700/60 pb-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar Initials Circle */}
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shadow-inner shrink-0 ${avatarColorClass}`}
                      >
                        {initials}
                      </div>

                      <div>
                        <h3
                          onClick={() => setSelectedTrainer(t)}
                          className="text-base font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer transition-colors"
                        >
                          {t.name}
                        </h3>
                        <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mt-0.5">
                          {t.specialization}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.role}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {/* Rating */}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg border border-amber-200 dark:border-amber-800">
                        <Star size={12} className="fill-amber-400 text-amber-400" /> {t.rating}
                      </span>
                      {/* Active/Inactive Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                          t.is_active
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            t.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        {t.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Trainer Performance Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 my-3">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <Users size={11} /> Members
                      </p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {t.members_count} active
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <Calendar size={11} /> Classes
                      </p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {t.classes_count}/week
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <IndianRupee size={11} /> Revenue
                      </p>
                      <p className="text-sm font-bold text-brand-600 dark:text-brand-400 mt-0.5">
                        ₹{t.revenue_generated.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <ClipboardList size={11} /> Tasks
                      </p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {trainerTasks.length} assigned
                      </p>
                    </div>
                  </div>

                  {/* Assigned Tasks Summary List */}
                  {trainerTasks.length > 0 && (
                    <div className="space-y-1.5 my-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Active Tasks
                      </p>
                      {trainerTasks.slice(0, 2).map(task => (
                        <div
                          key={task.id}
                          className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs flex items-center justify-between border border-slate-100 dark:border-slate-700/40"
                        >
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                            {task.title}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                              task.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-3 gap-1.5 mt-2">
                  <button
                    onClick={() => setSelectedTrainer(t)}
                    className="py-1.5 px-2 bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 text-brand-700 dark:text-brand-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    title="View Trainer Profile"
                  >
                    <Eye size={13} /> View Profile
                  </button>
                  <button
                    onClick={() => setTaskModalTrainer(t)}
                    className="py-1.5 px-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    title="Assign Task"
                  >
                    <Plus size={13} /> Task
                  </button>
                  <button
                    onClick={() => setQrModalTrainer(t)}
                    className="py-1.5 px-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    title="QR Attendance"
                  >
                    <QrCode size={13} /> QR
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Trainer</th>
                  <th className="py-3 px-4">Specialization / Role</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-center">Rating</th>
                  <th className="py-3 px-4 text-center">Members</th>
                  <th className="py-3 px-4 text-center">Classes/wk</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                  <th className="py-3 px-4 text-right">Salary</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-800 dark:text-slate-200">
                {filteredTrainers.map((t, idx) => {
                  const initials = getInitials(t.name)
                  const avatarColorClass = getAvatarColor(idx)

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${avatarColorClass}`}
                          >
                            {initials}
                          </div>
                          <div>
                            <p
                              onClick={() => setSelectedTrainer(t)}
                              className="font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer"
                            >
                              {t.name}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{t.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-brand-600 dark:text-brand-400">{t.specialization}</p>
                        <p className="text-[11px] text-slate-400">{t.role}</p>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                        {t.phone}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-500">
                          <Star size={12} className="fill-amber-400" /> {t.rating}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-bold">{t.members_count}</td>
                      <td className="py-3 px-4 text-center font-semibold">{t.classes_count}</td>

                      <td className="py-3 px-4 text-right font-bold text-brand-600 dark:text-brand-400">
                        ₹{t.revenue_generated.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right font-semibold">
                        ₹{t.monthly_salary.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            t.is_active
                              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${t.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {t.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => setSelectedTrainer(t)}
                          className="px-2.5 py-1 text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 rounded-lg transition-colors"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => setTaskModalTrainer(t)}
                          className="px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          Task
                        </button>
                        <button
                          onClick={() => setQrModalTrainer(t)}
                          className="px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          QR
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TASKS LIST SECTION */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ClipboardList size={18} className="text-brand-500" /> Trainer Task Assignments & Reminders
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track due dates, mark completions, and trigger WhatsApp/in-app reminders.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {tasks.map(task => (
            <div key={task.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleTaskStatus(task.id)}
                  className={`mt-0.5 p-1 rounded-lg transition-colors ${
                    task.status === 'completed'
                      ? 'text-brand-500 bg-brand-50 dark:bg-brand-900/30'
                      : 'text-slate-400 hover:text-brand-500'
                  }`}
                >
                  <CheckCircle2 size={18} />
                </button>
                <div>
                  <h4
                    className={`text-sm font-bold ${
                      task.status === 'completed'
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {task.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{task.description}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="font-semibold text-brand-600 dark:text-brand-400">
                      Assigned: {task.trainer_name}
                    </span>
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

      {/* ADD TRAINER MODAL */}
      {isAddModalOpen && (
        <AddTrainerModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddTrainer}
        />
      )}

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
            setToast({
              type: 'success',
              text: `Reminder sent to ${reminderTask.trainer_name} for "${reminderTask.title}"`
            })
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
          tasks={tasks.filter(
            t => t.trainer_id === selectedTrainer.id || t.trainer_name === selectedTrainer.name
          )}
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

/* ADD TRAINER MODAL */
function AddTrainerModal({
  onClose,
  onAdd
}: {
  onClose: () => void
  onAdd: (trainer: Omit<Trainer, 'id' | 'rating' | 'members_count' | 'classes_count' | 'revenue_generated' | 'is_active'>) => void
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [specialization, setSpecialization] = useState('Strength & Conditioning')
  const [role, setRole] = useState('Senior Coach')
  const [monthlySalary, setMonthlySalary] = useState(35000)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({
      name: name.trim(),
      phone: phone.trim() || '+91 98765 00000',
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@gymos.com`,
      specialization,
      role,
      monthly_salary: Number(monthlySalary) || 35000
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserPlus size={20} className="text-brand-500" /> Add New Trainer
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+91 98765 12345"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="rahul@gymos.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Specialization
              </label>
              <select
                value={specialization}
                onChange={e => setSpecialization(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium"
              >
                <option value="Strength & Conditioning">Strength & Conditioning</option>
                <option value="CrossFit & Functional">CrossFit & Functional</option>
                <option value="Yoga & Pilates">Yoga & Pilates</option>
                <option value="HIIT & Cardio">HIIT & Cardio</option>
                <option value="Nutrition & Wellness">Nutrition & Wellness</option>
                <option value="Personal Training">Personal Training</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Role / Designation
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium"
              >
                <option value="Head Trainer">Head Trainer</option>
                <option value="Senior Coach">Senior Coach</option>
                <option value="Junior Coach">Junior Coach</option>
                <option value="Group Instructor">Group Instructor</option>
                <option value="Dietician & Coach">Dietician & Coach</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Monthly Salary (₹)
            </label>
            <input
              type="number"
              min={0}
              step={1000}
              value={monthlySalary}
              onChange={e => setMonthlySalary(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm"
            >
              Add Trainer
            </button>
          </div>
        </form>
      </div>
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
  trainer: Trainer
  trainers: Trainer[]
  onClose: () => void
  onAssign: (task: TrainerTask) => void
}) {
  const [selectedTrainerId, setSelectedTrainerId] = useState(trainer.id || trainers[0]?.id || '')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const targetTrainer = trainers.find(t => t.id === selectedTrainerId) || trainer
    onAssign({
      id: 'task_' + Date.now(),
      trainer_id: targetTrainer.id,
      trainer_name: targetTrainer.name,
      title: title.trim(),
      description: description.trim(),
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
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Trainer
            </label>
            <select
              value={selectedTrainerId}
              onChange={e => setSelectedTrainerId(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold"
            >
              {trainers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.role || 'Trainer'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Task Title *
            </label>
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
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Task Description
            </label>
            <textarea
              rows={3}
              placeholder="Provide instructions or scope for the trainer..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm"
            >
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
  const [msg, setMsg] = useState(
    `Hi ${task.trainer_name}, this is a reminder for your assigned task "${task.title}" due on ${task.due_date}. Please update your progress in Gym OS.`
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell size={18} className="text-amber-500" /> Send Task Reminder
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Recipient: <strong>{task.trainer_name}</strong>
        </p>

        <textarea
          rows={4}
          value={msg}
          onChange={e => setMsg(e.target.value)}
          className="w-full px-3 py-2 text-xs font-sans border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
        />

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={onSent}
            className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm flex items-center gap-1.5"
          >
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
  trainer: Trainer
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
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        <div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{trainer.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{trainer.role || 'Staff Coach'}</p>
        </div>

        {/* QR Code Container */}
        <div className="flex justify-center">
          <QrCodeThemed payload={`TRAINER-ATTENDANCE-${trainer.id}`} passCode={`trainer_${trainer.id}`} showPicker size={160} />
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Scan this QR code at front desk kiosk or mark attendance manually below.
        </p>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onMarked}
            className="w-full py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm flex items-center justify-center gap-1.5"
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
  trainer: Trainer
  tasks: TrainerTask[]
  onClose: () => void
  onAssignTask: () => void
}) {
  const rating = trainer.rating || 4.8
  const membersCount = trainer.members_count || 0
  const classesCount = trainer.classes_count || 0
  const revenue = trainer.revenue_generated || 0
  const initials = getInitials(trainer.name)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full p-6 shadow-2xl space-y-5 my-8">
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center font-black text-base shadow-md">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{trainer.name}</h3>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                    trainer.is_active
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                  }`}
                >
                  {trainer.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mt-0.5">
                {trainer.role} • {trainer.specialization}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <p className="text-slate-400 text-xs font-medium flex items-center gap-1">
              <Phone size={11} /> Phone
            </p>
            <a
              href={`tel:${trainer.phone}`}
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline mt-0.5 block"
            >
              {trainer.phone || '—'}
            </a>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <p className="text-slate-400 text-xs font-medium flex items-center gap-1">
              <Mail size={11} /> Email
            </p>
            <p className="font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
              {trainer.email || '—'}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <p className="text-slate-400 text-xs font-medium flex items-center gap-1">
              <Star size={11} className="text-amber-500" /> Rating
            </p>
            <p className="font-bold text-amber-500 mt-0.5">{rating} ⭐</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <p className="text-slate-400 text-xs font-medium flex items-center gap-1">
              <IndianRupee size={11} /> Monthly Salary
            </p>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              ₹{trainer.monthly_salary ? trainer.monthly_salary.toLocaleString() : '35,000'}
            </p>
          </div>
        </div>

        {/* 4 Performance Stats Breakdown */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Performance Dashboard
          </p>
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
              <p className="text-lg font-black text-brand-700 dark:text-brand-300">
                ₹{(revenue / 1000).toFixed(0)}k
              </p>
            </div>
          </div>
        </div>

        {/* Assigned Tasks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Assigned Tasks ({tasks.length})
            </p>
            <button
              onClick={onAssignTask}
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              + Assign Task
            </button>
          </div>
          {tasks.length === 0 ? (
            <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
              No tasks assigned to this trainer yet.
            </p>
          ) : (
            <div className="space-y-1.5">
              {tasks.map(t => (
                <div
                  key={t.id}
                  className="p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs flex items-center justify-between border border-slate-100 dark:border-slate-700/60"
                >
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{t.title}</p>
                    <p className="text-slate-400 text-[11px]">Due: {t.due_date}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${
                      t.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  )
}
