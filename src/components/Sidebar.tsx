import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Ticket, QrCode, UserCircle } from 'lucide-react'

const navItems = [
  { path: '/', label: 'Command Center', icon: LayoutDashboard },
  { path: '/leads', label: 'Lead CRM', icon: Users },
  { path: '/trials', label: 'Trial Engine', icon: Ticket },
  { path: '/check-in', label: 'QR Check-In', icon: QrCode },
  { path: '/members', label: 'Members', icon: UserCircle }
]

export default function Sidebar() {
  return (
    <aside className="w-60 bg-brand-950 text-white flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-brand-800">
        <h1 className="text-lg font-bold tracking-tight">GYM OS</h1>
        <p className="text-xs text-brand-400 mt-0.5">Management Platform</p>
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
                    ? 'bg-brand-800 text-white border-l-2 border-orange-400'
                    : 'text-brand-300 hover:bg-brand-900 hover:text-white'
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
        <p className="text-xs text-brand-400">Oxigen Fitness</p>
        <p className="text-xs text-brand-500">C-Scheme, Jaipur</p>
      </div>
    </aside>
  )
}
