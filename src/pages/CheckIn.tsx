import { useState, useEffect } from 'react'
import { Search, UserCheck, AlertCircle, Clock, Ban, MapPin, Repeat } from 'lucide-react'
import { api } from '../api/client'
import type { ValidationResult, CheckInResult, CheckIn } from '../types'

const resultConfig: Record<string, { color: string; icon: any; label: string }> = {
  VALID: { color: 'border-green-300 bg-green-50 text-green-700', icon: UserCheck, label: '✅ VALID' },
  INVALID: { color: 'border-red-300 bg-red-50 text-red-700', icon: AlertCircle, label: '❌ INVALID' },
  EXPIRED: { color: 'border-orange-300 bg-orange-50 text-orange-700', icon: Clock, label: '⚠️ EXPIRED' },
  REVOKED: { color: 'border-red-300 bg-red-50 text-red-700', icon: Ban, label: '❌ REVOKED' },
  WRONG_BRANCH: { color: 'border-orange-300 bg-orange-50 text-orange-700', icon: MapPin, label: '⚠️ WRONG BRANCH' },
  ALREADY_USED: { color: 'border-orange-300 bg-orange-50 text-orange-700', icon: Repeat, label: '⚠️ ALREADY USED' }
}

export default function CheckIn() {
  const [token, setToken] = useState('')
  const [validating, setValidating] = useState(false)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(null)
  const [recentCheckins, setRecentCheckins] = useState<CheckIn[]>([])
  const [error, setError] = useState('')

  const fetchRecent = async () => {
    try {
      const res = await api.getRecentCheckIns(5)
      if (res.success) setRecentCheckins(res.checkins)
    } catch (e) { console.error(e) }
  }

  useEffect(() => { fetchRecent() }, [])

  const handleValidate = async () => {
    if (!token.trim()) return
    setValidating(true)
    setValidation(null)
    setCheckInResult(null)
    setError('')
    try {
      const res = await api.validateQR(token.trim())
      setValidation(res)
    } catch (e: any) {
      setError(e.message)
    }
    setValidating(false)
  }

  const handleCheckIn = async () => {
    if (!validation?.valid) return
    setCheckingIn(true)
    setError('')
    try {
      const res = await api.checkIn(token.trim())
      if (res.success) {
        setCheckInResult(res)
        fetchRecent()
      } else {
        setError(res.error || 'Check-in failed')
      }
    } catch (e: any) {
      setError(e.message)
    }
    setCheckingIn(false)
  }

  const reset = () => {
    setToken('')
    setValidation(null)
    setCheckInResult(null)
    setError('')
  }

  const config = validation?.result ? resultConfig[validation.result] : null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-slate-800">QR Check-In</h2>

      {/* QR Input */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-600 mb-2 block">Enter QR Token</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Enter or scan QR token..."
                value={token}
                onChange={e => setToken(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleValidate()}
                className="w-full pl-9 pr-3 py-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-brand-400 font-mono"
              />
            </div>
            <button onClick={handleValidate} disabled={validating || !token.trim()} className="px-6 py-3 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50 whitespace-nowrap">
              {validating ? 'Validating...' : 'Validate'}
            </button>
          </div>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">{error}</div>}

        {/* Validation Result */}
        {validation && config && (
          <div className={`border-2 rounded-lg p-4 ${config.color}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg font-bold">{config.label}</span>
            </div>
            {validation.valid && validation.person_name && (
              <div className="space-y-1 text-sm">
                <div><span className="opacity-60">Person:</span> <span className="font-semibold">{validation.person_name}</span></div>
                <div><span className="opacity-60">Pass Type:</span> <span className="font-medium">{validation.pass_type}</span></div>
                <div><span className="opacity-60">Status:</span> <span className="font-medium">{validation.status}</span></div>
                <div><span className="opacity-60">Lead ID:</span> <span className="font-mono text-xs">{validation.lead_id}</span></div>
              </div>
            )}
            {!validation.valid && !validation.valid && (
              <p className="text-sm opacity-80">
                {validation.result === 'INVALID' && 'This QR token was not found in the system.'}
                {validation.result === 'EXPIRED' && 'This trial pass has expired. Please issue a new pass.'}
                {validation.result === 'REVOKED' && 'This pass has been revoked.'}
                {validation.result === 'WRONG_BRANCH' && 'This pass is for a different branch.'}
                {validation.result === 'ALREADY_USED' && 'This visitor has already checked in.'}
              </p>
            )}

            {/* Check-in button */}
            {validation.valid && !checkInResult && (
              <button
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="mt-4 w-full py-3 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {checkingIn ? 'Checking in...' : 'CHECK IN VISITOR'}
              </button>
            )}

            {/* Check-in success */}
            {checkInResult?.success && (
              <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded space-y-1 text-sm">
                <p className="font-semibold text-green-800">✅ Check-in successful!</p>
                <p><span className="opacity-60">Person:</span> {checkInResult.person_name}</p>
                <p><span className="opacity-60">Attendance ID:</span> <span className="font-mono text-xs">{checkInResult.attendance_id}</span></p>
                <p><span className="opacity-60">Time:</span> {checkInResult.timestamp?.replace('T', ' ').split('.')[0]}</p>
              </div>
            )}
          </div>
        )}

        {(validation || checkInResult) && (
          <button onClick={reset} className="text-sm text-slate-500 hover:underline">Clear and scan next →</button>
        )}
      </div>

      {/* Recent Check-ins */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Recent Check-ins</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {recentCheckins.length === 0 ? (
            <p className="px-4 py-8 text-sm text-slate-400 text-center">No check-ins recorded yet.</p>
          ) : recentCheckins.map(ci => (
            <div key={ci.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50">
              <div>
                <p className="text-sm font-medium text-slate-700">{ci.member_name}</p>
                <p className="text-xs text-slate-400">{ci.entry_method} · {ci.qr_token}</p>
              </div>
              <span className="text-xs text-slate-400">{ci.check_in_time?.replace('T', ' ').split('.')[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
