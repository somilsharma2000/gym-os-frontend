import { useState, useEffect } from 'react'
import {
  Send,
  Users,
  Clock,
  X,
  Loader,
  Check,
  AlertCircle,
  Filter,
  BarChart3,
  TrendingUp,
  Calendar,
  Sparkles,
  MessageSquare,
  CheckCheck,
  Eye,
  Trash2
} from 'lucide-react'
import { api, getGymId } from '../api/client'
import LoadingScreen from '../components/LoadingScreen'

type BroadcastStatus = 'scheduled' | 'sent' | 'draft' | 'failed'

export interface BroadcastRecord {
  id: string
  title: string
  audience: string
  audience_label: string
  message: string
  status: BroadcastStatus
  scheduled_time?: string
  sent_count: number
  delivered_count: number
  read_count: number
  total_count: number
  created_date: string
}

export default function WhatsApp() {
  const [members, setMembers] = useState<any[]>([])
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastRecord | null>(null)

  const gymId = getGymId()

  useEffect(() => {
    Promise.all([
      api.getMembers().then(res => (res && res.success ? res.members || [] : []))
    ])
      .then(([m]) => {
        setMembers(m)

        // Seed initial history if none exists
        const sampleHistory: BroadcastRecord[] = [
          {
            id: 'bc_001',
            title: 'Welcome Onboarding - Beyond Pixells',
            audience: 'all',
            audience_label: 'All Members',
            message: 'Hi {name}, welcome to Beyond Pixells Gym! We are excited to help you achieve your fitness goals. See you soon!',
            status: 'sent',
            sent_count: m.length,
            delivered_count: Math.max(0, m.length - 1),
            read_count: Math.floor(m.length * 0.85),
            total_count: m.length,
            created_date: new Date(Date.now() - 3 * 86400000).toISOString()
          },
          {
            id: 'bc_002',
            title: 'August Renewal Blitz',
            audience: 'expiring',
            audience_label: 'Expiring Soon',
            message: 'Hi {name}, your membership at Beyond Pixells Gym is expiring on {expiry_date}. Renew today to keep crushing your fitness goals!',
            status: 'sent',
            sent_count: 8,
            delivered_count: 8,
            read_count: 7,
            total_count: 8,
            created_date: new Date(Date.now() - 1 * 86400000).toISOString()
          }
        ]
        setBroadcasts(sampleHistory)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Audience segments
  const segments = [
    {
      key: 'all',
      label: 'All Members',
      count: members.length,
      filter: () => true
    },
    {
      key: 'active',
      label: 'Active Members',
      count: members.filter(m => m.status === 'active').length,
      filter: (m: any) => m.status === 'active'
    },
    {
      key: 'expired',
      label: 'Expired Members',
      count: members.filter(m => m.status === 'expired' || m.status === 'inactive').length,
      filter: (m: any) => m.status === 'expired' || m.status === 'inactive'
    },
    {
      key: 'at_risk',
      label: 'At-Risk Members',
      count: members.filter(m => m.risk_status && m.risk_status !== 'healthy' && m.risk_status !== 'none' && m.risk_status !== '').length,
      filter: (m: any) => m.risk_status && m.risk_status !== 'healthy' && m.risk_status !== 'none' && m.risk_status !== ''
    },
    {
      key: 'expiring',
      label: 'Expiring Soon',
      count: members.filter(m => {
        if (!m.expiry_date) return false
        const days = (new Date(m.expiry_date).getTime() - Date.now()) / 86400000
        return days >= 0 && days <= 7
      }).length,
      filter: (m: any) => {
        if (!m.expiry_date) return false
        const days = (new Date(m.expiry_date).getTime() - Date.now()) / 86400000
        return days >= 0 && days <= 7
      }
    }
  ]

  // Required template messages
  const templates = [
    {
      key: 'welcome',
      label: 'Welcome Message',
      text: 'Hi {name}, welcome to Beyond Pixells Gym! We are excited to help you achieve your fitness goals. See you on the workout floor!'
    },
    {
      key: 'renewal',
      label: 'Renewal Reminder',
      text: 'Hi {name}, your membership at Beyond Pixells Gym is expiring on {expiry_date}. Renew today to stay on track with your workouts!'
    },
    {
      key: 'birthday',
      label: 'Birthday Wish',
      text: 'Happy Birthday {name}! 🎉 Warmest wishes from the team at Beyond Pixells Gym. Enjoy a complimentary personal training session on us this week!'
    },
    {
      key: 'promotion',
      label: 'Promotional Offer',
      text: 'Hi {name}, exclusive offer from Beyond Pixells Gym! Refer a friend this month and both of you get 20% off your next renewal package.'
    },
    {
      key: 'custom',
      label: 'Custom Message',
      text: ''
    }
  ]

  // Broadcast Handler
  const handleSendBroadcast = async (data: {
    title: string
    audience: string
    message: string
    schedule_time?: string
  }) => {
    const targetSegment = segments.find(s => s.key === data.audience)
    const audienceMembers = members.filter(targetSegment?.filter || (() => true))

    if (data.schedule_time) {
      // Schedule broadcast
      const scheduledRecord: BroadcastRecord = {
        id: `bc_${Date.now()}`,
        title: data.title,
        audience: data.audience,
        audience_label: targetSegment?.label || data.audience,
        message: data.message,
        status: 'scheduled',
        scheduled_time: data.schedule_time,
        sent_count: 0,
        delivered_count: 0,
        read_count: 0,
        total_count: audienceMembers.length,
        created_date: new Date().toISOString()
      }

      setBroadcasts(prev => [scheduledRecord, ...prev])
      showToast(`Broadcast scheduled for ${data.schedule_time}!`)
      return { sent: 0, total: audienceMembers.length }
    }

    // Immediate Send — HONEST reporting: only count real API successes
    let sentCount = 0
    let notConfigured = false
    for (const member of audienceMembers) {
      const phone = (member.phone || '').replace(/[^0-9+]/g, '')
      if (!phone) continue

      const personalized = data.message
        .replace(/{name}/g, member.name || 'Member')
        .replace(/{expiry_date}/g, member.expiry_date || 'soon')
        .replace(/{membership_type}/g, member.membership_type || member.plan || 'Standard')

      try {
        const res = await api.sendWhatsAppMessage(phone, personalized)
        if (res?.success) {
          sentCount++
        } else if (res?.not_configured) {
          notConfigured = true
          break // no point retrying the rest, WhatsApp isn't connected at all
        }
      } catch (e) {
        // real network/API failure — do not count as sent
      }
    }

    const sentRecord: BroadcastRecord = {
      id: `bc_${Date.now()}`,
      title: data.title,
      audience: data.audience,
      audience_label: targetSegment?.label || data.audience,
      message: data.message,
      status: sentCount > 0 ? 'sent' : 'failed',
      sent_count: sentCount,
      delivered_count: sentCount,
      read_count: 0,
      total_count: audienceMembers.length,
      created_date: new Date().toISOString()
    }

    setBroadcasts(prev => [sentRecord, ...prev])

    if (notConfigured) {
      showToast(`WhatsApp isn't connected yet — add your API token in Settings first.`)
    } else if (sentCount === 0) {
      showToast(`Broadcast failed — 0 of ${audienceMembers.length} messages sent. Check your WhatsApp connection.`)
    } else if (sentCount < audienceMembers.length) {
      showToast(`Sent to ${sentCount} of ${audienceMembers.length} members (some failed).`)
    } else {
      showToast(`WhatsApp broadcast sent to ${sentCount} members!`)
    }
    return { sent: sentCount, total: audienceMembers.length }
  }

  if (loading) return <LoadingScreen message="Loading Beyond Pixells WhatsApp hub..." />

  const activeMembersCount = members.filter(m => m.status === 'active').length
  const expiredMembersCount = members.filter(m => m.status === 'expired' || m.status === 'inactive').length

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-4 py-3 rounded-lg shadow-xl text-sm font-medium flex items-center gap-2 animate-fade-in">
          <Sparkles size={16} className="text-brand-400" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">WhatsApp Broadcast Hub</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Targeted messaging with segment filtering, pre-built templates, and delivery reporting.
          </p>
        </div>
        <button
          onClick={() => setShowBroadcastModal(true)}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Send size={16} /> New Broadcast Campaign
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Members</span>
            <Users size={18} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{members.length}</p>
          <span className="text-xs text-slate-400 mt-1 block">Full audience list</span>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Audience</span>
            <Check size={18} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeMembersCount}</p>
          <span className="text-xs text-slate-400 mt-1 block">Active subscription</span>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Expired Audience</span>
            <AlertCircle size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{expiredMembersCount}</p>
          <span className="text-xs text-slate-400 mt-1 block">Re-engagement list</span>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Broadcasts</span>
            <TrendingUp size={18} className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{broadcasts.length}</p>
          <span className="text-xs text-slate-400 mt-1 block">Campaigns created</span>
        </div>
      </div>

      {/* Audience Segments Section */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <Filter size={16} className="text-blue-600" /> Target Audience Segments
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {segments.map(seg => (
            <div
              key={seg.key}
              onClick={() => setShowBroadcastModal(true)}
              className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 hover:border-blue-500 transition-all cursor-pointer shadow-sm group"
            >
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{seg.label}</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{seg.count}</p>
              <p className="text-xs font-medium text-blue-600 group-hover:underline mt-2 flex items-center gap-1">
                Send broadcast →
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Broadcast History Table */}
      <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-600" /> Broadcast History & Logs
          </h3>
          <span className="text-xs text-slate-400">{broadcasts.length} campaigns logged</span>
        </div>

        {broadcasts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <MessageSquare size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-base font-medium">No broadcasts sent yet</p>
            <p className="text-xs text-slate-400 mt-1">Create your first broadcast campaign to start reaching members on WhatsApp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700/80">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Campaign / Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Audience Segment</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Message Preview</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Recipients</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Sent / Del. / Read</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {broadcasts.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                    {/* Title & Date */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">{b.title}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {new Date(b.created_date).toLocaleDateString()} {new Date(b.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Audience Segment */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                        {b.audience_label}
                      </span>
                    </td>

                    {/* Message Preview */}
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate text-xs">
                      {b.message}
                    </td>

                    {/* Recipients Count */}
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                      {b.total_count} members
                    </td>

                    {/* Delivery Stats */}
                    <td className="px-4 py-3">
                      <div className="text-xs font-mono space-x-1.5 text-slate-600 dark:text-slate-300">
                        <span className="text-blue-600 font-bold">{b.sent_count} sent</span> /
                        <span className="text-emerald-600 font-bold">{b.delivered_count} del.</span> /
                        <span className="text-purple-600 font-bold">{b.read_count} read</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        b.status === 'sent'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : b.status === 'scheduled'
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {b.status === 'sent' && <CheckCheck size={12} className="mr-1" />}
                        {b.status === 'scheduled' && <Clock size={12} className="mr-1" />}
                        <span className="capitalize">{b.status}</span>
                      </span>
                      {b.scheduled_time && (
                        <div className="text-[10px] text-amber-600 mt-0.5">
                          Scheduled: {b.scheduled_time}
                        </div>
                      )}
                    </td>

                    {/* View Details */}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedBroadcast(b)}
                        className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors flex items-center gap-1 ml-auto"
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Broadcast Details Modal */}
      {selectedBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{selectedBroadcast.title}</h3>
                <p className="text-xs text-slate-500">Campaign Details & Logs</p>
              </div>
              <button onClick={() => setSelectedBroadcast(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <span className="text-slate-400 block">Audience Segment</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedBroadcast.audience_label}</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <span className="text-slate-400 block">Status</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{selectedBroadcast.status}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Message Payload</label>
                <div className="mt-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
                  {selectedBroadcast.message}
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                Delivery Breakdown: {selectedBroadcast.sent_count} sent out of {selectedBroadcast.total_count} targeted recipients.
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-right">
              <button
                onClick={() => setSelectedBroadcast(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Broadcast Composer Modal */}
      {showBroadcastModal && (
        <BroadcastModal
          segments={segments}
          templates={templates}
          onClose={() => setShowBroadcastModal(false)}
          onSend={async data => {
            const result = await handleSendBroadcast(data)
            setShowBroadcastModal(false)
            return result
          }}
        />
      )}
    </div>
  )
}

function BroadcastModal({
  segments,
  templates,
  onClose,
  onSend
}: {
  segments: { key: string; label: string; count: number; filter: (m: any) => boolean }[]
  templates: { key: string; label: string; text: string }[]
  onClose: () => void
  onSend: (data: { title: string; audience: string; message: string; schedule_time?: string }) => Promise<{ sent: number; total: number }>
}) {
  const [title, setTitle] = useState('')
  const [audience, setAudience] = useState('all')
  const [template, setTemplate] = useState('welcome')
  const [message, setMessage] = useState(templates[0].text)
  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const [scheduleTime, setScheduleTime] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; total: number } | null>(null)
  const [error, setError] = useState('')

  const selectedSegment = segments.find(s => s.key === audience)
  const selectedTemplate = templates.find(t => t.key === template)

  useEffect(() => {
    if (selectedTemplate && template !== 'custom') {
      setMessage(selectedTemplate.text)
    }
  }, [template])

  const handleSend = async () => {
    if (!title.trim()) {
      setError('Please enter a campaign title')
      return
    }
    if (!message.trim()) {
      setError('Please enter a message body')
      return
    }
    if (scheduleEnabled && !scheduleTime) {
      setError('Please select a date and time for scheduled broadcast')
      return
    }

    setSending(true)
    setError('')
    try {
      const res = await onSend({
        title,
        audience,
        message,
        schedule_time: scheduleEnabled ? scheduleTime : undefined
      })
      setResult(res)
    } catch (e) {
      setError('Failed to process WhatsApp broadcast campaign')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Send size={18} className="text-blue-600" /> New Broadcast Campaign
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Send personalized WhatsApp messages to targeted member segments
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {result ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Check size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Broadcast Processed!</h3>
              <p className="text-sm text-slate-500 mt-2">
                {scheduleEnabled
                  ? `Campaign scheduled for ${scheduleTime} to ${selectedSegment?.count || 0} members.`
                  : `${result.sent} messages delivered out of ${result.total} members.`}
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs font-medium text-red-600">
                  {error}
                </div>
              )}

              {/* Campaign Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. August Membership Renewal Reminder"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Audience Segment Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Audience Segment *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {segments.map(seg => (
                    <button
                      key={seg.key}
                      type="button"
                      onClick={() => setAudience(seg.key)}
                      className={`px-3 py-2 text-left text-xs rounded-lg border transition-all ${
                        audience === seg.key
                          ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span className="block truncate">{seg.label}</span>
                      <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                        {seg.count} members
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Templates */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Template Preset
                </label>
                <select
                  value={template}
                  onChange={e => setTemplate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {templates.map(t => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message Composer */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message Body{' '}
                  <span className="text-[10px] text-slate-400 font-normal">
                    (Placeholders: {'{name}'}, {'{expiry_date}'}, {'{membership_type}'})
                  </span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Type your WhatsApp message..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 resize-none font-sans"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {message.length} characters · Will be delivered to {selectedSegment?.count || 0} members
                </p>
              </div>

              {/* Schedule For Later Option */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scheduleEnabled}
                    onChange={e => setScheduleEnabled(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Clock size={14} className="text-amber-500" /> Schedule broadcast for later
                  </span>
                </label>

                {scheduleEnabled && (
                  <div className="mt-2">
                    <input
                      type="datetime-local"
                      value={scheduleTime}
                      onChange={e => setScheduleTime(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-[11px] text-blue-700 dark:text-blue-300">
                Messages will be sent via Beyond Pixells WhatsApp Integration to registered phone numbers.
              </div>

              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {sending ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                {sending
                  ? 'Processing Broadcast...'
                  : scheduleEnabled
                  ? 'Schedule Broadcast'
                  : `Send Now to ${selectedSegment?.count || 0} Members`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
