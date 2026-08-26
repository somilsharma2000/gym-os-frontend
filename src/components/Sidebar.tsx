import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Ticket, QrCode, UserCircle, CreditCard, Calendar, RefreshCw, AlertTriangle, UserCog, Share2 } from 'lucide-react'

const navItems = [
  { path: '/', label: 'Command Center', icon: LayoutDashboard },
  { path: '/leads', label: 'Lead CRM', icon: Users },
  { path: '/trials', label: 'Trial Engine', icon: Ticket },
  { path: '/check-in', label: 'QR Check-In', icon: QrCode },
  { path: '/members', label: 'Members', icon: UserCircle },
  { path: '/memberships', label: 'Memberships', icon: CreditCard },
  { path: '/classes', label: 'Classes', icon: Calendar },
  { path: '/renewals', label: 'Renewals', icon: RefreshCw },
  { path: '/at-risk', label: 'At-Risk', icon: AlertTriangle },
  { path: '/staff', label: 'Staff', icon: UserCog },
  { path: '/referrals', label: 'Referrals', icon: Share2 }
]

export default function Sidebar() {
  return (
    <aside className="w-60 bg-brand-950 text-white flex flex-col h-screen sticky top-0 overflow-y-auto">
      <div className="px-5 py-5 border-b border-brand-800 flex items-center gap-3">
        <img src={`${import.meta.env.BASE_URL}brand/beyond-pixels-logo.jpg`} alt="Beyond Pixels" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
        <div>
          <h1 className="text-base font-bold tracking-tight leading-tight">GYM OS</h1>
          <p className="text-[10px] text-brand-300 leading-tight">by Beyond Pixels</p>
        </div>
      </div>
      <nav className="flex-1 py-3">
        {navItems.map(item => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-brand-700 text-white border-l-2 border-brand-300'
                    : 'text-brand-200 hover:bg-brand-900 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
      <div className="px-5 py-3 border-t border-brand-800">
        <p className="text-xs text-brand-300">Oxigen Fitness</p>
        <p className="text-xs text-brand-500">C-Scheme, Jaipur</p>
        <p className="text-[10px] text-amber-400 mt-1 font-semibold">[ DEMO MODE ACTIVE ]</p>
      </div>
    </aside>
  )
}
