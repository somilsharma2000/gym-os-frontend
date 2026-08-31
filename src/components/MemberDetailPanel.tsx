import { useState, useEffect } from 'react'
import {
  X,
  Phone,
  Mail,
  Calendar,
  IndianRupee,
  MessageCircle,
  Edit,
  Trash2,
  Snowflake,
  RefreshCw,
  User,

  Clock,
  CreditCard,
  Send,
  StickyNote,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Activity,
  UserCheck
} from 'lucide-react'
import type { Member } from '../types'
import { demoCheckIns, demoPayments, demoStaff } from '../data/demoData'
import StatusBadge from './StatusBadge'

export interface MemberDetailPanelProps {
  member: Member | null
  onClose: () => void
  onEdit?: (member: Member) => void
  onWhatsApp?: (member: Member) => void
  onDelete?: (member: Member) => void
  onFreeze?: (member: Member) => void
  onRenew?: (member: Member) => void
}

interface PaymentRecord {
  id: string
  date: string
  amount: number
  method: string
  status: 'paid' | 'pending' | 'overdue'
  type?: string
  invoice_number?: string
}

interface CheckInRecord {
  id: string
  date: string
  time: string
  duration: string
  entryMethod: string
  dayOfWeek: number // 0 = Mon, 6 = Sun
}

interface NoteRecord {
  id: string
  text: string
  createdAt: string
  author?: string
}

function getMembershipStatusBadge(status?: string) {
  const s = (status || 'active').toLowerCase()
  if (s === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        Active
      </span>
    )
  }
  if (s === 'expired') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
        Expired
      </span>
    )
  }
  if (s === 'frozen') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        Frozen
      </span>
    )
  }
  if (s === 'expiring') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        Expiring Soon
      </span>
    )
  }
  return <StatusBadge status={status} />
}

export default function MemberDetailPanel({
  member,
  onClose,
  onEdit,
  onWhatsApp,
  onDelete,
  onFreeze,
  onRenew,
}: MemberDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'payments' | 'notes'>('overview')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null)
  
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([])
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [trainerName, setTrainerName] = useState<string>('Coach Vikas')
  const [notes, setNotes] = useState<NoteRecord[]>([])
  const [newNoteText, setNewNoteText] = useState<string>('')

  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 3200)
  }

  useEffect(() => {
    if (!member) return

    setActiveTab('overview')
    setNewNoteText('')

    // 1. Resolve Check-Ins
    const matchedDemoCheckIns = demoCheckIns.filter(
      c => c.member_id === member.id || c.member_name?.toLowerCase() === member.name.toLowerCase()
    )

    if (matchedDemoCheckIns.length > 0) {
      const formatted: CheckInRecord[] = matchedDemoCheckIns.map(c => {
        const d = new Date(c.check_in_time)
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        const jsDay = d.getDay() // 0=Sun, 1=Mon...
        const dayIdx = jsDay === 0 ? 6 : jsDay - 1
        return {
          id: c.id,
          date: dateStr,
          time: timeStr,
          duration: c.duration_minutes ? `${c.duration_minutes} mins` : '60 mins',
          entryMethod: c.entry_method === 'qr_scan' ? 'QR Scan' : 'Manual Check-in',
          dayOfWeek: dayIdx
        }
      })
      setCheckIns(formatted)
    } else {
      // If member has attendance_count or active status, mock realistic check-in sessions
      const hasHistory = (member.membership_status === 'active' || member.membership_status === 'expiring')
      if (hasHistory) {
        const mockSessions: CheckInRecord[] = [
          { id: 'cin-1', date: 'Aug 28, 2026', time: '06:30 AM', duration: '75 mins', entryMethod: 'QR Scan', dayOfWeek: 4 },
          { id: 'cin-2', date: 'Aug 26, 2026', time: '07:00 AM', duration: '60 mins', entryMethod: 'QR Scan', dayOfWeek: 2 },
          { id: 'cin-3', date: 'Aug 24, 2026', time: '06:45 AM', duration: '90 mins', entryMethod: 'QR Scan', dayOfWeek: 0 },
          { id: 'cin-4', date: 'Aug 22, 2026', time: '08:15 AM', duration: '45 mins', entryMethod: 'Manual Check-in', dayOfWeek: 5 },
          { id: 'cin-5', date: 'Aug 20, 2026', time: '07:15 AM', duration: '60 mins', entryMethod: 'QR Scan', dayOfWeek: 3 },
        ]
        setCheckIns(mockSessions)
      } else {
        setCheckIns([])
      }
    }

    // 2. Resolve Payments
    const matchedDemoPayments = demoPayments.filter(
      p => p.member_id === member.id || p.member_name?.toLowerCase() === member.name.toLowerCase()
    )

    if (matchedDemoPayments.length > 0) {
      const formattedPay: PaymentRecord[] = matchedDemoPayments.map(p => ({
        id: p.id,
        date: p.date,
        amount: p.amount,
        method: p.method,
        status: (p.status as 'paid' | 'pending' | 'overdue') || 'paid',
        type: p.type,
        invoice_number: p.invoice_number
      }))
      setPayments(formattedPay)
    } else {
      // Default payment if active/expiring
      if (member.membership_status === 'active' || member.membership_status === 'expiring') {
        const planPrice = member.plan_name?.includes('Annual') ? 24000 : member.plan_name?.includes('Quarterly') ? 9000 : 3500
        setPayments([
          {
            id: `pay-${member.id}-1`,
            date: member.joined_date || member.created_date || '2026-08-01',
            amount: planPrice,
            method: 'UPI',
            status: 'paid',
            type: member.plan_name || 'Monthly Membership',
            invoice_number: `INV-2026-${member.id.slice(-3).toUpperCase()}`
          }
        ])
      } else {
        setPayments([])
      }
    }

    // 3. Resolve Trainer
    const trainerObj = demoStaff.find(s => s.id === (member as any).trainer_id)
    if (trainerObj) {
      setTrainerName(trainerObj.name)
    } else {
      // Assign default trainer based on member name char code for consistency
      const trainers = ['Coach Vikas', 'Coach Rajesh', 'Coach Anjali']
      const idx = member.name.charCodeAt(0) % trainers.length
      setTrainerName(trainers[idx])
    }

    // 4. Resolve Notes
    const initialNotes: NoteRecord[] = []
    if (member.notes && member.notes.trim().length > 0) {
      initialNotes.push({
        id: 'note-init-1',
        text: member.notes,
        createdAt: member.joined_date || member.created_date || 'Aug 24, 2026 • 10:00 AM',
        author: 'System'
      })
    }
    // Add default staff onboarding note
    initialNotes.push({
      id: 'note-init-2',
      text: `Member account initialized. Membership plan: ${member.plan_name || 'Standard'}.`,
      createdAt: 'Aug 20, 2026 • 09:30 AM',
      author: 'Gym Desk'
    })
    setNotes(initialNotes)

  }, [member])

  if (!member) return null

  // Stats Calculations
  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0)

  const formattedRevenue = `₹${totalRevenue.toLocaleString('en-IN')}`
  const initial = member.name ? member.name.charAt(0).toUpperCase() : 'M'

  // Weekly bar counts (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weeklyCounts = [0, 0, 0, 0, 0, 0, 0]
  checkIns.forEach(c => {
    if (c.dayOfWeek >= 0 && c.dayOfWeek < 7) {
      weeklyCounts[c.dayOfWeek] += 1
    }
  })

  // If no weekly counts from checkIns, show realistic weekly pattern for active members
  const maxCount = Math.max(...weeklyCounts, 1)

  const handleSaveNote = () => {
    if (!newNoteText.trim()) return
    const newNoteObj: NoteRecord = {
      id: `note-${Date.now()}`,
      text: newNoteText.trim(),
      createdAt: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      author: 'Staff Note'
    }
    setNotes(prev => [newNoteObj, ...prev])
    setNewNoteText('')
    triggerToast('Note saved successfully!')
  }

  const handleSendPaymentLink = () => {
    triggerToast(`Payment link generated & sent to ${member.phone} via WhatsApp!`, 'info')
  }

  const isAtRisk = (member.risk_status && member.risk_status !== 'none' && member.risk_status !== 'low') ||
    (member as any).risk_level === 'critical' || (member as any).risk_level === 'medium'

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="w-full sm:w-[480px] max-w-full h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 flex flex-col shadow-2xl relative animate-slide-in-right overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast Notification Banner */}
        {toast && (
          <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between p-3 rounded-xl border text-xs font-semibold shadow-lg backdrop-blur-md animate-fade-up bg-slate-900/90 text-white border-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{toast.message}</span>
            </div>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Sticky Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-20 border-b border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center text-base shrink-0 border border-brand-200 dark:border-brand-800">
              {initial}
            </div>
            <div className="truncate">
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {member.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {member.phone}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close Panel"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 px-4 pt-2 gap-1 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <User size={15} /> Overview
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Calendar size={15} /> Attendance
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'payments'
                ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <IndianRupee size={15} /> Payments
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'notes'
                ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <StickyNote size={15} /> Notes
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-fade-up">
              {/* Member Profile Avatar Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-brand-600 text-white font-bold text-xl flex items-center justify-center shadow-md shrink-0">
                  {initial}
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {member.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <Phone size={13} className="text-brand-500" />
                    <a href={`tel:${member.phone}`} className="hover:underline">{member.phone}</a>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate">
                    <Mail size={13} className="text-brand-500" />
                    {member.email ? (
                      <a href={`mailto:${member.email}`} className="hover:underline truncate">{member.email}</a>
                    ) : (
                      <span className="italic text-slate-400">No email provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* At-Risk Warning Badge (If At Risk) */}
              {isAtRisk && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                        At-Risk Member
                      </span>
                      <StatusBadge status={member.risk_status || 'at_risk'} />
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                      {member.risk_reason || 'Member attendance has dropped significantly in recent weeks.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Membership Info Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-3">
                  <div>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Membership Plan</span>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {member.plan_name || member.membership_type || 'Monthly Premium'}
                    </h5>
                  </div>
                  <div>{getMembershipStatusBadge(member.membership_status)}</div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Joined Date</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      {member.joined_date || member.created_date || 'Aug 01, 2026'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Expiry Date</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <Clock size={13} className="text-slate-400" />
                      {member.membership_expiry_date || member.membership_expiry || 'Sep 01, 2026'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assigned Trainer */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-semibold text-xs">
                    <UserCheck size={16} />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block">Assigned Trainer</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{trainerName}</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium">
                  Senior Coach
                </span>
              </div>

              {/* Key Stats Card */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 font-medium block">Total Visits</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                    {checkIns.length > 0 ? checkIns.length : (member.attendance_count || 14)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 font-medium block">Last Check-in</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white mt-1 block truncate">
                    {checkIns[0]?.date ? checkIns[0].date.split(',')[0] : 'Aug 28'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 font-medium block">Total Revenue</span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block truncate">
                    {formattedRevenue}
                  </span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Quick Actions
                </span>
                <div className="grid grid-cols-5 gap-2">
                  <button
                    onClick={() => {
                      if (onRenew) onRenew(member)
                      triggerToast(`Initiated renewal for ${member.name}`)
                    }}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                    title="Renew Membership"
                  >
                    <RefreshCw size={16} className="mb-1" />
                    <span className="text-[11px] font-semibold">Renew</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onFreeze) onFreeze(member)
                      triggerToast(`Membership frozen for ${member.name}`)
                    }}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    title="Freeze Membership"
                  >
                    <Snowflake size={16} className="mb-1" />
                    <span className="text-[11px] font-semibold">Freeze</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onWhatsApp) onWhatsApp(member)
                      else triggerToast(`Opening WhatsApp chat with ${member.phone}`)
                    }}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-teal-200 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors"
                    title="Send WhatsApp"
                  >
                    <MessageCircle size={16} className="mb-1" />
                    <span className="text-[11px] font-semibold">WhatsApp</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onEdit) onEdit(member)
                      else triggerToast(`Editing profile for ${member.name}`)
                    }}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Edit Member"
                  >
                    <Edit size={16} className="mb-1" />
                    <span className="text-[11px] font-semibold">Edit</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onDelete) onDelete(member)
                      else triggerToast(`Member deletion requested for ${member.name}`, 'error')
                    }}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                    title="Delete Member"
                  >
                    <Trash2 size={16} className="mb-1" />
                    <span className="text-[11px] font-semibold">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-5 animate-fade-up">
              {/* Weekly Trend Bar Chart */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                    <Activity size={14} className="text-brand-500" /> Weekly Check-in Trend
                  </h4>
                  <span className="text-[11px] text-slate-400">Last 7 Days</span>
                </div>

                {/* Pure CSS Bar Chart */}
                <div className="pt-4 pb-1">
                  <div className="h-28 flex items-end justify-between gap-2 px-2 border-b border-slate-200 dark:border-slate-700">
                    {daysOfWeek.map((day, idx) => {
                      const count = weeklyCounts[idx]
                      const pct = Math.max((count / maxCount) * 100, count > 0 ? 15 : 6)
                      return (
                        <div key={day} className="flex-1 flex flex-col items-center h-full justify-end group">
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 opacity-80 group-hover:opacity-100">
                            {count}
                          </span>
                          <div
                            style={{ height: `${pct}%` }}
                            className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                              count > 0
                                ? 'bg-gradient-to-t from-brand-600 to-brand-400 shadow-sm'
                                : 'bg-slate-200 dark:bg-slate-700/50'
                            }`}
                          />
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-between gap-2 px-2 pt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 text-center">
                    {daysOfWeek.map(day => (
                      <span key={day} className="flex-1">{day}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Check-Ins List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Last 5 Check-in Sessions
                </h4>

                {checkIns.length > 0 ? (
                  <div className="space-y-2">
                    {checkIns.slice(0, 5).map((session, i) => (
                      <div
                        key={session.id || i}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                            <Clock size={15} />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                              {session.date}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              {session.time}
                            </span>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            {session.duration}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            {session.entryMethod}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                      <Calendar size={22} />
                    </div>
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      No check-ins recorded
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                      Attendance history will appear here once member scans QR code at entry.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-4 animate-fade-up">
              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
                    Total Paid Summary
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-white text-[10px] font-semibold border border-white/20">
                    {payments.filter(p => p.status === 'paid').length} Paid Transactions
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold">{formattedRevenue}</span>
                  <span className="text-xs text-emerald-100">INR</span>
                </div>

                <div className="pt-2 border-t border-white/20 flex items-center justify-between">
                  <button
                    onClick={handleSendPaymentLink}
                    className="w-full py-2 px-3 bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Send size={14} /> Send Payment Link
                  </button>
                </div>
              </div>

              {/* Payments List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Payment History
                </h4>

                {payments.length > 0 ? (
                  <div className="space-y-2">
                    {payments.map(p => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                            <IndianRupee size={16} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-100 block">
                              ₹{p.amount.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              {p.date} • {p.method}
                            </span>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          {p.status === 'paid' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                              Paid
                            </span>
                          )}
                          {p.status === 'pending' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                              Pending
                            </span>
                          )}
                          {p.status === 'overdue' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800">
                              Overdue
                            </span>
                          )}
                          {p.type && (
                            <span className="block text-[10px] text-slate-400 truncate max-w-[120px]">
                              {p.type}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                      <CreditCard size={22} />
                    </div>
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      No payments recorded
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                      No payment records found for this member yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4 animate-fade-up">
              {/* Add Note Form */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Add Staff Note
                </label>
                <textarea
                  value={newNoteText}
                  onChange={e => setNewNoteText(e.target.value)}
                  placeholder="Type internal notes about goals, preferences, or medical history..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNote}
                    disabled={!newNoteText.trim()}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Plus size={14} /> Save Note
                  </button>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Existing Notes ({notes.length})
                </h4>

                {notes.length > 0 ? (
                  <div className="space-y-2.5">
                    {notes.map(n => (
                      <div
                        key={n.id}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-semibold text-brand-600 dark:text-brand-400">
                            {n.author || 'Staff Note'}
                          </span>
                          <span>{n.createdAt}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                          {n.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                      <StickyNote size={22} />
                    </div>
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      No notes added yet
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                      Use the field above to record member notes.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
