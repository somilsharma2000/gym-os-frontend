import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { api } from '../api/client'
import type { Member } from '../types'
import StatusBadge from '../components/StatusBadge'

const membershipStatusOptions = ['all', 'active', 'expiring', 'expired', 'frozen', 'cancelled']
const riskStatusOptions = ['all', 'none', 'at_risk', 'critical']

export default function Members() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [membershipFilter, setMembershipFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const res = await api.getMembers({ membership_status: membershipFilter, risk_status: riskFilter, search })
      if (res.success) setMembers(res.members)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => {
    const debounce = setTimeout(fetchMembers, 300)
    return () => clearTimeout(debounce)
  }, [search, membershipFilter, riskFilter])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Members</h2>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-brand-400"
          />
        </div>
        <select value={membershipFilter} onChange={e => setMembershipFilter(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-brand-400">
          {membershipStatusOptions.map(s => <option key={s} value={s}>{s === 'all' ? 'All Membership' : s.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-brand-400">
          {riskStatusOptions.map(s => <option key={s} value={s}>{s === 'all' ? 'All Risk' : s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="px-4 py-12 text-center text-slate-400">Loading members...</div>
        ) : members.length === 0 ? (
          <div className="px-4 py-12 text-center text-slate-400">No members found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Name</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Phone</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Membership</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Risk</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Plan</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {members.map(m => (
                <tr key={m.id} onClick={() => setSelectedMember(m)} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-2.5 font-medium text-slate-700">{m.name}</td>
                  <td className="px-4 py-2.5 text-slate-500">{m.phone}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={m.membership_status} /></td>
                  <td className="px-4 py-2.5"><StatusBadge status={m.risk_status} /></td>
                  <td className="px-4 py-2.5 text-slate-500">{m.plan_name || '—'}</td>
                  <td className="px-4 py-2.5 text-slate-400">{m.membership_expiry_date || m.membership_expiry || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Member Detail Drawer */}
      {selectedMember && <MemberDetailDrawer member={selectedMember} onClose={() => setSelectedMember(null)} />}
    </div>
  )
}

function MemberDetailDrawer({ member, onClose }: { member: Member; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end z-50" onClick={onClose}>
      <div className="bg-white w-full max-w-md h-full overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{member.name}</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-400">Phone:</span> <span className="font-medium">{member.phone}</span></div>
            <div><span className="text-slate-400">Email:</span> <span className="font-medium">{member.email || '—'}</span></div>
            <div><span className="text-slate-400">Membership:</span> <StatusBadge status={member.membership_status} /></div>
            <div><span className="text-slate-400">Risk:</span> <StatusBadge status={member.risk_status} /></div>
            <div><span className="text-slate-400">Plan:</span> <span className="font-medium">{member.plan_name || '—'}</span></div>
            <div><span className="text-slate-400">Joined:</span> <span className="font-medium">{member.joined_date || '—'}</span></div>
            <div><span className="text-slate-400">Expiry:</span> <span className="font-medium">{member.membership_expiry_date || member.membership_expiry || '—'}</span></div>
            <div><span className="text-slate-400">Payment:</span> <span className="font-medium">{member.payment_status || '—'}</span></div>
          </div>
          {member.risk_reason && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-md text-sm">
              <p className="text-orange-600 font-medium mb-1">Risk Reason</p>
              <p className="text-slate-700">{member.risk_reason}</p>
            </div>
          )}
          {member.notes && (
            <div className="p-3 bg-slate-50 rounded-md text-sm">
              <p className="text-slate-400 mb-1">Notes</p>
              <p>{member.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
