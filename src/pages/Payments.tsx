import { useState, useMemo, useEffect } from 'react'
import { IndianRupee, Clock, CheckCircle, AlertCircle, Plus, Send, FileText, Loader, X, Bell } from 'lucide-react'
import { api } from '../api/client'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://base44.app/api/apps/6a700b150c8d8b8e923580a1/functions'

export default function Payments() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [invoiceLoading, setInvoiceLoading] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [reminderTarget, setReminderTarget] = useState<any | null>(null)
  const [showRecordModal, setShowRecordModal] = useState(false)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const res = await api.getPayments()
      if (res.success) setPayments(res.payments || [])
    } catch (e) { /* silent */ }
    setLoading(false)
  }

  const filtered = useMemo(() => {
    return payments.filter(p => {
      const matchSearch = (p.member_name || '').toLowerCase().includes(search.toLowerCase()) || (p.invoice_number || '').toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || p.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [search, statusFilter, payments])

  // Dynamic counters from backend records
  const totalRevenue = payments.filter(p => p.status === 'paid' || p.status === 'Paid').reduce((s, p) => s + (p.amount || 0), 0)
  const pendingAmount = payments.filter(p => p.status === 'pending' || p.status === 'Pending').reduce((s, p) => s + (p.amount || 0), 0)
  const overdueAmount = payments.filter(p => p.status === 'overdue' || p.status === 'Overdue').reduce((s, p) => s + (p.amount || 0), 0)
  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentMonthName = new Date().toLocaleString('default', { month: 'short' })
  const collectedThisMonth = payments.filter(p => (p.status === 'paid' || p.status === 'Paid') && (p.date || '').startsWith(currentMonth)).reduce((s, p) => s + (p.amount || 0), 0)

  const formatINR = (amt: number) => `\u20B9${(amt || 0).toLocaleString('en-IN')}`

  const handleGenerateInvoice = async (paymentId: string) => {
    setInvoiceLoading(paymentId)
    try {
      const gymId = localStorage.getItem('gym_os_gym_id') || 'gym_oxigen'
      const res = await fetch(`${API_BASE}/generateInvoice`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId, gym_id: gymId })
      })
      const data = await res.json()
      if (data.success && data.html) {
        const w = window.open('', '_blank')
        if (w) { w.document.write(data.html); w.document.close() }
        else { alert('Please allow popups to view the invoice') }
      } else { alert('Failed to generate invoice: ' + (data.error || 'Unknown error')) }
    } catch (err) { alert('Error generating invoice') }
    setInvoiceLoading(null)
  }

  const handleSendReminder = (payment: any) => {
    setReminderTarget(payment)
  }

  const confirmSendReminder = async () => {
    if (!reminderTarget) return
    setActionLoading(reminderTarget.id)
    try {
      // Send WhatsApp payment reminder
      const phone = (reminderTarget.member_phone || '').replace(/[^0-9]/g, '')
      const msg = `Hi ${reminderTarget.member_name}, your payment of ${formatINR(reminderTarget.amount)} is ${reminderTarget.status}. Please clear it at your earliest convenience. Invoice: ${reminderTarget.invoice_number || 'N/A'}. Thank you!`
      if (phone) await api.sendWhatsApp(phone, msg)
    } catch (e) { /* silent */ }
    setActionLoading(null)
    setReminderTarget(null)
  }

  const handleMarkPaid = async (payment: any) => {
    setActionLoading(payment.id)
    try {
      await api.recordPayment({
        id: payment.id,
        member_id: payment.member_id,
        member_name: payment.member_name,
        amount: payment.amount,
        type: payment.type,
        method: payment.method,
        status: 'paid',
        date: new Date().toISOString().split('T')[0]
      })
      // Update local state
      setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, status: 'paid' } : p))
    } catch (e) { /* silent */ }
    setActionLoading(null)
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-500 dark:text-slate-400">Loading payments...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Payments & Billing</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage member billing, track pending payments, and issue invoices.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowRecordModal(true)} className="px-3 py-1.5 text-sm text-white bg-brand-600 rounded-md hover:bg-brand-700 transition-colors flex items-center gap-1.5">
            <Plus size={14} /> Record Payment
          </button>
        </div>
      </div>

      {/* Dynamic stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Revenue" value={formatINR(totalRevenue)} icon={<IndianRupee size={16} />} color="text-green-600 dark:text-green-400" />
        <StatCard label="Pending" value={formatINR(pendingAmount)} icon={<Clock size={16} />} color="text-amber-600 dark:text-amber-400" />
        <StatCard label={`Collected (${currentMonthName})`} value={formatINR(collectedThisMonth)} icon={<CheckCircle size={16} />} color="text-blue-600 dark:text-blue-400" />
        <StatCard label="Overdue" value={formatINR(overdueAmount)} icon={<AlertCircle size={16} />} color="text-red-600 dark:text-red-400" />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 flex-wrap">
          <input type="text" placeholder="Search member or invoice..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[180px] px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:border-brand-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:border-brand-400">
            <option value="all">All Statuses</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="overdue">Overdue</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 text-left text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Invoice #</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">No payments found.</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{p.member_name || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.type || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{formatINR(p.amount)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.date || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.method || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">{p.invoice_number || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {p.status !== 'paid' && p.status !== 'Paid' && (
                        <>
                          <button
                            onClick={() => handleMarkPaid(p)}
                            disabled={actionLoading === p.id}
                            className="text-xs px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === p.id ? <Loader size={12} className="animate-spin" /> : 'Mark Paid'}
                          </button>
                          <button
                            onClick={() => handleSendReminder(p)}
                            className="text-xs px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors flex items-center gap-1"
                          >
                            <Bell size={11} /> Reminder
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleGenerateInvoice(p.id)}
                        disabled={invoiceLoading === p.id}
                        className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        {invoiceLoading === p.id ? <Loader size={12} className="animate-spin" /> : <FileText size={12} />} Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reminder Confirmation Modal */}
      {reminderTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Bell size={20} className="text-amber-600" /> Send Payment Reminder</h2>
              <button onClick={() => setReminderTarget(null)} className="text-slate-400"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-300">Send a WhatsApp payment reminder to <strong>{reminderTarget.member_name}</strong></p>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm space-y-1">
                <div className="flex justify-between"><span className="text-slate-400">Amount:</span><span className="font-semibold">{formatINR(reminderTarget.amount)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Status:</span><span className="font-semibold capitalize">{reminderTarget.status}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Invoice:</span><span className="font-mono">{reminderTarget.invoice_number || 'N/A'}</span></div>
              </div>
              <button onClick={confirmSendReminder} disabled={actionLoading === reminderTarget.id} className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                {actionLoading === reminderTarget.id ? <Loader size={16} className="animate-spin" /> : <Send size={16} />} Send WhatsApp Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecordModal && (
        <RecordPaymentModal onClose={() => setShowRecordModal(false)} onRecord={fetchPayments} />
      )}
    </div>
  )
}

function RecordPaymentModal({ onClose, onRecord }: { onClose: () => void; onRecord: () => void }) {
  const [memberName, setMemberName] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('Monthly Membership')
  const [method, setMethod] = useState('Cash')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.recordPayment({
        member_name: memberName, amount: parseFloat(amount), type, method,
        status: 'paid', date: new Date().toISOString().split('T')[0],
        invoice_number: `GYM-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
      })
      onRecord()
      onClose()
    } catch (e) { /* silent */ }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Record Payment</h2>
          <button onClick={onClose} className="text-slate-400"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Member Name *</label><input type="text" required value={memberName} onChange={e => setMemberName(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₹) *</label><input type="number" required value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Method</label><select value={method} onChange={e => setMethod(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"><option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option><option>Razorpay</option></select></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label><select value={type} onChange={e => setType(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"><option>Monthly Membership</option><option>Quarterly Membership</option><option>Annual Membership</option><option>Personal Training</option><option>Merchandise</option><option>Other</option></select></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold">{submitting ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />} Record</button>
          </div>
        </form>
      </div>
    </div>
  )
}
