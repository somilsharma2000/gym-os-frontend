import { useState, useEffect, useRef } from 'react'
import { Search, UserCheck, AlertCircle, Clock, Ban, MapPin, Repeat, Camera, CameraOff, QrCode, Loader, Download } from 'lucide-react'
import { api } from '../api/client'
import type { ValidationResult, CheckInResult, CheckIn } from '../types'

declare global {
  interface Window { Html5Qrcode: any }
}

const resultConfig: Record<string, { color: string; icon: any; label: string }> = {
  VALID: { color: 'border-green-300 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800', icon: UserCheck, label: 'VALID' },
  INVALID: { color: 'border-red-300 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800', icon: AlertCircle, label: 'INVALID' },
  EXPIRED: { color: 'border-orange-300 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800', icon: Clock, label: 'EXPIRED' },
  REVOKED: { color: 'border-red-300 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800', icon: Ban, label: 'REVOKED' },
  WRONG_BRANCH: { color: 'border-orange-300 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800', icon: MapPin, label: 'WRONG BRANCH' },
  ALREADY_USED: { color: 'border-orange-300 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800', icon: Repeat, label: 'ALREADY USED' }
}

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
      script.onload = () => {}
      document.head.appendChild(script)
    }
    return () => { stopCamera() }
  }, [])

  const startCamera = async () => {
    setCameraLoading(true)
    setError('')
    try {
      if (!window.Html5Qrcode) {
        setError('QR scanner library still loading. Please wait a moment and try again.')
        setCameraLoading(false)
        return
      }
      const html5QrCode = new window.Html5Qrcode(scannerDivId)
      scannerRef.current = html5QrCode
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          setToken(decodedText)
          stopCamera()
          handleValidate(decodedText)
        },
        () => {}
      )
      setCameraActive(true)
    } catch (err: any) {
      setError('Camera access denied. Please allow camera permissions or use manual entry.')
    }
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">QR Check-In</h2>
        <button onClick={() => setShowQRGen(!showQRGen)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 rounded-md hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors">
          <QrCode size={14} /> Generate QR
        </button>
      </div>

      {/* Camera Scanner */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Camera size={18} className="text-brand-600" /> Camera Scanner
          </h3>
          {cameraActive ? (
            <button onClick={stopCamera} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
              <CameraOff size={14} /> Stop Camera
            </button>
          ) : (
            <button onClick={startCamera} disabled={cameraLoading} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50 transition-colors">
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
            <button onClick={() => handleValidate()} disabled={validating || !token.trim()} className="px-6 py-3 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50 whitespace-nowrap transition-colors">{validating ? 'Validating...' : 'Validate'}</button>
          </div>
        </div>

        {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">{error}</div>}

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
                {validation.result === 'EXPIRED' && 'This trial pass has expired. Please issue a new pass.'}
                {validation.result === 'REVOKED' && 'This pass has been revoked.'}
                {validation.result === 'WRONG_BRANCH' && 'This pass is for a different branch.'}
                {validation.result === 'ALREADY_USED' && 'This visitor has already checked in.'}
              </p>
            )}
            {validation.valid && !checkInResult && (
              <button onClick={handleCheckIn} disabled={checkingIn} className="mt-4 w-full py-3 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors">{checkingIn ? 'Checking in...' : 'CHECK IN VISITOR'}</button>
            )}
            {checkInResult?.success && (
              <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 rounded space-y-1 text-sm">
                <p className="font-semibold text-green-800 dark:text-green-400">✓ Check-in successful!</p>
                <p><span className="opacity-60">Person:</span> {checkInResult.person_name}</p>
                <p><span className="opacity-60">Time:</span> {checkInResult.timestamp?.replace('T', ' ').split('.')[0]}</p>
              </div>
            )}
          </div>
        )}

        {(validation || checkInResult) && <button onClick={reset} className="text-sm text-slate-500 dark:text-slate-400 hover:underline">Clear and scan next</button>}
      </div>

      {/* Recent Check-ins */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700"><h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Recent Check-ins</h3></div>
        <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
          {recentCheckins.length === 0 ? (
            <p className="px-4 py-8 text-sm text-slate-400 dark:text-slate-500 text-center">No check-ins recorded yet.</p>
          ) : recentCheckins.map(ci => (
            <div key={ci.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/30">
              <div><p className="text-sm font-medium text-slate-700 dark:text-slate-200">{ci.member_name}</p><p className="text-xs text-slate-400 dark:text-slate-500">{ci.entry_method}</p></div>
              <span className="text-xs text-slate-400 dark:text-slate-500">{ci.check_in_time?.replace('T', ' ').split('.')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* QR Generator */}
      {showQRGen && <QRGeneratorModal onClose={() => setShowQRGen(false)} />}
    </div>
  )
}

function QRGeneratorModal({ onClose }: { onClose: () => void }) {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.getMembers().then(res => { if (res.success) setMembers(res.members || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const filtered = members.filter(m => m.name?.toLowerCase().includes(search.toLowerCase()) || m.phone?.includes(search))
  const generateQRUrl = (id: string) => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GYMOS_${id}_${Date.now()}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><QrCode size={20} className="text-brand-600" /> Generate Member QR Codes</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><span className="text-xl">✕</span></button>
        </div>
        <div className="p-5">
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400" />
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader size={24} className="animate-spin text-brand-500" /></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.slice(0, 30).map(m => (
                <div key={m.id} className="text-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <img src={generateQRUrl(m.id)} alt={`QR for ${m.name}`} className="w-full h-auto rounded-lg mb-2" />
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{m.name}</p>
                  <p className="text-xs text-slate-400">{m.phone}</p>
                  <a href={generateQRUrl(m.id)} download={`qr-${m.name}.png`} className="mt-2 inline-flex items-center gap-1 text-xs text-brand-600 hover:underline">
                    <Download size={12} /> Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
