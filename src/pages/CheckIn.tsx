import { useState, useEffect, useRef } from 'react'
import { Search, UserCheck, AlertCircle, Clock, Ban, MapPin, Repeat, Camera, CameraOff, QrCode, Loader, Download, Plus, X, Copy, Check } from 'lucide-react'
import { api } from '../api/client'
import { exportToCSV } from '../utils/csvExport'
import type { ValidationResult, CheckInResult, CheckIn } from '../types'

declare global {
  interface Window { Html5Qrcode: any }
}

const resultConfig: Record<string, { color: string; icon: any; label: string }> = {
  VALID: { color: 'border-green-300 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800', icon: UserCheck, label: 'VALID' },
  INVALID: { color: 'border-red-300 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800', icon: AlertCircle, label: 'INVALID' },
  EXPIRED: { color: 'border-orange-300 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800', icon: Clock, label: 'EXPIRED' },
  REVOKED: { color: 'border-red-300 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800', icon: Ban, label: 'REVOKED' },
  WRONG_BRANCH: { color: 'border-orange-300 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800', icon: MapPin, label: 'WRONG GYM' },
  ALREADY_USED: { color: 'border-orange-300 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800', icon: Repeat, label: 'ALREADY CHECKED IN' }
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://base44.app/api/apps/6a8949954092729194579577/functions'

export default function CheckIn() {
  const [token, setToken] = useState('')
  const [validating, setValidating] = useState(false)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(null)
  const [recentCheckins, setRecentCheckins] = useState<CheckIn[]>([])
  const [error, setError] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [showQRGen, setShowQRGen] = useState(false)
  const [members, setMembers] = useState<any[]>([])
  const [qrGenMember, setQrGenMember] = useState('')
  const [qrGenResult, setQrGenResult] = useState<any>(null)
  const [qrGenLoading, setQrGenLoading] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState('')
  const scannerRef = useRef<any>(null)
  const scannerDivId = 'qr-reader'

  const fetchRecent = async () => {
    try { const res = await api.getRecentCheckIns(5); if (res.success) setRecentCheckins(res.checkins || []) } catch (e) { console.error(e) }
  }

  useEffect(() => {
    fetchRecent()
    // Load html5-qrcode from CDN
    if (!window.Html5Qrcode) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js'
      document.head.appendChild(script)
    }
    return () => { stopCamera() }
  }, [])

  const startCamera = async () => {
    setCameraLoading(true); setError('')
    try {
      if (!window.Html5Qrcode) { setError('QR scanner library still loading. Please wait a moment and try again.'); setCameraLoading(false); return }
      const html5QrCode = new window.Html5Qrcode(scannerDivId)
      scannerRef.current = html5QrCode
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => { setToken(decodedText); stopCamera(); handleValidate(decodedText) },
        () => {}
      )
      setCameraActive(true)
    } catch (err) { setError('Camera access denied. Please allow camera permissions or use manual entry.') }
    setCameraLoading(false)
  }

  const stopCamera = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); await scannerRef.current.clear() } catch (e) {}
      scannerRef.current = null
    }
    setCameraActive(false)
  }

  const handleValidate = async (tokenValue?: string) => {
    const t = (tokenValue || token).trim()
    if (!t) return
    setValidating(true); setValidation(null); setCheckInResult(null); setError('')
    try { const res = await api.validateQR(t); setValidation(res) } catch (e: unknown) { setError(e instanceof Error ? e.message : "Unknown error") }
    setValidating(false)
  }

  const handleCheckIn = async () => {
    if (!validation?.valid) return
    setCheckingIn(true); setError('')
    try { const res = await api.checkIn(token.trim()); if (res.success) { setCheckInResult(res); fetchRecent() } else setError(res.error || 'Check-in failed') } catch (e: unknown) { setError(e instanceof Error ? e.message : "Unknown error") }
    setCheckingIn(false)
  }

  const reset = () => { setToken(''); setValidation(null); setCheckInResult(null); setError('') }
  const config = validation?.result ? (resultConfig[validation.result] || { color: 'gray', label: 'Unknown', icon: 'help' }) : null

  // QR Generation per member
  const handleGenerateQR = async () => {
    if (!qrGenMember) return
    setQrGenLoading(true)
    try {
      const gymId = localStorage.getItem('gym_os_gym_id') || 'gym_oxigen'
      const member = members.find(m => m.id === qrGenMember)
      const res = await fetch(`${API_BASE}/generateMemberQR`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gym_id: gymId,
          member_id: qrGenMember,
          member_name: member?.name || '',
          membership_type: member?.membership_type || 'Member'
        })
      })
      const data = await res.json()
      if (data.success) setQrGenResult(data)
    } catch (e) { /* silent */ }
    setQrGenLoading(false)
  }

  // Fetch members for QR generation
  useEffect(() => {
    if (showQRGen) {
      api.getMembers().then(res => { if (res.success) setMembers(res.members || []) })
    }
  }, [showQRGen])

  const copyUrl = (url: string) => { navigator.clipboard.writeText(url); setCopiedUrl(url); setTimeout(() => setCopiedUrl(''), 2000) }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">QR Check-In</h2>
        <button onClick={() => { setShowQRGen(!showQRGen); setQrGenResult(null) }} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 rounded-md hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors">
          <QrCode size={14} /> Generate Member QR
        </button>
      </div>

      {/* QR Generation Panel */}
      {showQRGen && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Plus size={16} className="text-brand-600" /> Generate QR Code for Member
          </h3>
          {!qrGenResult ? (
            <div className="space-y-3">
              <select value={qrGenMember} onChange={e => setQrGenMember(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400">
                <option value="">Select a member...</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name} — {m.phone || 'No phone'}</option>)}
              </select>
              <button onClick={handleGenerateQR} disabled={!qrGenMember || qrGenLoading}
                className="w-full py-2.5 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {qrGenLoading ? <Loader size={14} className="animate-spin" /> : <QrCode size={14} />} Generate QR Code
              </button>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-xs text-blue-600">
                Each member gets a unique QR token linked to their gym. The QR code contains a check-in URL that members can scan from their phone at the gym entrance.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img src={qrGenResult.qr_image_url} alt="Member QR Code" className="rounded-lg border-2 border-brand-200 dark:border-brand-800" />
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg space-y-2">
                <div className="text-xs text-slate-400">QR Token</div>
                <div className="font-mono text-sm text-brand-600 dark:text-brand-400 break-all">{qrGenResult.qr_token}</div>
                <div className="text-xs text-slate-400 mt-2">Check-in URL</div>
                <div className="flex items-center gap-2">
                  <div className="font-mono text-xs text-slate-600 dark:text-slate-300 flex-1 truncate">{qrGenResult.qr_url}</div>
                  <button onClick={() => copyUrl(qrGenResult.qr_url)} className="text-brand-600">
                    {copiedUrl === qrGenResult.qr_url ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={qrGenResult.qr_image_url} download={`qr-${qrGenResult.qr_token}.png`}
                  className="flex-1 px-4 py-2 text-sm text-white bg-brand-600 rounded-md hover:bg-brand-700 flex items-center justify-center gap-2">
                  <Download size={14} /> Download QR
                </a>
                <button onClick={() => { setQrGenResult(null); setQrGenMember('') }}
                  className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50">
                  New QR
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Camera Scanner */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Camera size={18} className="text-brand-600" /> Camera Scanner
          </h3>
          {cameraActive ? (
            <button onClick={stopCamera} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-md hover:bg-red-100">
              <CameraOff size={14} /> Stop Camera
            </button>
          ) : (
            <button onClick={startCamera} disabled={cameraLoading} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50">
              {cameraLoading ? <Loader size={14} className="animate-spin" /> : <Camera size={14} />} {cameraLoading ? 'Starting...' : 'Start Camera'}
            </button>
          )}
        </div>
        {cameraActive && (
          <div className="rounded-lg overflow-hidden border-2 border-brand-200 dark:border-brand-800">
            <div id={scannerDivId} className="w-full" style={{ minHeight: '300px' }} />
          </div>
        )}
        {!cameraActive && !cameraLoading && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Camera size={48} className="text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Click "Start Camera" to scan QR codes</p>
            <p className="text-xs text-slate-400 mt-1">Or use manual entry below</p>
          </div>
        )}
      </div>

      {/* Manual Entry */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">Manual Entry (fallback)</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Enter or paste QR token..." value={token} onChange={e => setToken(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleValidate()} className="w-full pl-9 pr-3 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400 font-mono" />
            </div>
            <button onClick={() => handleValidate()} disabled={validating || !token.trim()} className="px-6 py-3 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50 whitespace-nowrap">{validating ? 'Validating...' : 'Validate'}</button>
          </div>
        </div>

        {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600">{error}</div>}

        {validation && config && (
          <div className={`border-2 rounded-lg p-4 ${config.color}`}>
            <div className="flex items-center gap-2 mb-3"><span className="text-lg font-bold">{config.label}</span></div>
            {validation.valid && validation.person_name && (
              <div className="space-y-1 text-sm">
                <div><span className="opacity-60">Person:</span> <span className="font-semibold">{validation.person_name}</span></div>
                <div><span className="opacity-60">Pass Type:</span> <span className="font-medium">{validation.pass_type}</span></div>
                <div><span className="opacity-60">Status:</span> <span className="font-medium">{validation.status}</span></div>
              </div>
            )}
            {!validation.valid && (
              <p className="text-sm opacity-80">
                {validation.result === 'INVALID' && 'This QR token was not found in the system.'}
                {validation.result === 'EXPIRED' && 'Membership has expired. Please renew.'}
                {validation.result === 'REVOKED' && 'This pass has been revoked.'}
                {validation.result === 'WRONG_BRANCH' && 'This member belongs to a different gym branch.'}
                {validation.result === 'ALREADY_USED' && 'This member has already checked in today.'}
              </p>
            )}
            {validation.valid && !checkInResult && (
              <button onClick={handleCheckIn} disabled={checkingIn} className="mt-3 px-6 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50">
                {checkingIn ? 'Checking in...' : 'Confirm Check-In'}
              </button>
            )}
            {checkInResult && checkInResult.success && (
              <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 rounded text-sm text-green-700 dark:text-green-400">
                {checkInResult.message || 'Check-in successful!'}
              </div>
            )}
            <button onClick={reset} className="mt-3 text-xs opacity-60 hover:opacity-100">Reset</button>
          </div>
        )}
      </div>

      {/* Recent Check-ins */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Recent Check-ins</h3>
        {recentCheckins.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No recent check-ins.</p>
        ) : (
          <div className="space-y-2">
            {recentCheckins.map((c, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center text-xs font-bold">
                    {(c.member_name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{c.member_name || 'Unknown'}</p>
                    <p className="text-xs text-slate-400">{c.check_in_time ? new Date(c.check_in_time).toLocaleString() : ''} · {c.entry_method || 'manual'}</p>
                  </div>
                </div>
                {c.check_out_time && <span className="text-xs text-slate-400">{c.duration_minutes}min</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}