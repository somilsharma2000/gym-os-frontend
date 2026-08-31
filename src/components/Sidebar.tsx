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
  Megaphone,
  BarChart3,
  Dumbbell,
  ClipboardList,
  ChevronLeft,
  Globe
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { isSuperAdmin } from '../api/client'

const allNavItems = [
  { path: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { path: '/leads', label: 'Lead CRM', icon: Users },
  { path: '/follow-ups', label: 'Follow-Ups', icon: ClipboardList },
  { path: '/trials', label: 'Trial Engine', icon: Ticket },
  { path: '/members', label: 'Members', icon: UserCircle },
  { path: '/memberships', label: 'Memberships', icon: CreditCard },
  { path: '/check-in', label: 'QR Check-In', icon: QrCode },
  { path: '/qr-passes', label: 'QR Passes', icon: QrCode },
  { path: '/classes', label: 'Classes', icon: Calendar },
  { path: '/trainers', label: 'Trainers', icon: Dumbbell },
  { path: '/payments', label: 'Payments', icon: IndianRupee },
  { path: '/revenue', label: 'Revenue', icon: TrendingUp },
  { path: '/at-risk', label: 'At-Risk', icon: AlertTriangle },
  { path: '/renewals', label: 'Renewals', icon: RefreshCw },
  { path: '/referrals', label: 'Referrals', icon: Share2 },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { path: '/socials', label: 'Social Media', icon: Megaphone },
  { path: '/staff', label: 'Staff', icon: UserCog },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['gym_owner', 'super_admin'] },
  { path: '/integrations', label: 'Integrations', icon: Settings, superAdminOnly: true },
  { path: '/website-sync', label: 'Website Sync', icon: Globe },
  { path: '/super-admin', label: 'Super Admin', icon: Building2, superAdminOnly: true },
]

const gymOwnerNavItems = allNavItems.filter(item => !item.superAdminOnly)

export default function Sidebar({
  mobileOpen,
  onClose,
  collapsed,
  onToggleCollapse
}: {
  mobileOpen: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}) {
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
      {/* Mobile overlay with backdrop blur transition */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-40 lg:hidden cursor-pointer transition-all duration-300"
          style={{ animation: 'fadeIn 300ms ease-out forwards' }}
          onClick={onClose}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideOutLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        @keyframes navItemSlide {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <aside
        style={{
          transitionProperty: 'width, transform',
          transitionDelay: collapsed ? '150ms' : '0ms'
        }}
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-30 h-screen select-none flex flex-col
          bg-gradient-to-b from-slate-950 to-slate-900
          border-r border-slate-800 shadow-[1px_0_0_0_rgba(37,99,235,0.1)]
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${collapsed ? 'lg:w-[76px]' : 'lg:w-64'}
          w-64
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Premium gradient accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-600/50 to-transparent" />

        {/* Collapse toggle (desktop) — floating pill */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex cursor-pointer absolute top-8 -right-3.5 z-50 w-7 h-7 rounded-full bg-slate-800 border border-slate-700 items-center justify-center text-slate-300 hover:text-white hover:bg-brand-600 hover:border-brand-600 shadow-lg hover:shadow-brand-600/40 hover:scale-110 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            size={14}
            className={`transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? 'rotate-180' : ''}`}
          />
        </button>

        {/* BRAND HEADER */}
        <div className={`px-5 py-5 border-b border-slate-800/80 flex items-center gap-3 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? 'lg:justify-center lg:px-0' : 'justify-between'}`}>
          <Link to="/dashboard" onClick={onClose} className="flex items-center gap-3 cursor-pointer group min-w-0">
            <div className="relative flex-shrink-0">
              <img
                src={`${import.meta.env.BASE_URL}brand/beyond-pixells-logo.png`}
                alt="Beyond Pixells"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-600/30 group-hover:ring-brand-400 group-hover:animate-pulse transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105"
              />
              {/* Pulsing accent dot */}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-950" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
            </div>
            <div
              className={`overflow-hidden transition-all ease-[cubic-bezier(0.4,0,0.2,1)] ${
                collapsed
                  ? 'lg:w-0 lg:opacity-0 duration-150 delay-0 pointer-events-none'
                  : 'w-auto opacity-100 duration-300 delay-[200ms]'
              }`}
            >
              <h1 className="text-base font-black tracking-tight leading-tight text-white group-hover:text-brand-400 transition-colors duration-300 whitespace-nowrap">
                GYM OS
              </h1>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="cursor-pointer lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all duration-200 flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* NAVIGATION LINKS CONTAINER */}
        <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
          <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto overflow-x-hidden min-h-0 sidebar-scroll">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group relative cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                    ${collapsed ? 'lg:justify-center lg:px-0 lg:w-12 lg:mx-auto' : ''}
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold shadow-[0_0_15px_rgba(37,99,235,0.15)] shadow-brand-600/25'
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-white hover:translate-x-1'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Left accent bar (3px wide blue bar) that animates height from 0 to full on hover/active */}
                      <span
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-blue-500 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                          isActive
                            ? 'h-full opacity-100'
                            : 'h-0 opacity-0 group-hover:h-full group-hover:opacity-100'
                        }`}
                      />

                      <Icon size={16} className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />

                      <span
                        className={`truncate transition-all ease-[cubic-bezier(0.4,0,0.2,1)] ${
                          collapsed
                            ? 'lg:w-0 lg:opacity-0 duration-150 delay-0 pointer-events-none'
                            : 'w-auto opacity-100 duration-300 delay-[200ms]'
                        }`}
                      >
                        {item.label}
                      </span>

                      {/* Tooltip for collapsed state with slide-in from left */}
                      {collapsed && (
                        <span className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-semibold whitespace-nowrap shadow-xl z-50 pointer-events-none animate-in slide-in-from-left-2 duration-200">
                          {item.label}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* Subtle bottom gradient fade at bottom of nav area */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-950 to-transparent z-10 opacity-90" />
        </div>

        {/* FOOTER USER / LOGOUT */}
        <div className="p-3 border-t border-slate-800/80 bg-gradient-to-b from-slate-900/40 to-slate-950/60">
          <div className={`flex items-center gap-3 mb-2.5 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? 'lg:justify-center lg:mb-2' : ''}`}>
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand-600/20">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
            <div
              className={`flex-1 min-w-0 overflow-hidden transition-all ease-[cubic-bezier(0.4,0,0.2,1)] ${
                collapsed
                  ? 'lg:w-0 lg:opacity-0 lg:flex-none duration-150 delay-0 pointer-events-none'
                  : 'w-auto opacity-100 duration-300 delay-[200ms]'
              }`}
            >
              <p className="text-xs font-bold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className={`cursor-pointer flex items-center gap-2 w-full py-2 px-3 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-xs font-semibold ${
              collapsed ? 'lg:justify-center lg:px-0' : ''
            }`}
          >
            <LogOut size={16} className="flex-shrink-0" />
            <span
              className={`truncate transition-all ease-[cubic-bezier(0.4,0,0.2,1)] ${
                collapsed
                  ? 'lg:w-0 lg:opacity-0 duration-150 delay-0 pointer-events-none'
                  : 'w-auto opacity-100 duration-300 delay-[200ms]'
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}
