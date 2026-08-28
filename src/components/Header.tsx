import { useState, useEffect, useRef } from 'react'
import { Menu, ChevronDown, Building2, Check, LogOut, Sun, Moon, Lock } from 'lucide-react'
import { api, getGymId, setGymId, isSuperAdmin } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

interface GymInfo {
  gym_id: string
  gym_name: string
  branding?: { primary_color: string }
}

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [gyms, setGyms] = useState<GymInfo[]>([])
  const [selectedGym, setSelectedGym] = useState<GymInfo | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const _isSuperAdmin = isSuperAdmin()

  useEffect(() => {
    if (_isSuperAdmin) {
      api.getAllGyms().then(res => {
        if (res.success && res.gyms) {
          const list = res.gyms.map((g: any) => ({ gym_id: g.gym_id, gym_name: g.gym_name, branding: g.branding }))
          setGyms(list)
          const currentId = getGymId()
          const current = list.find((g: GymInfo) => g.gym_id === currentId) || list[0]
          setSelectedGym(current)
        }
      }).catch(() => {})
    } else if (user) {
      // Gym owner — locked to their gym
      setSelectedGym({ gym_id: user.gym_id, gym_name: user.gym_name })
    }
  }, [_isSuperAdmin, user])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectGym = (gym: GymInfo) => {
    setSelectedGym(gym)
    setGymId(gym.gym_id)
    setDropdownOpen(false)
    // Real-time sync: reload to re-fetch all data for the new gym
    window.location.reload()
  }

  const handleLogout = () => {
    logout()
    window.location.hash = '#/login'
  }

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-20 transition-colors">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-1 -ml-1">
          <Menu size={22} />
        </button>
        {/* Gym Selector — super admin can switch, gym owner is locked */}
        <div className="relative" ref={dropdownRef}>
          {_isSuperAdmin ? (
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Building2 size={16} className="text-brand-600 dark:text-brand-400" />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {selectedGym?.gym_name || 'Select Gym'}
              </span>
              <ChevronDown size={16} className="text-slate-400 dark:text-slate-500" />
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 cursor-default">
              <Building2 size={16} className="text-brand-600 dark:text-brand-400" />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {selectedGym?.gym_name || user?.gym_name || 'My Gym'}
              </span>
              <span title="Locked to your gym"><Lock size={12} className="text-slate-400" /></span>
            </div>
          )}
          {dropdownOpen && _isSuperAdmin && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 max-h-80 overflow-y-auto z-50">
              {gyms.map(gym => (
                <button
                  key={gym.gym_id}
                  onClick={() => selectGym(gym)}
                  className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between ${
                    selectedGym?.gym_id === gym.gym_id ? 'bg-brand-50 dark:bg-brand-900/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: gym.branding?.primary_color || '#0066FF' }} />
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{gym.gym_name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{gym.gym_id}</p>
                    </div>
                  </div>
                  {selectedGym?.gym_id === gym.gym_id && <Check size={16} className="text-brand-600 dark:text-brand-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <img
              src={`${import.meta.env.BASE_URL}brand/beyond-pixells-logo.png`}
              alt="Beyond Pixells"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block">{user?.name || 'User'}</span>
            <ChevronDown size={16} className="text-slate-400 dark:text-slate-500" />
          </button>
          {userMenuOpen && (
            <div className="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{user?.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{user?.email}</p>
                <p className="text-xs text-brand-600 dark:text-brand-400 mt-1 capitalize">{user?.role?.replace(/_/g, ' ')}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
