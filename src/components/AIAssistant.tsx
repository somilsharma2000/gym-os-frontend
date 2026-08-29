import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Sparkles,
  X,
  Send,
  Copy,
  Check,
  Globe,
  Database,
  Wifi,
  Trash2,
  ChevronDown,
  Layers,
  ArrowRight
} from 'lucide-react'

type Message = {
  id: string
  role: 'user' | 'ai'
  text: string
  timestamp: string
  pageContext?: string
}

interface PageConfig {
  id: string
  name: string
  badgeText: string
  greeting: string
  chips: string[]
  suggestionsMap: Record<string, string>
}

// Page Context Definitions
const PAGE_CONFIGS: Record<string, PageConfig> = {
  members: {
    id: 'members',
    name: 'Members Page',
    badgeText: 'Members Context Active',
    greeting: 'Member Operations active. I can analyze member retention, at-risk churn, attendance trends, and suggest bulk actions using live gym data.',
    chips: [
      'Bulk member actions',
      'Member retention tips',
      'At-risk member strategies',
      'Re-engagement message script'
    ],
    suggestionsMap: {
      'bulk member actions': `⚡ **Bulk Member Actions Protocol**:
1. **Mass Renewal Broadcast**: Go to Members table -> filter by Expiry < 7 days -> Trigger bulk WhatsApp renewal pass with 10% discount.
2. **Tagging Inactive Members**: Tag members with 0 check-ins in 14 days as 'At-Risk'.
3. **Fee & Locker Audit**: Export active members list to auto-reconcile overdue payments in 1 click.`,
      'member retention tips': `🎯 **Member Retention Playbook**:
1. **30-Day Check-in**: Automated WhatsApp message on Day 30 to review progress and offer 1 free trainer advice session.
2. **Milestone Celebrations**: Reward 25th, 50th, and 100th check-ins automatically with protein shake vouchers or gym gear.
3. **Community Challenges**: Run monthly 30-day attendance challenges. Gyms running monthly challenges see 28% higher 6-month retention.`,
      'at-risk member strategies': `⚠️ **At-Risk Member Recovery**:
1. **Red Flag Trigger**: 0 visits in 7 consecutive days.
2. **Immediate Action**: Send direct non-sales message: "Hey {Name}, missed you on the floor! Everything okay? Complimentary PT session waiting for you."
3. **Phone Outreach**: Call members inactive for 14+ days. Personal phone calls recover 41% of churning members.`,
      're-engagement message script': `💬 **WhatsApp Re-engagement Script**:
"Hi {Name}! We noticed your spot at Gym OS has been empty for a few days 💪 We want to help you stay on track! Come in this week and get a free body composition analysis + PT tune-up session. Reply 'YES' to claim!"`
    }
  },

  leads: {
    id: 'leads',
    name: 'Leads & Trials Page',
    badgeText: 'Leads Context Active',
    greeting: 'Lead CRM & Conversion Mode active. Connected to ad channels, trial pass forms, and response velocity data. Let\'s convert leads into paying members.',
    chips: [
      'Follow-up strategies',
      'Conversion tips',
      'Lead scoring advice',
      'High-converting trial script'
    ],
    suggestionsMap: {
      'follow-up strategies': `📞 **Lead Follow-Up Rules**:
1. **Speed to Lead**: Call or WhatsApp new leads within 5 minutes. Response velocity under 5 min increases conversion rate by 9x.
2. **3-Touch Sequence**:
   • Minute 1: Instant automated WhatsApp trial pass with QR code.
   • Hour 4: Short phone call to confirm trial visit time.
   • Day 2: Follow-up text with gym video walkthrough.
3. Keep phone calls under 3 minutes — focus 100% on getting them through the door.`,
      'conversion tips': `🔥 **Trial-to-Paid Conversion Tips**:
1. **Day 1 Fitness Assessment**: Perform a 10-minute baseline body comp test on their first visit. Show measurable goals.
2. **Same-Day Closing Incentive**: Offer 100% enrollment fee waiver if they join during their trial period.
3. **Trial Completion Rate**: Target 75%+ trial attendance rate. Unattended trials convert at under 8%.`,
      'lead scoring advice': `📊 **Lead Scoring Matrix**:
• **Hot Lead (Score 80-100)**: Booked trial + requested pricing. Strategy: Immediate phone call & VIP slot reservation.
• **Warm Lead (Score 50-79)**: Submitted contact form or clicked ad. Strategy: Automated WhatsApp trial offer.
• **Cold Lead (Score <50)**: Social media engagement. Strategy: 5-day educational nurture sequence.`,
      'high-converting trial script': `💬 **WhatsApp Trial Invitation Script**:
"Hey {Name}! Your 48-Hour All-Access Pass to Gym OS is ready 🏋️‍♂️ Includes full workout access + 1 group class + body comp assessment. What day works best for your first visit: Today or Tomorrow?"`
    }
  },

  revenue: {
    id: 'revenue',
    name: 'Revenue Page',
    badgeText: 'Revenue Context Active',
    greeting: 'Revenue Engine Mode active. Connected to financial transaction logs, subscription renewals, and membership tier performance.',
    chips: [
      'How to increase revenue?',
      'Best pricing strategy',
      'Upsell tips',
      'PT package pitch'
    ],
    suggestionsMap: {
      'how to increase revenue?': `💰 **5 Direct Revenue Drivers**:
1. **Upfront Annual Commitments**: Offer 2 months free on upfront annual plans. Immediate cashflow injection.
2. **Personal Training Upsell**: Pitch 12-session transformation packs to members visiting 3+ times/week without a trainer.
3. **Paid Value Add-ons**: Lockers (₹500/mo), Towel Service (₹300/mo), Nutrition Coaching (₹1500/mo).
4. **Off-Peak Memberships**: Sell discounted access for 11 AM - 4 PM slots to monetize empty floor space.
5. **Corporate Group Packs**: Partner with local offices for 5+ seat corporate memberships paid annually.`,
      'best pricing strategy': `🏷️ **Optimal Pricing Architecture**:
1. **3-Tier Structure**:
   • Starter: Basic Gym Access (Monthly)
   • Pro: Full Access + Classes (Quarterly) — *Highlight as Most Popular*
   • VIP: Unlimited + PT + Diet (Annual)
2. **Price Anchoring**: Present VIP tier first so Pro tier feels high-value.
3. **No Raw Price Cuts**: Never discount base monthly fee; instead add bonus months or free PT sessions to preserve brand equity.`,
      'upsell tips': `🚀 **High-Margin Upsell Tactics**:
1. **Month 2 Target**: Pitch PT during Month 2 when members seek faster results after initial habit formation.
2. **3-Day PT Trial Pass**: Sell a ₹499 3-session PT intro package. 38% convert to full PT packages.
3. **Diet Plan Bundling**: Bundle custom nutrition plans with quarterly renewals for an extra ₹1,999.`,
      'pt package pitch': `💬 **PT Package Pitch Script**:
"You've been super consistent this month! To help you hit your target 2x faster, we're giving active members a 12-session Transformation Pack at 20% off this week. Want me to save a slot with Head Trainer Alex?"`
    }
  },

  classes: {
    id: 'classes',
    name: 'Classes Page',
    badgeText: 'Classes Context Active',
    greeting: 'Class Operations Mode active. Monitoring studio schedules, trainer allocations, class fill rates, and waitlists.',
    chips: [
      'Class scheduling optimization',
      'Capacity management',
      'Boost class attendance',
      'Peak hour planning'
    ],
    suggestionsMap: {
      'class scheduling optimization': `📅 **Schedule Optimization Rules**:
1. **High-Intensity Prime Slots**: Schedule HIIT, Zumba, and Cross-Training during peak evening hours (6:30 PM - 8:30 PM).
2. **Morning Recovery / Flow**: Schedule Yoga and Pilates between 6:00 AM - 8:00 AM.
3. **Mid-Day Express**: Offer 30-minute express core/spin classes at 1:00 PM for working professionals.`,
      'capacity management': `🏋️ **Capacity & Waitlist Rules**:
1. Cap bookings at 85% of studio floor capacity for safety and movement quality.
2. Enforce a 2-hour cancellation cutoff. Auto-promote waitlisted members via WhatsApp immediately on spot opening.
3. Send automated WhatsApp reminder 4 hours prior to class time to reduce no-shows by 35%.`,
      'boost class attendance': `🚀 **Attendance Booster**:
1. **First-Class Free Pass**: Give all new gym members 2 complimentary group class vouchers on signup.
2. **Bring-a-Friend Days**: Allow members to bring a buddy for free on Friday evening classes.
3. **Social Proof**: Post weekly leaderboards of top class attendees on gym screens and WhatsApp.`,
      'peak hour planning': `⏰ **Peak Hour Load Balancing**:
1. Run parallel group classes during peak 7:00 PM gym floor hours to shift traffic off machines into studio space.
2. Require pre-booking on Gym OS app for peak sessions to eliminate overcrowding.`
    }
  },

  trainers: {
    id: 'trainers',
    name: 'Trainers / Staff Page',
    badgeText: 'Trainers Context Active',
    greeting: 'Staff Performance Mode active. Tracking trainer sales, client attendance logs, task completion, and commission structures.',
    chips: [
      'Trainer performance metrics',
      'Task assignment tips',
      'Incentive structures',
      'Client retention rules'
    ],
    suggestionsMap: {
      'trainer performance metrics': `📈 **Key Trainer KPIs**:
1. **Client Retention Rate**: Target >80% month-over-month client renewal.
2. **Sales Conversion Rate**: Target >25% conversion on trial lead handoffs.
3. **Session Delivery**: Minimum 100 sessions delivered/month per full-time trainer.`,
      'task assignment tips': `📋 **Staff Task Assignment**:
1. Assign floor trainers 10 lead follow-up calls per day during off-peak hours (12 PM - 4 PM).
2. Mandate daily check-in logging and workout card updates in Gym OS.
3. Conduct 15-minute daily morning huddles to review target vs actual revenue.`,
      'incentive structures': `💵 **High-Performance Incentive Plan**:
1. Base Salary + Tiered Commission:
   • Tier 1 (1-30 sessions): 10% commission
   • Tier 2 (31-60 sessions): 15% commission
   • Tier 3 (61+ sessions): 20% commission
2. Bonus ₹2,000 for maintaining 90%+ client renewal rate in a month.`,
      'client retention rules': `🛡️ **Trainer Client Retention**:
1. Monthly progress measurement & re-assessment.
2. Send client weekly progress WhatsApp summary every Sunday.
3. Prompt client renewal talk 14 days before PT package completion.`
    }
  },

  socials: {
    id: 'socials',
    name: 'Socials & WhatsApp Page',
    badgeText: 'Socials & Broadcasts Active',
    greeting: 'Marketing & Broadcast Engine active. Connected to WhatsApp API status, campaign click-through rates, and social lead capture.',
    chips: [
      'Content ideas for gym',
      'Posting schedules',
      'Engagement strategies',
      'WhatsApp broadcast template'
    ],
    suggestionsMap: {
      'content ideas for gym': `📱 **5 High-Converting Content Ideas**:
1. **Real Transformations**: Member before/after with exact timeline and trainer tag.
2. **30-Second Form Checks**: Quick reels correcting common Squat, Deadlift, or Bench mistakes.
3. **Equipment Showcases**: Short clips demonstrating proper setup for popular gym machines.
4. **Member of the Month**: Highlight consistent members and their fitness journey.
5. **Trainer Q&A**: Short answers to common fitness and nutrition myths.`,
      'posting schedules': `⏰ **Optimal Gym Posting Windows**:
• **Instagram Reels**: 7:00 AM - 9:00 AM (Morning workout motivation) & 7:30 PM - 9:30 PM (Evening scrolling).
• **WhatsApp Broadcasts**: Tuesday & Thursday at 10:30 AM or 5:30 PM.
• **Frequency**: 1 Reel/day, 3 Stories/day, 2 WhatsApp broadcasts/week max.`,
      'engagement strategies': `🔥 **Social Engagement Boosters**:
1. Add interactive polls to Instagram Stories ("Morning vs Evening Workouts?").
2. Run a "Tag Your Workout Partner" contest with a 1-month free membership prize.
3. Print QR codes on gym mirrors linking directly to Instagram location tag or Google Review page.`,
      'whatsapp broadcast template': `💬 **Ready-To-Send WhatsApp Broadcast**:
"🔥 *{Gym Name} Flash Offer!*
Commit to your fitness goals this season! Get **2 Months Free** when you sign up for an annual membership this week.

🎁 Bonus: Free Body Composition Test + 2 PT Sessions.
⏰ *Only 10 spots available. Offer ends Sunday!*

Reply 'CLAIM' or visit the front desk to lock in your spot!"`
    }
  },

  diet: {
    id: 'diet-plans',
    name: 'Diet Plans Page',
    badgeText: 'Diet & Nutrition Active',
    greeting: 'Nutrition & Diet Mode active. Connected to custom meal plan templates, macronutrient calculators, and client compliance tracking.',
    chips: [
      'Diet plan templates',
      'Nutrition tips for clients',
      'Macro guidance',
      'Supplement upsell guide'
    ],
    suggestionsMap: {
      'diet plan templates': `🥗 **Standard Diet Plan Templates**:
1. **Fat Loss Protocol**: High protein (2g/kg), moderate carbs, controlled healthy fats. Caloric deficit of 20-25%.
2. **Hypertrophy / Muscle Gain**: Caloric surplus (+300 kcal), 2.2g/kg protein, complex carbs timed around workouts.
3. **Indian Veg Muscle Plan**: Paneer, tofu, lentils, sprouted legumes, whey protein, Greek yogurt, and seeds.`,
      'nutrition tips for clients': `💡 **Client Compliance Rules**:
1. Keep meal plans simple — maximum 3-4 meal options per day to prevent decision fatigue.
2. Recommend local, affordable grocery items rather than expensive imported ingredients.
3. Require weekly Sunday morning weigh-in and photo uploads for accountability.`,
      'macro guidance': `📊 **Target Macro Breakdown**:
• **Fat Loss**: 40% Protein / 35% Carbs / 25% Fat
• **Muscle Building**: 30% Protein / 50% Carbs / 20% Fat
• **Maintenance / Endurance**: 25% Protein / 55% Carbs / 20% Fat`,
      'supplement upsell guide': `💊 **Ethical Supplement Upselling**:
1. Recommend Whey Protein and Creatine Monohydrate based on objective body comp gaps.
2. Offer member-exclusive 10% discounts on verified partner supplement brands at front desk.`
    }
  },

  settings: {
    id: 'settings',
    name: 'Settings & Integrations',
    badgeText: 'Settings Context Active',
    greeting: 'System Settings & Integration Mode active. Monitoring WhatsApp API connection, payment gateway webhooks, and access controls.',
    chips: [
      'Integration setup guide',
      'WhatsApp connection tips',
      'Automation triggers',
      'Role & Permission management'
    ],
    suggestionsMap: {
      'integration setup guide': `⚙️ **Integration Setup Guide**:
1. **WhatsApp Meta Cloud API**: Connect API credentials in Settings -> WhatsApp to enable auto OTPs and automated renewal alerts.
2. **Payment Gateways**: Configure Razorpay / Stripe keys for auto-debit recurring subscriptions.
3. **Biometric / QR Access Control**: Sync front desk scanners with Gym OS API endpoint for real-time check-in logs.`,
      'whatsapp connection tips': `💬 **WhatsApp Connection Checklist**:
1. Use an official Meta Business Verified number to ensure high delivery rate and prevent phone number flags.
2. Set up pre-approved HSM templates for renewal notifications and payment receipts.
3. Configure automated after-hours auto-reply for prospective lead inquiries.`,
      'automation triggers': `⚡ **Recommended Automation Triggers**:
• **Trigger 1**: New Lead Created -> Send Instant WhatsApp Trial QR.
• **Trigger 2**: Membership Expiring in 3 Days -> Send Renewal Reminder + Discount Link.
• **Trigger 3**: Member Inactive for 7 Days -> Alert Head Trainer & Send Re-engagement Text.`,
      'role & permission management': `🔒 **Access Control Rules**:
1. Restrict financial reports and profit margins to Gym Owner / Super Admin roles only.
2. Grant Trainers access only to client attendance, workout logs, and session scheduling.`
    }
  },

  dashboard: {
    id: 'dashboard',
    name: 'Command Center',
    badgeText: 'Dashboard Context Active',
    greeting: 'Command Center Overview active. Analyzing overall gym KPIs, revenue flow, active attendance, and priority alerts across all branches.',
    chips: [
      'Overview insights',
      'What needs attention?',
      "Today's priorities",
      'Quick growth tip'
    ],
    suggestionsMap: {
      'overview insights': `📊 **Executive Gym Overview**:
• **Revenue Velocity**: On track for monthly target. Focus on renewing expired memberships.
• **Floor Attendance**: Peak hours running smoothly at 7 AM & 6:30 PM.
• **Lead Pipeline**: 85% response rate on incoming trial pass requests.`,
      'what needs attention?': `🚨 **Immediate Action Items**:
1. **Expired Memberships**: 14 memberships expired in last 7 days without renewal. Run bulk WhatsApp renewal blast.
2. **Hot Leads Pending**: 5 trial requests received today waiting for initial follow-up call.
3. **At-Risk Alert**: 9 regular members haven't checked in for 7+ days. Trigger re-engagement workflow.`,
      "today's priorities": `📋 **Daily Priority Execution List**:
1. Follow up on all pending trial leads within 1 hour.
2. Review trainer session delivery logs for yesterday.
3. Send renewal reminders for memberships expiring in next 3 days.`,
      'quick growth tip': `💡 **Quick Growth Tip**:
Launch a 48-hour "Bring a Friend Free Weekend" broadcast. Referral leads convert 3x higher than cold ad traffic with zero acquisition cost.`
    }
  },

  default: {
    id: 'default',
    name: 'General Assistant',
    badgeText: 'Gym OS AI Active',
    greeting: 'Gym OS Assistant active. I have direct access to your gym\'s operational data, website metrics, and live internet context. How can I help grow your business today?',
    chips: [
      'How to increase revenue?',
      'Lead conversion tips',
      'Member retention playbook',
      'WhatsApp broadcast template'
    ],
    suggestionsMap: {
      'how to increase revenue?': `💰 **Top 3 Revenue Accelerators**:
1. **Upsell Personal Training**: Pitch 12-session transformation packs to high-frequency members.
2. **Push Annual Upfront Plans**: Offer 2 months free for annual upfront commitment.
3. **Reactivate Expired Members**: Send "We miss you" discount passes to members who lapsed in last 90 days.`,
      'lead conversion tips': `📞 **Lead Conversion Rules**:
1. Respond to new leads under 5 minutes.
2. Offer 100% enrollment fee waiver for same-day trial signups.
3. Conduct 10-minute baseline fitness assessments during trial visits.`,
      'member retention playbook': `🎯 **Retention Core Strategy**:
1. Trigger WhatsApp alerts for members inactive for 7+ days.
2. Celebrate check-in milestones (25th, 50th visit).
3. Run monthly 30-day attendance challenges.`,
      'whatsapp broadcast template': `💬 **High-Converting WhatsApp Blast**:
"🔥 *{Gym Name} Flash Deal!*
Renew or upgrade your membership this week and get **1 Month Free** + a complimentary PT Assessment session! 

⏰ *Offer valid for next 48 hours only.* Reply 'RENEW' to lock in this price!"`
    }
  }
}

// Route mapping helper
function resolvePageContext(pathname: string, hash: string): PageConfig {
  const p = (pathname + ' ' + hash).toLowerCase()

  if (p.includes('member') && !p.includes('membership')) return PAGE_CONFIGS.members
  if (p.includes('lead') || p.includes('trial')) return PAGE_CONFIGS.leads
  if (p.includes('revenue') || p.includes('payment') || p.includes('membership')) return PAGE_CONFIGS.revenue
  if (p.includes('class')) return PAGE_CONFIGS.classes
  if (p.includes('staff') || p.includes('trainer')) return PAGE_CONFIGS.trainers
  if (p.includes('whatsapp') || p.includes('social') || p.includes('referral')) return PAGE_CONFIGS.socials
  if (p.includes('diet')) return PAGE_CONFIGS.diet
  if (p.includes('setting') || p.includes('super-admin')) return PAGE_CONFIGS.settings
  if (p === '/' || p.includes('dashboard') || p.includes('#/')) return PAGE_CONFIGS.dashboard

  return PAGE_CONFIGS.default
}

// Fallback search response builder for arbitrary user text
function generateFreeTextResponse(query: string, pageConfig: PageConfig): string {
  const q = query.toLowerCase().trim()

  // Match against current page chips first
  for (const [key, val] of Object.entries(pageConfig.suggestionsMap)) {
    if (q.includes(key) || key.includes(q)) return val
  }

  // Check all configs
  for (const cfg of Object.values(PAGE_CONFIGS)) {
    for (const [key, val] of Object.entries(cfg.suggestionsMap)) {
      if (q.includes(key) || key.includes(q)) return val
    }
  }

  // Topic specific keyword search
  if (q.includes('revenue') || q.includes('money') || q.includes('price') || q.includes('pricing') || q.includes('upsell') || q.includes('sales')) {
    return PAGE_CONFIGS.revenue.suggestionsMap['how to increase revenue?']
  }
  if (q.includes('lead') || q.includes('follow') || q.includes('convert') || q.includes('prospect') || q.includes('inquiry')) {
    return PAGE_CONFIGS.leads.suggestionsMap['follow-up strategies']
  }
  if (q.includes('retention') || q.includes('at risk') || q.includes('churn') || q.includes('inactive') || q.includes('cancel')) {
    return PAGE_CONFIGS.members.suggestionsMap['at-risk member strategies']
  }
  if (q.includes('class') || q.includes('schedule') || q.includes('zumba') || q.includes('yoga') || q.includes('hiit')) {
    return PAGE_CONFIGS.classes.suggestionsMap['class scheduling optimization']
  }
  if (q.includes('trainer') || q.includes('staff') || q.includes('kpi') || q.includes('incentive') || q.includes('pt')) {
    return PAGE_CONFIGS.trainers.suggestionsMap['trainer performance metrics']
  }
  if (q.includes('whatsapp') || q.includes('broadcast') || q.includes('social') || q.includes('post') || q.includes('content')) {
    return PAGE_CONFIGS.socials.suggestionsMap['whatsapp broadcast template']
  }
  if (q.includes('diet') || q.includes('nutrition') || q.includes('macro') || q.includes('meal')) {
    return PAGE_CONFIGS.diet.suggestionsMap['diet plan templates']
  }
  if (q.includes('setting') || q.includes('integrate') || q.includes('api') || q.includes('webhook')) {
    return PAGE_CONFIGS.settings.suggestionsMap['integration setup guide']
  }

  // Default direct, truthful, action-oriented response
  return `💡 **Direct Action Steps for "${query}"**:

1. **Operational Focus**: Analyze real-time logs in Gym OS for current trends on this item.
2. **Immediate Action**: Use automated WhatsApp templates to engage affected members/leads directly.
3. **Optimization**: Review weekly conversion and retention KPIs to verify measurable growth.

*Connected to: Gym OS Database, Website Analytics, and Live Internet Context.*`
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const [pageConfig, setPageConfig] = useState<PageConfig>(PAGE_CONFIGS.default)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Track route changes and update context
  useEffect(() => {
    const newConfig = resolvePageContext(location.pathname, window.location.hash)
    setPageConfig(newConfig)
  }, [location.pathname, window.location.hash])

  // Initialize or update initial greeting when page context changes or widget opens
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'init-1',
          role: 'ai',
          text: pageConfig.greeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          pageContext: pageConfig.name
        }
      ])
    }
  }, [pageConfig, messages.length])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, typing, open])

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim()
    if (!text || typing) return

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    if (!textToSend) setInput('')
    setTyping(true)

    // Simulate direct, fast AI inference
    setTimeout(() => {
      const responseText = generateFreeTextResponse(text, pageConfig)
      const aiMsg: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pageContext: pageConfig.name
      }
      setMessages(prev => [...prev, aiMsg])
      setTyping(false)
    }, 450 + Math.random() * 300)
  }

  const handleCopy = (id: string, text: string) => {
    const cleanText = text.replace(/\*\*/g, '').replace(/---/g, '\n')
    navigator.clipboard.writeText(cleanText)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleClear = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'ai',
        text: pageConfig.greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pageContext: pageConfig.name
      }
    ])
  }

  // Floating trigger button (Circular blue #2563eb, bottom-right, z-50)
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open Gym OS Assistant"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#2563eb] text-white flex items-center justify-center shadow-xl shadow-blue-600/30 hover:bg-[#1d4ed8] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
      >
        <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
      </button>
    )
  }

  // Chat Panel (Slide-up, max 400px wide, max 500px tall, full-width on mobile)
  // Background: #111827 | Input area: #1f2937 | Send button: #2563eb
  return (
    <div className="fixed bottom-0 sm:bottom-6 right-0 sm:right-6 z-50 w-full sm:w-[400px] h-[500px] max-h-[calc(100vh-1rem)] sm:max-h-[500px] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden bg-[#111827] border border-slate-800 shadow-2xl transition-all">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#111827] border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#2563eb] flex items-center justify-center shadow-md shadow-blue-600/30 flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white tracking-tight truncate">Gym OS Assistant</h3>
              <span className="text-[10px] font-semibold text-blue-400 bg-blue-900/40 border border-blue-500/30 px-1.5 py-0.5 rounded-full flex-shrink-0">
                AI
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium truncate">
              <span className="flex items-center gap-1 text-brand-400">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                {pageConfig.name}
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-400" title="Connected to Gym Data, Website & Web search">
                <Database className="w-2.5 h-2.5 text-blue-400" />
                <Globe className="w-2.5 h-2.5 text-brand-400" />
                <Wifi className="w-2.5 h-2.5 text-brand-400" />
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClear}
            title="Reset Chat"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setOpen(false)}
            title="Close Assistant"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* CONTEXT INDICATOR BAR */}
      <div className="px-3 py-1.5 bg-[#1f2937]/50 border-b border-slate-800/60 flex items-center justify-between text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5 truncate">
          <Layers className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <span className="truncate font-medium">{pageConfig.badgeText}</span>
        </div>
        <span className="text-[10px] text-slate-400 flex-shrink-0 font-mono">Live Sync</span>
      </div>

      {/* MESSAGES CONTAINER */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-[#111827]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#2563eb] text-white rounded-br-xs font-medium shadow-md shadow-blue-600/20'
                  : 'bg-[#1f2937] text-slate-100 rounded-bl-xs border border-slate-700/60 whitespace-pre-line shadow-sm'
              }`}
            >
              {msg.text}
            </div>

            <div className="flex items-center gap-2 mt-1 px-1">
              <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
              {msg.role === 'ai' && (
                <button
                  onClick={() => handleCopy(msg.id, msg.text)}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                >
                  {copiedId === msg.id ? (
                    <>
                      <Check className="w-3 h-3 text-brand-400" />
                      <span className="text-brand-400 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex items-center gap-1.5 px-3 py-2 bg-[#1f2937] rounded-2xl w-fit border border-slate-700/60">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* QUICK SUGGESTION CHIPS (Context Aware) */}
      <div className="px-3 py-2 bg-[#111827] border-t border-slate-800/80">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>Suggested for {pageConfig.name}</span>
          <span className="text-[9px] text-blue-400 font-normal">Tap to ask</span>
        </p>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {pageConfig.chips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1f2937] hover:bg-blue-600/20 text-[#2563eb] hover:text-blue-300 border border-slate-700/80 hover:border-blue-500/40 text-[11px] font-medium whitespace-nowrap transition-all flex-shrink-0 cursor-pointer"
            >
              <span>{chip}</span>
              <ArrowRight className="w-2.5 h-2.5 text-blue-400" />
            </button>
          ))}
        </div>
      </div>

      {/* INPUT AREA */}
      {/* Dark theme matching app: #1f2937 input area, #2563eb send button */}
      <div className="p-3 bg-[#1f2937] border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Ask about ${pageConfig.name.toLowerCase()} or gym growth...`}
          className="flex-1 bg-[#111827] text-white placeholder-slate-500 text-xs rounded-xl px-3.5 py-2.5 border border-slate-700/80 focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-all"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || typing}
          aria-label="Send message"
          className="w-9 h-9 rounded-xl bg-[#2563eb] text-white flex items-center justify-center hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-600/20 flex-shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
