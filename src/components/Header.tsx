import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Menu,
  ChevronDown,
  Building2,
  MapPin,
  Check,
  LogOut,
  Sun,
  Moon,
  Lock,
  Sparkles,
  Settings,
  Eye,
  User as UserIcon
} from 'lucide-react'
import { api, getGymId, setGymId, getBranchId, setBranchId, isSuperAdmin } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

interface GymInfo {
  gym_id: string
  gym_name: string
  branding?: { primary_color: string }
}

interface BranchInfo {
  id: string
  name: string
  code: string
}

const DEFAULT_GYMS: GymInfo[] = [
  { gym_id: 'gym_oxigen', gym_name: 'Oxigen Fitness (Main)', branding: { primary_color: '#0066FF' } },
  { gym_id: 'gym_powerhouse', gym_name: 'Powerhouse Fitness', branding: { primary_color: '#10B981' } },
  { gym_id: 'gym_ironforge', gym_name: 'Iron Forge Gym', branding: { primary_color: '#F59E0B' } },
  { gym_id: 'gym_golds', gym_name: "Gold's Fitness Club", branding: { primary_color: '#EF4444' } }
]

const SAMPLE_BRANCHES: BranchInfo[] = [
  { id: 'branch_c_scheme', name: 'C-Scheme Main Branch', code: 'CS' },
  { id: 'branch_vaishali', name: 'Vaishali Nagar Branch', code: 'VN' },
  { id: 'branch_malviya', name: 'Malviya Nagar Branch', code: 'MN' }
]

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const [gyms, setGyms] = useState<GymInfo[]>(DEFAULT_GYMS)
  const [selectedGym, setSelectedGym] = useState<GymInfo | null>(null)
  const [gymDropdownOpen, setGymDropdownOpen] = useState(false)

  const [branches] = useState<BranchInfo[]>(SAMPLE_BRANCHES)
  const [selectedBranch, setSelectedBranch] = useState<BranchInfo>(SAMPLE_BRANCHES[0])
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false)

  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const gymDropdownRef = useRef<HTMLDivElement>(null)
  const branchDropdownRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const _isSuperAdmin = isSuperAdmin() || user?.role === 'super_admin'

  // Initialize selected branch from localStorage
  useEffect(() => {
    const currentBranchId = getBranchId()
    const found = branches.find(b => b.id === currentBranchId) || branches[0]
    setSelectedBranch(found)
  }, [branches])

  // Initialize gyms list and selected gym
  useEffect(() => {
    let isMounted = true

    if (_isSuperAdmin) {
      api.getAllGyms()
        .then(res => {
          if (!isMounted) return
          if (res && res.success && Array.isArray(res.gyms) && res.gyms.length > 0) {
            const list = res.gyms.map((g: any) => ({
              gym_id: g.gym_id || g.gym_code,
              gym_name: g.gym_name || g.name,
              branding: g.branding
            }))
            setGyms(list)
            const currentId = getGymId()
            const current = list.find((g: GymInfo) => g.gym_id === currentId) || list[0]
            setSelectedGym(current)
          } else {
            // Use fallback DEFAULT_GYMS
            setGyms(DEFAULT_GYMS)
            const currentId = getGymId()
            const current = DEFAULT_GYMS.find((g: GymInfo) => g.gym_id === currentId) || DEFAULT_GYMS[0]
            setSelectedGym(current)
          }
        })
        .catch(() => {
          if (!isMounted) return
          setGyms(DEFAULT_GYMS)
          const currentId = getGymId()
          const current = DEFAULT_GYMS.find((g: GymInfo) => g.gym_id === currentId) || DEFAULT_GYMS[0]
          setSelectedGym(current)
        })
    } else if (user) {
      setSelectedGym({ gym_id: user.gym_id, gym_name: user.gym_name })
    }

    return () => { isMounted = false }
  }, [_isSuperAdmin, user])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (gymDropdownRef.current && !gymDropdownRef.current.contains(e.target as Node)) {
        setGymDropdownOpen(false)
      }
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(e.target as Node)) {
        setBranchDropdownOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const selectGym = (gym: GymInfo) => {
    setSelectedGym(gym)
    setGymId(gym.gym_id)
    setGymDropdownOpen(false)
    window.location.reload()
  }

  const selectBranch = (branch: BranchInfo) => {
    setSelectedBranch(branch)
    setBranchId(branch.id)
    setBranchDropdownOpen(false)
    window.dispatchEvent(new CustomEvent('branch:changed', { detail: branch.id }))
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/80 px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-50 transition-colors shadow-sm">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="cursor-pointer lg:hidden text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors -ml-1"
          aria-label="Open Mobile Menu"
        >
          <Menu size={22} />
        </button>

        {/* GYM SWITCHER DROPDOWN */}
        <div className="relative" ref={gymDropdownRef}>
          {_isSuperAdmin ? (
            <button
              onClick={() => {
                setGymDropdownOpen(!gymDropdownOpen)
                setBranchDropdownOpen(false)
                setUserMenuOpen(false)
              }}
              className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all text-slate-800 dark:text-slate-100"
            >
              <Building2 size={16} className="text-brand-600 dark:text-brand-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-bold truncate max-w-[120px] sm:max-w-[180px]">
                {selectedGym?.gym_name || 'Select Gym'}
              </span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${gymDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 cursor-default">
              <Building2 size={16} className="text-brand-600 dark:text-brand-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate max-w-[140px]">
                {selectedGym?.gym_name || user?.gym_name || 'My Gym'}
              </span>
              <span title="Locked to assigned gym"><Lock size={12} className="text-slate-400" /></span>
            </div>
          )}

          {/* Gym Dropdown Menu */}
          {gymDropdownOpen && _isSuperAdmin && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-[60] animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Gym Tenant</p>
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {gyms.map(gym => {
                  const isSelected = selectedGym?.gym_id === gym.gym_id
                  return (
                    <button
                      key={gym.gym_id}
                      onClick={() => selectGym(gym)}
                      className={`cursor-pointer w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/70 flex items-center justify-between transition-colors ${
                        isSelected ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: gym.branding?.primary_color || '#0066FF' }} />
                        <div className="truncate">
                          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{gym.gym_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">{gym.gym_id}</p>
                        </div>
                      </div>
                      {isSelected && <Check size={14} className="text-brand-600 dark:text-brand-400 flex-shrink-0 ml-2" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* BRANCH SELECTOR DROPDOWN */}
        <div className="relative hidden md:block" ref={branchDropdownRef}>
          <button
            onClick={() => {
              setBranchDropdownOpen(!branchDropdownOpen)
              setGymDropdownOpen(false)
              setUserMenuOpen(false)
            }}
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all text-slate-800 dark:text-slate-100"
          >
            <MapPin size={15} className="text-emerald-500 flex-shrink-0" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[150px]">
              {selectedBranch.name}
            </span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${branchDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Branch Dropdown Menu */}
          {branchDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-[60] animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Gym Branch</p>
              </div>
              <div className="py-1">
                {branches.map(branch => {
                  const isSelected = selectedBranch.id === branch.id
                  return (
                    <button
                      key={branch.id}
                      onClick={() => selectBranch(branch)}
                      className={`cursor-pointer w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/70 flex items-center justify-between transition-colors ${
                        isSelected ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {branch.code}
                        </span>
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-100 truncate">{branch.name}</span>
                      </div>
                      {isSelected && <Check size={14} className="text-emerald-500 flex-shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE CONTROLS & PROFILE MENU */}
      <div className="flex items-center gap-2">
        {/* DEMO MODE LINK BUTTON */}
        <Link
          to="/demo"
          className="cursor-pointer hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30 transition-all"
          title="Explore Interactive Demo Mode"
        >
          <Sparkles size={14} />
          <span>Demo Mode</span>
        </Link>

        {/* THEME TOGGLE BUTTON */}
        <button
          onClick={toggleTheme}
          className="cursor-pointer p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* PROFILE MENU DROPDOWN */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => {
              setUserMenuOpen(!userMenuOpen)
              setGymDropdownOpen(false)
              setBranchDropdownOpen(false)
            }}
            className="cursor-pointer flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <img
              src={`${import.meta.env.BASE_URL}brand/beyond-pixells-logo.png`}
              alt="Beyond Pixells"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/40 flex-shrink-0"
            />
            <div className="text-left hidden sm:block">
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                {user?.name || 'Gym Admin'}
              </span>
              <span className="block text-[10px] text-slate-400 capitalize leading-tight">
                {user?.role?.replace(/_/g, ' ') || 'Admin'}
              </span>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {userMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-[60] animate-in fade-in zoom-in-95">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/60">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{user?.name || 'Gym Admin'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email || 'admin@oxigen.fitness'}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                    {user?.role?.replace(/_/g, ' ') || 'Admin'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{selectedGym?.gym_name}</span>
                </div>
              </div>

              <div className="py-1">
                <Link
                  to="/demo"
                  onClick={() => setUserMenuOpen(false)}
                  className="cursor-pointer flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
                >
                  <Eye size={15} className="text-emerald-500" /> Switch to Demo Mode
                </Link>

                {_isSuperAdmin && (
                  <Link
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="cursor-pointer flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
                  >
                    <Settings size={15} className="text-slate-400" /> Gym Settings & Integrations
                  </Link>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700/60 pt-1 mt-1">
                <button
                  onClick={handleLogout}
                  className="cursor-pointer w-full text-left px-4 py-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 transition-colors"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
