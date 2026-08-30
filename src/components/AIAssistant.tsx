import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Sparkles, X, Send, ChevronUp } from 'lucide-react'

const PAGE_GREETINGS: Record<string, { name: string; tips: string[] }> = {
  '/': { name: 'Dashboard', tips: ['Revenue summary', 'Member growth', 'Quick actions'] },
  '/leads': { name: 'Leads', tips: ['Follow-up script', 'Conversion tips', 'Lead scoring', 'WhatsApp template'] },
  '/members': { name: 'Members', tips: ['Retention tips', 'At-risk check', 'Re-engagement message'] },
  '/check-in': { name: 'Check-In', tips: ['QR setup', 'Attendance report', 'Peak hours'] },
  '/classes': { name: 'Classes', tips: ['Class promotion', 'Capacity tips', 'Schedule optimization'] },
  '/trainers': { name: 'Trainers', tips: ['Performance review', 'Assign members', 'Rating tips'] },
  '/revenue': { name: 'Revenue', tips: ['Upsell ideas', 'Pricing strategy', 'Revenue forecast'] },
  '/payments': { name: 'Payments', tips: ['Overdue follow-up', 'Payment methods', 'Receipt automation'] },
  '/analytics': { name: 'Analytics', tips: ['Conversion funnel', 'Retention rate', 'Growth metrics'] },
  '/whatsapp': { name: 'WhatsApp', tips: ['Broadcast tips', 'Auto-reply setup', 'Template messages'] },
  '/socials': { name: 'Social Media', tips: ['Content ideas', 'Best posting time', 'Engagement tips'] },
}

const RESPONSES: Record<string, string> = {
  'follow-up script': `**WhatsApp Follow-Up (send within 5 min):**\n"Hi {Name}! Your 48-hour trial pass is ready. Includes full gym access + body comp assessment. What day works best — Today or Tomorrow?"\n\n**Hour 4:** Call to confirm visit time.\n**Day 2:** Text with gym video walkthrough.`,
  'conversion tips': `**Trial-to-Paid Conversion:**\n1. Day 1: Baseline body comp test → show measurable goals\n2. Same-day closing: Waive enrollment fee if they join during trial\n3. Target 75%+ trial attendance — unattended trials convert <8%`,
  'lead scoring': `**Scoring:**\n• Hot (80-100): Booked trial + asked pricing → Call now\n• Warm (50-79): Submitted form → WhatsApp trial offer\n• Cold (<50): Social engagement → 5-day nurture sequence`,
  'whatsapp template': `**Re-engagement:**\n"Hi {Name}! We noticed your spot has been empty 💪 Come in this week for a free body composition analysis + PT tune-up. Reply YES to claim!"`,
  'retention tips': `**Retention Playbook:**\n1. 30-day check-in: Automated WhatsApp + free PT advice\n2. Milestone rewards: 25th, 50th, 100th check-in → shake voucher\n3. Monthly challenges: 30-day attendance challenge (28% higher retention)`,
  'at-risk check': `**At-Risk Protocol:**\n• 0 visits in 7 days = red flag\n• Send: "Missed you! Everything okay? Free PT session waiting"\n• Call members inactive 14+ days (41% recovery rate)`,
  're-engagement message': `"Hi {Name}! Your spot has been empty for a few days 💪 Come in this week — free body comp analysis + PT tune-up. Reply YES to claim!"`,
  'revenue summary': `Key metrics to track:\n• MRR (Monthly Recurring Revenue)\n• Trial-to-member conversion rate\n• Average revenue per member\n• Churn rate\n\nAll available on your Dashboard.`,
  'member growth': `Growth levers:\n• Referral program (2x conversion vs ads)\n• Corporate partnerships (5+ seat deals)\n• Social proof (member transformations)\n• Trial-to-member funnel optimization`,
  'quick actions': `Quick actions available:\n• Add new lead\n• Create trial pass\n• Record payment\n• Schedule follow-up\n• Send WhatsApp broadcast`,
}

function getResponse(text: string, pageName: string): string {
  const lower = text.toLowerCase()
  for (const [key, value] of Object.entries(RESPONSES)) {
    if (lower.includes(key.split(' ')[0]) || lower.includes(key)) return value
  }
  return `I'm your Gym OS assistant for ${pageName}. I can help with follow-up scripts, conversion tips, retention strategies, and more. Try one of the suggested topics above, or ask me anything about managing your gym.`
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const location = useLocation()
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const pageKey = PAGE_GREETINGS[location.pathname] ? location.pathname : '/'
  const pageData = PAGE_GREETINGS[pageKey]

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  useEffect(() => {
    setOpen(false)
    setMessages([])
  }, [location.pathname])

  const send = (text: string) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: getResponse(text, pageData.name) }])
    }, 300)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open Gym OS Assistant"
        className="fixed bottom-4 right-4 z-50 w-11 h-11 rounded-full bg-[#0066FF] text-white flex items-center justify-center shadow-lg shadow-[#0066FF]/30 hover:scale-105 active:scale-95 transition-all"
      >
        <Sparkles className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 max-w-[calc(100vw-2rem)] flex flex-col rounded-xl overflow-hidden bg-[#0F1535] border border-slate-800 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-[#0F1535] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#0066FF] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white leading-tight">Gym OS</h3>
            <p className="text-[9px] text-slate-400 leading-tight">{pageData.name} context</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => { setOpen(false); setMessages([]) }} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <ChevronUp className="w-4 h-4" />
          </button>
          <button onClick={() => { setOpen(false); setMessages([]) }} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2.5 space-y-2 max-h-48 min-h-[60px]">
        {messages.length === 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] text-slate-400">Quick suggestions:</p>
            <div className="flex flex-wrap gap-1.5">
              {pageData.tips.map(tip => (
                <button key={tip} onClick={() => send(tip)} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-[10px] font-medium transition-colors">
                  {tip}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-2.5 py-1.5 rounded-lg text-[11px] leading-relaxed whitespace-pre-wrap ${
              m.role === 'user' ? 'bg-[#0066FF] text-white' : 'bg-slate-800 text-slate-200'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-1.5 px-2.5 py-2 border-t border-slate-800 bg-[#0A0E27]">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
          placeholder="Ask Gym OS..."
          className="flex-1 bg-transparent text-white text-xs placeholder-slate-500 outline-none"
        />
        <button onClick={() => send(input)} className="p-1.5 bg-[#0066FF] hover:bg-[#0052cc] text-white rounded-lg">
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
