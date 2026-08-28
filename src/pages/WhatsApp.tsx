import { useState, useEffect } from 'react'
import { MessageCircle, Send, CheckCircle, Clock, Zap, Plus, X, Users, Calendar, Loader, AlertCircle } from 'lucide-react'
import { api } from '../api/client'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'

interface Broadcast {
  id: string
  title: string
  audience: string
  sent_date: string
  recipients: number
  delivered: number
  status: string
}

interface Template {
  id: string
  name: string
  body: string
  active: boolean
  trigger: string
}

export default function WhatsApp() {
  const [templates, setTemplates] = useState<Template[]>([
    { id: '1', name: 'Welcome Message', body: 'Welcome to {gym_name}! We are excited to have you on board. Your trial pass is ready — show this message at the front desk.', active: true, trigger: 'New Lead' },
    { id: '2', name: 'Trial Reminder', body: 'Hi {name}! Your free trial at {gym_name} is scheduled for tomorrow. We can\'t wait to see you! Reply YES to confirm.', active: true, trigger: 'Trial Scheduled' },
    { id: '3', name: 'Membership Renewal', body: 'Hi {name}, your membership at {gym_name} expires on {expiry_date}. Renew now to keep your streak going! Reply RENEW.', active: true, trigger: 'Expiring Membership' },
    { id: '4', name: 'Payment Reminder', body: 'Hi {name}, your payment of ₹{amount} is pending. Please clear it at your earliest convenience. Thank you!', active: false, trigger: 'Payment Due' },
    { id: '5', name: 'Birthday Wish', body: 'Happy Birthday {name}! 🎂 Your gym family wishes you an amazing day. Enjoy a free protein shake on us today!', active: true, trigger: 'Birthday' }
  ])
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([
    { id: '1', title: 'New Year Offer', audience: 'All Members', sent_date: '2026-01-01', recipients: 847, delivered: 832, status: 'delivered' },
    { id: '2', title: 'Class Schedule Update', audience: 'Active Members', sent_date: '2026-01-05', recipients: 620, delivered: 618, status: 'delivered' },
    { id: '3', title: 'Renewal Reminder', audience: 'Expiring Members', sent_date: '2026-01-10', recipients: 45, delivered: 44, status: 'delivered' }
  ])

  const stats = {
    messages_sent: 2341,
    delivery_rate: '97.8%',
    automations_active: templates.filter(t => t.active).length,
    pending_queued: 0
  }

  const toggleTemplate = (id: string) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t))
  }

  const handleSendBroadcast = async (title: string, audience: string, message: string, scheduleDate?: string) => {
    // In production, this calls a backend function to send WhatsApp messages
    const newBroadcast: Broadcast = {
      id: 'bc_' + Date.now(),
      title,
      audience,
      sent_date: scheduleDate || new Date().toISOString().split('T')[0],
      recipients: audience === 'All Members' ? 847 : audience === 'Active Members' ? 620 : 45,
      delivered: 0,
      status: scheduleDate ? 'scheduled' : 'sending'
    }
    setBroadcasts(prev => [newBroadcast, ...prev])
    setShowBroadcastModal(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">WhatsApp Automation</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage automated triggers, broadcast announcements, and message templates.</p>
        </div>
        <button
          onClick={() => setShowBroadcastModal(true)}
          className="px-3 py-1.5 text-sm text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
        >
          <Plus size={14} /> New Broadcast
        </button>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
        <MessageCircle size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          WhatsApp integration requires API setup. Contact <strong>Beyond Pixels</strong> support to activate.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Messages Sent" value={stats.messages_sent} icon={<Send size={16} />} color="text-blue-600 dark:text-blue-400" />
        <StatCard label="Delivery Rate" value={stats.delivery_rate} icon={<CheckCircle size={16} />} color="text-green-600 dark:text-green-400" />
        <StatCard label="Automations Active" value={stats.automations_active} icon={<Zap size={16} />} color="text-purple-600 dark:text-purple-400" />
        <StatCard label="Pending Queued" value={stats.pending_queued} icon={<Clock size={16} />} color="text-amber-600 dark:text-amber-400" />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4">Automated Message Templates</h3>
        <div className="space-y-4">
          {templates.map((tpl) => (
            <div key={tpl.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{tpl.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Trigger: {tpl.trigger}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-3 py-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">Save</button>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={tpl.active} onChange={() => toggleTemplate(tpl.id)} className="sr-only peer" />
                    <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-green-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                  </label>
                </div>
              </div>
              <textarea
                value={tpl.body} readOnly
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md p-2.5 text-xs text-slate-700 dark:text-slate-200 font-mono h-20 resize-none focus:outline-none focus:border-brand-400"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Recent Broadcasts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 text-left text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Audience</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Recipients</th>
                <th className="px-4 py-3 font-medium">Delivered</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {broadcasts.map((bc) => (
                <tr key={bc.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{bc.title}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{bc.audience}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{bc.sent_date}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{bc.recipients}</td>
                  <td className="px-4 py-3 text-green-600 dark:text-green-400">{bc.delivered || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={bc.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <BroadcastModal
          onClose={() => setShowBroadcastModal(false)}
          onSend={handleSendBroadcast}
        />
      )}
    </div>
  )
}

function BroadcastModal({ onClose, onSend }: { onClose: () => void; onSend: (title: string, audience: string, message: string, scheduleDate?: string) => void }) {
  const [title, setTitle] = useState('')
  const [audience, setAudience] = useState('all_members')
  const [message, setMessage] = useState('')
  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [sending, setSending] = useState(false)

  const audienceOptions = [
    { value: 'all_members', label: 'All Members' },
    { value: 'active_members', label: 'Active Members Only' },
    { value: 'expiring', label: 'Expiring Members' },
    { value: 'at_risk', label: 'At-Risk Members' },
    { value: 'leads', label: 'All Leads' },
    { value: 'trial_pending', label: 'Pending Trial Leads' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) return
    setSending(true)
    setTimeout(() => {
      onSend(title, audienceOptions.find(a => a.value === audience)?.label || 'All Members', message, scheduleEnabled ? scheduleDate : undefined)
      setSending(false)
    }, 500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageCircle size={20} className="text-emerald-600" /> New Broadcast
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Broadcast Title *</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. New Class Schedule"
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Audience *</label>
            <select value={audience} onChange={e => setAudience(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
              {audienceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message *</label>
            <textarea required value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="Type your broadcast message here... Use {name} for personalization."
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            <p className="text-xs text-slate-400 mt-1">Variables: {'{name}'}, {'{gym_name}'}, {'{expiry_date}'}</p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={scheduleEnabled} onChange={e => setScheduleEnabled(e.target.checked)} className="sr-only peer" />
              <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-emerald-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
            </label>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5"><Calendar size={14} /> Schedule for later</p>
              <p className="text-xs text-slate-400">Send at a specific date & time</p>
            </div>
            {scheduleEnabled && (
              <input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} required={scheduleEnabled}
                className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold">Cancel</button>
            <button type="submit" disabled={sending} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold">
              {sending ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
              {scheduleEnabled ? 'Schedule' : 'Send Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
