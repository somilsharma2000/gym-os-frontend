import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Send, ChevronDown } from 'lucide-react'

type Msg = { role: 'user' | 'ai'; text: string }

const QUICK_PROMPTS = [
  'What membership plans do you offer?',
  'How do I book a free trial?',
  'What are your gym timings?',
  'Do you have personal trainers?',
  'What group classes are available?',
]

const RESPONSES: Record<string, string> = {
  plan: `We offer 3 membership plans:

💪 **Starter** — ₹3,500/month
Full gym access, QR check-in, mobile app

🔥 **Standard** — ₹4,000/month  
Full access + 4 group classes/month + fitness assessment

⚡ **Premium** — ₹4,500/month
Unlimited classes + 2 PT sessions + diet plan + priority booking

All plans include our mobile app with workout tracking. Annual plans get 2 months free!`,
  trial: `Booking a free trial is easy! 🎯

You get a **48-hour free trial pass** that includes:
• Full gym access
• 1 group class of your choice
• Fitness assessment with a certified trainer

Just visit the gym with a valid ID, or message us and we'll set it up. Your trial starts the moment you check in with your QR pass!`,
  timing: `Our gym is open:

📅 **Monday - Saturday:** 5:00 AM - 11:00 PM
📅 **Sunday:** 7:00 AM - 10:00 AM (Morning only)

Peak hours: 6-9 AM and 6-9 PM. For a quieter workout, try 11 AM - 4 PM!`,
  trainer: `Yes! We have certified personal trainers available 💪

Our trainers specialize in:
• Strength & conditioning
• Weight loss & transformation
• Functional training
• Sports-specific training

PT sessions start at ₹500/session. Package deals available — ask at the front desk for current offers!`,
  class: `We offer a variety of group classes:

🧘 Yoga & Meditation (Morning)
💪 HIIT & Bootcamp (Evening)
🚴 Spin Class (Morning + Evening)
🥊 Boxing/MMA (Evening)
💃 Zumba (Evening)

Classes are included in Standard and Premium plans. Starter plan members can join for ₹200/class. Check the schedule on our app!`,
  default: `Hi! I'm your gym's virtual assistant 🤖 I can help you with:

• Membership plans and pricing
• Free trial booking
• Gym timings and location
• Personal training info
• Group class schedules
• General questions

Just tap a question above or type your own!`,
}

function getResponse(input: string): string {
  const q = input.toLowerCase()
  if (q.includes('plan') || q.includes('membership') || q.includes('price') || q.includes('cost')) return RESPONSES.plan
  if (q.includes('trial') || q.includes('free') || q.includes('try')) return RESPONSES.trial
  if (q.includes('time') || q.includes('hour') || q.includes('open') || q.includes('timing')) return RESPONSES.timing
  if (q.includes('trainer') || q.includes('pt') || q.includes('personal')) return RESPONSES.trainer
  if (q.includes('class') || q.includes('group') || q.includes('yoga') || q.includes('zumba')) return RESPONSES.class
  return RESPONSES.default
}

export default function PublicAIAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([{ role: 'ai', text: "Welcome to our gym! 💪 I'm here to answer your questions about memberships, trials, classes, and more. How can I help?" }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  const send = (text: string) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: getResponse(text) }])
      setTyping(false)
    }, 600 + Math.random() * 500)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-medium shadow-xl hover:scale-105 transition-all"
      >
        <Sparkles size={22} />
        <span>Ask AI</span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] h-[480px] max-h-[calc(100vh-3rem)] flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-emerald-600">
        <div className="flex items-center gap-2.5">
          <Sparkles size={18} className="text-white" />
          <p className="text-sm font-semibold text-white">Gym Assistant</p>
        </div>
        <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors">
          <ChevronDown size={18} />
        </button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === 'user' ? 'flex justify-end' : 'flex'}>
            <div className={msg.role === 'user'
              ? 'max-w-[85%] px-3 py-2 rounded-xl rounded-br-sm bg-blue-600 text-white text-sm'
              : 'max-w-[90%] px-3 py-2 rounded-xl rounded-bl-sm bg-white border border-slate-200 text-slate-700 text-sm whitespace-pre-line shadow-sm'
            }>
              {msg.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex items-center gap-1.5 px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>
      {messages.length <= 2 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5 bg-slate-50">
          {QUICK_PROMPTS.map((p, i) => (
            <button key={i} onClick={() => send(p)} className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-xs text-slate-600 hover:text-blue-600 transition-colors">
              {p}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 px-3 py-3 border-t border-slate-200 bg-white">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="Type your question..." className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        <button onClick={() => send(input)} className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors">
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
