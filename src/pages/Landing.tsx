import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
  ArrowRight,
  Activity,
  Award,
  FileText,
  RotateCcw,
  Menu
} from 'lucide-react'
import { enableDemoMode } from '../data/demoData'

export default function Landing() {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

    // Simulate submission, show success message, then navigate to /dashboard after 1.5s
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-blue-600/20 via-blue-900/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-[700px] right-0 w-[550px] h-[550px] bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-[1400px] left-0 w-[550px] h-[550px] bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-[2200px] right-1/4 w-[600px] h-[600px] bg-blue-600/5 blur-3xl pointer-events-none" />

      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-[#0A0E27]/90 backdrop-blur-md border-b border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Logo Top-Left */}
          <Link to="/" className="flex items-center gap-3 group select-none">
            <img
              src={`${import.meta.env.BASE_URL}brand/beyond-pixells-logo.png`}
              alt="Beyond Pixells Logo"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/40 group-hover:ring-blue-400 transition-all duration-300"
            />
            <div>
              <div className="text-lg font-black tracking-tight text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                GYM OS
              </div>
              <div className="text-[11px] font-medium text-slate-400 tracking-wide">
                by Beyond Pixells
              </div>
            </div>
          </Link>

          {/* Navigation Links Desktop */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-white bg-slate-800/80"
            >
              Home
            </Link>
            <Link
              to="/features"
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              Features
            </Link>
            <Link
              to="/pricing"
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/about"
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              Contact
            </Link>
            <Link
              to="/blog"
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              Blog
            </Link>
          </nav>

          {/* Action Buttons Top-Right */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              onClick={handleLogin}
              className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogIn size={15} className="text-slate-400" />
              <span>Gym Owner Login</span>
            </button>
            <button
              onClick={handleLiveDemo}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles size={15} className="text-white" />
              <span>Explore Live Demo</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800/60 border border-slate-700/60"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0A0E27] border-b border-slate-800 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600/20 border border-blue-500/30"
            >
              Home
            </Link>
            <Link
              to="/features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Features
            </Link>
            <Link
              to="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Pricing
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800"
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Contact
            </Link>
            <Link
              to="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Blog
            </Link>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLiveDemo()
                }}
                className="w-full px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                <Sparkles size={16} />
                <span>Explore Live Demo</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogin()
                }}
                className="w-full px-4 py-3 text-sm font-semibold text-slate-300 bg-slate-900 border border-slate-700 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <LogIn size={16} />
                <span>Gym Owner Login</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex flex-col items-center animate-fade-in-up">
        {/* Badge Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs sm:text-sm font-semibold mb-8 backdrop-blur-sm">
          <Zap size={14} className="text-blue-400" />
          <span>Next-Gen Gym Operating System</span>
        </div>

        {/* Outcome-focused Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-5xl mx-auto">
          Eliminate Gym Admin Fatigue &{' '}
          <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
            Scale Revenue
          </span>
        </h1>

        {/* Outcome-focused Subheadline */}
        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
          Automate touchless QR check-ins, dispatch automated WhatsApp reminders, stop billing drop-offs, and convert leads into loyal members with one intelligent command center.
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

        {/* Book Demo Link */}
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

        {/* Interactive Command Center Preview */}
        <div className="mt-14 w-full max-w-4xl p-1 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md shadow-2xl overflow-hidden">
          <div className="bg-[#0c122c] rounded-xl p-6 sm:p-8 border border-slate-800/60 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-slate-800/80 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">gym-os-command-center.v2</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  Live Operations Command Center (Demo Data)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/90 hover:border-blue-500/40 transition-colors">
                <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <QrCode size={13} className="text-blue-400" />
                  <span>Daily Check-ins</span>
                </div>
                <div className="text-2xl font-black text-white mt-1.5">86</div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                  <span>+14% today</span>
                  <span className="text-slate-500">• QR Touchless</span>
                </div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/90 hover:border-blue-500/40 transition-colors">
                <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <Users size={13} className="text-blue-400" />
                  <span>Active Members</span>
                </div>
                <div className="text-2xl font-black text-white mt-1.5">287</div>
                <div className="text-[11px] text-blue-400 font-semibold mt-1">94% Retention Active</div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/90 hover:border-blue-500/40 transition-colors">
                <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <MessageCircle size={13} className="text-blue-400" />
                  <span>New Leads</span>
                </div>
                <div className="text-2xl font-black text-white mt-1.5">18</div>
                <div className="text-[11px] text-indigo-400 font-semibold mt-1">WhatsApp Automated</div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/90 hover:border-blue-500/40 transition-colors">
                <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <TrendingUp size={13} className="text-blue-400" />
                  <span>Monthly Revenue</span>
                </div>
                <div className="text-2xl font-black text-white mt-1.5">₹4,85,000</div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-1">Auto-Invoiced Dues</div>
              </div>
            </div>

            {/* Live Ticker Feed Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 overflow-x-auto gap-4">
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-slate-300 font-mono text-[11px]">Recent Feed:</span>
              </div>
              <div className="flex items-center gap-6 text-[11px] font-medium text-slate-300 flex-shrink-0">
                <span>[10:14 AM] QR Check-in: Rahul M. verified</span>
                <span className="text-slate-600">•</span>
                <span>[10:12 AM] WhatsApp: Renewal nudge sent to Priya S.</span>
                <span className="text-slate-600">•</span>
                <span>[10:05 AM] New Lead: Ananya K. claimed trial pass</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP SECTION */}
      <section className="py-10 border-y border-slate-800/80 bg-slate-950/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
            Trusted by modern fitness centers, strength boxes & studio chains across India
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-slate-300 text-xs sm:text-sm font-semibold">
            <span className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-2 hover:border-slate-700 transition-colors">
              <Building2 size={15} className="text-blue-400" /> Commercial Fitness Centers
            </span>
            <span className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-2 hover:border-slate-700 transition-colors">
              <Dumbbell size={15} className="text-blue-400" /> CrossFit & Strength Boxes
            </span>
            <span className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-2 hover:border-slate-700 transition-colors">
              <ShieldCheck size={15} className="text-blue-400" /> Personal Training Studios
            </span>
            <span className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-2 hover:border-slate-700 transition-colors">
              <MapPin size={15} className="text-blue-400" /> Multi-Branch Gym Chains
            </span>
          </div>

          {/* Key Impact Stats */}
          <div className="mt-8 pt-6 border-t border-slate-900 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">15+ Hrs</div>
              <div className="text-[11px] text-slate-400 font-medium">Saved Weekly Per Branch</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">&lt; 2 Sec</div>
              <div className="text-[11px] text-slate-400 font-medium">QR Check-in Speed</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">3.2x</div>
              <div className="text-[11px] text-slate-400 font-medium">Faster Lead Conversion</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">98%</div>
              <div className="text-[11px] text-slate-400 font-medium">WhatsApp Open Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE HIGHLIGHT CARDS (4 CORE PILLARS REQUIRED) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
            <Award size={13} />
            <span>Four Core Pillars</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Built for Modern Fitness Operations
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Four powerful core engines designed by Beyond Pixells to automate manual tasks, eliminate front desk bottlenecks, and maximize member retention.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Touchless QR Check-in */}
          <div className="bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/50 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <QrCode size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-blue-400 transition-colors">
                Touchless QR Check-in
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Sub-2 second entrance logging via dynamic QR codes. Track real-time gym capacity, attendance history, and automatically flag overdue accounts.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-blue-400">
              <span>Zero Front-Desk Queue</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: WhatsApp Automation */}
          <div className="bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/50 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <MessageCircle size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-blue-400 transition-colors">
                Automated WhatsApp Hub
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Dispatch automated payment receipts, trial passes, and renewal nudges directly on WhatsApp with 98% open rates and instant member replies.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-blue-400">
              <span>Automated Member Retention</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Revenue Analytics */}
          <div className="bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/50 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-blue-400 transition-colors">
                Revenue Analytics
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Real-time financial dashboards, pending dues breakdown, automated GST invoicing, and monthly recurring revenue (MRR) growth forecasting.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-blue-400">
              <span>Total Financial Clarity</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: High-Converting Lead CRM */}
          <div className="bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/50 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-blue-400 transition-colors">
                High-Converting Lead CRM
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Capture lead channels, issue instant digital trial passes, schedule follow-up tasks, and convert gym inquiries into paying subscribers seamlessly.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-blue-400">
              <span>3.2x Lead Conversion</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (3-STEP WORKFLOW) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-950/50 border-y border-slate-800/60 rounded-3xl my-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Simple 3-Step Setup for Gym Owners
          </h2>
          <p className="mt-3 text-base text-slate-400">
            Go from manual spreadsheets to an automated dark command center in less than 15 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#0c122c] border border-slate-800 rounded-2xl p-6 relative">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 font-extrabold text-lg flex items-center justify-center mb-4">
              01
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Import & Configure</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Upload existing member lists or add them in seconds. Define custom membership plans, GST rates, and staff permission controls.
            </p>
          </div>

          <div className="bg-[#0c122c] border border-slate-800 rounded-2xl p-6 relative">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 font-extrabold text-lg flex items-center justify-center mb-4">
              02
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Deploy QR & WhatsApp</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Display your front-desk QR code for instant member scans and activate automated WhatsApp templates for renewal reminders.
            </p>
          </div>

          <div className="bg-[#0c122c] border border-slate-800 rounded-2xl p-6 relative">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 font-extrabold text-lg flex items-center justify-center mb-4">
              03
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Automate & Scale</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Monitor live attendance check-ins, collect member dues on auto-pilot, and scale your recurring gym revenue effortlessly.
            </p>
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION SECTION: ELIMINATE GYM ADMINISTRATIVE HEADACHE */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-slate-900/90 via-[#0c1330] to-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
                <Activity size={14} />
                <span>Operational Efficiency</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Everything You Need to Eliminate Gym Administrative Fatigue
              </h2>
              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                From tracking expiring memberships to sending automatic WhatsApp payment receipts, GYM OS by Beyond Pixells simplifies every daily operation so you can focus on member satisfaction and business growth.
              </p>

              <ul className="mt-6 space-y-3.5 text-sm text-slate-300">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                    <Check size={13} />
                  </div>
                  <span>Instant Digital Trial Passes generated & dispatched via WhatsApp</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                    <Check size={13} />
                  </div>
                  <span>Smart Member Retention & Attendance Dropout Alert Engine</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                    <Check size={13} />
                  </div>
                  <span>Multi-branch management & granular staff access control</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                    <Check size={13} />
                  </div>
                  <span>Automated GST invoice generation and digital ledger records</span>
                </li>
              </ul>

              <div className="mt-8">
                <button
                  onClick={handleLiveDemo}
                  className="px-7 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl transition-all shadow-lg shadow-blue-600/25 inline-flex items-center gap-2.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles size={16} />
                  <span>Test Drive GYM OS Live</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-blue-500/40 transition-all flex items-start gap-4 shadow-lg">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                  <BarChart3 size={22} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Automated Financial Ledger</h4>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    Automatic invoice generation, payment method split, and expense tracking without manual spreadsheets or accounting errors.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-blue-500/40 transition-all flex items-start gap-4 shadow-lg">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Clock size={22} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Save 15+ Hours Weekly</h4>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    Front desk staff check in members in under 2 seconds, completely eliminating long queues during morning & evening peak hours.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-blue-500/40 transition-all flex items-start gap-4 shadow-lg">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={22} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">98% On-Time Renewal Rate</h4>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    Automated WhatsApp nudges remind members 7, 3, and 1 day before plan expiry, drastically cutting membership drop-offs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING HIGH-IMPACT CTA BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full my-8">
        <div className="bg-gradient-to-r from-blue-950/90 via-[#0a0e27] to-indigo-950/90 border border-blue-500/30 rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Ready to Upgrade Your Gym Operations?
          </h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
            Experience how Gym OS by Beyond Pixells simplifies member management, automates WhatsApp outreach, and accelerates revenue growth.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleLiveDemo}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles size={18} />
              <span>Explore Live Demo</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:border-slate-600"
            >
              <Calendar size={18} className="text-blue-400" />
              <span>Book a Free Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#070a1e] py-12 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800/60">
            {/* Brand Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={`${import.meta.env.BASE_URL}brand/beyond-pixells-logo.png`}
                  alt="Beyond Pixells"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30"
                />
                <span className="text-lg font-black text-white tracking-tight">GYM OS</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The all-in-one management platform for gym owners and fitness entrepreneurs across India. Built by Beyond Pixells.
              </p>
            </div>

            {/* Navigation Links */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Product</h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/features" className="hover:text-white transition-colors">Features</Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-white transition-colors">Pricing Plans</Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">About Beyond Pixells</Link>
                </li>
                <li>
                  <button onClick={() => setIsModalOpen(true)} className="hover:text-white transition-colors text-left">Book a Demo</button>
                </li>
                <li>
                  <Link to="/blog" className="hover:text-white transition-colors">Blog & Guides</Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Legal</h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/privacy-policy" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-slate-500" />
                    <span>Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link to="/terms-of-service" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <FileText size={13} className="text-slate-500" />
                    <span>Terms of Service</span>
                  </Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <RotateCcw size={13} className="text-slate-500" />
                    <span>Refund Policy</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact & Support */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Get in Touch</h3>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-blue-400 flex-shrink-0" />
                  <a href="mailto:beyondpixells@gmail.com" className="hover:text-blue-400 transition-colors">
                    beyondpixells@gmail.com
                  </a>
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  <Calendar size={14} />
                  <span>Book a Free Demo</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <div>
              GYM OS v2 © 2026 <span className="font-semibold text-slate-300">Beyond Pixells</span>. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <Link to="/privacy-policy" className="hover:text-slate-300">Privacy</Link>
              <span>•</span>
              <Link to="/terms-of-service" className="hover:text-slate-300">Terms</Link>
              <span>•</span>
              <Link to="/refund-policy" className="hover:text-slate-300">Refunds</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* CONTACT DEMO MODAL */}
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
                  Thank you <span className="font-semibold text-white">{formData.name}</span>. Our team at Beyond Pixells is redirecting you to the live demo environment now...
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
                    Enter your details below and our product specialist from Beyond Pixells will reach out shortly.
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
