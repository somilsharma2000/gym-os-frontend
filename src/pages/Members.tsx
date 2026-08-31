import { useState, useEffect } from 'react'
import {
  Search,
  Phone,
  MessageCircle,
  Bell,
  Edit,
  Loader,
  Check,
  MoreVertical,
  Mail,
  Eye,
  Upload,
  X
} from 'lucide-react'
import { api } from '../api/client'
import type { Member } from '../types'
import StatusBadge from '../components/StatusBadge'
import DataTable, { type Column } from '../components/DataTable'
import BulkUploadModal from '../components/BulkUploadModal'
import MemberDetailPanel from '../components/MemberDetailPanel'

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
  const [editMember, setEditMember] = useState<Member | null>(null)
  const [whatsappTarget, setWhatsappTarget] = useState<Member | null>(null)
  const [reminderTarget, setReminderTarget] = useState<Member | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [bulkSelect, setBulkSelect] = useState<Set<string>>(new Set())
  const [showBulkWhatsapp, setShowBulkWhatsapp] = useState(false)

  // Bulk upload modal state
  const [showBulkUpload, setShowBulkUpload] = useState(false)

  // Open action menu state per row
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const fetchMembers = async () => {
    setLoading(true); setError('')
    try {
      const res = await api.getMembers({ membership_status: membershipFilter, risk_status: riskFilter, search })
      if (res.success) setMembers(res.members || [])
      else setError(res.error || 'Failed to load members')
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Unknown error") }
    setLoading(false)
  }

  useEffect(() => {
    const debounce = setTimeout(fetchMembers, 300)
    return () => clearTimeout(debounce)
  }, [search, membershipFilter, riskFilter])

  // Close open dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => setOpenMenuId(null)
    window.addEventListener('click', handleOutsideClick)
    return () => window.removeEventListener('click', handleOutsideClick)
  }, [])

  const handleWhatsApp = async (member: Member) => {
    setWhatsappTarget(member)
  }

  const sendWhatsAppMessage = async (member: Member, message: string) => {
    setActionLoading(member.id)
    try {
      const phone = member.phone.replace(/[^0-9]/g, '')
      await api.sendWhatsApp(phone, message)
    } catch (e) { /* silent */ }
    setActionLoading(null)
    setWhatsappTarget(null)
  }

  const handleReminder = async (member: Member) => {
    setReminderTarget(member)
  }

  const sendReminder = async (member: Member) => {
    setActionLoading(member.id)
    try {
      const phone = member.phone.replace(/[^0-9]/g, '')
      const msg = `Hi ${member.name}, this is a reminder from your gym. Your membership ${member.membership_status === 'expiring' ? 'expires soon' : member.membership_status === 'expired' ? 'has expired' : 'needs attention'}. Please visit the front desk or reply to this message. Thank you!`
      await api.sendWhatsApp(phone, msg)
    } catch (e) { /* silent */ }
    setActionLoading(null)
    setReminderTarget(null)
  }

  const handleEdit = (member: Member) => {
    setEditMember(member)
  }

  const saveEdit = async (updated: Member) => {
    setActionLoading(updated.id)
    try {
      await api.addMember({
        id: updated.id, name: updated.name, phone: updated.phone, email: updated.email,
        membership_status: updated.membership_status, notes: updated.notes
      })
      setMembers(prev => prev.map(m => m.id === updated.id ? updated : m))
    } catch (e) { /* silent */ }
    setActionLoading(null)
    setEditMember(null)
  }

  const toggleBulkSelect = (id: string) => {
    setBulkSelect(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (bulkSelect.size === members.length) setBulkSelect(new Set())
    else setBulkSelect(new Set(members.map(m => m.id)))
  }

  const sendBulkWhatsApp = async (message: string) => {
    setActionLoading('bulk')
    const selected = members.filter(m => bulkSelect.has(m.id))
    for (const member of selected) {
      try {
        const phone = member.phone.replace(/[^0-9]/g, '')
        await api.sendWhatsApp(phone, message.replace(/{name}/g, member.name))
      } catch (e) { /* silent */ }
    }
    setActionLoading(null)
    setShowBulkWhatsapp(false)
    setBulkSelect(new Set())
  }

  const columns: Column<Member>[] = [
    {
      key: 'select',
      header: '',
      render: (m) => (
        <input
          type="checkbox"
          checked={bulkSelect.has(m.id)}
          onChange={(e) => { e.stopPropagation(); toggleBulkSelect(m.id) }}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
      ),
    },
    {
      key: 'name', header: 'Name', sortable: true,
      render: (m) => <span className="font-medium text-slate-700 dark:text-slate-200">{m.name}</span>,
    },
    {
      key: 'phone', header: 'Phone', sortable: true,
      render: (m) => <span className="text-slate-500 dark:text-slate-400">{m.phone}</span>,
    },
    {
      key: 'membership_status', header: 'Membership', sortable: true,
      render: (m) => <StatusBadge status={m.membership_status} />,
    },
    {
      key: 'plan_name', header: 'Plan',
      render: (m) => <span className="text-slate-500 dark:text-slate-400">{m.plan_name || '—'}</span>,
    },
    {
      key: 'membership_expiry_date', header: 'Expiry', sortable: true,
      sortValue: (m) => m.membership_expiry_date || m.membership_expiry || '',
      render: (m) => <span className="text-slate-400 dark:text-slate-500">{m.membership_expiry_date || m.membership_expiry || '—'}</span>,
    },
    {
      key: 'risk_status', header: 'Risk', sortable: true,
      render: (m) => <StatusBadge status={m.risk_status} />,
    },
    {
      key: 'actions', header: 'Actions',
      render: (m) => {
        const cleanPhone = m.phone.replace(/[^0-9+]/g, '')
        const waLink = `https://wa.me/${cleanPhone.replace('+', '')}`
        const isMenuOpen = openMenuId === m.id

        return (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <a
              href={`tel:${m.phone}`}
              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
              title="Call"
            >
              <Phone size={14} />
            </a>
            <button
              onClick={() => handleWhatsApp(m)}
              className="p-1.5 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-md transition-colors"
              title="Send WhatsApp Message"
            >
              {actionLoading === m.id ? <Loader size={14} className="animate-spin" /> : <MessageCircle size={14} />}
            </button>
            <button
              onClick={() => handleReminder(m)}
              className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-md transition-colors"
              title="Send Reminder"
            >
              <Bell size={14} />
            </button>

            {/* More options popover menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setOpenMenuId(isMenuOpen ? null : m.id)
                }}
                className={`p-1.5 rounded-md transition-colors ${
                  isMenuOpen
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title="Contact & Options"
              >
                <MoreVertical size={15} />
              </button>

              {isMenuOpen && (
                <div
                  className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 py-1 text-xs divide-y divide-slate-100 dark:divide-slate-700/60"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setSelectedMember(m)
                        setOpenMenuId(null)
                      }}
                      className="w-full text-left px-3 py-2 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors"
                    >
                      <Eye size={14} className="text-brand-500" />
                      View Profile
                    </button>
                  </div>

                  <div className="py-1">
                    <a
                      href={`tel:${m.phone}`}
                      onClick={() => setOpenMenuId(null)}
                      className="w-full text-left px-3 py-2 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors"
                    >
                      <Phone size={14} className="text-blue-500" />
                      Call ({m.phone})
                    </a>

                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpenMenuId(null)}
                      className="w-full text-left px-3 py-2 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors"
                    >
                      <MessageCircle size={14} className="text-brand-500" />
                      WhatsApp (wa.me)
                    </a>

                    <button
                      onClick={() => {
                        handleWhatsApp(m)
                        setOpenMenuId(null)
                      }}
                      className="w-full text-left px-3 py-2 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors"
                    >
                      <MessageCircle size={14} className="text-teal-500" />
                      Send Message (API)
                    </button>

                    {m.email ? (
                      <a
                        href={`mailto:${m.email}`}
                        onClick={() => setOpenMenuId(null)}
                        className="w-full text-left px-3 py-2 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors"
                      >
                        <Mail size={14} className="text-brand-500" />
                        Email ({m.email})
                      </a>
                    ) : (
                      <span className="w-full text-left px-3 py-2 font-medium text-slate-400 dark:text-slate-500 opacity-60 flex items-center gap-2.5 cursor-not-allowed">
                        <Mail size={14} />
                        Email (None)
                      </span>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleEdit(m)
                        setOpenMenuId(null)
                      }}
                      className="w-full text-left px-3 py-2 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors"
                    >
                      <Edit size={14} className="text-slate-500 dark:text-slate-400" />
                      Edit Member
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Members</h2>

        <div className="flex items-center gap-3">
          {/* Bulk Member Upload Button */}
          <button
            onClick={() => setShowBulkUpload(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-brand-700 hover:bg-brand-800 active:bg-brand-800 rounded-lg transition-all flex items-center gap-2 shadow-sm"
          >
            <Upload size={14} /> Bulk Upload
          </button>

          {bulkSelect.size > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">{bulkSelect.size} selected</span>
              <button
                onClick={() => setShowBulkWhatsapp(true)}
                className="px-3 py-1.5 text-sm text-white bg-brand-700 rounded-md hover:bg-brand-800 transition-colors flex items-center gap-1.5"
              >
                <MessageCircle size={14} /> Bulk WhatsApp
              </button>
              <button onClick={() => setBulkSelect(new Set())} className="text-sm text-slate-400 hover:text-slate-600">Clear</button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400" />
        </div>
        <select value={membershipFilter} onChange={e => setMembershipFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400">
          {membershipStatusOptions.map(s => <option key={s} value={s}>{s === 'all' ? 'All Membership' : s.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400">
          {riskStatusOptions.map(s => <option key={s} value={s}>{s === 'all' ? 'All Risk' : s.replace(/_/g, ' ')}</option>)}
        </select>
        {members.length > 0 && (
          <button onClick={toggleSelectAll} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            {bulkSelect.size === members.length ? 'Deselect All' : 'Select All'}
          </button>
        )}
      </div>

      <DataTable data={members} columns={columns} loading={loading} error={error} emptyMessage="No members found." pageSize={15} onRowClick={setSelectedMember} />

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onSuccess={() => fetchMembers()}
      />

      {selectedMember && (
        <MemberDetailPanel
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onEdit={(m) => {
            setEditMember(m)
          }}
          onWhatsApp={(m) => {
            setWhatsappTarget(m)
          }}
        />
      )}

      {whatsappTarget && <WhatsAppModal member={whatsappTarget} onClose={() => setWhatsappTarget(null)} onSend={sendWhatsAppMessage} />}
      {reminderTarget && <ReminderModal member={reminderTarget} onClose={() => setReminderTarget(null)} onSend={sendReminder} />}
      {editMember && <EditMemberModal member={editMember} onClose={() => setEditMember(null)} onSave={saveEdit} />}
      {showBulkWhatsapp && <BulkWhatsAppModal count={bulkSelect.size} onClose={() => setShowBulkWhatsapp(false)} onSend={sendBulkWhatsApp} loading={actionLoading === 'bulk'} />}
    </div>
  )
}

function WhatsAppModal({ member, onClose, onSend }: { member: Member; onClose: () => void; onSend: (m: Member, msg: string) => void }) {
  const [message, setMessage] = useState(`Hi ${member.name}, this is a message from your gym. How can we help you today?`)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><MessageCircle size={20} className="text-brand-600" /> WhatsApp: {member.name}</h2>
          <button onClick={onClose} className="text-slate-400"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-slate-500">To: {member.phone}</p>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          <button onClick={() => onSend(member, message)} className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            <MessageCircle size={16} /> Send Message
          </button>
        </div>
      </div>
    </div>
  )
}

function ReminderModal({ member, onClose, onSend }: { member: Member; onClose: () => void; onSend: (m: Member) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Bell size={20} className="text-amber-600" /> Send Reminder</h2>
          <button onClick={onClose} className="text-slate-400"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">Send a WhatsApp reminder to <strong>{member.name}</strong> ({member.phone})</p>
          <p className="text-sm text-slate-500">Status: <StatusBadge status={member.membership_status} /></p>
          <button onClick={() => onSend(member)} className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            <Bell size={16} /> Send Reminder
          </button>
        </div>
      </div>
    </div>
  )
}

function EditMemberModal({ member, onClose, onSave }: { member: Member; onClose: () => void; onSave: (m: Member) => void }) {
  const [name, setName] = useState(member.name)
  const [phone, setPhone] = useState(member.phone)
  const [email, setEmail] = useState(member.email || '')
  const [status, setStatus] = useState(member.membership_status)
  const [notes, setNotes] = useState(member.notes || '')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Edit size={20} className="text-brand-600" /> Edit Member</h2>
          <button onClick={onClose} className="text-slate-400"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-3">
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="active">Active</option><option value="expiring">Expiring</option><option value="expired">Expired</option><option value="frozen">Frozen</option><option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" /></div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold">Cancel</button>
            <button onClick={() => onSave({ ...member, name, phone, email, membership_status: status, notes })} className="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"><Check size={16} /> Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function BulkWhatsAppModal({ count, onClose, onSend, loading }: { count: number; onClose: () => void; onSend: (msg: string) => void; loading: boolean }) {
  const [message, setMessage] = useState('Hi {name}, this is an important update from your gym. Please check your member app for details.')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><MessageCircle size={20} className="text-brand-600" /> Bulk WhatsApp</h2>
          <button onClick={onClose} className="text-slate-400"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">Sending to <strong>{count}</strong> members</p>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          <p className="text-xs text-slate-400">Use {'{name}'} for personalized recipient name</p>
          <button onClick={() => onSend(message)} disabled={loading} className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            {loading ? <Loader size={16} className="animate-spin" /> : <MessageCircle size={16} />} Send to {count} Members
          </button>
        </div>
      </div>
    </div>
  )
}
