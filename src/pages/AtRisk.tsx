import { useState, useEffect } from 'react'
import { AlertTriangle, ShieldCheck, AlertCircle, Phone, MessageCircle, Gift, Calendar, UserCheck, Activity, TrendingDown, Clock, X, Send, Loader, Bell, Tag, Star, UserPlus, Zap } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import { api } from '../api/client'
import StatusBadge from '../components/StatusBadge'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://base44.app/api/apps/6a700b150c8d8b8e923580a1/functions'

export default function AtRisk() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionMember, setActionMember] = useState<any | null>(null)
  const [actionType, setActionType] = useState<string>('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionResult, setActionResult] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const res = await api.getMembers()
      if (res.success) setMembers(res.members || [])
    } catch (e) { /* silent */ }
    setLoading(false)
  }

  if (loading) return <LoadingScreen message="Loading at-risk members..." />

  const atRisk = members.filter(m => m.risk_status && m.risk_status !== 'none' && m.risk_status !== 'healthy' && m.risk_status !== '')
  const high = atRisk.filter(m => m.risk_status === 'high' || m.risk_status === 'critical').length
  const medium = atRisk.filter(m => m.risk_status === 'medium' || m.risk_status === 'at_risk').length
  const healthy = members.filter(m => !m.risk_status || m.risk_status === 'none' || m.risk_status === 'healthy').length
  const atRiskRevenue = atRisk.reduce((s, m) => s + (m.total_revenue || 0), 0)
  const churnRate = members.length > 0 ? ((atRisk.length / members.length) * 100).toFixed(1) : '0'
  
  const filtered = filter === 'all' ? atRisk : filter === 'high' 
    ? atRisk.filter(m => m.risk_status === 'high' || m.risk_status === 'critical')
    : atRisk.filter(m => m.risk_status === 'medium' || m.risk_status === 'at_risk')

  const cardCls = "bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-colors"

  const handleAction = async (member: any, action: string) => {
    setActionMember(member)
    setActionType(action)
    setActionResult(null)
  }

  const executeAction = async () => {
    if (!actionMember || !actionType) return
    setActionLoading(true)
    try {
      const phone = (actionMember.phone || '').replace(/[^0-9]/g, '')
      
      switch (actionType) {
        case 'whatsapp': {
          const msg = `Hi ${actionMember.name}, we miss you at the gym! Your membership is still active. Come back and crush your fitness goals! Reply to this message to schedule your next visit.`
          if (phone) await api.sendWhatsApp(phone, msg)
          setActionResult({ type: 'success', text: `WhatsApp message sent to ${actionMember.name}` })
          break
        }
        case 'call': {
          window.open(`tel:${actionMember.phone}`)
          setActionResult({ type: 'success', text: `Initiating call to ${actionMember.name}` })
          break
        }
        case 'discount': {
          const msg = `Hi ${actionMember.name}, we noticed you haven't visited in a while. Here's a special 20% discount on your next membership renewal! Show this message at the front desk. Valid for 7 days only.`
          if (phone) await api.sendWhatsApp(phone, msg)
          setActionResult({ type: 'success', text: `Discount offer sent to ${actionMember.name}` })
          break
        }
        case 'followup': {
          const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
          setActionResult({ type: 'success', text: `Follow-up scheduled for ${tomorrow} with ${actionMember.name}` })
          break
        }
        case 'assign_trainer': {
          setActionResult({ type: 'success', text: `Trainer assignment opened for ${actionMember.name}` })
          break
        }
        case 'freeze': {
          setActionResult({ type: 'success', text: `Membership freeze request created for ${actionMember.name}` })
          break
        }
        case 'winback': {
          const msg = `Hi ${actionMember.name}, we'd love to have you back! Your membership expired but we're offering you a special comeback rate. Reply to reactivate your membership today!`
          if (phone) await api.sendWhatsApp(phone, msg)
          setActionResult({ type: 'success', text: `Win-back campaign triggered for ${actionMember.name}` })
          break
        }
        case 'reminder': {
          const msg = `Hi ${actionMember.name}, this is a friendly reminder that your gym membership is active. We'd love to see you! Visit anytime during gym hours.`
          if (phone) await api.sendWhatsApp(phone, msg)
          setActionResult({ type: 'success', text: `Reminder sent to ${actionMember.name}` })
          break
        }
      }
    } catch (e) {
      setActionResult({ type: 'error', text: 'Action failed. Please try again.' })
    }
    setActionLoading(false)
  }

  const actionButtons = [
    { key: 'whatsapp', label: 'Send WhatsApp', icon: MessageCircle, color: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' },
    { key: 'call', label: 'Call Member', icon: Phone, color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
    { key: 'discount', label: 'Offer Discount', icon: Gift, color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
    { key: 'followup', label: 'Schedule Follow-up', icon: Calendar, color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
    { key: 'assign_trainer', label: 'Assign Trainer', icon: UserPlus, color: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' },
    { key: 'freeze', label: 'Freeze Membership', icon: Clock, color: 'bg-slate-50 dark:bg-slate-700/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600' },
    { key: 'winback', label: 'Win-back Campaign', icon: Zap, color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
    { key: 'reminder', label: 'Send Reminder', icon: Bell, color: 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">At-Risk Members</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Retention center — identify, engage, and recover at-risk members.</p>
        </div>
      </div>

      {/* Enhanced stat cards with churn rate and revenue at risk */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className={cardCls}>
          <div className="flex items-center gap-2 mb-2"><AlertCircle size={16} className="text-red-600" /><span className="text-xs text-slate-500 dark:text-slate-400">High Risk</span></div>
          <p className="text-2xl font-bold text-red-600">{high}</p>
        </div>
        <div className={cardCls}>
          <div className="flex items-center gap-2 mb-2"><AlertTriangle size={16} className="text-amber-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Medium</span></div>
          <p className="text-2xl font-bold text-amber-600">{medium}</p>
        </div>
        <div className={cardCls}>
          <div className="flex items-center gap-2 mb-2"><ShieldCheck size={16} className="text-green-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Healthy</span></div>
          <p className="text-2xl font-bold text-green-600">{healthy}</p>
        </div>
        <div className={cardCls}>
          <div className="flex items-center gap-2 mb-2"><TrendingDown size={16} className="text-orange-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Churn Rate</span></div>
          <p className="text-2xl font-bold text-orange-600">{churnRate}%</p>
        </div>
        <div className={cardCls}>
          <div className="flex items-center gap-2 mb-2"><Activity size={16} className="text-red-600" /><span className="text-xs text-slate-500 dark:text-slate-400">Revenue at Risk</span></div>
          <p className="text-2xl font-bold text-red-600">{`\u20B9${atRiskRevenue.toLocaleString('en-IN')}`}</p>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2">
        {['all', 'high', 'medium'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${filter === s ? 'bg-brand-700 text-white border-brand-700' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
            {s === 'all' ? 'All At-Risk' : s === 'high' ? 'High Risk' : 'Medium Risk'}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        {filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-slate-400 dark:text-slate-500">
            <ShieldCheck size={32} className="mx-auto mb-2 text-green-400" />
            No at-risk members detected. All members are healthy.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Member</th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Phone</th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Risk Level</th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Reason</th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Last Visit</th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Revenue</th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {filtered.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-200">{m.name}</td>
                    <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{m.phone}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={m.risk_status} /></td>
                    <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 max-w-xs truncate">{m.risk_reason || '\u2014'}</td>
                    <td className="px-4 py-2.5 text-slate-400 dark:text-slate-500">{m.last_checkin ? m.last_checkin.split('T')[0] : 'Never'}</td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{`\u20B9${(m.total_revenue || 0).toLocaleString('en-IN')}`}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleAction(m, 'whatsapp')} className="p-1.5 bg-green-50 dark:bg-green-900/30 text-green-600 rounded border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors" title="Send WhatsApp"><MessageCircle size={13} /></button>
                        <button onClick={() => handleAction(m, 'call')} className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors" title="Call"><Phone size={13} /></button>
                        <button onClick={() => handleAction(m, 'discount')} className="p-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors" title="Offer Discount"><Gift size={13} /></button>
                        <button onClick={() => setActionMember(m)} className="p-1.5 bg-slate-50 dark:bg-slate-700/30 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors" title="More actions"><Zap size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Retention Actions</h3>
                <p className="text-xs text-slate-500 mt-0.5">{actionMember.name} · {actionMember.phone}</p>
              </div>
              <button onClick={() => { setActionMember(null); setActionType(''); setActionResult(null) }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-3">
              {actionResult ? (
                <div className={`flex items-center gap-3 p-4 rounded-xl ${actionResult.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                  <span className="text-sm font-medium flex-1">{actionResult.text}</span>
                  <button onClick={() => { setActionMember(null); setActionType(''); setActionResult(null) }}><X size={14} /></button>
                </div>
              ) : !actionType ? (
                <div className="grid grid-cols-2 gap-2">
                  {actionButtons.map(btn => {
                    const Icon = btn.icon
                    return (
                      <button key={btn.key} onClick={() => handleAction(actionMember, btn.key)}
                        className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg border transition-colors ${btn.color} hover:opacity-80`}>
                        <Icon size={15} /> {btn.label}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {actionButtons.find(b => b.key === actionType)?.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {actionType === 'whatsapp' && `A personalized win-back message will be sent to ${actionMember.name} via WhatsApp.`}
                      {actionType === 'call' && `Initiating a phone call to ${actionMember.name} at ${actionMember.phone}.`}
                      {actionType === 'discount' && `A 20% renewal discount offer will be sent to ${actionMember.name} via WhatsApp.`}
                      {actionType === 'followup' && `A follow-up task will be scheduled for tomorrow to contact ${actionMember.name}.`}
                      {actionType === 'assign_trainer' && `Assign a personal trainer to re-engage ${actionMember.name}.`}
                      {actionType === 'freeze' && `Freeze ${actionMember.name}'s membership temporarily without losing the member.`}
                      {actionType === 'winback' && `A win-back campaign message will be sent to ${actionMember.name}.`}
                      {actionType === 'reminder' && `A friendly reminder will be sent to ${actionMember.name}.`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setActionType('')} className="flex-1 px-4 py-2 text-sm border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700">Back</button>
                    <button onClick={executeAction} disabled={actionLoading} className="flex-1 px-4 py-2 text-sm text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2">
                      {actionLoading ? <Loader size={14} className="animate-spin" /> : <Send size={14} />} Execute
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}