import { NavLink, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Ticket,
  QrCode,
  UserCircle,
  CreditCard,
  Calendar,
  RefreshCw,
  AlertTriangle,
  UserCog,
  Share2,
  X,
  LogOut,
  IndianRupee,
  TrendingUp,
  MessageCircle,
  Building2,
  Settings,
  Zap,
  Megaphone,
  BarChart3,
  Dumbbell,
  ClipboardList
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { isSuperAdmin } from '../api/client'

const allNavItems = [
  // Dashboard
  { path: '/', label: 'Command Center', icon: LayoutDashboard },
  // Lead Management
  { path: '/leads', label: 'Lead CRM', icon: Users },
  { path: '/follow-ups', label: 'Follow-Ups', icon: ClipboardList },
  { path: '/trials', label: 'Trial Engine', icon: Ticket },
  // Members
  { path: '/members', label: 'Members', icon: UserCircle },
  { path: '/memberships', label: 'Memberships', icon: CreditCard },
  { path: '/check-in', label: 'QR Check-In', icon: QrCode },
  // Classes & Training
  { path: '/classes', label: 'Classes', icon: Calendar },
  { path: '/trainers', label: 'Trainers', icon: Dumbbell },
  // Revenue
  { path: '/payments', label: 'Payments', icon: IndianRupee },
  { path: '/revenue', label: 'Revenue', icon: TrendingUp },
  { path: '/revenue-engine', label: 'Revenue Engine', icon: Zap },
  // Retention
  { path: '/at-risk', label: 'At-Risk', icon: AlertTriangle },
  { path: '/renewals', label: 'Renewals', icon: RefreshCw },
  { path: '/referrals', label: 'Referrals', icon: Share2 },
  // Insights
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  // Communication
  { path: '/whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { path: '/socials', label: 'Social Media', icon: Megaphone },
  // Staff & Settings
  { path: '/staff', label: 'Staff', icon: UserCog },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['gym_owner', 'super_admin'] },
  { path: '/integrations', label: 'Integrations', icon: Settings },
  // Admin Only
  { path: '/super-admin', label: 'Super Admin', icon: Building2, superAdminOnly: true },
]

const gymOwnerNavItems = allNavItems.filter(item => !item.superAdminOnly)

export default function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const _isSuperAdmin = isSuperAdmin() || user?.role === 'super_admin'
  const navItems = _isSuperAdmin ? allNavItems : gymOwnerNavItems

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden cursor-pointer"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-30 w-60 bg-slate-950 border-r border-slate-800 text-white flex flex-col h-screen overflow-y-auto transition-transform duration-200 select-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* BRAND HEADER */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3">
          <Link to="/" onClick={onClose} className="flex items-center gap-3 cursor-pointer group">
            <img
              src={`${import.meta.env.BASE_URL}brand/beyond-pixells-logo.png`}
              alt="Beyond Pixells"
              className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-brand-600/30 group-hover:ring-brand-400 transition-all"
            />
            <div>
              <h1 className="text-base font-black tracking-tight leading-tight text-white group-hover:text-brand-400 transition-colors">
                GYM OS
              </h1>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="cursor-pointer lg:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `cursor-pointer flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white font-bold shadow-lg shadow-brand-600/20'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`
                }
              >
                <Icon size={16} />
                <span className="truncate">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* FOOTER USER / LOGOUT */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-brand-600/20 flex items-center justify-center text-brand-400 font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="cursor-pointer w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
