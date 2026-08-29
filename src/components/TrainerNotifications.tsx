import { useState, useEffect, useRef } from 'react'
import { Bell, X, Award, TrendingUp, Target, Zap } from 'lucide-react'
import { api } from '../api/client'

type Notification = {
  id: string
  type: 'session_target' | 'commission_goal' | 'milestone'
  trainerName: string
  title: string
  message: string
  icon: string
  color: string
}

export default function TrainerNotifications() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchTrainerData()
  }, [])

  const fetchTrainerData = async () => {
    setLoading(true)
    try {
      const res = await api.getStaff()
      if (res.success && res.staff) {
        const notifs: Notification[] = []
        const trainers = res.staff.filter((s: any) => s.role?.toLowerCase().includes('trainer') || s.specialization)
        trainers.forEach((t: any) => {
          const sessionTarget = 100 // monthly session target
          const sessionsCompleted = t.sessions_completed || t.classes_count || 0
          if (sessionsCompleted >= sessionTarget) {
            notifs.push({
              id: `session-${t.id || t.name}`,
              type: 'session_target',
              trainerName: t.name,
              title: 'Session Target Hit! 🎯',
              message: `${t.name} has completed ${sessionsCompleted} sessions this month — target achieved!`,
              icon: 'target',
              color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
            })
          } else if (sessionsCompleted >= sessionTarget * 0.8) {
            notifs.push({
              id: `session-near-${t.id || t.name}`,
              type: 'milestone',
              trainerName: t.name,
              title: 'Approaching Session Target',
              message: `${t.name} is at ${sessionsCompleted}/${sessionTarget} sessions — ${sessionTarget - sessionsCompleted} to go!`,
              icon: 'trending',
              color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
            })
          }
          const revenue = t.revenue_generated || 0
          const revenueTarget = 50000
          if (revenue >= revenueTarget) {
            notifs.push({
              id: `commission-${t.id || t.name}`,
              type: 'commission_goal',
              trainerName: t.name,
              title: 'Commission Goal Reached! 💰',
              message: `${t.name} has generated ₹${revenue.toLocaleString()} in revenue — commission goal hit!`,
              icon: 'award',
              color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
            })
          }
        })
        setNotifications(notifs)
        setUnreadCount(notifs.length)
      }
    } catch {
      // Graceful failure
    } finally {
      setLoading(false)
    }
  }

  const markAllRead = () => {
    setUnreadCount(0)
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'target': return Target
      case 'award': return Award
      case 'trending': return TrendingUp
      default: return Zap
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (open) markAllRead() }}
        className="relative p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 z-50 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Bell size={16} className="text-emerald-400" /> Trainer Notifications
              </h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-slate-700 text-slate-400">
                <X size={16} />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-8 text-center text-sm text-slate-400">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-500">
                  <Target size={32} className="mx-auto mb-2 opacity-40" />
                  No new notifications
                  <p className="text-xs mt-1">Trainer milestone alerts will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {notifications.map((n) => {
                    const Icon = getIcon(n.icon)
                    return (
                      <div key={n.id} className="px-4 py-3 hover:bg-slate-800 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg border ${n.color}`}>
                            <Icon size={16} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{n.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
