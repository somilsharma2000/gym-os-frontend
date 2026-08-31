import { Link } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'
import {
  Building2,
  Globe,
  Zap,
  Users,
  Award,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'

export default function About() {
  const stats = [
    { label: 'Gyms Powered', value: '120+' },
    { label: 'Active Members Tracked', value: '45,000+' },
    { label: 'Monthly Gym Revenue Tracked', value: '₹4,20,000+' },
    { label: 'System Uptime', value: '99.8%' }
  ]

  const services = [
    {
      title: 'Gym OS Platform',
      description: 'An all-in-one operating system designed specifically for fitness centers, unifying Lead CRM, QR Check-ins, member subscriptions, class scheduling, and retention alerts.',
      icon: Zap
    },
    {
      title: 'Custom Websites',
      description: 'High-converting, lightning-fast gym websites built by Beyond Pixells with integrated trial booking engines, GST pricing tables, and lead capture forms.',
      icon: Globe
    },
    {
      title: 'WhatsApp Automation',
      description: 'End-to-end messaging workflows that send automated check-in confirmations, payment renewal alerts, and promotional broadcasts directly to member phones.',
      icon: Users
    }
  ]

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white flex flex-col font-sans selection:bg-[#2563eb]/30 selection:text-blue-200">
      <PublicHeader />

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2563eb]/10 border border-[#2563eb]/30 text-blue-400 text-xs font-semibold mb-6">
          <Building2 size={14} />
          <span>About Beyond Pixells</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          We build technology that helps{' '}
          <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
            gyms grow.
          </span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          At Beyond Pixells, we replace outdated registers and disconnected tools with intelligent, automated software solutions built for fitness entrepreneurs.
        </p>
      </section>

      {/* STATS STRIP */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-[#131a26] border border-slate-800 rounded-3xl p-6 sm:p-8">
          {stats.map((st, idx) => (
            <div key={idx} className="text-center p-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-400 tracking-tight">{st.value}</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium mt-1">{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-[#131a26] border border-slate-800 rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-[#2563eb]/20 text-blue-400 text-xs font-semibold mb-4">
              Our Mission
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
              Empowering Fitness Businesses with Operating Clarity
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
              Managing a fitness center requires wearing multiple hats — from handling walk-in leads and tracking attendance to sending payment reminders and managing trainer schedules.
            </p>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Beyond Pixells created <strong>Gym OS</strong> to combine every critical operational capability into a single, cohesive dark-themed platform. We handle the tech so gym owners can focus on building vibrant fitness communities.
            </p>
          </div>
          <div className="bg-[#0a0e17] border border-slate-800/80 rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-sm font-bold text-white">Automated Member Engagement</h4>
                <p className="text-xs text-slate-400 mt-1">Instant QR check-ins, automated WhatsApp renewal alerts, and attendance notifications.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-sm font-bold text-white">Actionable Business Intelligence</h4>
                <p className="text-xs text-slate-400 mt-1">Real-time revenue tracking in ₹ INR, member churn prediction, and lead conversion rates.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-sm font-bold text-white">Turnkey Setup & Support</h4>
                <p className="text-xs text-slate-400 mt-1">From custom domain configuration to staff training, our team provides hands-on onboarding.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">What We Do at Beyond Pixells</h2>
          <p className="text-slate-300 text-sm mt-2 max-w-xl mx-auto">
            A comprehensive suite of digital tools purpose-built for fitness centers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((srv, i) => {
            const Icon = srv.icon
            return (
              <div key={i} className="bg-[#131a26] border border-slate-800 rounded-2xl p-6 hover:border-[#2563eb]/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#2563eb]/15 text-blue-400 flex items-center justify-center mb-4">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{srv.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{srv.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="bg-[#131a26] border border-slate-800 rounded-3xl p-8 text-center">
          <div className="inline-block px-3.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold mb-4">
            Leadership
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Deekshant Sharma</h2>
          <p className="text-blue-400 text-xs font-semibold mb-4">Proprietor & Founder, Beyond Pixells</p>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
            "We established Beyond Pixells with a singular focus: to engineer software products that solve real operational friction for gym owners. Gym OS is built to bring reliability, automation, and simplicity to fitness management."
          </p>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="bg-gradient-to-r from-[#131a26] via-[#1a2336] to-[#131a26] border border-slate-700/80 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-extrabold text-white mb-3">Partner with Beyond Pixells Today</h3>
          <p className="text-slate-300 text-sm max-w-lg mx-auto mb-6">
            Book a free demo to discover how Gym OS can automate your fitness business.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/contact"
              className="px-6 py-3 bg-[#2563eb] hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
            >
              <Sparkles size={16} />
              <span>Book a Demo</span>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
