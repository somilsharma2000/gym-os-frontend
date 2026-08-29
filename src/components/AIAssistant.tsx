import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Send, Copy, Check, MessageCircle, TrendingUp, Users, AlertTriangle, Zap, ChevronDown } from 'lucide-react'

type Msg = { role: 'user' | 'ai'; text: string; actions?: { label: string; icon: string }[] }

const QUICK_PROMPTS = [
  { icon: TrendingUp, label: 'How do I increase revenue?', color: 'text-emerald-400' },
  { icon: MessageCircle, label: 'Generate a WhatsApp broadcast', color: 'text-blue-400' },
  { icon: Users, label: 'Write a follow-up message', color: 'text-purple-400' },
  { icon: AlertTriangle, label: 'Which members are at risk?', color: 'text-amber-400' },
  { icon: Zap, label: 'How to improve retention?', color: 'text-orange-400' },
]

const RESPONSES: Record<string, string> = {
  revenue: `Here are 5 proven ways to increase your gym's revenue right now:

1. **Renewal Recovery** — You likely have members whose memberships expired in the last 30-90 days. Send them a "We miss you" WhatsApp message with a 10% renewal discount. Recovery rate is typically 15-25%.

2. **PT Upsell** — Identify members who attend 4+ times/week but don't have a personal trainer. Pitch a "Transformation Package" — 12 sessions for ₹X. High-intent members convert at 20-30%.

3. **Referral Engine** — Launch a "Bring a Friend" program: existing members get 1 month free for every friend who joins. Zero acquisition cost, highest LTV members.

4. **Class Premium Tier** — Add a premium group class (HIIT, Yoga Flow) with limited spots at ₹500/session. Creates urgency and FOMO.

5. **Annual Plan Push** — Offer 2 months free on annual plans vs monthly. Immediate cash injection + locks in retention.`,
  broadcast: `Here's a ready-to-send WhatsApp broadcast for expired members:

---
🔥 *{Gym Name} Misses You, {Member Name}!*

It's been {X days} since your membership expired, and we've noticed your spot on the floor has been empty! 

We've got something special for you — come back this week and get **15% off your renewal** + a complimentary PT session worth ₹1500.

⏰ *This offer expires in 48 hours.*

Reply "BACK" to claim your spot or click here: [link]

See you soon! 💪
---

💡 Tips for better results:
• Personalize with the member's name
• Mention how many days since they last visited
• Keep the 48-hour urgency — it drives 3x more responses
• Send between 10 AM - 12 PM for best open rates`,
  'follow-up': `Here are 3 follow-up message templates based on lead stage:

**1. New Lead (within 24 hours):**
"Hi {Name}! Thanks for your interest in {Gym Name} 💪 When would be a good time for you to visit for a free trial? We have slots open this week — just reply with a day that works for you!"

**2. No Response (Day 3):**
"Hey {Name}, just checking in! We'd love to show you around the gym. Here's what you get with your free trial: full gym access + 1 group class + fitness assessment. Worth a visit? 😊"

**3. Visited but not joined (Day 7):**
"Hi {Name}! Hope you enjoyed your trial at {Gym Name}. We noticed you haven't enrolled yet — is there anything holding you back? We have a special offer this month: join now and get your first month at 20% off. Let me know! 🙌"`,
  'at-risk': `Based on your gym's data, here's how to identify at-risk members:

**Red Flags (Immediate Action):**
• Members who haven't checked in for 7+ days
• Members whose membership expires in 30 days and haven't renewed
• Members who reduced visit frequency from 4x/week to 1x/week

**Recommended Actions:**
1. Send a personalized WhatsApp: "Hey {Name}, we miss seeing you at the gym! Everything okay? Here's a free PT session to get you back on track 💪"
2. Call members who haven't visited in 14+ days — a personal call has 40% re-engagement rate
3. Offer a "Come Back" incentive: 1 week free extension for returning

**Automation Tip:** You can set up automatic at-risk alerts in Settings → Automations. Members crossing the 7-day no-visit threshold will trigger a WhatsApp alert to you automatically.`,
  retention: `Here's your member retention playbook:

**Week 1-2 (Onboarding):**
• Welcome WhatsApp message with gym rules + class schedule
• Assign a "gym buddy" or trainer intro session
• Goal-setting conversation (helps with commitment)

**Month 1-3 (Habit Building):**
• Monthly check-in message asking how their progress is going
• Invite to a group class (social bonds = retention)
• Celebrate milestones (10th visit, 1 month, first weight loss)

**Month 3-6 (Value Reinforcement):**
• Progress report with before/after metrics
• Upgrade pitch (PT sessions, premium classes)
• Referral program invitation

**Month 6-12 (Pre-Renewal):**
• Send renewal reminder 30 days before expiry
• Offer loyalty discount for early renewal
• Share transformation stories from other members

**Automation:** Set up auto-renewal reminders in Settings to notify members 3, 7, and 14 days before expiry automatically.`,
  default: `I'm your AI gym management assistant! I can help you with:

📊 **Revenue Growth** — strategies to boost your monthly income
📱 **WhatsApp Broadcasts** — ready-to-send message templates
👥 **Member Retention** — proven retention playbooks
🎯 **Lead Conversion** — follow-up message templates
⚠️ **At-Risk Members** — identification and recovery strategies
💪 **PT Upsell** — how to sell personal training to members

Just tap one of the quick prompts above, or type your question!`,
}

function getResponse(input: string): string {
  const q = input.toLowerCase()
  if (q.includes('revenue') || q.includes('income') || q.includes('earn') || q.includes('money')) return RESPONSES.revenue
  if (q.includes('broadcast') || q.includes('blast') || q.includes('mass message')) return RESPONSES.broadcast
  if (q.includes('follow') || q.includes('lead') || q.includes('message template')) return RESPONSES['follow-up']
  if (q.includes('risk') || q.includes('churn') || q.includes('leaving')) return RESPONSES['at-risk']
  if (q.includes('retention') || q.includes('retain') || q.includes('keep member')) return RESPONSES.retention
  return RESPONSES.default
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([{ role: 'ai', text: "Hey! I'm your Gym OS AI Assistant 💡 I can help you grow revenue, retain members, write WhatsApp messages, and more. Tap a suggestion below or ask me anything!" }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  const send = (text: string) => {
    if (!text.trim()) return
    const userMsg: Msg = { role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      const aiMsg: Msg = { role: 'ai', text: getResponse(text) }
      setMessages(prev => [...prev, aiMsg])
      setTyping(false)
    }, 800 + Math.random() * 600)
  }

  const copyMsg = (idx: number, text: string) => {
    navigator.clipboard.writeText(text.replace(/\*\*/g, '').replace(/---/g, '\n'))
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-medium shadow-xl shadow-emerald-600/30 hover:scale-105 transition-all group"
      >
        <Sparkles size={22} className="group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline">AI Assistant</span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[520px] max-h-[calc(100vh-3rem)] flex flex-col rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border-b border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Gym OS AI Assistant</p>
            <p className="text-[10px] text-slate-400">Your growth co-pilot</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
          <ChevronDown size={18} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === 'user' ? 'flex justify-end' : 'flex flex-col gap-1'}>
            <div className={msg.role === 'user'
              ? 'max-w-[85%] px-3 py-2 rounded-xl rounded-br-sm bg-emerald-600 text-white text-sm'
              : 'max-w-[90%] px-3 py-2 rounded-xl rounded-bl-sm bg-slate-800 text-slate-100 text-sm whitespace-pre-line'
            }>
              {msg.text}
            </div>
            {msg.role === 'ai' && idx > 0 && (
              <div className="flex gap-2 ml-1">
                <button onClick={() => copyMsg(idx, msg.text)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-400 transition-colors">
                  {copied === idx ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  {copied === idx ? 'Copied!' : 'Copy'}
                </button>
                <button className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-400 transition-colors">
                  <MessageCircle size={12} /> Send via WhatsApp
                </button>
              </div>
            )}
          </div>
        ))}
        {typing && (
          <div className="flex items-center gap-1.5 px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* Quick prompts (show when few messages) */}
      {messages.length <= 2 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((p, i) => {
            const Icon = p.icon
            return (
              <button key={i} onClick={() => send(p.label)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs ${p.color} transition-colors`}>
                <Icon size={12} /> {p.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-3 border-t border-slate-700">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="Ask me anything..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <button onClick={() => send(input)} className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
