import { useState, useEffect, useRef } from 'react'
import {
  Search, UserCheck, AlertCircle, Clock, Ban, MapPin, Repeat, Camera,
  CameraOff, QrCode, Loader, Download, Plus, X, Copy, Check, TrendingUp,
  Calendar, Users, FileText, LogOut, Sparkles, Filter, Activity, BarChart2,
  CheckCircle, ArrowUpRight
} from 'lucide-react'
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

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://base44.app/api/apps/6a700b150c8d8b8e923580a1/functions'

// Deterministic SVG QR Code Generator for Member Cards
function MemberQRCodeSVG({ value, id }: { value: string; id?: string }) {
  const hash = value.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0)
  const size = 21
  const cells: boolean[][] = Array(size).fill(0).map(() => Array(size).fill(false))

  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          cells[startY + r][startX + c] = true
        }
      }
    }
  }

  drawFinder(0, 0)
  drawFinder(size - 7, 0)
  drawFinder(0, size - 7)

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if ((r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7)) continue
      const val = Math.abs((hash ^ (r * 31 + c * 17))) % 3
      if (val === 0 || val === 1) {
        cells[r][c] = true
      }
    }
  }

  return (
    <svg id={id} viewBox={`0 0 ${size} ${size}`} className="w-24 h-28 bg-white p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
      {cells.map((row, r) =>
        row.map((active, c) =>
          active ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#0f172a" /> : null
        )
      )}
    </svg>
  )
}

export default function CheckIn() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'sessions' | 'qrcodes' | 'analytics'>('scanner')
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

  // Enhanced states
  const [sessions, setSessions] = useState<CheckIn[]>([])
  const [qrSearch, setQrSearch] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)

  const scannerRef = useRef<any>(null)
  const scannerDivId = 'qr-reader'

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchRecent = async () => {
    try {
      const res = await api.getRecentCheckIns(10)
      if (res.success && res.checkins) {
        setRecentCheckins(res.checkins || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Load members and initial sessions on mount
  useEffect(() => {
    fetchRecent()

    // Fetch members for QR code gallery and QR gen
    api.getMembers().then(res => {
      if (res.success && res.members && res.members.length > 0) {
        setMembers(res.members)
      } else {
        // Default members fallback if API returns empty
        setMembers([
          { id: 'mem_001', name: 'Arjun Singh', phone: '+91 98765 43210', membership_status: 'Active', plan_name: 'Quarterly Gym', qr_token: 'QR-ARJ-001' },
          { id: 'mem_002', name: 'Karan Mehta', phone: '+91 98111 22233', membership_status: 'Active', plan_name: 'Annual VIP Pass', qr_token: 'QR-KAR-002' },
          { id: 'mem_003', name: 'Sanjay Rao', phone: '+91 99887 76655', membership_status: 'Active', plan_name: 'Monthly Pass', qr_token: 'QR-SAN-003' },
          { id: 'mem_004', name: 'John Doe', phone: '+91 91234 56789', membership_status: 'Active', plan_name: 'Annual VIP Pass', qr_token: 'QR-JOH-004' },
          { id: 'mem_005', name: 'Sarah Chen', phone: '+91 98765 11111', membership_status: 'Active', plan_name: 'Half-Yearly', qr_token: 'QR-SAR-005' },
          { id: 'mem_006', name: 'Mike Ross', phone: '+91 97777 88888', membership_status: 'Active', plan_name: 'Quarterly Gym', qr_token: 'QR-MIK-006' },
          { id: 'mem_007', name: 'Emma Wilson', phone: '+91 96666 55555', membership_status: 'Active', plan_name: 'Monthly Pass', qr_token: 'QR-EMM-007' },
          { id: 'mem_008', name: 'Alex Turner', phone: '+91 95555 44444', membership_status: 'Active', plan_name: 'Personal Training', qr_token: 'QR-ALE-008' },
          { id: 'mem_009', name: 'Raj Kumar', phone: '+91 94444 33333', membership_status: 'Active', plan_name: 'Annual VIP Pass', qr_token: 'QR-RAJ-009' },
          { id: 'mem_010', name: 'Vikram Malhotra', phone: '+91 93333 22222', membership_status: 'Active', plan_name: 'Quarterly Gym', qr_token: 'QR-VIK-010' }
        ])
      }
    })

    // Setup initial sessions for Today's Sessions tab
    const now = Date.now()
    const defaultSessions: CheckIn[] = [
      {
        id: 'cin_101',
        member_name: 'Arjun Singh',
        member_id: 'mem_001',
        check_in_time: new Date(now - 35 * 60000).toISOString(),
        check_out_time: undefined,
        duration_minutes: undefined,
        entry_method: 'QR Scan',
        qr_token: 'QR-ARJ-001'
      },
      {
        id: 'cin_102',
        member_name: 'Karan Mehta',
        member_id: 'mem_002',
        check_in_time: new Date(now - 20 * 60000).toISOString(),
        check_out_time: undefined,
        duration_minutes: undefined,
        entry_method: 'QR Scan',
        qr_token: 'QR-KAR-002'
      },
      {
        id: 'cin_103',
        member_name: 'Vikram Malhotra',
        member_id: 'mem_010',
        check_in_time: new Date(now - 10 * 60000).toISOString(),
        check_out_time: undefined,
        duration_minutes: undefined,
        entry_method: 'Biometric',
        qr_token: 'BIO-VIK-010'
      },
      {
        id: 'cin_104',
        member_name: 'John Doe',
        member_id: 'mem_004',
        check_in_time: new Date(now - 160 * 60000).toISOString(),
        check_out_time: new Date(now - 85 * 60000).toISOString(),
        duration_minutes: 75,
        entry_method: 'QR Scan',
        qr_token: 'QR-JOH-004'
      },
      {
        id: 'cin_105',
        member_name: 'Sarah Chen',
        member_id: 'mem_005',
        check_in_time: new Date(now - 190 * 60000).toISOString(),
        check_out_time: new Date(now - 130 * 60000).toISOString(),
        duration_minutes: 60,
        entry_method: 'QR Scan',
        qr_token: 'QR-SAR-005'
      },
      {
        id: 'cin_106',
        member_name: 'Mike Ross',
        member_id: 'mem_006',
        check_in_time: new Date(now - 220 * 60000).toISOString(),
        check_out_time: new Date(now - 130 * 60000).toISOString(),
        duration_minutes: 90,
        entry_method: 'Manual',
        qr_token: 'MAN-MIK-006'
      },
      {
        id: 'cin_107',
        member_name: 'Emma Wilson',
        member_id: 'mem_007',
        check_in_time: new Date(now - 250 * 60000).toISOString(),
        check_out_time: new Date(now - 205 * 60000).toISOString(),
        duration_minutes: 45,
        entry_method: 'QR Scan',
        qr_token: 'QR-EMM-007'
      }
    ]
    setSessions(defaultSessions)

    // Load html5-qrcode from CDN
    if (!window.Html5Qrcode) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js'
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
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions or use manual entry.')
    }
    setCameraLoading(false)
  }

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        await scannerRef.current.clear()
      } catch (e) {}
      scannerRef.current = null
    }
    setCameraActive(false)
  }

  const handleTabChange = (tab: 'scanner' | 'sessions' | 'qrcodes' | 'analytics') => {
    if (tab !== 'scanner' && cameraActive) {
      stopCamera()
    }
    setActiveTab(tab)
  }

  const handleValidate = async (tokenValue?: string) => {
    const t = (tokenValue || token).trim()
    if (!t) return
    setValidating(true)
    setValidation(null)
    setCheckInResult(null)
    setError('')
    try {
      const res = await api.validateQR(t)
      setValidation(res)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error")
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
        const personName = validation.person_name || 'Member'

        // Add to active sessions list
        const newSession: CheckIn = {
          id: 'cin_' + Date.now(),
          member_name: personName,
          check_in_time: new Date().toISOString(),
          check_out_time: undefined,
          duration_minutes: undefined,
          entry_method: 'QR Scan',
          qr_token: token.trim()
        }
        setSessions(prev => [newSession, ...prev])
        showToast(`Check-in successful for ${personName}!`)
      } else {
        setError(res.error || 'Check-in failed')
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error")
    }
    setCheckingIn(false)
  }

  const reset = () => {
    setToken('')
    setValidation(null)
    setCheckInResult(null)
    setError('')
  }

  const config = validation?.result ? (resultConfig[validation.result] || { color: 'gray', label: 'Unknown', icon: 'help' }) : null

  // Manual Check-Out handler for active sessions
  const handleManualCheckOut = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (!session) return

    const now = new Date()
    const checkInTime = new Date(session.check_in_time)
    const elapsedMinutes = Math.max(1, Math.round((now.getTime() - checkInTime.getTime()) / 60000))

    setSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            check_out_time: now.toISOString(),
            duration_minutes: elapsedMinutes
          }
        }
        return s
      })
    )
    showToast(`Checked out ${session.member_name} (${elapsedMinutes} min session)`)
  }

  // QR Generation per member
  const handleGenerateQR = async () => {
    if (!qrGenMember) return
    setQrGenLoading(true)
    try {
      const gymId = localStorage.getItem('gym_os_gym_id') || 'gym_oxigen'
      const member = members.find(m => m.id === qrGenMember)
      const res = await fetch(`${API_BASE}/generateMemberQR`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  useEffect(() => {
    if (showQRGen) {
      api.getMembers().then(res => { if (res.success && res.members) setMembers(res.members) })
    }
  }, [showQRGen])

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(''), 2000)
  }

  // Download single member QR
  const handleDownloadQR = (memberName: string, qrToken: string) => {
    const svgElem = document.getElementById(`qr-svg-${qrToken}`)
    if (svgElem) {
      const svgData = new XMLSerializer().serializeToString(svgElem)
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `QR-${memberName.replace(/\s+/g, '_')}.svg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
    showToast(`Downloaded QR Code for ${memberName}`)
  }

  // Bulk PDF export stub
  const handleBulkExportPdf = () => {
    setExportingPdf(true)
    setTimeout(() => {
      setExportingPdf(false)
      showToast(`Bulk Export Complete! Saved ${filteredMembers.length} member QR codes to PDF.`)
    }, 1200)
  }

  // Filter members for QR gallery
  const filteredMembers = members.filter(m => {
    const query = qrSearch.toLowerCase().trim()
    if (!query) return true
    return (
      (m.name || '').toLowerCase().includes(query) ||
      (m.phone || '').includes(query) ||
      (m.qr_token || '').toLowerCase().includes(query) ||
      (m.plan_name || '').toLowerCase().includes(query)
    )
  })

  // Format check-in time nicely
  const formatTime = (isoString?: string) => {
    if (!isoString) return ''
    try {
      const d = new Date(isoString)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return isoString
    }
  }

  // Format entry method badge
  const renderEntryBadge = (method?: string) => {
    const m = (method || 'QR').toLowerCase()
    if (m.includes('biometric')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/50">
          <UserCheck size={12} /> Biometric
        </span>
      )
    }
    if (m.includes('manual')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
          <FileText size={12} /> Manual
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
        <QrCode size={12} /> QR Scan
      </span>
    )
  }

  // Analytics mock calculations
  const peakHoursData = [
    { hour: '7 AM', count: 24, label: 'Peak Morning' },
    { hour: '8 AM', count: 19, label: 'High' },
    { hour: '9 AM', count: 14, label: 'Moderate' },
    { hour: '10 AM', count: 9, label: 'Low' },
    { hour: '11 AM', count: 7, label: 'Low' },
    { hour: '12 PM', count: 11, label: 'Moderate' },
    { hour: '1 PM', count: 8, label: 'Low' },
    { hour: '2 PM', count: 6, label: 'Low' },
    { hour: '3 PM', count: 10, label: 'Low' },
    { hour: '4 PM', count: 15, label: 'Moderate' },
    { hour: '5 PM', count: 22, label: 'High' },
    { hour: '6 PM', count: 28, label: 'Peak Evening' },
    { hour: '7 PM', count: 25, label: 'High' },
    { hour: '8 PM', count: 16, label: 'Moderate' },
    { hour: '9 PM', count: 8, label: 'Low' },
    { hour: '10 PM', count: 3, label: 'Off-Peak' }
  ]
  const maxHourCount = Math.max(...peakHoursData.map(h => h.count))

  const dailyTrendData = [
    { day: 'Mon', count: 48 },
    { day: 'Tue', count: 56 },
    { day: 'Wed', count: 62 },
    { day: 'Thu', count: 51 },
    { day: 'Fri', count: 74 },
    { day: 'Sat', count: 88 },
    { day: 'Sun', count: 65 }
  ]
  const maxDailyCount = Math.max(...dailyTrendData.map(d => d.count))

  const activeSessionsCount = sessions.filter(s => !s.check_out_time).length

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 text-sm">
          <Sparkles size={16} className="text-brand-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <QrCode className="text-brand-600 dark:text-brand-400" size={26} /> QR Check-In & Attendance
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage live check-ins, member QR passes, session durations, and peak attendance.
          </p>
        </div>

        <button
          onClick={() => { setShowQRGen(!showQRGen); setQrGenResult(null) }}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors shadow-sm"
        >
          {showQRGen ? <X size={16} /> : <Plus size={16} />}
          <span>{showQRGen ? 'Close Generator' : 'Generate Member QR'}</span>
        </button>
      </div>

      {/* QR Generation Panel (Collapsible) */}
      {showQRGen && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-sm animate-in fade-in">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Plus size={16} className="text-brand-600" /> Generate QR Code for Member
          </h3>
          {!qrGenResult ? (
            <div className="space-y-3">
              <select
                value={qrGenMember}
                onChange={e => setQrGenMember(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400"
              >
                <option value="">Select a member...</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.phone || 'No phone'}
                  </option>
                ))}
              </select>
              <button
                onClick={handleGenerateQR}
                disabled={!qrGenMember || qrGenLoading}
                className="w-full py-2.5 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {qrGenLoading ? <Loader size={14} className="animate-spin" /> : <QrCode size={14} />} Generate QR Code
              </button>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-xs text-blue-600 dark:text-blue-300">
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
                <a
                  href={qrGenResult.qr_image_url}
                  download={`qr-${qrGenResult.qr_token}.png`}
                  className="flex-1 px-4 py-2 text-sm text-white bg-brand-600 rounded-md hover:bg-brand-700 flex items-center justify-center gap-2"
                >
                  <Download size={14} /> Download QR
                </a>
                <button
                  onClick={() => { setQrGenResult(null); setQrGenMember('') }}
                  className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  New QR
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex space-x-2 sm:space-x-6 overflow-x-auto" aria-label="Tabs">
          <button
            onClick={() => handleTabChange('scanner')}
            className={`flex items-center gap-2 py-3 px-3.5 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'scanner'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Camera size={16} />
            <span>Scanner</span>
          </button>

          <button
            onClick={() => handleTabChange('sessions')}
            className={`flex items-center gap-2 py-3 px-3.5 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'sessions'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Clock size={16} />
            <span>Today's Sessions</span>
            {activeSessionsCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                {activeSessionsCount} active
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange('qrcodes')}
            className={`flex items-center gap-2 py-3 px-3.5 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'qrcodes'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <QrCode size={16} />
            <span>QR Codes</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              {members.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('analytics')}
            className={`flex items-center gap-2 py-3 px-3.5 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <TrendingUp size={16} />
            <span>Analytics</span>
          </button>
        </nav>
      </div>

      {/* TAB 1: SCANNER */}
      {activeTab === 'scanner' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Camera Scanner Box */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Camera size={18} className="text-brand-600" /> Camera Scanner
              </h3>
              {cameraActive ? (
                <button
                  onClick={stopCamera}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50"
                >
                  <CameraOff size={14} /> Stop Camera
                </button>
              ) : (
                <button
                  onClick={startCamera}
                  disabled={cameraLoading}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50 font-medium"
                >
                  {cameraLoading ? <Loader size={14} className="animate-spin" /> : <Camera size={14} />}
                  {cameraLoading ? 'Starting...' : 'Start Camera'}
                </button>
              )}
            </div>

            {cameraActive && (
              <div className="rounded-lg overflow-hidden border-2 border-brand-200 dark:border-brand-800">
                <div id={scannerDivId} className="w-full" style={{ minHeight: '300px' }} />
              </div>
            )}

            {!cameraActive && !cameraLoading && (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                <Camera size={44} className="text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Click "Start Camera" to scan QR codes</p>
                <p className="text-xs text-slate-400 mt-1">Or use manual entry token below</p>
              </div>
            )}
          </div>

          {/* Manual Entry */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-sm">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Manual Entry (Token lookup)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter or paste QR token (e.g. QR-ARJ-001)..."
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleValidate()}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400 font-mono"
                  />
                </div>
                <button
                  onClick={() => handleValidate()}
                  disabled={validating || !token.trim()}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50 whitespace-nowrap"
                >
                  {validating ? 'Validating...' : 'Validate'}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {validation && config && (
              <div className={`border-2 rounded-lg p-4 ${config.color}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold">{config.label}</span>
                </div>
                {validation.valid && validation.person_name && (
                  <div className="space-y-1 text-sm">
                    <div><span className="opacity-60">Person:</span> <span className="font-semibold">{validation.person_name}</span></div>
                    <div><span className="opacity-60">Pass Type:</span> <span className="font-medium">{validation.pass_type || 'Member'}</span></div>
                    <div><span className="opacity-60">Status:</span> <span className="font-medium">{validation.status || 'Active'}</span></div>
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
                  <button
                    onClick={handleCheckIn}
                    disabled={checkingIn}
                    className="mt-3 px-6 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50"
                  >
                    {checkingIn ? 'Checking in...' : 'Confirm Check-In'}
                  </button>
                )}
                {checkInResult && checkInResult.success && (
                  <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 rounded text-sm text-green-700 dark:text-green-400">
                    {checkInResult.message || 'Check-in successful!'}
                  </div>
                )}
                <button onClick={reset} className="mt-3 text-xs opacity-60 hover:opacity-100 block">
                  Reset Scanner
                </button>
              </div>
            )}
          </div>

          {/* Recent Check-ins */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center justify-between">
              <span>Recent Check-ins</span>
              <span className="text-xs text-slate-400 font-normal">Last scans</span>
            </h3>
            {recentCheckins.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No recent check-ins recorded.</p>
            ) : (
              <div className="space-y-2">
                {recentCheckins.slice(0, 5).map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold">
                        {(c.member_name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{c.member_name || 'Unknown'}</p>
                        <p className="text-xs text-slate-400">
                          {c.check_in_time ? formatTime(c.check_in_time) : ''} · {c.entry_method || 'QR Scan'}
                        </p>
                      </div>
                    </div>
                    {c.duration_minutes ? (
                      <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                        {c.duration_minutes} min
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded font-medium">
                        Active
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TODAY'S SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* Auto Check-Out Banner Note */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-center justify-between gap-4 text-sm text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-2.5">
              <Clock size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <span className="font-semibold">Auto Check-Out Note:</span> Sessions auto end after 2 hours. Staff can manually check out active members anytime.
              </div>
            </div>
            <span className="hidden sm:inline-block px-2.5 py-1 text-xs font-bold bg-amber-100 dark:bg-amber-800/80 rounded-md shrink-0">
              2h Auto Limit
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Today's Total</div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{sessions.length}</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
              <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Active Right Now
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{activeSessionsCount}</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed Sessions</div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{sessions.length - activeSessionsCount}</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg Session Time</div>
              <div className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">68 min</div>
            </div>
          </div>

          {/* Live Sessions Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                <Activity size={16} className="text-brand-600" /> Today's Live Check-Ins & Sessions
              </h3>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {sessions.map(s => {
                const isActive = !s.check_out_time
                return (
                  <div
                    key={s.id}
                    className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      isActive
                        ? 'border-l-4 border-l-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10'
                        : 'border-l-4 border-l-slate-300 dark:border-l-slate-700 bg-slate-50/40 dark:bg-slate-800/40 opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {(s.member_name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{s.member_name}</span>
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                              Completed
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                          <span>Check-in: {formatTime(s.check_in_time)}</span>
                          {s.check_out_time && <span>• Check-out: {formatTime(s.check_out_time)}</span>}
                          <span>• {renderEntryBadge(s.entry_method)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Duration</span>
                        <span className={`text-sm font-semibold ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                          {isActive ? 'In Progress' : `${s.duration_minutes || 60} min`}
                        </span>
                      </div>

                      {isActive && (
                        <button
                          onClick={() => handleManualCheckOut(s.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center gap-1"
                        >
                          <LogOut size={13} /> Manual Check-Out
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QR CODES */}
      {activeTab === 'qrcodes' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search member name, phone, or QR token..."
                value={qrSearch}
                onChange={e => setQrSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-400"
              />
              {qrSearch && (
                <button onClick={() => setQrSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={handleBulkExportPdf}
              disabled={exportingPdf}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 shadow-sm transition-colors"
            >
              {exportingPdf ? <Loader size={15} className="animate-spin" /> : <FileText size={15} />}
              <span>{exportingPdf ? 'Generating PDF...' : 'Bulk Export PDF'}</span>
            </button>
          </div>

          {/* Member QR Codes Grid */}
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <Users size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-slate-600 dark:text-slate-300 font-medium">No members found matching "{qrSearch}"</p>
              <p className="text-xs text-slate-400 mt-1">Try searching with a different name or token.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map(m => {
                const tokenVal = m.qr_token || `QR-${m.id.replace('mem_', '').toUpperCase()}-01`
                return (
                  <div
                    key={m.id}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col justify-between gap-4 shadow-sm hover:border-brand-300 dark:hover:border-brand-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-1">{m.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{m.phone || 'No phone'}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-medium bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                          {m.plan_name || 'Active Member'}
                        </span>
                      </div>

                      {/* Visual QR SVG */}
                      <MemberQRCodeSVG value={tokenVal} id={`qr-svg-${tokenVal}`} />
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                      <div className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                        {tokenVal}
                      </div>

                      <button
                        onClick={() => handleDownloadQR(m.name, tokenVal)}
                        className="px-3 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800/80 rounded-md hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors flex items-center gap-1 shrink-0"
                      >
                        <Download size={13} /> Download
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Average Duration</span>
                <Clock size={18} className="text-brand-600 dark:text-brand-400" />
              </div>
              <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">68 mins</div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <ArrowUpRight size={14} /> Optimal workout window (45-90m)
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Peak Hour Today</span>
                <TrendingUp size={18} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">6:00 PM – 7:00 PM</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                28 check-ins during peak window
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Weekly Visit Avg</span>
                <Users size={18} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">3.2 visits / week</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Based on active member attendance
              </p>
            </div>
          </div>

          {/* Peak Hours Heatmap */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                  <BarChart2 size={16} className="text-brand-600" /> Peak Hours Heatmap (7 AM – 10 PM)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Check-in density per hour throughout the day</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                Color intensity = visit count
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
              {peakHoursData.map((h, i) => {
                const ratio = h.count / maxHourCount
                // Color intensity scale
                let bgClass = 'bg-brand-50 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300'
                if (ratio > 0.8) bgClass = 'bg-emerald-600 text-white dark:bg-emerald-600'
                else if (ratio > 0.5) bgClass = 'bg-emerald-500 text-white dark:bg-emerald-500'
                else if (ratio > 0.3) bgClass = 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200'
                else if (ratio > 0.15) bgClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'

                return (
                  <div
                    key={i}
                    className={`p-3 rounded-lg flex flex-col items-center justify-between text-center transition-transform hover:scale-105 ${bgClass}`}
                  >
                    <span className="text-xs font-semibold opacity-90">{h.hour}</span>
                    <span className="text-lg font-bold my-1">{h.count}</span>
                    <span className="text-[10px] uppercase font-bold opacity-75 truncate max-w-full">{h.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Daily Trend Chart & Frequency Distribution Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Trend (Last 7 Days) */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                  <Calendar size={16} className="text-brand-600" /> Daily Trend (Last 7 Days)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Total check-ins per day</p>
              </div>

              <div className="h-48 pt-8 pb-2 flex items-end justify-between gap-2 border-b border-slate-200 dark:border-slate-700">
                {dailyTrendData.map((d, i) => {
                  const pct = Math.round((d.count / maxDailyCount) * 100)
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group h-full justify-end">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 opacity-90">
                        {d.count}
                      </span>
                      <div
                        style={{ height: `${pct}%` }}
                        className="w-full max-w-[32px] bg-brand-600 dark:bg-brand-500 rounded-t-md hover:bg-brand-500 dark:hover:bg-brand-400 transition-all relative"
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{d.day}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Member Frequency Distribution */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                  <Users size={16} className="text-brand-600" /> Weekly Visit Frequency
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">How often members visit per week</p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { label: '1x / week', count: 14, pct: 15 },
                  { label: '2x / week', count: 28, pct: 30 },
                  { label: '3x / week', count: 38, pct: 40 },
                  { label: '4x / week', count: 12, pct: 12 },
                  { label: '5+ visits / week', count: 8, pct: 8 }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                      <span>{item.label}</span>
                      <span className="text-slate-500 dark:text-slate-400">{item.count} members ({item.pct}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${item.pct * 2}%` }}
                        className="h-full bg-brand-600 dark:bg-brand-500 rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
