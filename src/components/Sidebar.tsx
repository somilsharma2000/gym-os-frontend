import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Ticket, QrCode, UserCircle, CreditCard, Calendar, RefreshCw, AlertTriangle, UserCog, Share2, X, LogOut, IndianRupee, TrendingUp, MessageCircle, Building2, Settings, ChevronDown, Check, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { canSwitchGym, isSuperAdmin, getAuthUser } from '../api/client'

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

export default function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [gyms, setGyms] = useState<Gym[]>([])
  const [currentGymId, setCurrentGymId] = useState(localStorage.getItem('gym_os_gym_id') || 'gym_oxigen')
  const [gymDropdownOpen, setGymDropdownOpen] = useState(false)

  const _isSuperAdmin = isSuperAdmin()
  const navItems = _isSuperAdmin ? allNavItems : gymOwnerNavItems

  useEffect(() => {
    // Only fetch gyms for super admin
    if (_isSuperAdmin) fetchGyms()
  }, [_isSuperAdmin])

  // For gym owners, lock to their gym_id
  useEffect(() => {
    if (!_isSuperAdmin && user?.gym_id) {
      localStorage.setItem('gym_os_gym_id', user.gym_id)
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
        setGyms(list.map((g: any) => ({ gym_id: g.gym_code || g.gym_id, gym_name: g.gym_name, branding: g.branding })))
      }
    } catch (err) {
      // Silent fail
    }
  }

  const currentGym = gyms.find(g => g.gym_id === currentGymId) || { gym_id: currentGymId, gym_name: user?.gym_name || 'My Gym' }

  const handleGymSwitch = (gymId: string) => {
    localStorage.setItem('gym_os_gym_id', gymId)
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

        {/* Gym Switcher — ONLY for super admin */}
        {_isSuperAdmin && gyms.length > 0 && (
          <div className="relative border-b border-brand-800">
            <button
              onClick={() => setGymDropdownOpen(!gymDropdownOpen)}
              className="w-full flex items-center gap-2 px-5 py-3 text-left hover:bg-brand-900 transition-colors"
            >
              <Building2 size={16} className="text-brand-300 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-brand-400 uppercase tracking-wide">Current Gym</p>
                <p className="text-sm font-semibold truncate">{currentGym.gym_name}</p>
              </div>
              <ChevronDown size={16} className={`text-brand-400 transition-transform ${gymDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {gymDropdownOpen && (
              <div className="absolute left-0 right-0 top-full bg-brand-900 border border-brand-700 rounded-b-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                {gyms.map(gym => (
                  <button
                    key={gym.gym_id}
                    onClick={() => handleGymSwitch(gym.gym_id)}
                    className="w-full flex items-center gap-2 px-5 py-2.5 text-left text-sm hover:bg-brand-800 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: gym.branding?.primary_color || '#0066FF' }} />
                    <span className="flex-1 truncate text-brand-100">{gym.gym_name}</span>
                    {gym.gym_id === currentGymId && <Check size={14} className="text-brand-300" />}
                  </button>
                ))}
                <NavLink
                  to="/super-admin"
                  onClick={() => setGymDropdownOpen(false)}
                  className="w-full flex items-center gap-2 px-5 py-2.5 text-xs text-brand-400 hover:bg-brand-800 border-t border-brand-700"
                >
                  <Building2 size={12} /> Manage All Gyms
                </NavLink>
              </div>
            )}
          </div>
        )}

        {/* For gym owners — show their gym name (locked, no switching) */}
        {!_isSuperAdmin && (
          <div className="border-b border-brand-800 px-5 py-3">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-brand-300 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-brand-400 uppercase tracking-wide">Your Gym</p>
                <p className="text-sm font-semibold truncate">{user?.gym_name || 'My Gym'}</p>
              </div>
            </div>
          </div>
        )}

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
              {_isSuperAdmin && <p className="text-[10px] text-brand-300 mt-1">Super Admin</p>}
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
