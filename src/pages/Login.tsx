import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Sparkles, HelpCircle } from 'lucide-react'
import { api, isTokenExpired } from '../api/client'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotMsg, setForgotMsg] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const emailVal = email.trim()
    const passwordVal = password.trim()

    if (!emailVal || !passwordVal) {
      setError('Please enter your email and password.')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailVal)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await api.login(emailVal, passwordVal)
      if (res.success && res.token && res.user) {
        // Verify token isn't immediately expired
        if (isTokenExpired(res.token)) {
          setError('Login succeeded but session expired. Please try again.')
          setLoading(false)
          return
        }
        login(res.token, res.user)
        navigate('/', { replace: true })
      } else {
        setError(res.error || 'Invalid credentials. Please try again.')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0E27] flex flex-col items-center justify-center p-4">
      {/* Logo Header */}
      <div className="flex items-center gap-3 mb-8">
        <img
          src={`${import.meta.env.BASE_URL}brand/beyond-pixells-logo.png`}
          alt="Beyond Pixells"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">GYM OS</h1>
          <p className="text-xs text-slate-400">by Beyond Pixells</p>
        </div>
      </div>

      {/* Demo Mode Badge */}
      <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-medium">
        <Sparkles size={14} className="text-brand-400" />
        <span>Demo mode active — explore with sample data</span>
      </div>

      {/* Login Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl shadow-2xl w-full max-w-md p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Sign In</h2>
          <p className="text-sm text-slate-400 mt-1">Enter your credentials to access your dashboard</p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 p-3 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-300">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {forgotMsg && (
          <div className="mb-4 flex items-start gap-2 p-3 bg-brand-900/40 border border-brand-700/50 rounded-lg text-sm text-brand-200">
            <HelpCircle size={16} className="flex-shrink-0 mt-0.5 text-brand-400" />
            <span>Contact support at beyondpixells@gmail.com</span>
          </div>
        )}

        <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="login-email"
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="you@gym.com"
                autoComplete="email"
                autoFocus
                required
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-700 rounded-lg bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-300">Password</label>
              <button
                type="button"
                onClick={() => setForgotMsg(!forgotMsg)}
                className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="login-password"
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-700 rounded-lg bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Try Demo Button */}
          <button
            type="button"
            onClick={() => {
              setEmail('demo@oxigen.fitness')
              setPassword('demo123')
              setTimeout(() => {
                const form = document.getElementById('login-form') as HTMLFormElement
                form?.requestSubmit()
              }, 100)
            }}
            className="w-full py-2.5 text-sm font-semibold text-brand-400 border border-brand-500/30 rounded-lg hover:bg-brand-500/10 transition-colors"
          >
            Try Demo Dashboard
          </button>
        </form>

        {/* Book Demo Link */}
        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <a
            href="https://somilsharma2000.github.io/beyond-pixells/"
            className="text-xs font-medium text-slate-400 hover:text-brand-300 transition-colors"
          >
            New to Gym OS? <span className="text-brand-400 underline">Book a demo</span>
          </a>
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-6">Beyond Pixells Gym OS — Gym Management Platform</p>
    </div>
  )
}
