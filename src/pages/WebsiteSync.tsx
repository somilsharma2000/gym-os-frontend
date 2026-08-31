import { useState } from 'react'
import {
  Globe,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Calendar,
  Users,
  CreditCard,
  Building2,
  Megaphone,
  Smartphone,
  Monitor,
  Clock,
  Lock,
  ArrowRight,
  Sparkles,
  Check,
  Activity,
  Dumbbell,
  MapPin,
  Phone,
  ChevronRight,
  Zap,
  Tag
} from 'lucide-react'

interface SyncCategory {
  id: string
  title: string
  description: string
  destination: string
  icon: any
  lastUpdated: string
  itemCount: string
}

interface ActivityLog {
  id: string
  time: string
  text: string
  category: string
  badgeColor: string
}

export default function WebsiteSync() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState('2 min ago')
  const [syncSuccessToast, setSyncSuccessToast] = useState(false)
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop')

  const [activities, setActivities] = useState<ActivityLog[]>([
    {
      id: '1',
      time: '2 min ago',
      text: 'Updated HIIT Blast class capacity from 15 to 20',
      category: 'Classes',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    },
    {
      id: '2',
      time: '1 hour ago',
      text: 'Added new trainer Priya Patel to website',
      category: 'Trainers',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    },
    {
      id: '3',
      time: '3 hours ago',
      text: 'Updated monthly pricing from ₹3,000 to ₹3,500',
      category: 'Memberships',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      id: '4',
      time: 'Yesterday',
      text: 'Published new blog post: 5 Tips for Beginner Gym Goers',
      category: 'Blog',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      id: '5',
      time: '2 days ago',
      text: 'Updated Sunday operating hours to 7:00 AM - 8:00 PM',
      category: 'Gym Profile',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    }
  ])

  const syncCategories: SyncCategory[] = [
    {
      id: 'classes',
      title: 'Classes',
      description: 'Schedule, trainer assignments, and seat capacities auto-update on your site timetable.',
      destination: 'Website class schedule page',
      icon: Calendar,
      lastUpdated: 'Updated 2m ago',
      itemCount: '12 Active Classes'
    },
    {
      id: 'trainers',
      title: 'Trainers',
      description: 'Trainer name, photos, bio specializations, and availability flow directly to your team showcase.',
      destination: 'Website team page',
      icon: Users,
      lastUpdated: 'Updated 1h ago',
      itemCount: '8 Head Trainers'
    },
    {
      id: 'memberships',
      title: 'Membership Plans',
      description: 'Pricing tiers, features list, and promotional discounts sync live to your pricing tables.',
      destination: 'Website pricing page',
      icon: CreditCard,
      lastUpdated: 'Updated 3h ago',
      itemCount: '4 Active Plans'
    },
    {
      id: 'profile',
      title: 'Gym Profile',
      description: 'Operating hours, physical address, contact numbers, and social links update across site footers.',
      destination: 'Website footer/about',
      icon: Building2,
      lastUpdated: 'Updated Yesterday',
      itemCount: 'Synced to Footer'
    },
    {
      id: 'announcements',
      title: 'Announcements/Blog',
      description: 'Promotional banners, holiday alerts, fitness blogs, and news post directly to your homepage.',
      destination: 'Website homepage banner',
      icon: Megaphone,
      lastUpdated: 'Updated Yesterday',
      itemCount: '3 Live Banners'
    }
  ]

  const handleManualSync = () => {
    setIsSyncing(true)
    setSyncSuccessToast(false)

    setTimeout(() => {
      setIsSyncing(false)
      setLastSyncTime('Just now')
      setSyncSuccessToast(true)

      // Add a fresh activity entry
      const newActivity: ActivityLog = {
        id: Date.now().toString(),
        time: 'Just now',
        text: 'Manual full-sync performed: Synchronized all 5 data modules to live website',
        category: 'System',
        badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      }
      setActivities(prev => [newActivity, ...prev])

      setTimeout(() => {
        setSyncSuccessToast(false)
      }, 5000)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#0A0E27] text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HERO HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-[#2563eb]/10 border border-[#2563eb]/30 rounded-xl text-[#2563eb]">
                <Globe size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Website Sync</h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Auto-Sync Active
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-3xl mt-1">
              Your gym website stays in sync automatically. Every change you make here appears on your website instantly.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-[#0F1535] px-3.5 py-2 rounded-xl border border-slate-800 self-start md:self-auto">
            <Zap size={14} className="text-amber-400" />
            <span>Webhooks Latency: <strong className="text-white font-semibold">120ms</strong></span>
          </div>
        </div>

        {/* SYNC STATUS CARD */}
        <div className="bg-[#0F1535] border border-slate-800 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-xl">
          {/* Subtle bg glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#2563eb]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563eb] to-blue-700 flex items-center justify-center text-white shadow-lg shadow-[#2563eb]/20 flex-shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <a
                    href="https://pulsefitness.beyondpixells.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-bold text-white hover:text-[#2563eb] transition-colors flex items-center gap-1.5 group"
                  >
                    pulsefitness.beyondpixells.com
                    <ExternalLink size={15} className="text-slate-400 group-hover:text-[#2563eb] transition-colors" />
                  </a>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-slate-500" />
                    Last Sync: <strong className="text-slate-200 font-semibold">{lastSyncTime}</strong>
                  </span>
                  <span className="hidden sm:inline text-slate-700">•</span>
                  <span className="flex items-center gap-1.5">
                    <Activity size={13} className="text-emerald-400" />
                    Status: <strong className="text-emerald-400 font-semibold">100% Operational</strong>
                  </span>
                  <span className="hidden sm:inline text-slate-700">•</span>
                  <span className="flex items-center gap-1">
                    SSL: <strong className="text-slate-300 font-medium">Valid (TLS 1.3)</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start lg:self-center">
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all duration-200 flex items-center gap-2 shadow-lg cursor-pointer ${
                  isSyncing
                    ? 'bg-[#2563eb]/60 cursor-not-allowed'
                    : 'bg-[#2563eb] hover:bg-blue-600 shadow-[#2563eb]/25 active:scale-95'
                }`}
              >
                <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'Syncing Website...' : 'Manual Sync'}
              </button>
            </div>
          </div>

          {/* Sync Success Toast */}
          {syncSuccessToast && (
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center justify-between transition-all">
              <span className="flex items-center gap-2 font-medium">
                <CheckCircle2 size={16} className="flex-shrink-0" />
                All Gym OS data has been successfully pushed to website.
              </span>
              <span className="text-[10px] text-emerald-500 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">200 OK</span>
            </div>
          )}
        </div>

        {/* WHAT GETS SYNCED SECTION */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-[#2563eb]" />
                What Gets Synced
              </h2>
              <p className="text-xs text-slate-400">Data channels continuously synced between Gym OS and your website</p>
            </div>
            <span className="text-xs text-slate-400 bg-[#0F1535] px-3 py-1 rounded-lg border border-slate-800">
              5 Data Modules Connected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {syncCategories.map(cat => {
              const IconComp = cat.icon
              return (
                <div
                  key={cat.id}
                  className="bg-[#0F1535] border border-slate-800 hover:border-[#2563eb]/40 rounded-xl p-5 transition-all duration-200 flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    {/* Top Row: Icon + Title & Synced Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#2563eb]/10 border border-[#2563eb]/20 text-[#2563eb] rounded-xl group-hover:scale-105 transition-transform">
                          <IconComp size={20} />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                            {cat.title}
                          </h3>
                          <span className="text-[10px] text-slate-500 font-mono">{cat.itemCount}</span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                        <Check size={12} />
                        Synced
                      </span>
                    </div>

                    {/* Target destination badge */}
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#2563eb] bg-[#2563eb]/10 px-2.5 py-1 rounded-md border border-[#2563eb]/20">
                        <ArrowRight size={11} />
                        {cat.destination}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {cat.description}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock size={12} />
                      {cat.lastUpdated}
                    </span>
                    <span className="text-emerald-400 font-mono text-[10px]">Real-time hook</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RECENT SYNC ACTIVITY FEED */}
        <div className="bg-[#0F1535] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity size={18} className="text-[#2563eb]" />
                Recent Sync Activity
              </h2>
              <p className="text-xs text-slate-400">Audit trail of automated and triggered sync operations</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Live Feed
            </span>
          </div>

          <div className="relative pl-4 sm:pl-6 space-y-6 before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {activities.map(act => (
              <div key={act.id} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 group">
                {/* Timeline Dot */}
                <div className="absolute -left-4 sm:-left-6 top-1.5 w-3 h-3 rounded-full bg-[#2563eb] ring-4 ring-[#0F1535] group-hover:scale-125 transition-transform" />

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${act.badgeColor} w-fit`}>
                    {act.category}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium">
                    {act.text}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono self-start sm:self-auto flex-shrink-0">
                  <Clock size={12} />
                  {act.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WEBSITE PREVIEW MOCKUP */}
        <div className="bg-[#0F1535] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Monitor size={18} className="text-[#2563eb]" />
                Website Live Preview
              </h2>
              <p className="text-xs text-slate-400">Interactive mockup showing live synced content on pulsefitness.beyondpixells.com</p>
            </div>

            {/* TOGGLE BUTTON: DESKTOP VS MOBILE */}
            <div className="flex items-center bg-[#0A0E27] p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
              <button
                onClick={() => setDeviceView('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  deviceView === 'desktop'
                    ? 'bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor size={14} />
                Desktop
              </button>
              <button
                onClick={() => setDeviceView('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  deviceView === 'mobile'
                    ? 'bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone size={14} />
                Mobile Phone
              </button>
            </div>
          </div>

          {/* MOCKUP CONTAINER */}
          <div className="bg-[#0A0E27] p-2 sm:p-4 rounded-xl border border-slate-800/80 flex justify-center items-center min-h-[500px] overflow-x-auto">
            {deviceView === 'desktop' ? (
              /* DESKTOP BROWSER MOCKUP */
              <div className="w-full max-w-5xl bg-[#090D1F] rounded-xl border border-slate-800 shadow-2xl overflow-hidden text-xs">
                {/* Browser Bar */}
                <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>

                  <div className="flex-1 max-w-xl mx-auto bg-[#0A0E27] border border-slate-800 rounded-lg px-3 py-1 text-slate-300 font-mono text-[11px] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 overflow-hidden truncate">
                      <Lock size={12} className="text-emerald-400 flex-shrink-0" />
                      <span className="text-emerald-400 font-semibold">https://</span>
                      <span className="text-slate-200 truncate">pulsefitness.beyondpixells.com</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-sans ml-2">Synced</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500">
                    <RefreshCw size={13} className="hover:text-slate-300 cursor-pointer" />
                  </div>
                </div>

                {/* Gym Website Content Preview (Desktop) */}
                <div className="p-6 bg-gradient-to-b from-[#0B0F2B] via-[#0D1236] to-[#0A0E27] space-y-8 text-slate-200">
                  {/* Top Bar / Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center font-black text-white text-sm">
                        PF
                      </div>
                      <span className="font-bold text-white text-base tracking-tight">PULSE FITNESS</span>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-slate-300 font-medium">
                      <span className="hover:text-white cursor-pointer">Classes</span>
                      <span className="hover:text-white cursor-pointer">Trainers</span>
                      <span className="hover:text-white cursor-pointer">Pricing</span>
                      <span className="hover:text-white cursor-pointer">About</span>
                      <button className="bg-[#2563eb] text-white px-3.5 py-1.5 rounded-lg font-semibold hover:bg-blue-600">
                        Book Trial
                      </button>
                    </div>
                  </div>

                  {/* Hero Banner (Synced Announcement) */}
                  <div className="relative rounded-2xl bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 p-8 border border-blue-500/30 overflow-hidden">
                    <div className="relative z-10 max-w-xl">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#2563eb]/20 text-blue-300 border border-[#2563eb]/40 mb-3">
                        <Megaphone size={12} />
                        Synced Announcement
                      </span>
                      <h3 className="text-2xl font-black text-white mb-2 leading-tight">
                        Transform Your Body & Elevate Your Fitness
                      </h3>
                      <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                        Join Pulse Fitness today. State-of-the-art equipment, certified personal trainers, and high-energy group classes updated live via Gym OS.
                      </p>
                      <div className="flex items-center gap-3">
                        <button className="bg-[#2563eb] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 flex items-center gap-1.5">
                          Explore Memberships <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Synced Classes Schedule Preview */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        <Calendar size={15} className="text-[#2563eb]" />
                        Live Class Schedule
                      </h4>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">Synced from Gym OS</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { title: 'HIIT Blast', time: '07:00 AM', trainer: 'Priya Patel', cap: '20 seats (Updated)' },
                        { title: 'Power Yoga', time: '09:00 AM', trainer: 'Ananya Roy', cap: '15 seats' },
                        { title: 'Crossfit Grind', time: '05:30 PM', trainer: 'Rahul Sharma', cap: '18 seats' }
                      ].map((cls, idx) => (
                        <div key={idx} className="bg-[#0F1535] border border-slate-800 rounded-xl p-3">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-white text-xs">{cls.title}</span>
                            <span className="text-[10px] font-mono text-[#2563eb] bg-[#2563eb]/10 px-1.5 py-0.5 rounded">{cls.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mb-1">Trainer: {cls.trainer}</p>
                          <p className="text-[10px] text-emerald-400 font-mono">{cls.cap}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Synced Trainers Showcase */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        <Dumbbell size={15} className="text-[#2563eb]" />
                        Certified Trainers
                      </h4>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">Synced from Gym OS</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { name: 'Priya Patel', spec: 'HIIT & Conditioning', exp: '6 Yrs' },
                        { name: 'Rahul Sharma', spec: 'Strength & Crossfit', exp: '8 Yrs' },
                        { name: 'Ananya Roy', spec: 'Yoga & Mobility', exp: '5 Yrs' },
                        { name: 'Vikram Singh', spec: 'Bodybuilding', exp: '10 Yrs' }
                      ].map((tr, idx) => (
                        <div key={idx} className="bg-[#0F1535] border border-slate-800 rounded-xl p-3 text-center">
                          <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs mb-2">
                            {tr.name.charAt(0)}
                          </div>
                          <div className="font-bold text-white text-xs">{tr.name}</div>
                          <div className="text-[10px] text-slate-400">{tr.spec}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Synced Membership Pricing Preview */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        <CreditCard size={15} className="text-[#2563eb]" />
                        Membership Plans
                      </h4>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">Synced from Gym OS</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-[#0F1535] border border-slate-800 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-white text-xs">Monthly Access</span>
                          <span className="text-xs font-bold text-emerald-400">₹3,500 / mo</span>
                        </div>
                        <p className="text-[11px] text-slate-400">Full gym access, locker room, and 2 group classes / week.</p>
                      </div>

                      <div className="bg-[#0F1535] border border-[#2563eb]/40 rounded-xl p-4 relative">
                        <span className="absolute -top-2 right-3 bg-[#2563eb] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">POPULAR</span>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-white text-xs">Quarterly Power Plan</span>
                          <span className="text-xs font-bold text-emerald-400">₹9,000 / 3 mo</span>
                        </div>
                        <p className="text-[11px] text-slate-400">Unlimited group classes, personal trainer consultation, free merch.</p>
                      </div>
                    </div>
                  </div>

                  {/* Gym Profile Footer Preview */}
                  <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-[#2563eb]" />
                      <span>102 Fitness Boulevard, Bandra West, Mumbai</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-[#2563eb]" />
                      <span>+91 98765 43210</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Hours: Mon-Sat 6 AM - 10 PM | Sun 7 AM - 8 PM
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* MOBILE PHONE MOCKUP */
              <div className="w-[340px] bg-[#000] rounded-[40px] border-[8px] border-slate-800 shadow-2xl overflow-hidden relative text-xs my-4">
                {/* Phone Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-800 rounded-b-xl z-30 flex items-center justify-center">
                  <div className="w-12 h-1 bg-slate-900 rounded-full" />
                </div>

                {/* Mobile Screen Header */}
                <div className="pt-7 pb-2 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded bg-[#2563eb] flex items-center justify-center font-bold text-white text-[10px]">
                      PF
                    </div>
                    <span className="font-bold text-white text-xs tracking-tight">PULSE FITNESS</span>
                  </div>
                  <button className="bg-[#2563eb] text-white text-[10px] px-2.5 py-1 rounded font-semibold">
                    Join
                  </button>
                </div>

                {/* Mobile URL Bar */}
                <div className="bg-[#0A0E27] px-3 py-1.5 border-b border-slate-800 text-[10px] font-mono text-emerald-400 flex items-center justify-between">
                  <span className="truncate">pulsefitness.beyondpixells.com</span>
                  <Lock size={10} className="text-emerald-400 flex-shrink-0" />
                </div>

                {/* Mobile Page Content */}
                <div className="p-4 bg-gradient-to-b from-[#0B0F2B] to-[#0A0E27] space-y-4 max-h-[580px] overflow-y-auto sidebar-scroll">
                  {/* Banner */}
                  <div className="p-4 bg-gradient-to-br from-blue-900/50 to-slate-900 rounded-xl border border-blue-500/30">
                    <span className="text-[9px] font-bold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full inline-block mb-1">
                      LIVE GYM OS SYNC
                    </span>
                    <h4 className="font-bold text-white text-sm leading-tight mb-1">
                      Transform Body & Mind
                    </h4>
                    <p className="text-[10px] text-slate-300 mb-2">
                      Live schedule, certified trainers, and membership offers synced directly.
                    </p>
                    <button className="w-full bg-[#2563eb] text-white py-1.5 rounded text-[10px] font-bold">
                      Book Free Trial
                    </button>
                  </div>

                  {/* Classes List */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-white text-xs">Today's Classes</span>
                      <span className="text-[9px] text-emerald-400 font-mono">Synced</span>
                    </div>

                    <div className="space-y-2">
                      <div className="bg-[#0F1535] p-2.5 rounded-lg border border-slate-800">
                        <div className="flex justify-between font-bold text-white text-[11px]">
                          <span>HIIT Blast</span>
                          <span className="text-[#2563eb]">07:00 AM</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Priya Patel • Cap: 20</div>
                      </div>

                      <div className="bg-[#0F1535] p-2.5 rounded-lg border border-slate-800">
                        <div className="flex justify-between font-bold text-white text-[11px]">
                          <span>Power Yoga</span>
                          <span className="text-[#2563eb]">09:00 AM</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Ananya Roy • Cap: 15</div>
                      </div>
                    </div>
                  </div>

                  {/* Trainers */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-white text-xs">Our Trainers</span>
                      <span className="text-[9px] text-emerald-400 font-mono">Synced</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#0F1535] p-2 rounded-lg border border-slate-800 text-center">
                        <div className="w-7 h-7 mx-auto rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-[10px] mb-1">
                          P
                        </div>
                        <div className="font-semibold text-white text-[10px]">Priya Patel</div>
                        <div className="text-[9px] text-slate-400">HIIT Specialist</div>
                      </div>
                      <div className="bg-[#0F1535] p-2 rounded-lg border border-slate-800 text-center">
                        <div className="w-7 h-7 mx-auto rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-[10px] mb-1">
                          R
                        </div>
                        <div className="font-semibold text-white text-[10px]">Rahul Sharma</div>
                        <div className="text-[9px] text-slate-400 font-normal">Crossfit</div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-[#0F1535] p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white text-xs">Monthly Membership</span>
                      <span className="text-emerald-400 font-bold text-xs">₹3,500</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-2">Full access + free locker</p>
                    <button className="w-full bg-slate-800 text-slate-200 py-1 rounded text-[10px] font-semibold">
                      Select Plan
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="pt-2 text-[9px] text-slate-500 text-center space-y-1">
                    <p>102 Fitness Boulevard, Bandra West, Mumbai</p>
                    <p>+91 98765 43210</p>
                    <p className="text-emerald-500">Synced via Gym OS Engine</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
