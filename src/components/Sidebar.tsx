import { useState, useEffect } from 'react'
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
  ChevronDown,
  Check,
  Zap,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { isSuperAdmin, setGymId, getGymId } from '../api/client'

// GYMOS app for gym data, Superagent app for auth
const GYMOS_API = 'https://base44.app/api/apps/6a8949954092729194579577/functions'

// Full nav — super admin sees everything including Super Admin
const allNavItems = [
  { path: '/', label: 'Command Center', icon: LayoutDashboard },
  { path: '/leads', label: 'Lead CRM', icon: Users },
  { path: '/trials', label: 'Trial Engine', icon: Ticket },
  { path: '/check-in', label: 'QR Check-In', icon: QrCode },
  { path: '/members', label: 'Members', icon: UserCircle },
  { path: '/memberships', label: 'Memberships', icon: CreditCard },
  { path: '/payments', label: 'Payments', icon: IndianRupee },
  { path: '/revenue', label: 'Revenue', icon: TrendingUp },
  { path: '/revenue-engine', label: 'Revenue Engine', icon: Zap },
  { path: '/whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { path: '/classes', label: 'Classes', icon: Calendar },
  { path: '/renewals', label: 'Renewals', icon: RefreshCw },
  { path: '/at-risk', label: 'At-Risk', icon: AlertTriangle },
  { path: '/staff', label: 'Staff', icon: UserCog },
  { path: '/referrals', label: 'Referrals', icon: Share2 },
  { path: '/super-admin', label: 'Super Admin', icon: Building2, superAdminOnly: true },
  { path: '/settings', label: 'Integrations', icon: Settings, superAdminOnly: true }
]

// Gym owner nav — no Super Admin
const gymOwnerNavItems = allNavItems.filter(item => !item.superAdminOnly)

interface Gym {
  gym_id: string
  gym_name: string
  branding?: { primary_color: string }
}

const FALLBACK_GYMS: Gym[] = [
  { gym_id: 'gym_oxigen', gym_name: 'Oxigen Fitness', branding: { primary_color: '#0066FF' } },
  { gym_id: 'gym_powerhouse', gym_name: 'Powerhouse Fitness', branding: { primary_color: '#10B981' } },
  { gym_id: 'gym_ironforge', gym_name: 'Iron Forge Gym', branding: { primary_color: '#F59E0B' } }
]

export default function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [gyms, setGyms] = useState<Gym[]>(FALLBACK_GYMS)
  const [currentGymId, setCurrentGymId] = useState(getGymId())
  const [gymDropdownOpen, setGymDropdownOpen] = useState(false)

  const _isSuperAdmin = isSuperAdmin() || user?.role === 'super_admin'
  const navItems = _isSuperAdmin ? allNavItems : gymOwnerNavItems

  useEffect(() => {
    if (_isSuperAdmin) fetchGyms()
  }, [_isSuperAdmin])

  useEffect(() => {
    if (!_isSuperAdmin && user?.gym_id) {
      setGymId(user.gym_id)
      setCurrentGymId(user.gym_id)
    }
  }, [_isSuperAdmin, user])

  const fetchGyms = async () => {
    try {
      const res = await fetch(`${GYMOS_API}/getGymTenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gym_id: 'ALL' })
      })
      const data = await res.json()
      if (data.success && (data.tenants || data.gyms)) {
        const list = data.tenants || data.gyms
        setGyms(list.map((g: any) => ({
          gym_id: g.gym_code || g.gym_id,
          gym_name: g.gym_name || g.name,
          branding: g.branding
        })))
      }
    } catch {
      setGyms(FALLBACK_GYMS)
    }
  }

  const currentGym = gyms.find(g => g.gym_id === currentGymId) || {
    gym_id: currentGymId,
    gym_name: user?.gym_name || 'My Gym'
  }

  const handleGymSwitch = (gymId: string) => {
    setGymId(gymId)
    setCurrentGymId(gymId)
    setGymDropdownOpen(false)
    window.location.reload()
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* Mobile backdrop */}
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
              className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-emerald-500/30 group-hover:ring-emerald-400 transition-all"
            />
            <div>
              <h1 className="text-base font-black tracking-tight leading-tight text-white group-hover:text-emerald-400 transition-colors">
                GYM OS
              </h1>
              <p className="text-[10px] text-slate-400 leading-tight">by Beyond Pixells</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="cursor-pointer lg:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* GYM SWITCHER DROPDOWN IN SIDEBAR FOR SUPER ADMIN */}
        {_isSuperAdmin && (
          <div className="relative border-b border-slate-800 bg-slate-900/50">
            <button
              onClick={() => setGymDropdownOpen(!gymDropdownOpen)}
              className="cursor-pointer w-full flex items-center gap-2 px-5 py-3 text-left hover:bg-slate-800/80 transition-colors"
            >
              <Building2 size={16} className="text-emerald-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Current Gym</p>
                <p className="text-xs font-bold truncate text-slate-100">{currentGym.gym_name}</p>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${gymDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {gymDropdownOpen && (
              <div className="absolute left-2 right-2 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto py-1">
                {gyms.map(gym => (
                  <button
                    key={gym.gym_id}
                    onClick={() => handleGymSwitch(gym.gym_id)}
                    className={`cursor-pointer w-full flex items-center gap-2 px-3.5 py-2 text-left text-xs hover:bg-slate-800 transition-colors ${
                      gym.gym_id === currentGymId ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'text-slate-200'
                    }`}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: gym.branding?.primary_color || '#0066FF' }}
                    />
                    <span className="flex-1 truncate">{gym.gym_name}</span>
                    {gym.gym_id === currentGymId && <Check size={14} className="text-emerald-400 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!_isSuperAdmin && (
          <div className="border-b border-slate-800 px-5 py-3 bg-slate-900/40">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-emerald-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Your Gym</p>
                <p className="text-xs font-bold truncate text-slate-100">{user?.gym_name || 'My Gym'}</p>
              </div>
            </div>
          </div>
        )}

        {/* DEMO MODE LINK IN SIDEBAR */}
        <div className="px-3 pt-3">
          <Link
            to="/demo"
            onClick={onClose}
            className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/10 hover:from-emerald-500/30 hover:to-teal-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition-all shadow-sm"
          >
            <Sparkles size={16} />
            <span>Interactive Demo Mode</span>
          </Link>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
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
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
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
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 space-y-2">
          {user && (
            <div>
              <p className="text-xs text-white font-bold truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              {_isSuperAdmin && <p className="text-[10px] font-bold text-emerald-400 mt-0.5">Super Admin</p>}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="cursor-pointer w-full flex items-center gap-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 px-3 py-2 rounded-xl transition-colors"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
