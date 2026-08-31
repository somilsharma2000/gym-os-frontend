import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LayoutDashboard, Sparkles, ChevronRight } from 'lucide-react'
import { enableDemoMode } from '../data/demoData'

export default function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/features', label: 'Features' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
    { path: '/blog', label: 'Blog' },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const handleDashboardClick = () => {
    enableDemoMode()
    navigate('/dashboard')
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0a0e17]/90 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 group select-none">
          <img
            src={`${import.meta.env.BASE_URL}brand/beyond-pixells-logo.png`}
            alt="Beyond Pixells Logo"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#2563eb]/40 group-hover:ring-[#2563eb] transition-all duration-300"
          />
          <div>
            <div className="text-lg font-black tracking-tight text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
              Gym OS
            </div>
            <div className="text-[11px] font-medium text-slate-400 tracking-wide">
              by Beyond Pixells
            </div>
          </div>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const active = isActive(link.path)
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'text-white bg-slate-800/80 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* DASHBOARD LINK / CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={handleDashboardClick}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#2563eb] hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>
        </div>

        {/* MOBILE HAMBURGER BUTTON */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800/60 border border-slate-700/60"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0e17] border-b border-slate-800 px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => {
            const active = isActive(link.path)
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'text-white bg-[#2563eb]/20 border border-[#2563eb]/40 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                handleDashboardClick()
              }}
              className="w-full px-4 py-3 text-sm font-semibold text-white bg-[#2563eb] hover:bg-blue-500 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <LayoutDashboard size={16} />
              <span>Go to Dashboard</span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
