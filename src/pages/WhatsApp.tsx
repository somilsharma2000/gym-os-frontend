import { useState, useEffect } from 'react'
import { Send, Users, Clock, X, Loader, Check, AlertCircle, Filter, BarChart3, TrendingUp } from 'lucide-react'
import { api } from '../api/client'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://base44.app/api/apps/6a8949954092729194579577/functions'

type Broadcast = {
  id: string
  title: string
  audience: string
  message: string
  status: 'scheduled' | 'sent' | 'draft'
  scheduled_time?: string
  sent_count?: number
  total_count?: number
  created_date: string
}

export default function WhatsApp() {
  const [members, setMembers] = useState<any[]>([])
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total_sent: 0, total_delivered: 0, active_members: 0, expired_members: 0 })

  useEffect(() => {
    Promise.all([
      api.getMembers().then(res => res.success ? res.members || [] : []),
    ]).then(([m]) => {
      setMembers(m)
      const active = m.filter((mem: any) => mem.status === 'active')
      const expired = m.filter((mem: any) => mem.status === 'expired' || mem.status === 'inactive')
      setStats({
        total_sent: 0,
        total_delivered: 0,
        active_members: active.length,
        expired_members: expired.length
      })
      setLoading(false)
    })
  }, [])

  // Audience segments
  const segments = [
    { key: 'all', label: 'All Members', count: members.length, filter: (m: any) => true },
    { key: 'active', label: 'Active Members', count: members.filter(m => m.status === 'active').length, filter: (m: any) => m.status === 'active' },
    { key: 'expired', label: 'Expired Members', count: members.filter(m => m.status === 'expired' || m.status === 'inactive').length, filter: (m: any) => m.status === 'expired' || m.status === 'inactive' },
    { key: 'at_risk', label: 'At-Risk Members', count: members.filter(m => m.risk_status && m.risk_status !== 'healthy' && m.risk_status !== 'none' && m.risk_status !== '').length, filter: (m: any) => m.risk_status && m.risk_status !== 'healthy' && m.risk_status !== 'none' && m.risk_status !== '' },
    { key: 'expiring', label: 'Expiring Soon', count: members.filter(m => { if (!m.expiry_date) return false; const days = (new Date(m.expiry_date).getTime() - Date.now()) / 86400000; return days > 0 && days <= 7 }).length, filter: (m: any) => { if (!m.expiry_date) return false; const days = (new Date(m.expiry_date).getTime() - Date.now()) / 86400000; return days > 0 && days <= 7 } },
  ]

  // Message templates
  const templates = [
    { key: 'welcome', label: 'Welcome Message', text: 'Hi {name}, welcome to our gym family! We are excited to help you achieve your fitness goals. See you soon!' },
    { key: 'renewal', label: 'Renewal Reminder', text: 'Hi {name}, your membership is expiring on {expiry_date}. Renew now to keep crushing your fitness goals! DM us to renew.' },
    { key: 'winback', label: 'Win-back Campaign', text: 'Hi {name}, we miss you at the gym! Come back and get 20% off your next renewal. Valid for 7 days only!' },
    { key: 'class', label: 'Class Announcement', text: 'Hi {name}, new classes are available! Check out our updated schedule and book your spot. DM us to enroll.' },
    { key: 'offer', label: 'Special Offer', text: 'Hi {name}, exclusive offer just for you! Get a personal training session at 50% off this week. DM us to book.' },
    { key: 'custom', label: 'Custom Message', text: '' },
  ]

  const handleSendBroadcast = async (data: { title: string; audience: string; message: string; schedule_time?: string }) => {
    const audienceMembers = members.filter(segments.find(s => s.key === data.audience)?.filter || (() => false))
    let sentCount = 0

    for (const member of audienceMembers) {
      const phone = (member.phone || '').replace(/[^0-9]/g, '')
      if (!phone) continue
      // Personalize message
      const personalized = data.message
        .replace(/{name}/g, member.name || 'Member')
        .replace(/{expiry_date}/g, member.expiry_date || 'soon')
        .replace(/{membership_type}/g, member.membership_type || 'Standard')
      try {
        await api.sendWhatsApp(phone, personalized)
        sentCount++
      } catch (e) { /* continue */ }
    }

    setBroadcasts(prev => [{
      id: Date.now().toString(),
      title: data.title,
      audience: data.audience,
      message: data.message,
      status: 'sent' as const,
      sent_count: sentCount,
      total_count: audienceMembers.length,
      created_date: new Date().toISOString()
    }, ...prev])

    return { sent: sentCount, total: audienceMembers.length }
  }

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading WhatsApp dashboard...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">WhatsApp Broadcast</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Targeted bulk messaging with segmentation, templates, and scheduling.</p>
        </div>
        <button onClick={() => setShowBroadcast(true)} className="px-3 py-1.5 text-sm text-white bg-brand-600 rounded-md hover:bg-brand-700 flex items-center gap-1.5">
          <Send size={14} /> New Broadcast
        </button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2"><Users size={16} className="text-blue-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Total Members</span></div>
          <p className="text-2xl font-bold text-blue-600">{members.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2"><Check size={16} className="text-green-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Active</span></div>
          <p className="text-2xl font-bold text-green-600">{stats.active_members}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2"><AlertCircle size={16} className="text-amber-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Expired</span></div>
          <p className="text-2xl font-bold text-amber-600">{stats.expired_members}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={16} className="text-brand-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Broadcasts Sent</span></div>
          <p className="text-2xl font-bold text-brand-600">{broadcasts.filter(b => b.status === 'sent').length}</p>
        </div>
      </div>

      {/* Audience Segments */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
          <Filter size={16} /> Audience Segments
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {segments.map(seg => (
            <div key={seg.key} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:border-brand-300 dark:hover:border-brand-700 transition-colors cursor-pointer"
              onClick={() => setShowBroadcast(true)}>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{seg.label}</p>
              <p className="text-2xl font-bold text-slate-600 dark:text-slate-300 mt-1">{seg.count}</p>
              <p className="text-xs text-brand-600 mt-1">Send broadcast →</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Broadcasts */}
      {broadcasts.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
            <BarChart3 size={16} /> Recent Campaigns
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {broadcasts.map(b => (
              <div key={b.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{b.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${b.status === 'sent' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                    {b.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{b.message}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  <span>Audience: {segments.find(s => s.key === b.audience)?.label || b.audience}</span>
                  {b.sent_count !== undefined && <span>Sent: {b.sent_count}/{b.total_count}</span>}
                  <span>{new Date(b.created_date).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Broadcast Modal */}
      {showBroadcast && (
        <BroadcastModal
          segments={segments}
          templates={templates}
          memberCount={members.length}
          onClose={() => setShowBroadcast(false)}
          onSend={async (data) => {
            const result = await handleSendBroadcast(data)
            setShowBroadcast(false)
            return result
          }}
        />
      )}
    </div>
  )
}

function BroadcastModal({ segments, templates, memberCount, onClose, onSend }: {
  segments: { key: string; label: string; count: number; filter: (m: any) => boolean }[]
  templates: { key: string; label: string; text: string }[]
  memberCount: number
  onClose: () => void
  onSend: (data: { title: string; audience: string; message: string; schedule_time?: string }) => Promise<{ sent: number; total: number }>
}) {
  const [title, setTitle] = useState('')
  const [audience, setAudience] = useState('all')
  const [template, setTemplate] = useState('custom')
  const [message, setMessage] = useState('')
  const [scheduleEnabled, setScheduleEnable] = useState(false)
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
    if (!title.trim()) { setError('Please enter a campaign title'); return }
    if (!message.trim()) { setError('Please enter a message'); return }
    setSending(true); setError('')
    try {
      const res = await onSend({ title, audience, message, schedule_time: scheduleEnabled ? scheduleTime : undefined })
      setResult(res)
    } catch (e) { setError('Failed to send broadcast') }
    setSending(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Send size={18} className="text-brand-600" /> New Broadcast
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Send personalized WhatsApp messages to targeted member segments</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          {result ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Broadcast Sent!</h3>
              <p className="text-sm text-slate-500 mt-2">{result.sent} messages sent out of {result.total} members</p>
              <button onClick={onClose} className="mt-4 px-6 py-2 text-sm text-white bg-brand-600 rounded-md hover:bg-brand-700">Done</button>
            </div>
          ) : (
            <>
              {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Campaign Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Renewal Reminder - Aug 2026"
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Audience Segment</label>
                <div className="grid grid-cols-3 gap-2">
                  {segments.map(seg => (
                    <button key={seg.key} type="button" onClick={() => setAudience(seg.key)}
                      className={`px-3 py-2 text-xs rounded-md border-2 transition-colors ${audience === seg.key ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30' : 'border-slate-200 dark:border-slate-600'}`}>
                      <span className={`block font-medium ${audience === seg.key ? 'text-brand-600' : 'text-slate-600 dark:text-slate-300'}`}>{seg.label}</span>
                      <span className="block text-slate-400 mt-0.5">{seg.count} members</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Message Template</label>
                <select value={template} onChange={e => setTemplate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:border-brand-400">
                  {templates.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Message <span className="text-xs text-slate-400">(use {'{name}'}, {'{expiry_date}'}, {'{membership_type}'} for personalization)</span>
                </label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Type your message..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:border-brand-400 resize-none" />
                <p className="text-xs text-slate-400 mt-1">{message.length} characters · Will be sent to {selectedSegment?.count || 0} members</p>
              </div>
              {/* Schedule Option */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={scheduleEnabled} onChange={e => setScheduleEnable(e.target.checked)} className="rounded" />
                  <span className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1"><Clock size={14} /> Schedule for later</span>
                </label>
                {scheduleEnabled && (
                  <input type="datetime-local" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                    className="w-full mt-2 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:border-brand-400" />
                )}
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-xs text-blue-600">
                Messages will be sent via WhatsApp to members with registered phone numbers. Each message is personalized with the member's name and details.
              </div>
              <button onClick={handleSend} disabled={sending}
                className="w-full py-2.5 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {sending ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
                {sending ? 'Sending...' : scheduleEnabled ? 'Schedule Broadcast' : `Send to ${selectedSegment?.count || 0} Members`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}