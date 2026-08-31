import { useState, useEffect } from 'react'
import { CreditCard, CheckCircle, AlertCircle, XCircle, Plus, X, Calendar, User, Phone, IndianRupee, Edit, Clock } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import { api } from '../api/client'
import StatusBadge from '../components/StatusBadge'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://base44.app/api/apps/6a700b150c8d8b8e923580a1/functions'

export default function Memberships() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<any | null>(null)

  const fetchMemberships = async () => {
    setLoading(true)
    try {
      const res = await api.getMemberships()
      if (res.success) setData(res)
    } catch (e) { /* silent */ }
    setLoading(false)
  }

  useEffect(() => { fetchMemberships() }, [])

  if (loading) return <LoadingScreen message="Loading memberships..." />
  const memberships = data?.memberships || []
  const plans = data?.plans || []
  const filtered = filter === 'all' ? memberships : memberships.filter((m: any) => m.status === filter)
  const active = memberships.filter((m: any) => m.status === 'active').length
  const expiring = memberships.filter((m: any) => m.status === 'expiring').length
  const expired = memberships.filter((m: any) => m.status === 'expired').length
  const totalRevenue = memberships.filter((m: any) => m.payment_status === 'paid').reduce((s: number, m: any) => s + (m.plan_price || 0), 0)

  const cardCls = "bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-colors"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Memberships</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track membership plans, renewals, and payment status.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-3 py-1.5 text-sm text-white bg-brand-600 rounded-md hover:bg-brand-700 transition-colors flex items-center gap-1.5">
          <Plus size={14} /> New Membership
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className={cardCls}><div className="flex items-center gap-2 mb-2"><CreditCard size={16} className="text-slate-600 dark:text-slate-400" /><span className="text-xs text-slate-500 dark:text-slate-400">Total</span></div><p className="text-2xl font-bold text-slate-700 dark:text-slate-200">{memberships.length}</p></div>
        <div className={cardCls}><div className="flex items-center gap-2 mb-2"><CheckCircle size={16} className="text-green-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Active</span></div><p className="text-2xl font-bold text-green-600">{active}</p></div>
        <div className={cardCls}><div className="flex items-center gap-2 mb-2"><AlertCircle size={16} className="text-amber-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Expiring</span></div><p className="text-2xl font-bold text-amber-600">{expiring}</p></div>
        <div className={cardCls}><div className="flex items-center gap-2 mb-2"><XCircle size={16} className="text-red-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Expired</span></div><p className="text-2xl font-bold text-red-600">{expired}</p></div>
        <div className={cardCls}><div className="flex items-center gap-2 mb-2"><IndianRupee size={16} className="text-blue-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Revenue</span></div><p className="text-2xl font-bold text-blue-600">{`\u20B9${totalRevenue.toLocaleString('en-IN')}`}</p></div>
      </div>

      <div className="flex gap-2">
        {['all', 'active', 'expiring', 'expired'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${filter === s ? 'bg-brand-700 text-white border-brand-700' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>{s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        {filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-slate-400 dark:text-slate-500">No memberships found.</div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Member</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Phone</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Plan</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Price</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Start</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Expiry</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Payment</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Status</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {filtered.map((m: any) => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-200">{m.member_name}</td>
                  <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{m.member_phone || '\u2014'}</td>
                  <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{m.plan_name} {m.plan_duration ? `(${m.plan_duration})` : ''}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-200">{`\u20B9${(m.plan_price || 0).toLocaleString('en-IN')}`}</td>
                  <td className="px-4 py-2.5 text-slate-400 dark:text-slate-500">{m.start_date}</td>
                  <td className="px-4 py-2.5 text-slate-400 dark:text-slate-500">{m.expiry_date}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={m.payment_status} /></td>
                  <td className="px-4 py-2.5"><StatusBadge status={m.status} /></td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => setEditTarget(m)} className="text-xs px-2 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded border border-brand-200 dark:border-brand-800 hover:bg-brand-100 flex items-center gap-1">
                      <Edit size={11} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      {plans.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-colors">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Available Plans</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {plans.map((p: any) => (
              <div key={p.id} className="border border-slate-200 dark:border-slate-700 rounded-md p-4">
                <p className="font-medium text-slate-700 dark:text-slate-200">{p.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{p.duration_days} days</p>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">{`\u20B9${p.price}`}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {(showCreate || editTarget) && (
        <MembershipModal
          membership={editTarget}
          plans={plans}
          onClose={() => { setShowCreate(false); setEditTarget(null) }}
          onSaved={() => { setShowCreate(false); setEditTarget(null); fetchMemberships() }}
        />
      )}
    </div>
  )
}

function MembershipModal({ membership, plans, onClose, onSaved }: { membership: any; plans: any[]; onClose: () => void; onSaved: () => void }) {
  const [memberName, setMemberName] = useState(membership?.member_name || '')
  const [memberPhone, setMemberPhone] = useState(membership?.member_phone || '')
  const [planName, setPlanName] = useState(membership?.plan_name || '')
  const [planPrice, setPlanPrice] = useState(membership?.plan_price || '')
  const [planDuration, setPlanDuration] = useState(membership?.plan_duration || '1 Month')
  const [startDate, setStartDate] = useState(membership?.start_date || new Date().toISOString().split('T')[0])
  const [paymentStatus, setPaymentStatus] = useState(membership?.payment_status || 'pending')
  const [paymentMethod, setPaymentMethod] = useState(membership?.payment_method || 'cash')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Calculate expiry based on plan duration
  const calculateExpiry = (start: string, duration: string) => {
    const startDt = new Date(start)
    const months = parseInt(duration) || 1
    startDt.setMonth(startDt.getMonth() + months)
    return startDt.toISOString().split('T')[0]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memberName || !planName || !planPrice) { setError('Member name, plan, and price are required'); return }
    setSubmitting(true)
    setError('')
    try {
      const gymId = localStorage.getItem('gym_os_gym_id') || ''
      const expiry = calculateExpiry(startDate, planDuration)
      // Create or update membership
      const payload = {
        gym_id: gymId,
        member_name: memberName,
        member_phone: memberPhone,
        plan_name: planName,
        plan_price: Number(planPrice),
        plan_duration: planDuration,
        start_date: startDate,
        expiry_date: expiry,
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        status: new Date(expiry) < new Date() ? 'expired' : 'active'
      }

      // Also record payment if paid
      if (paymentStatus === 'paid') {
        await fetch(`${API_BASE}/recordPaymentWithInvoice`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gym_id: gymId,
            member_name: memberName,
            amount: Number(planPrice),
            type: 'Membership',
            method: paymentMethod,
            status: 'paid',
            date: startDate,
            auto_generate_invoice: true
          })
        })
      }
      onSaved()
    } catch (err) { setError('Failed to save membership') }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{membership ? 'Edit Membership' : 'New Membership'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1"><User size={12} /> Member Name *</label>
              <input type="text" value={memberName} onChange={e => setMemberName(e.target.value)} placeholder="Member name"
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:border-brand-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1"><Phone size={12} /> Phone</label>
              <input type="text" value={memberPhone} onChange={e => setMemberPhone(e.target.value)} placeholder="Phone"
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:border-brand-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1"><CreditCard size={12} /> Plan Name *</label>
              <input type="text" value={planName} onChange={e => setPlanName(e.target.value)} placeholder="e.g. Monthly, Quarterly"
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:border-brand-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1"><IndianRupee size={12} /> Price *</label>
              <input type="number" value={planPrice} onChange={e => setPlanPrice(e.target.value)} placeholder="0"
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:border-brand-400" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Duration</label>
              <select value={planDuration} onChange={e => setPlanDuration(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:border-brand-400">
                <option value="1">1 Month</option><option value="3">3 Months</option><option value="6">6 Months</option><option value="12">12 Months</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1"><Calendar size={12} /> Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:border-brand-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1"><Clock size={12} /> Expiry</label>
              <input type="date" value={calculateExpiry(startDate, planDuration)} readOnly
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400 rounded-md focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Payment Status</label>
              <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:border-brand-400">
                <option value="paid">Paid</option><option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Payment Method</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:border-brand-400">
                <option value="cash">Cash</option><option value="card">Card</option><option value="upi">UPI</option><option value="wallet">Wallet</option>
              </select>
            </div>
          </div>
          {paymentStatus === 'paid' && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-xs text-blue-600">
              A payment record and invoice will be auto-generated for this membership.
            </div>
          )}
          <button type="submit" disabled={submitting} className="w-full py-2.5 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50 transition-colors">
            {submitting ? 'Saving...' : membership ? 'Update Membership' : 'Create Membership'}
          </button>
        </form>
      </div>
    </div>
  )
}