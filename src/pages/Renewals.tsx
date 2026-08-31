import { useState, useEffect } from 'react'
import {
  RefreshCw,
  AlertCircle,
  Clock,
  Send,
  CheckCircle2,
  Search,
  Filter,
  CreditCard,
  IndianRupee,
  Sparkles,
  X
} from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import { api, getGymId } from '../api/client'

export interface RenewalMember {
  id: string
  member_name: string
  phone?: string
  plan_name: string
  expiry_date: string
  days_until_expiry: number
  renewal_status: 'auto' | 'manual'
  amount: number
  assigned_to?: string
  reminder_sent?: boolean
}

export default function Renewals() {
  const [renewals, setRenewals] = useState<RenewalMember[]>([])
  const [loading, setLoading] = useState(true)
  const [daysFilter, setDaysFilter] = useState<number>(30)
  const [searchTerm, setSearchType] = useState('')
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [sentReminders, setSentReminders] = useState<Record<string, boolean>>({})
  const [selectedMember, setSelectedMember] = useState<RenewalMember | null>(null)
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false)
  const [renewing, setRenewing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Modal form state
  const [renewPlan, setRenewPlan] = useState('Monthly Standard')
  const [renewAmount, setRenewAmount] = useState<number>(3500)
  const [renewDurationMonths, setRenewDurationMonths] = useState<number>(1)
  const [paymentMethod, setPaymentMethod] = useState('UPI')

  const gymId = getGymId()

  const loadRenewals = async (days: number) => {
    setLoading(true)
    try {
      const res = await api.fetchExpiringMembers(gymId, days)
      if (res && res.success) {
        const rawList = res.expiring_members || res.renewals || []
        // Format/Normalize list items
        const formatted: RenewalMember[] = rawList.map((item: any, idx: number) => {
          const daysLeft = item.days_until_expiry ?? item.days_to_expiry ?? 0
          const expDate = item.expiry_date || new Date(Date.now() + daysLeft * 86400000).toISOString().split('T')[0]
          return {
            id: item.id || item.member_id || `ren_${idx}`,
            member_name: item.member_name || item.name || 'Member',
            phone: item.phone || '+91 98765 43210',
            plan_name: item.plan_name || item.plan || 'Standard Membership',
            expiry_date: expDate,
            days_until_expiry: daysLeft,
            renewal_status: item.renewal_status || (idx % 3 === 0 ? 'auto' : 'manual'),
            amount: item.amount || (item.plan_name?.includes('Annual') ? 24000 : item.plan_name?.includes('Quarterly') ? 9000 : 3500),
            assigned_to: item.assigned_to || 'Staff'
          }
        })
        setRenewals(formatted)
      }
    } catch (err) {
      console.error('Failed to load renewals:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRenewals(daysFilter)
  }, [daysFilter])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Action: Send WhatsApp Renewal Reminder
  const handleSendReminder = async (member: RenewalMember) => {
    setSendingId(member.id)
    try {
      const msg = `Hi ${member.member_name}, your ${member.plan_name} at Beyond Pixells Gym expires on ${member.expiry_date} (${member.days_until_expiry > 0 ? `${member.days_until_expiry} days remaining` : 'overdue'}). Renew today to keep crushing your fitness goals!`
      await api.sendWhatsAppMessage(member.phone || '', msg)
      setSentReminders(prev => ({ ...prev, [member.id]: true }))
      showToast(`Renewal reminder sent to ${member.member_name} via WhatsApp!`)
    } catch (err) {
      showToast(`Failed to send reminder to ${member.member_name}`)
    } finally {
      setSendingId(null)
    }
  }

  // Action: Open Renew Modal
  const handleOpenRenewModal = (member: RenewalMember) => {
    setSelectedMember(member)
    setRenewPlan(member.plan_name)
    setRenewAmount(member.amount)
    setRenewDurationMonths(member.plan_name.includes('Annual') ? 12 : member.plan_name.includes('Quarterly') ? 3 : 1)
    setIsRenewModalOpen(true)
  }

  // Action: Submit Mark Renewed
  const handleMarkRenewed = async () => {
    if (!selectedMember) return
    setRenewing(true)
    try {
      // Calculate new expiry date based on current date or current expiry
      const baseDate = new Date(selectedMember.expiry_date).getTime() > Date.now()
        ? new Date(selectedMember.expiry_date)
        : new Date()
      baseDate.setMonth(baseDate.getMonth() + renewDurationMonths)
      const newExpiryStr = baseDate.toISOString().split('T')[0]

      // 1. Record payment
      await api.recordPayment({
        gym_id: gymId,
        member_id: selectedMember.id,
        member_name: selectedMember.member_name,
        amount: renewAmount,
        payment_method: paymentMethod,
        type: renewPlan,
        status: 'paid',
        notes: `Renewal extension (+${renewDurationMonths} months)`
      })

      // 2. Update member expiry date
      await api.updateMember(selectedMember.id, {
        expiry_date: newExpiryStr,
        plan_name: renewPlan,
        status: 'active'
      })

      // Update local state
      setRenewals(prev => prev.filter(r => r.id !== selectedMember.id))
      showToast(`Successfully renewed ${selectedMember.member_name}'s membership until ${newExpiryStr}!`)
      setIsRenewModalOpen(false)
      setSelectedMember(null)
    } catch (err) {
      showToast('Error recording renewal. Please try again.')
    } finally {
      setRenewing(false)
    }
  }

  if (loading) return <LoadingScreen message="Loading Beyond Pixells renewal pipeline..." />

  // Filtered members based on time window and search
  const filteredRenewals = renewals.filter(r => {
    // Filter by days remaining <= selected daysFilter
    const matchesDays = r.days_until_expiry <= daysFilter
    const matchesSearch = r.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.plan_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesDays && matchesSearch
  })

  // Summary statistics calculation
  const totalExpiring = filteredRenewals.length
  const revenueAtRisk = filteredRenewals.reduce((sum, r) => sum + r.amount, 0)
  const autoRenewalsCount = filteredRenewals.filter(r => r.renewal_status === 'auto').length
  const criticalCount = filteredRenewals.filter(r => r.days_until_expiry < 7).length

  // Color coding helper for urgency: green (>21), yellow (7-21), red (<7)
  const getUrgencyBadge = (days: number) => {
    if (days < 7) {
      return {
        cls: 'bg-red-500/10 text-red-500 border-red-500/20',
        label: days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left (Critical)`
      }
    }
    if (days <= 21) {
      return {
        cls: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        label: `${days}d left (Warning)`
      }
    }
    return {
      cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      label: `${days}d left (Safe)`
    }
  }

  const cardCls = "bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 shadow-sm"

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-4 py-3 rounded-lg shadow-xl text-sm font-medium flex items-center gap-2 animate-fade-in">
          <Sparkles size={16} className="text-brand-400" />
          {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Membership Renewals</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track upcoming membership expirations, send WhatsApp reminders, and record renewals.
          </p>
        </div>

        {/* Days Filter Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          {[30, 60, 90].map(days => (
            <button
              key={days}
              onClick={() => setDaysFilter(days)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                daysFilter === days
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Next {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats Top Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={cardCls}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Expiring ({daysFilter}d)</span>
            <RefreshCw size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{totalExpiring}</p>
          <span className="text-xs text-slate-400 mt-1 block">Members up for renewal</span>
        </div>

        <div className={cardCls}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Revenue at Risk</span>
            <IndianRupee size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">₹{revenueAtRisk.toLocaleString('en-IN')}</p>
          <span className="text-xs text-slate-400 mt-1 block">Potential renewal value</span>
        </div>

        <div className={cardCls}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Auto-Renewals</span>
            <CreditCard size={18} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{autoRenewalsCount}</p>
          <span className="text-xs text-slate-400 mt-1 block">Scheduled auto-charge</span>
        </div>

        <div className={cardCls}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Critical (&lt;7 Days)</span>
            <AlertCircle size={18} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalCount}</p>
          <span className="text-xs text-slate-400 mt-1 block">Requires immediate action</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchType(e.target.value)}
            placeholder="Search member or plan..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredRenewals.length}</span> members expiring within {daysFilter} days
        </div>
      </div>

      {/* Renewals Table */}
      <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden shadow-sm">
        {filteredRenewals.length === 0 ? (
          <div className="px-4 py-16 text-center text-slate-400 dark:text-slate-500">
            <Clock size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-base font-medium">No expiring memberships found</p>
            <p className="text-xs text-slate-400 mt-1">There are no member renewals expiring in the next {daysFilter} days matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700/80">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Member Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Plan Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Expiry Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Days Remaining</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Renewal Mode</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Price (₹)</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredRenewals.map(member => {
                  const urgency = getUrgencyBadge(member.days_until_expiry)
                  const isSent = sentReminders[member.id]
                  const isSending = sendingId === member.id

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                      {/* Member Name */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{member.member_name}</div>
                        <span className="text-xs text-slate-400">{member.phone}</span>
                      </td>

                      {/* Plan Name */}
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                        {member.plan_name}
                      </td>

                      {/* Expiry Date */}
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">
                        {member.expiry_date}
                      </td>

                      {/* Days Remaining with urgency colors */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-semibold ${urgency.cls}`}>
                          {urgency.label}
                        </span>
                      </td>

                      {/* Renewal Status (Auto / Manual) */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${
                          member.renewal_status === 'auto'
                            ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          {member.renewal_status}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                        ₹{member.amount.toLocaleString('en-IN')}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Send WhatsApp Renewal Reminder Button */}
                          <button
                            onClick={() => handleSendReminder(member)}
                            disabled={isSending || isSent}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                              isSent
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-default'
                                : 'bg-green-600 hover:bg-green-700 text-white shadow-sm disabled:opacity-50'
                            }`}
                          >
                            {isSending ? (
                              <RefreshCw size={12} className="animate-spin" />
                            ) : isSent ? (
                              <CheckCircle2 size={12} />
                            ) : (
                              <Send size={12} />
                            )}
                            {isSent ? 'Reminder Sent' : 'Send Reminder'}
                          </button>

                          {/* Mark Renewed Button */}
                          <button
                            onClick={() => handleOpenRenewModal(member)}
                            className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle2 size={12} /> Mark Renewed
                          </button>
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

      {/* Modal for Mark Renewed */}
      {isRenewModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Process Renewal</h3>
                <p className="text-xs text-slate-500">Record payment and extend membership</p>
              </div>
              <button onClick={() => setIsRenewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700/80">
                <p className="text-xs text-slate-400">Member</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{selectedMember.member_name}</p>
                <p className="text-xs text-slate-500 mt-1">Current Expiry: {selectedMember.expiry_date}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Renewal Plan</label>
                <select
                  value={renewPlan}
                  onChange={e => {
                    const val = e.target.value
                    setRenewPlan(val)
                    if (val.includes('Annual')) {
                      setRenewAmount(24000)
                      setRenewDurationMonths(12)
                    } else if (val.includes('Quarterly')) {
                      setRenewAmount(9000)
                      setRenewDurationMonths(3)
                    } else {
                      setRenewAmount(3500)
                      setRenewDurationMonths(1)
                    }
                  }}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                >
                  <option value="Monthly Standard">Monthly Standard (₹3,500)</option>
                  <option value="Quarterly Premium">Quarterly Premium (₹9,000)</option>
                  <option value="Annual VIP">Annual VIP (₹24,000)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    value={renewAmount}
                    onChange={e => setRenewAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setIsRenewModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkRenewed}
                disabled={renewing}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow flex items-center gap-1.5 disabled:opacity-50"
              >
                {renewing ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Confirm Renewal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
