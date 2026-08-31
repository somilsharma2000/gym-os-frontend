import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { api } from '../api/client'
import { QrCode, Loader2, LogIn, LogOut, User, Clock, CheckCircle2, XCircle, Crown, Gift, Phone } from 'lucide-react'

export default function MemberPortal({ gymId }: { gymId?: string }) {
  const params = useParams()
  const actualGymId = gymId || params.gymId || ''
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [member, setMember] = useState<any>(null)
  const [passData, setPassData] = useState<any>(null)
  const [passLoading, setPassLoading] = useState(false)

  // Check for stored token
  useEffect(() => {
    const stored = localStorage.getItem('gym_member_token')
    if (stored) {
      setToken(stored)
      loadPass(stored)
    }
  }, [])

  const handleLogin = async () => {
    if (!phone.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await api.memberLogin(actualGymId, phone.trim(), password.trim() || undefined)
      if (res.success) {
        localStorage.setItem('gym_member_token', res.token)
        setToken(res.token)
        setMember(res.member)
        loadPass(res.token)
      } else {
        setError(res.error || 'Login failed')
      }
    } catch (err: any) {
      setError(err.message || 'Connection error')
    }
    setLoading(false)
  }

  const loadPass = async (tkn: string) => {
    setPassLoading(true)
    try {
      const res = await api.memberGetMyPass(tkn)
      if (res.success) {
        setMember(res.member)
        if (res.has_pass) setPassData(res.pass)
        else setPassData(null)
      } else {
        // Token expired
        handleLogout()
      }
    } catch {}
    setPassLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('gym_member_token')
    setToken(null)
    setMember(null)
    setPassData(null)
  }

  // LOGIN SCREEN
  if (!token) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <QrCode size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Member Portal</h1>
            <p className="text-sm text-slate-400 mt-1">Login to view your QR pass</p>
          </div>

          <div className="bg-[#131a26] border border-slate-700 rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1.5 block flex items-center gap-1"><Phone size={12} /> PHONE NUMBER</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Enter your registered phone" type="tel"
                className="w-full px-4 py-3 bg-[#0a0e17] border border-slate-700 rounded-xl text-white focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1.5 block">PASSWORD (last 4 digits of phone)</label>
              <input value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="e.g. 9999" type="password"
                className="w-full px-4 py-3 bg-[#0a0e17] border border-slate-700 rounded-xl text-white focus:border-brand-500 focus:outline-none" />
            </div>
            {error && <p className="text-sm text-red-400 bg-red-400/10 rounded-lg p-3">{error}</p>}
            <button disabled={!phone.trim() || loading} onClick={handleLogin}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />} Login
            </button>
            <p className="text-xs text-slate-500 text-center">Use the last 4 digits of your phone as password. Ask gym staff if you need help.</p>
          </div>
        </div>
      </div>
    )
  }

  // LOGGED IN — SHOW QR PASS
  return (
    <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">My QR Pass</h1>
            <p className="text-xs text-slate-400">{member?.name || 'Member'}</p>
          </div>
          <button onClick={handleLogout} className="p-2 bg-[#131a26] border border-slate-700 rounded-lg hover:bg-slate-700">
            <LogOut size={16} className="text-slate-400" />
          </button>
        </div>

        {passLoading ? (
          <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-brand-400" /></div>
        ) : passData ? (
          <div className="bg-[#131a26] border border-slate-700 rounded-2xl p-6 space-y-5">
            {/* Status badge */}
            <div className="flex items-center justify-center">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
                passData.status === 'active' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                passData.status === 'expired' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
                'text-red-400 bg-red-400/10 border-red-400/20'
              }`}>
                {passData.status === 'active' ? <><CheckCircle2 size={12} className="inline mr-1" /> ACTIVE</> :
                 passData.status === 'expired' ? <><XCircle size={12} className="inline mr-1" /> EXPIRED</> :
                 passData.status.toUpperCase()}
              </span>
            </div>

            {/* QR Code */}
            <div className="bg-white rounded-2xl p-4 flex justify-center">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(passData.qr_payload || passData.pass_code)}`}
                alt="QR Pass" className="w-56 h-56" />
            </div>

            {/* Pass info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  {passData.type === 'trial' ? <Gift size={14} /> : <Crown size={14} />}
                  Type
                </span>
                <span className="text-white font-medium">{passData.type === 'trial' ? 'Free Trial (48hr)' : 'Membership'}</span>
              </div>
              {passData.plan_name && (
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5"><Crown size={14} /> Plan</span>
                  <span className="text-white font-medium">{passData.plan_name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500 flex items-center gap-1.5"><Clock size={14} /> Expires</span>
                <span className="text-white font-medium">{new Date(passData.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            {passData.type === 'trial' && (
              <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-3 text-xs text-amber-400 text-center">
                ⚠ Trial pass is single-use only. Your QR will stop working after first check-in.
              </div>
            )}

            <p className="text-xs text-slate-500 text-center">Show this QR at the front desk to check in</p>
          </div>
        ) : (
          <div className="bg-[#131a26] border border-slate-700 rounded-2xl p-8 text-center">
            <User size={48} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No Active QR Pass</h3>
            <p className="text-sm text-slate-500">
              {member?.status === 'active' ? 'Your pass may have expired. Please contact the gym to renew.' :
               'Please contact the gym staff to get your membership QR pass.'}
            </p>
            {member && (
              <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-400 space-y-1">
                <p><strong>Name:</strong> {member.name}</p>
                <p><strong>Phone:</strong> {member.phone}</p>
                <p><strong>Status:</strong> {member.status || 'N/A'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
