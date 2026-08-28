import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Ticket, QrCode, UserCircle, CreditCard, Calendar, RefreshCw, AlertTriangle, UserCog, Share2, X, LogOut, IndianRupee, TrendingUp, MessageCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { path: '/', label: 'Command Center', icon: LayoutDashboard },
  { path: '/leads', label: 'Lead CRM', icon: Users },
  { path: '/trials', label: 'Trial Engine', icon: Ticket },
  { path: '/check-in', label: 'QR Check-In', icon: QrCode },
  { path: '/members', label: 'Members', icon: UserCircle },
  { path: '/memberships', label: 'Memberships', icon: CreditCard },
  { path: '/payments', label: 'Payments', icon: IndianRupee },
  { path: '/revenue', label: 'Revenue', icon: TrendingUp },
  { path: '/whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { path: '/classes', label: 'Classes', icon: Calendar },
  { path: '/renewals', label: 'Renewals', icon: RefreshCw },
  { path: '/at-risk', label: 'At-Risk', icon: AlertTriangle },
  { path: '/staff', label: 'Staff', icon: UserCog },
  { path: '/referrals', label: 'Referrals', icon: Share2 }
]

export default function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 w-60 bg-brand-950 text-white flex flex-col h-screen overflow-y-auto transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-5 py-5 border-b border-brand-800 flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}brand/beyond-pixells-logo.png`} alt="Beyond Pixells" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
          <div className="flex-1">
            <h1 className="text-base font-bold tracking-tight leading-tight">GYM OS</h1>
            <p className="text-[10px] text-brand-300 leading-tight">by Beyond Pixells</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-brand-300 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 py-3">
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
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
          {user && (
            <div className="mb-2">
              <p className="text-xs text-white font-medium truncate">{user.name}</p>
              <p className="text-xs text-brand-400 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-brand-300 hover:text-white transition-colors mt-1"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
