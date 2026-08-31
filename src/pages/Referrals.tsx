import { useState, useEffect } from 'react'
import {
  Share2,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  Plus,
  UserCheck,
  Search,
  Gift,
  X,
  Sparkles,
  PhoneCall
} from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import { api, getGymId } from '../api/client'
import StatusBadge from '../components/StatusBadge'

export interface Referral {
  id: string
  referrer_name: string
  referred_name: string
  referred_phone: string
  status: 'pending' | 'converted' | 'not_interested'
  reward_status: 'pending' | 'given' | 'not_eligible'
  bonus_reward: string
  date: string
  conversion_date?: string
}

export default function Referrals() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modals & Notifications
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form State
  const [referrerName, setReferrerName] = useState('')
  const [referredName, setReferredName] = useState('')
  const [referredPhone, setReferredPhone] = useState('')
  const [bonusReward, setBonusReward] = useState('₹500 Voucher')
  const [submitting, setSubmitting] = useState(false)

  const gymId = getGymId()

  const loadData = async () => {
    setLoading(true)
    try {
      const [refRes, memRes] = await Promise.all([
        api.getReferrals(gymId),
        api.getMembers()
      ])

      if (refRes && refRes.success) {
        const rawRefs = refRes.referrals || []
        const formatted: Referral[] = rawRefs.map((r: any, idx: number) => ({
          id: r.id || `ref_${idx}`,
          referrer_name: r.referrer_name || 'Member',
          referred_name: r.referred_name || 'Prospect',
          referred_phone: r.referred_phone || r.phone || '+91 98765 43210',
          status: r.status || 'pending',
          reward_status: r.reward_status || (r.status === 'converted' ? 'pending' : 'not_eligible'),
          bonus_reward: r.bonus_reward || r.reward || '1 Month Free',
          date: r.date || r.created_date || new Date().toISOString().split('T')[0],
          conversion_date: r.conversion_date
        }))
        setReferrals(formatted)
      }

      if (memRes && memRes.success) {
        setMembers(memRes.members || [])
      }
    } catch (err) {
      console.error('Failed to load referrals data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Handle Add Referral
  const handleAddReferral = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!referrerName || !referredName || !referredPhone) {
      showToast('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    try {
      const newRef: Referral = {
        id: `ref_${Date.now()}`,
        referrer_name: referrerName,
        referred_name: referredName,
        referred_phone: referredPhone,
        status: 'pending',
        reward_status: 'pending',
        bonus_reward: bonusReward,
        date: new Date().toISOString().split('T')[0]
      }

      setReferrals(prev => [newRef, ...prev])
      showToast(`Referral added for ${referredName}!`)
      setIsAddModalOpen(false)

      // Reset form
      setReferrerName('')
      setReferredName('')
      setReferredPhone('')
    } catch (err) {
      showToast('Failed to add referral.')
    } finally {
      setSubmitting(false)
    }
  }

  // Action: Mark Converted
  const handleMarkConverted = (id: string) => {
    const today = new Date().toISOString().split('T')[0]
    setReferrals(prev =>
      prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            status: 'converted',
            reward_status: 'pending',
            conversion_date: today
          }
        }
        return r
      })
    )
    showToast('Referral marked as Converted! Reward is now claimable.')
  }

  // Action: Mark Reward Given
  const handleMarkRewardGiven = (id: string) => {
    setReferrals(prev =>
      prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            reward_status: 'given'
          }
        }
        return r
      })
    )
    showToast('Reward status updated to Given!')
  }

  if (loading) return <LoadingScreen message="Loading Beyond Pixells referral engine..." />

  // Filtered referrals list
  const filteredReferrals = referrals.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    const matchesSearch =
      r.referrer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.referred_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.referred_phone.includes(searchTerm)
    return matchesStatus && matchesSearch
  })

  // Statistics Calculation
  const totalReferrals = referrals.length
  const convertedCount = referrals.filter(r => r.status === 'converted').length
  const pendingCount = referrals.filter(r => r.status === 'pending').length
  const conversionRate = totalReferrals > 0 ? Math.round((convertedCount / totalReferrals) * 100) : 0

  // Calculate Top Referrers
  const referrerCounts: Record<string, number> = {}
  referrals.forEach(r => {
    if (r.status === 'converted' || r.status === 'pending') {
      referrerCounts[r.referrer_name] = (referrerCounts[r.referrer_name] || 0) + 1
    }
  })
  const topReferrerEntries = Object.entries(referrerCounts).sort((a, b) => b[1] - a[1])
  const topReferrer = topReferrerEntries.length > 0 ? `${topReferrerEntries[0][0]} (${topReferrerEntries[0][1]})` : 'N/A'

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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Member Referrals</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Grow Beyond Pixells membership base with member-get-member referral rewards.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={16} /> Add Referral
        </button>
      </div>

      {/* Referral Stats Top Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={cardCls}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Referrals</span>
            <Share2 size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{totalReferrals}</p>
          <span className="text-xs text-slate-400 mt-1 block">Total referred leads</span>
        </div>

        <div className={cardCls}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Conversion Rate</span>
            <TrendingUp size={18} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{conversionRate}%</p>
          <span className="text-xs text-slate-400 mt-1 block">{convertedCount} converted to members</span>
        </div>

        <div className={cardCls}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Referrals</span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</p>
          <span className="text-xs text-slate-400 mt-1 block">Prospects in trial/follow-up</span>
        </div>

        <div className={cardCls}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Top Referrer</span>
            <Award size={18} className="text-purple-500" />
          </div>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400 truncate">{topReferrer}</p>
          <span className="text-xs text-slate-400 mt-1 block">Most successful promoter</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search referrer, prospect or phone..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 dark:text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="converted">Converted</option>
            <option value="not_interested">Not Interested</option>
          </select>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden shadow-sm">
        {filteredReferrals.length === 0 ? (
          <div className="px-4 py-16 text-center text-slate-400 dark:text-slate-500">
            <Share2 size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-base font-medium">No referrals found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or click 'Add Referral' to record a new one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700/80">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Referrer Member</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Referred Person</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Referred Phone</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Reward Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Date</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredReferrals.map(ref => (
                  <tr key={ref.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                    {/* Referrer Name */}
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">
                      {ref.referrer_name}
                    </td>

                    {/* Referred Person */}
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                      {ref.referred_name}
                    </td>

                    {/* Referred Phone */}
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">
                      {ref.referred_phone}
                    </td>

                    {/* Referral Status Badge */}
                    <td className="px-4 py-3">
                      <StatusBadge status={ref.status} />
                    </td>

                    {/* Reward Status */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          ref.reward_status === 'given'
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : ref.reward_status === 'pending'
                            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                        }`}>
                          <Gift size={12} className="mr-1" />
                          {ref.reward_status === 'given' ? 'Reward Given' : ref.reward_status === 'pending' ? 'Reward Pending' : 'Not Eligible'}
                        </span>
                        <span className="text-xs text-slate-400">({ref.bonus_reward})</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                      {ref.date}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Mark Converted button on pending referrals */}
                        {ref.status === 'pending' && (
                          <button
                            onClick={() => handleMarkConverted(ref.id)}
                            className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex items-center gap-1 transition-colors"
                          >
                            <UserCheck size={12} /> Mark Converted
                          </button>
                        )}

                        {/* Mark Reward Given button on converted referrals with pending reward */}
                        {ref.status === 'converted' && ref.reward_status === 'pending' && (
                          <button
                            onClick={() => handleMarkRewardGiven(ref.id)}
                            className="px-3 py-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm flex items-center gap-1 transition-colors"
                          >
                            <Gift size={12} /> Mark Reward Given
                          </button>
                        )}

                        {ref.status === 'converted' && ref.reward_status === 'given' && (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 size={14} /> Completed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Referral Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Add New Referral</h3>
                <p className="text-xs text-slate-500">Record a lead referred by an existing member</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddReferral} className="space-y-3">
              {/* Select Member Referrer */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Referrer Member *
                </label>
                <input
                  type="text"
                  list="member-options"
                  value={referrerName}
                  onChange={e => setReferrerName(e.target.value)}
                  placeholder="Select or type member name..."
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
                <datalist id="member-options">
                  {members.map((m, idx) => (
                    <option key={m.id || idx} value={m.name} />
                  ))}
                </datalist>
              </div>

              {/* Referred Person Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Referred Person Name *
                </label>
                <input
                  type="text"
                  value={referredName}
                  onChange={e => setReferredName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Referred Person Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Referred Phone Number *
                </label>
                <input
                  type="text"
                  value={referredPhone}
                  onChange={e => setReferredPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Reward */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Referral Reward
                </label>
                <select
                  value={bonusReward}
                  onChange={e => setBonusReward(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                >
                  <option value="₹500 Voucher">₹500 Voucher</option>
                  <option value="1 Month Free">1 Month Free Extension</option>
                  <option value="Protein Supplement Shaker">Protein Shaker</option>
                  <option value="Personal Training Session">1-on-1 PT Session</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Plus size={14} /> Submit Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
