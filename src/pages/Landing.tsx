import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  QrCode,
  MessageCircle,
  TrendingUp,
  Users,
  Sparkles,
  LogIn,
  CheckCircle2,
  X,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  Building2,
  Zap,
  Calendar,
  ChevronRight,
  BarChart3,
  Dumbbell,
  Check,
  Loader2,
  MapPin,
  Clock,
  Sparkle
} from 'lucide-react'
import { enableDemoMode } from '../data/demoData'

export default function Landing() {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state for contact modal
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gymName: ''
  })

  const handleLiveDemo = () => {
    enableDemoMode()
    navigate('/dashboard')
  }

  const handleLogin = () => {
    navigate('/login')
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate submission, show success message, then navigate to /demo/dashboard after 1.5s
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)

      setTimeout(() => {
        enableDemoMode()
        navigate('/dashboard')
      }, 1500)
    }, 400)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setIsSubmitted(false)
    setFormData({ name: '', phone: '', email: '', gymName: '' })
  }

  return (
    <div className="min-h-screen bg-[#0A0E27] text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-200 relative overflow-x-hidden">
      {/* Background Ambient Glow FX */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-600/15 via-blue-900/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-[600px] right-0 w-[500px] h-[500px] bg-blue-500/5 blur-3xl pointer-events-none" />
      <div className="absolute top-[1200px] left-0 w-[500px] h-[500px] bg-indigo-500/5 blur-3xl pointer-events-none" />

      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#0A0E27]/85 backdrop-blur-md border-b border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo Top-Left */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <img
              src={`${import.meta.env.BASE_URL}brand/beyond-pixells-logo.png`}
              alt="Beyond Pixells Logo"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30 group-hover:ring-blue-400 transition-all duration-300"
            />
            <div>
              <div className="text-lg font-black tracking-tight text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                GYM OS
              </div>
              <div className="text-[11px] font-medium text-slate-400 tracking-wide">
                by Beyond Pixells
              </div>
            </div>
          </div>

          {/* Action Buttons Top-Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleLogin}
              className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogIn size={15} className="text-slate-400" />
              <span>Gym Owner Login</span>
            </button>
            <button
              onClick={handleLiveDemo}
              className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles size={15} className="text-white" />
              <span>Explore Live Demo</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex flex-col items-center">
        {/* Badge Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs sm:text-sm font-semibold mb-8 backdrop-blur-sm">
          <Zap size={14} className="text-blue-400" />
          <span>Next-Gen Gym Operating System</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-5xl mx-auto">
          The Operating System for{' '}
          <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
            Modern Gyms
          </span>
        </h1>

        {/* Subtext */}
        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
          Streamline member check-ins, automate WhatsApp outreach, skyrocket retention, and scale your gym revenue with one unified, intelligent platform.
        </p>

        {/* Hero CTA Buttons */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none">
          <button
            onClick={handleLiveDemo}
            className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles size={18} className="text-white" />
            <span>Explore Live Demo</span>
          </button>
          <button
            onClick={handleLogin}
            className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:border-slate-600"
          >
            <LogIn size={18} className="text-slate-400" />
            <span>Gym Owner Login</span>
          </button>
        </div>

        {/* Book Demo Contact Modal Trigger Link */}
        <div className="mt-5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors group cursor-pointer"
          >
            <Calendar size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
            <span>Book a free demo with our team</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Interactive Feature Pills Showcase */}
        <div className="mt-14 w-full max-w-4xl p-1 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md shadow-2xl overflow-hidden">
          <div className="bg-[#0c122c] rounded-xl p-6 sm:p-8 border border-slate-800/60 text-left">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">gym-os-command-center.v2</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                Live Operations View
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Daily Check-ins</div>
                <div className="text-2xl font-black text-white mt-1">86</div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-1">QR Touchless Scan</div>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Active Members</div>
                <div className="text-2xl font-black text-white mt-1">287</div>
                <div className="text-[11px] text-blue-400 font-semibold mt-1">Retention Alert Active</div>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">New Leads</div>
                <div className="text-2xl font-black text-white mt-1">18</div>
                <div className="text-[11px] text-indigo-400 font-semibold mt-1">WhatsApp Automated</div>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Monthly Revenue</div>
                <div className="text-2xl font-black text-white mt-1">INR 4.85L</div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-1">Auto-Invoiced</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP SECTION */}
      <section className="py-10 border-y border-slate-800/80 bg-slate-950/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
            Trusted by gyms across India
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-slate-300 text-xs sm:text-sm font-semibold">
            <span className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-2">
              <Building2 size={14} className="text-blue-400" /> Commercial Fitness Centers
            </span>
            <span className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-2">
              <Dumbbell size={14} className="text-blue-400" /> CrossFit & Strength Boxes
            </span>
            <span className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-2">
              <ShieldCheck size={14} className="text-blue-400" /> Personal Training Studios
            </span>
            <span className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-2">
              <MapPin size={14} className="text-blue-400" /> Multi-Branch Gym Chains
            </span>
          </div>
        </div>
      </section>

      {/* FEATURE HIGHLIGHT CARDS (4 REQUIRED FEATURES) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built for modern fitness operations
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            Four powerful core pillars designed to automate manual tasks and grow your fitness business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: QR Check-in */}
          <div className="bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/50 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-600/20 transition-all">
                <QrCode size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">QR Check-in</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Instant touchless member check-ins via dynamic QR codes with live capacity & attendance tracking.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-blue-400">
              <span>Touchless Scanning</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: WhatsApp Automation */}
          <div className="bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/50 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-600/20 transition-all">
                <MessageCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">WhatsApp Automation</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Automated payment reminders, trial pass dispatches, and renewal nudges sent directly on WhatsApp.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-blue-400">
              <span>Direct Messaging</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Revenue Analytics */}
          <div className="bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/50 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-600/20 transition-all">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Revenue Analytics</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Real-time revenue reports, payment breakdown, expense tracking, and MRR growth forecasting.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-blue-400">
              <span>Financial Insights</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Lead CRM */}
          <div className="bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/50 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-600/20 transition-all">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Lead CRM</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Track lead sources, trial pass conversions, and automated follow-up tasks in one pipeline.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-blue-400">
              <span>Lead Conversion</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* ADDITIONAL VALUE PROPOSITION SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-slate-900/90 via-[#0d1430] to-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Everything you need to eliminate gym administrative headache
              </h3>
              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                From tracking expiring memberships to sending automatic WhatsApp receipts, GYM OS simplifies every daily operation so you can focus on member satisfaction and scaling your brand.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                    <Check size={12} />
                  </div>
                  <span>Instant Digital Trial Passes generated in seconds</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                    <Check size={12} />
                  </div>
                  <span>Smart Member Retention & Attendance Drop Detection</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                    <Check size={12} />
                  </div>
                  <span>Multi-branch management & staff permission controls</span>
                </li>
              </ul>
              <div className="mt-8">
                <button
                  onClick={handleLiveDemo}
                  className="px-6 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-600/20 inline-flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles size={16} />
                  <span>Test Drive GYM OS Live</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Automated Financial Ledger</h4>
                  <p className="text-xs text-slate-400 mt-1">Automatic invoice generation, payment method split, and expense tracking without spreadsheets.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Save 15+ Hours Weekly</h4>
                  <p className="text-xs text-slate-400 mt-1">Front desk staff check in members in under 2 seconds, eliminating long queues at peak hours.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#070a1e] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center pb-8 border-b border-slate-800/60">
            {/* Brand column */}
            <div>
              <div className="flex items-center gap-3">
                <img
                  src={`${import.meta.env.BASE_URL}brand/beyond-pixells-logo.png`}
                  alt="Beyond Pixells"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30"
                />
                <span className="text-lg font-black text-white tracking-tight">GYM OS</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                The all-in-one management platform for gym owners and fitness entrepreneurs across India.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-blue-400 flex-shrink-0" />
                <a href="mailto:beyondpixells@gmail.com" className="hover:text-blue-400 transition-colors">
                  beyondpixells@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={15} className="text-blue-400 flex-shrink-0" />
                <a href="tel:+917737077479" className="hover:text-blue-400 transition-colors">
                  +91 77370 77479
                </a>
              </div>
            </div>

            {/* Copyright and Credits */}
            <div className="text-xs text-slate-400 lg:text-right space-y-1">
              <div className="font-semibold text-slate-300">Powered by Beyond Pixells</div>
              <div>GYM OS v2 © 2026</div>
            </div>
          </div>

          <div className="pt-6 text-center text-[11px] text-slate-400">
            Designed for growth, operational efficiency, and member retention.
          </div>
        </div>
      </footer>

      {/* CONTACT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0d1322] border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative text-left">
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {isSubmitted ? (
              /* Success Toast / State */
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="text-xl font-bold text-white">Demo Request Received!</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Thank you <span className="font-semibold text-white">{formData.name}</span>. Redirecting you to the live demo environment now...
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-blue-400 pt-3 font-semibold">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Launching Live Demo...</span>
                </div>
              </div>
            ) : (
              /* Form */
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white">Book a Free Demo</h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Enter your details below and our team will get in touch shortly.
                  </p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-medium text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Vikram Sharma"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-700/80 rounded-xl bg-slate-900/90 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="contact-phone" className="block text-xs font-medium text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-700/80 rounded-xl bg-slate-900/90 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-medium text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="owner@yourgym.com"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-700/80 rounded-xl bg-slate-900/90 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Gym Name */}
                  <div>
                    <label htmlFor="contact-gym" className="block text-xs font-medium text-slate-300 mb-1">
                      Gym / Fitness Center Name
                    </label>
                    <input
                      id="contact-gym"
                      type="text"
                      required
                      value={formData.gymName}
                      onChange={(e) => setFormData({ ...formData, gymName: e.target.value })}
                      placeholder="e.g. Pulse Fitness Club"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-700/80 rounded-xl bg-slate-900/90 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-60 rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Calendar size={16} />
                        <span>Submit Demo Request</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
