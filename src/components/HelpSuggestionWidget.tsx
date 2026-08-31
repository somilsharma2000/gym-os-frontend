import { useState } from 'react'
import { HelpCircle, X, Send, Loader2, CheckCircle2, Lightbulb, LifeBuoy } from 'lucide-react'

const API_BASE = 'https://base44.app/api/apps/6a700b150c8d8b8e923580a1/functions'

export default function HelpSuggestionWidget() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<'help' | 'suggestion'>('help')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (!message.trim()) return
    setSubmitting(true)
    try {
      const gymId = localStorage.getItem('gym_os_gym_id') || ''
      const gymName = localStorage.getItem('gym_os_gym_name') || ''
      await fetch(`${API_BASE}/submitHelpRequest`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, message, type, gym_id: gymId, gym_name: gymName })
      })
      setSent(true)
      setTimeout(() => { setOpen(false); setSent(false); setName(''); setContact(''); setMessage('') }, 2000)
    } catch {}
    setSubmitting(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/30 flex items-center justify-center text-white transition-all hover:scale-105"
        title="Help & Suggestions"
      >
        <HelpCircle size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-4 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-sm bg-[#131a26] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <LifeBuoy size={16} className="text-brand-400" /> Help & Suggestions
              </h3>
              <button onClick={() => setOpen(false)} className="p-1 text-slate-400 hover:text-white"><X size={18} /></button>
            </div>

            {sent ? (
              <div className="p-8 text-center">
                <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3" />
                <p className="text-sm text-white font-medium">Sent! We'll get back to you.</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                <div className="flex gap-2">
                  <button onClick={() => setType('help')} className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border ${type === 'help' ? 'bg-brand-600 text-white border-brand-600' : 'bg-transparent text-slate-400 border-slate-700'}`}>
                    <LifeBuoy size={13} /> Need Help
                  </button>
                  <button onClick={() => setType('suggestion')} className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border ${type === 'suggestion' ? 'bg-brand-600 text-white border-brand-600' : 'bg-transparent text-slate-400 border-slate-700'}`}>
                    <Lightbulb size={13} /> Suggestion
                  </button>
                </div>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name (optional)"
                  className="w-full px-3 py-2 bg-[#0a0e17] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500" />
                <input value={contact} onChange={e => setContact(e.target.value)} placeholder="Email or phone (optional)"
                  className="w-full px-3 py-2 bg-[#0a0e17] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500" />
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
                  placeholder={type === 'help' ? "What do you need help with?" : "What would you like to see improved?"}
                  className="w-full px-3 py-2 bg-[#0a0e17] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none" />
                <button onClick={handleSubmit} disabled={!message.trim() || submitting}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Send
                </button>
                <p className="text-[10px] text-slate-500 text-center">Goes straight to the Gym OS team — you'll hear back soon.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
