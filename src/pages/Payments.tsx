import { useState, useMemo, useEffect } from 'react'
import { IndianRupee, Clock, CheckCircle, AlertCircle, Plus, Send, FileText, Loader, X, Bell, CreditCard, Smartphone, Banknote, Wallet } from 'lucide-react'
import { api } from '../api/client'
import { exportToCSV } from '../utils/csvExport'
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
  const [stats, setStats] = useState({ total_revenue: 0, pending_amount: 0, overdue_amount: 0, collected_this_month: 0 })

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const res = await api.getPayments()
      if (res.success) {
        setPayments(res.payments || [])
        if (res.stats) setStats(res.stats)
      }
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

  // Use backend stats if available, otherwise calculate locally
  const totalRevenue = stats.total_revenue || payments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0)
  const pendingAmount = stats.pending_amount || payments.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0)
  const overdueAmount = stats.overdue_amount || payments.filter(p => p.status === 'overdue').reduce((s, p) => s + (p.amount || 0), 0)
  const currentMonthName = new Date().toLocaleString('default', { month: 'short' })
  const collectedThisMonth = stats.collected_this_month || payments.filter(p => p.status === 'paid' && (p.date || '').startsWith(new Date().toISOString().slice(0, 7))).reduce((s, p) => s + (p.amount || 0), 0)

  const formatINR = (amt: number) => `\u20B9${(amt || 0).toLocaleString('en-IN')}`

  const handleGenerateInvoice = async (paymentId: string) => {
    setInvoiceLoading(paymentId)
    try {
      const gymId = localStorage.getItem('gym_os_gym_id') || ''
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
      const gymId = localStorage.getItem('gym_os_gym_id') || ''
      const res = await fetch(`${API_BASE}/recordPaymentWithInvoice`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: payment.id,
          gym_id: gymId,
          member_id: payment.member_id,
          member_name: payment.member_name,
          amount: payment.amount,
          type: payment.type,
          method: payment.method,
          status: 'paid',
          date: new Date().toISOString().split('T')[0],
          auto_generate_invoice: true
        })
      })
      const data = await res.json()
      if (data.success) {
        setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, status: 'paid', invoice_number: data.invoice_number || p.invoice_number } : p))
        fetchPayments()
      }
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

      {/* Dynamic stat cards from backend records */}
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
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{p.member_name || '\u2014'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.type || '\u2014'}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{formatINR(p.amount)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.date || '\u2014'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      {p.method === 'card' && <CreditCard size={12} />}
                      {p.method === 'upi' && <Smartphone size={12} />}
                      {(p.method === 'cash' || !p.method) && <Banknote size={12} />}
                      {p.method === 'wallet' && <Wallet size={12} />}
                      <span className="capitalize">{p.method || 'cash'}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">{p.invoice_number || '\u2014'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {p.status !== 'paid' && (
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
                            <Bell size={11} /> Remind
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleGenerateInvoice(p.id)}
                        disabled={invoiceLoading === p.id}
                        className="text-xs px-2 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded border border-brand-200 dark:border-brand-800 hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        {invoiceLoading === p.id ? <Loader size={11} className="animate-spin" /> : <FileText size={11} />} Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showRecordModal && (
        <RecordPaymentModal
          onClose={() => setShowRecordModal(false)}
          onRecorded={() => { setShowRecordModal(false); fetchPayments() }}
        />
      )}

      {reminderTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell size={18} className="text-amber-500" /> Send Payment Reminder
              </h3>
              <button onClick={() => setReminderTarget(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg text-sm space-y-1">
                <div><span className="text-slate-400">Member:</span> <span className="font-medium text-slate-700 dark:text-slate-200">{reminderTarget.member_name}</span></div>
                <div><span className="text-slate-400">Amount Due:</span> <span className="font-bold text-red-600">{formatINR(reminderTarget.amount)}</span></div>
                <div><span className="text-slate-400">Invoice:</span> <span className="font-mono text-xs">{reminderTarget.invoice_number || 'N/A'}</span></div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">A WhatsApp reminder will be sent to the member's registered phone number.</p>
              <div className="flex gap-2">
                <button onClick={() => setReminderTarget(null)} className="flex-1 px-4 py-2 text-sm border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
                <button onClick={confirmSendReminder} disabled={actionLoading === reminderTarget.id} className="flex-1 px-4 py-2 text-sm text-white bg-amber-500 rounded-md hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2">
                  {actionLoading === reminderTarget.id ? <Loader size={14} className="animate-spin" /> : <Send size={14} />} Send Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function RecordPaymentModal({ onClose, onRecorded }: { onClose: () => void; onRecorded: () => void }) {
  const [memberName, setMemberName] = useState('')
  const [memberId, setMemberId] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('Membership')
  const [method, setMethod] = useState('cash')
  const [status, setStatus] = useState('paid')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [members, setMembers] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.getMembers().then(res => { if (res.success) setMembers(res.members || []) })
  }, [])

  const filteredMembers = members.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.phone?.includes(search)
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount) { setError('Amount is required'); return }
    setSubmitting(true)
    setError('')
    try {
      const gymId = localStorage.getItem('gym_os_gym_id') || ''
      const res = await fetch(`${API_BASE}/recordPaymentWithInvoice`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gym_id: gymId,
          member_id: memberId || null,
          member_name: memberName || 'Walk-in',
          amount: Number(amount),
          type, method, status,
          date: new Date().toISOString().split('T')[0],
          auto_generate_invoice: status === 'paid'
        })
      })
      const data = await res.json()
      if (data.success) {
        if (data.invoice_html) {
          const w = window.open('', '_blank')
          if (w) { w.document.write(data.invoice_html); w.document.close() }
        }
        onRecorded()
      } else {
        setError(data.error || 'Failed to record payment')
      }
    } catch (err) { setError('Network error') }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record Payment</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Member</label>
            <input type="text" placeholder="Search member..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md mb-2 focus:outline-none focus:border-brand-400" />
            {search && filteredMembers.length > 0 && (
              <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-600 rounded-md">
                {filteredMembers.slice(0, 5).map(m => (
                  <button key={m.id} type="button" onClick={() => { setMemberId(m.id); setMemberName(m.name); setSearch('') }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{m.name}</span>
                    <span className="text-slate-400 ml-2">{m.phone}</span>
                  </button>
                ))}
              </div>
            )}
            {memberName && <p className="text-xs text-green-600 mt-1">Selected: {memberName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Amount</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:border-brand-400" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Type</label>
              <select value={type} onChange={e => setType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:border-brand-400">
                <option value="Membership">Membership</option>
                <option value="Personal Training">Personal Training</option>
                <option value="Class Fee">Class Fee</option>
                <option value="Supplements">Supplements</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:border-brand-400">
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Payment Method</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'cash', label: 'Cash', icon: Banknote },
                { value: 'card', label: 'Card', icon: CreditCard },
                { value: 'upi', label: 'UPI', icon: Smartphone },
                { value: 'wallet', label: 'Wallet', icon: Wallet },
              ].map(m => {
                const Icon = m.icon
                return (
                  <button key={m.value} type="button" onClick={() => setMethod(m.value)}
                    className={`flex flex-col items-center gap-1 py-3 rounded-md border-2 transition-colors ${method === m.value ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'}`}>
                    <Icon size={18} className={method === m.value ? 'text-brand-600' : 'text-slate-400'} />
                    <span className={`text-xs ${method === m.value ? 'text-brand-600 font-medium' : 'text-slate-500'}`}>{m.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-xs text-blue-600 dark:text-blue-400">
            Invoice will be auto-generated for paid payments. GST (18%) is calculated automatically.
          </div>

          <button type="submit" disabled={submitting} className="w-full py-2.5 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50 transition-colors">
            {submitting ? 'Recording...' : 'Record Payment & Generate Invoice'}
          </button>
        </form>
      </div>
    </div>
  )
}