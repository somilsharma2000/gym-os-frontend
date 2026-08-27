import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { api } from '../api/client'
import type { Member } from '../types'
import StatusBadge from '../components/StatusBadge'
import DataTable, { type Column } from '../components/DataTable'

const membershipStatusOptions = ['all', 'active', 'expiring', 'expired', 'frozen', 'cancelled']
const riskStatusOptions = ['all', 'none', 'at_risk', 'critical']

export default function Members() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [membershipFilter, setMembershipFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  const fetchMembers = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.getMembers({ membership_status: membershipFilter, risk_status: riskFilter, search })
      if (res.success) setMembers(res.members)
      else setError(res.error || 'Failed to load members')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error")
    }
    setLoading(false)
  }

  useEffect(() => {
    const debounce = setTimeout(fetchMembers, 300)
    return () => clearTimeout(debounce)
  }, [search, membershipFilter, riskFilter])

  const columns: Column<Member>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (m) => <span className="font-medium text-slate-700 dark:text-slate-200">{m.name}</span>,
    },
    {
      key: 'phone',
      header: 'Phone',
      sortable: true,
      render: (m) => <span className="text-slate-500 dark:text-slate-400">{m.phone}</span>,
    },
    {
      key: 'membership_status',
      header: 'Membership',
      sortable: true,
      render: (m) => <StatusBadge status={m.membership_status} />,
    },
    {
      key: 'risk_status',
      header: 'Risk',
      sortable: true,
      render: (m) => <StatusBadge status={m.risk_status} />,
    },
    {
      key: 'plan_name',
      header: 'Plan',
      render: (m) => <span className="text-slate-500 dark:text-slate-400">{m.plan_name || '—'}</span>,
    },
    {
      key: 'membership_expiry_date',
      header: 'Expiry',
      sortable: true,
      sortValue: (m) => m.membership_expiry_date || m.membership_expiry || '',
      render: (m) => <span className="text-slate-400 dark:text-slate-500">{m.membership_expiry_date || m.membership_expiry || '—'}</span>,
    },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Members</h2>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400"
          />
        </div>
        <select value={membershipFilter} onChange={e => setMembershipFilter(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400">
          {membershipStatusOptions.map(s => <option key={s} value={s}>{s === 'all' ? 'All Membership' : s.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400">
          {riskStatusOptions.map(s => <option key={s} value={s}>{s === 'all' ? 'All Risk' : s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <DataTable
        data={members}
        columns={columns}
        loading={loading}
        error={error}
        emptyMessage="No members found."
        pageSize={15}
        onRowClick={setSelectedMember}
      />

      {/* Member Detail Drawer */}
      {selectedMember && <MemberDetailDrawer member={selectedMember} onClose={() => setSelectedMember(null)} />}
    </div>
  )
}

function MemberDetailDrawer({ member, onClose }: { member: Member; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 w-full max-w-md h-full overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{member.name}</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-400 dark:text-slate-500">Phone:</span> <span className="font-medium text-slate-700 dark:text-slate-200">{member.phone}</span></div>
            <div><span className="text-slate-400 dark:text-slate-500">Email:</span> <span className="font-medium text-slate-700 dark:text-slate-200">{member.email || '—'}</span></div>
            <div><span className="text-slate-400 dark:text-slate-500">Membership:</span> <StatusBadge status={member.membership_status} /></div>
            <div><span className="text-slate-400 dark:text-slate-500">Risk:</span> <StatusBadge status={member.risk_status} /></div>
            <div><span className="text-slate-400 dark:text-slate-500">Plan:</span> <span className="font-medium text-slate-700 dark:text-slate-200">{member.plan_name || '—'}</span></div>
            <div><span className="text-slate-400 dark:text-slate-500">Joined:</span> <span className="font-medium text-slate-700 dark:text-slate-200">{member.joined_date || '—'}</span></div>
            <div><span className="text-slate-400 dark:text-slate-500">Expiry:</span> <span className="font-medium text-slate-700 dark:text-slate-200">{member.membership_expiry_date || member.membership_expiry || '—'}</span></div>
            <div><span className="text-slate-400 dark:text-slate-500">Payment:</span> <span className="font-medium text-slate-700 dark:text-slate-200">{member.payment_status || '—'}</span></div>
          </div>
          {member.risk_reason && (
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md text-sm">
              <p className="text-orange-600 dark:text-orange-400 font-medium mb-1">Risk Reason</p>
              <p className="text-slate-700 dark:text-slate-200">{member.risk_reason}</p>
            </div>
          )}
          {member.notes && (
            <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-md text-sm">
              <p className="text-slate-400 dark:text-slate-500 mb-1">Notes</p>
              <p className="text-slate-700 dark:text-slate-200">{member.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
