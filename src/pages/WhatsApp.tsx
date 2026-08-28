import { useState } from 'react'
import { MessageCircle, Send, CheckCircle, Clock, Zap, Plus } from 'lucide-react'
import { demoWhatsApp } from '../data/demoData'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'

export default function WhatsApp() {
  const [templates, setTemplates] = useState(demoWhatsApp.templates)
  const stats = demoWhatsApp.stats

  const toggleTemplate = (id: string) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">WhatsApp Automation</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage automated triggers, broadcast announcements, and message templates.</p>
        </div>
        <button className="px-3 py-1.5 text-sm text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-1.5">
          <Plus size={14} /> New Broadcast
        </button>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
        <MessageCircle size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          WhatsApp integration requires API setup. Contact <strong>Beyond Pixells</strong> support to activate.
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
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{tpl.name}</h4>
                <div className="flex items-center gap-3">
                  <button className="px-3 py-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                    Save
                  </button>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tpl.active}
                      onChange={() => toggleTemplate(tpl.id)}
                      className="sr-only peer"
                    />
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
              {demoWhatsApp.broadcasts.map((bc) => (
                <tr key={bc.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{bc.title}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{bc.audience}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{bc.sent_date}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{bc.recipients}</td>
                  <td className="px-4 py-3 text-green-600 dark:text-green-400">{bc.delivered}</td>
                  <td className="px-4 py-3"><StatusBadge status={bc.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
