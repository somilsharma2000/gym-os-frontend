import { Link } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'
import {
  Users,
  UserCheck,
  QrCode,
  Calendar,
  CreditCard,
  MessageSquare,
  BarChart3,
  Share2,
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle2
} from 'lucide-react'

export default function Features() {
  const featureList = [
    {
      icon: Users,
      title: 'Lead CRM',
      description: 'Capture, organize, and convert prospective members with an intelligent pipeline. Track lead sources, schedule follow-ups, and automate lead scoring so no inquiry falls through the cracks.'
    },
    {
      icon: UserCheck,
      title: 'Member Management',
      description: 'Centralize member profiles, active memberships, emergency contacts, and attendance history in one unified view. Effortlessly process renewals, plan changes, and status updates.'
    },
    {
      icon: QrCode,
      title: 'QR Check-in',
      description: 'Provide instant, touchless entrance for your gym members using dynamic QR code scans. Track peak attendance hours, eliminate register queues, and log automated attendance records.'
    },
    {
      icon: Calendar,
      title: 'Classes & Scheduling',
      description: 'Schedule group fitness sessions, personal training slots, and specialty workshops. Manage trainer assignments, booking capacities, and automated attendance notifications.'
    },
    {
      icon: CreditCard,
      title: 'Payments & Invoicing',
      description: 'Collect membership fees, track pending dues, and issue automated GST invoices in Indian Rupees (₹). Simplify recurring payment collection and monitor gym cash flow seamlessly.'
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp Automation',
      description: 'Engage members and leads directly on WhatsApp with automated check-in alerts, membership renewal reminders, payment receipts, and targeted promotional broadcasts on autopilot.'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Unlock actionable business intelligence with real-time dashboards. Track monthly recurring revenue, member retention rates, class popularity, and churn predictions to drive growth.'
    },
    {
      icon: Share2,
      title: 'Social Media Manager',
      description: 'Schedule promotional posts, showcase member transformations, and maintain a consistent brand presence across social platforms directly from your Gym OS workspace.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white flex flex-col font-sans selection:bg-[#2563eb]/30 selection:text-blue-200">
      <PublicHeader />

      {/* HERO HEADER */}
      <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2563eb]/10 border border-[#2563eb]/30 text-blue-400 text-xs font-semibold mb-6">
          <Zap size={14} />
          <span>All-In-One Gym Management Platform</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Powerful Features Built for{' '}
          <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
            Gym Growth
          </span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Everything you need to automate daily operations, delight members, and scale revenue — designed by Beyond Pixells specifically for modern fitness centers.
        </p>
      </section>

      {/* FEATURE GRID */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureList.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="bg-[#131a26] border border-slate-800 hover:border-[#2563eb]/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-[#2563eb]/10 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#2563eb]/15 border border-[#2563eb]/30 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 group-hover:bg-[#2563eb] group-hover:text-white transition-all duration-300">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full my-8">
        <div className="bg-gradient-to-r from-[#131a26] via-[#1a2336] to-[#131a26] border border-slate-700/80 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2563eb]/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Ready to Upgrade Your Gym Operations?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Experience how Gym OS by Beyond Pixells simplifies member management, WhatsApp messaging, and check-ins.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-white bg-[#2563eb] hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles size={18} />
              <span>Book a Demo</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/pricing"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
            >
              View Pricing Plans
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
