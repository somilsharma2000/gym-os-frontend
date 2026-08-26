import { useState, useEffect, useRef } from 'react'
import { Menu, ChevronDown, Building2, Check } from 'lucide-react'
import { api, getGymId, setGymId } from '../api/client'

interface GymTenant {
  id: string
  gym_name: string
  gym_code: string
}

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const [gyms, setGyms] = useState<GymTenant[]>([])
  const [selectedGym, setSelectedGym] = useState<GymTenant | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.getGymTenants().then(res => {
      const list = res.gyms || res.data || res || []
      if (Array.isArray(list) && list.length > 0) {
        setGyms(list)
        const currentId = getGymId()
        const current = list.find((g: any) => g.gym_code === currentId || g.id === currentId) || list[0]
        setSelectedGym(current)
      }
    }).catch(() => {
      // Fallback
      const fallback = { id: 'gym_oxigen', gym_name: 'Oxigen Fitness', gym_code: 'gym_oxigen' }
      setGyms([fallback])
      setSelectedGym(fallback)
    })
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectGym = (gym: GymTenant) => {
    setSelectedGym(gym)
    setGymId(gym.gym_code || gym.id)
    setDropdownOpen(false)
    window.location.reload()
  }

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-slate-600 hover:text-slate-900 p-1 -ml-1">
          <Menu size={22} />
        </button>
        {/* Gym Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Building2 size={16} className="text-brand-600" />
            <span className="text-sm font-semibold text-slate-800">
              {selectedGym?.gym_name || 'Select Gym'}
            </span>
            <ChevronDown size={16} className="text-slate-400" />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1 max-h-80 overflow-y-auto z-50">
              {gyms.map(gym => (
                <button
                  key={gym.id}
                  onClick={() => selectGym(gym)}
                  className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between ${
                    selectedGym?.id === gym.id ? 'bg-brand-50' : ''
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{gym.gym_name}</p>
                    <p className="text-xs text-slate-400">{gym.gym_code}</p>
                  </div>
                  {selectedGym?.id === gym.id && <Check size={16} className="text-brand-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
