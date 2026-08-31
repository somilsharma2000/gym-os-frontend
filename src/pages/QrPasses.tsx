import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'
import { QrCode, Ticket, Clock, CheckCircle2, XCircle, Loader2, Search, User, Crown, Gift, RefreshCw, Eye } from 'lucide-react'
import QrCodeThemed from '../components/QrCodeThemed'

export default function QrPasses() {
  const gymId = localStorage.getItem('gym_os_gym_id') || ''
  const [passes, setPasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)
  const [manualCode, setManualCode] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'used' | 'expired' | 'revoked'>('active')
  const [issueModal, setIssueModal] = useState(false)
  const [viewPass, setViewPass] = useState<any>(null)

  // Issue membership pass form state
  const [issueMemberId, setIssueMemberId] = useState('')
  const [issueName, setIssueName] = useState('')
  const [issuePhone, setIssuePhone] = useState('')
  const [issuePlan, setIssuePlan] = useState('')
  const [issueExpiry, setIssueExpiry] = useState('')
  const [issuing, setIssuing] = useState(false)
  const [issueResult, setIssueResult] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])

  const loadPasses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.getAllEntities('Pass', gymId)
      if (res.success) setPasses(res.records || [])
    } catch { /* */ }
    setLoading(false)
  }, [gymId])

  useEffect(() => {
    loadPasses()
    // Load members for the issue modal
    api.getMembers(gymId).then((res: any) => {
      if (res.success && res.members) setMembers(res.members.slice(0, 100))
    }).catch(() => {})
  }, [loadPasses, gymId])

  const handleScan = async (code: string) => {
    if (!code.trim()) return
    setScanning(true)
    setScanResult(null)
    try {
      const res = await api.validatePass(code.trim(), 'front_desk')
      setScanResult(res)
      loadPasses() // refresh pass statuses
    } catch (err: any) {
      setScanResult({ valid: false, reason: 'error', error: err.message })
    }
    setScanning(false)
  }

  const handleIssue = async () => {
    if (!issueMemberId || !issueName || !issuePhone || !issueExpiry) return
    setIssuing(true)
    setIssueResult(null)
    try {
      const res = await api.createMembershipPass({
        member_id: issueMemberId,
        name: issueName,
        phone: issuePhone,
        plan_name: issuePlan,
        expires_at: new Date(issueExpiry).toISOString(),
        source: 'owner'
      })
      setIssueResult(res)
      if (res.success) {
        loadPasses()
        setIssueMemberId(''); setIssueName(''); setIssuePhone(''); setIssuePlan(''); setIssueExpiry('')
      }
    } catch (err: any) {
      setIssueResult({ success: false, error: err.message })
    }
    setIssuing(false)
  }

  const filtered = filter === 'all' ? passes : passes.filter(p => p.status === filter)

  const statusColor = (s: string) => {
    switch (s) {
      case 'active': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
      case 'used': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      case 'expired': return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
      case 'revoked': return 'text-red-400 bg-red-400/10 border-red-400/20'
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <QrCode size={22} className="text-brand-400" /> QR Passes
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Trial and membership QR pass management</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadPasses} className="p-2 bg-[#131a26] hover:bg-slate-700 rounded-lg border border-slate-700" title="Refresh">
            <RefreshCw size={16} className="text-slate-400" />
          </button>
          <button onClick={() => setIssueModal(true)} className="px-4 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg text-sm font-semibold text-white flex items-center gap-2">
            <Crown size={16} /> Issue Membership QR
          </button>
        </div>
      </div>

      {/* Scanner Section */}
      <div className="bg-[#131a26] rounded-xl border border-slate-700 p-5">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Search size={16} className="text-brand-400" /> Validate Pass
        </h2>
        <div className="flex gap-3">
          <input
            value={manualCode}
            onChange={e => setManualCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleScan(manualCode)}
            placeholder="Enter pass code or scan QR..."
            className="flex-1 px-3 py-2.5 bg-[#0a0e17] border border-slate-700 rounded-lg text-sm text-white focus:border-brand-500 focus:outline-none font-mono"
          />
          <button
            disabled={!manualCode.trim() || scanning}
            onClick={() => handleScan(manualCode)}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 rounded-lg text-sm font-semibold text-white flex items-center gap-2"
          >
            {scanning ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {scanning ? 'Checking...' : 'Validate'}
          </button>
        </div>

        {scanResult && (
          <div className={`mt-4 p-4 rounded-lg border ${scanResult.valid ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <div className="flex items-start gap-3">
              {scanResult.valid ? (
                <CheckCircle2 size={24} className="text-emerald-500 flex-shrink-0" />
              ) : (
                <XCircle size={24} className="text-red-500 flex-shrink-0" />
              )}
              <div className="flex-1">
                {scanResult.valid ? (
                  <>
                    <p className="text-sm font-bold text-emerald-400">PASS VALID — Entry Granted</p>
                    <div className="mt-2 space-y-1 text-xs text-slate-300">
                      <p><strong>Type:</strong> {scanResult.type === 'trial' ? 'Free Trial (48hr)' : `Membership${scanResult.plan_name ? ' — ' + scanResult.plan_name : ''}`}</p>
                      <p><strong>Name:</strong> {scanResult.name}</p>
                      <p><strong>Phone:</strong> {scanResult.phone}</p>
                      <p><strong>Expires:</strong> {new Date(scanResult.expires_at).toLocaleString('en-IN')}</p>
                    </div>
                    {scanResult.type === 'trial' && (
                      <p className="mt-2 text-xs text-amber-400">⚠ Trial pass marked as used — single entry only</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-red-400">PASS INVALID — Entry Denied</p>
                    <p className="mt-1 text-xs text-slate-400">Reason: {scanResult.reason?.replace(/_/g, ' ')}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Gift size={16} />} label="Trial Passes" value={passes.filter(p => p.type === 'trial').length} color="text-blue-400" />
        <StatCard icon={<Crown size={16} />} label="Membership Passes" value={passes.filter(p => p.type === 'membership').length} color="text-brand-400" />
        <StatCard icon={<CheckCircle2 size={16} />} label="Active" value={passes.filter(p => p.status === 'active').length} color="text-emerald-400" />
        <StatCard icon={<Clock size={16} />} label="Used/Expired" value={passes.filter(p => p.status === 'used' || p.status === 'expired').length} color="text-amber-400" />
      </div>

      {/* Passes Table */}
      <div className="bg-[#131a26] rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">All Passes</h2>
          <div className="flex gap-1.5">
            {(['active', 'used', 'expired', 'revoked', 'all'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${filter === f ? 'bg-brand-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:text-white'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-brand-400" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No {filter !== 'all' ? filter + ' ' : ''}passes found.
            <br />Issue a membership QR or have a lead generate a trial pass from your website.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0a0e17]/50">
                <tr className="text-left text-xs text-slate-500 uppercase">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Pass Code</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Expires</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filtered.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-700/20">
                    <td className="px-4 py-3 text-white font-medium">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-500" />
                        {p.name}
                      </div>
                      <div className="text-xs text-slate-500">{p.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${p.type === 'trial' ? 'bg-blue-400/10 text-blue-400' : 'bg-brand-400/10 text-brand-400'}`}>
                        {p.type === 'trial' ? 'Trial' : 'Membership'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.pass_code?.slice(0, 12)}...</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${statusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{new Date(p.expires_at).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{p.source}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setViewPass(p)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-brand-400 hover:text-brand-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 border border-slate-700/80 transition-colors"
                        title="View & customize QR code frame"
                      >
                        <Eye size={13} /> View QR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Pass QR Modal */}
      {viewPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#131a26] border border-slate-700 rounded-xl max-w-md w-full p-6 space-y-4 text-center relative shadow-2xl">
            <button onClick={() => setViewPass(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold">×</button>
            <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
              <QrCode size={20} className="text-brand-400" /> Pass QR Code
            </h3>
            <div className="text-xs text-slate-300 bg-[#0a0e17] p-3 rounded-lg border border-slate-800 space-y-1">
              <p className="font-semibold text-white text-sm">{viewPass.name}</p>
              <p className="font-mono text-brand-400">{viewPass.pass_code}</p>
              <p className="text-slate-400">{viewPass.type === 'trial' ? 'Free Trial Pass' : `Membership — ${viewPass.plan_name || 'Standard'}`}</p>
            </div>
            <div className="flex justify-center py-2">
              <QrCodeThemed
                payload={viewPass.qr_payload || viewPass.pass_code}
                passCode={viewPass.pass_code}
                showPicker={true}
                size={190}
              />
            </div>
            <div className="flex justify-center pt-2">
              <button onClick={() => setViewPass(null)} className="px-5 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium text-white">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Membership Pass Modal */}
      {issueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#131a26] border border-slate-700 rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Crown size={20} className="text-brand-400" /> Issue Membership QR Pass
              </h3>
              <button onClick={() => { setIssueModal(false); setIssueResult(null) }} className="text-slate-500 hover:text-white text-xl font-bold">×</button>
            </div>

            {!issueResult?.success ? (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">SELECT MEMBER</label>
                  <select value={issueMemberId} onChange={e => {
                    const m = members.find(m => m.id === e.target.value)
                    setIssueMemberId(e.target.value)
                    if (m) { setIssueName(m.name); setIssuePhone(m.phone || '') }
                  }} className="w-full px-3 py-2.5 bg-[#0a0e17] border border-slate-700 rounded-lg text-sm text-white focus:border-brand-500 focus:outline-none">
                    <option value="">Choose a member...</option>
                    {members.map((m: any) => (
                      <option key={m.id} value={m.id}>{m.name} — {m.phone || 'No phone'}</option>
                    ))}
                  </select>
                </div>
                <input value={issueName} onChange={e => setIssueName(e.target.value)} placeholder="Member Name *"
                  className="w-full px-3 py-2.5 bg-[#0a0e17] border border-slate-700 rounded-lg text-sm text-white focus:border-brand-500 focus:outline-none" />
                <input value={issuePhone} onChange={e => setIssuePhone(e.target.value)} placeholder="Phone *" type="tel"
                  className="w-full px-3 py-2.5 bg-[#0a0e17] border border-slate-700 rounded-lg text-sm text-white focus:border-brand-500 focus:outline-none" />
                <input value={issuePlan} onChange={e => setIssuePlan(e.target.value)} placeholder="Plan Name (e.g. Monthly, Quarterly)"
                  className="w-full px-3 py-2.5 bg-[#0a0e17] border border-slate-700 rounded-lg text-sm text-white focus:border-brand-500 focus:outline-none" />
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">EXPIRY DATE</label>
                  <input type="date" value={issueExpiry} onChange={e => setIssueExpiry(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0a0e17] border border-slate-700 rounded-lg text-sm text-white focus:border-brand-500 focus:outline-none" />
                </div>
                {issueResult?.error && <p className="text-sm text-red-400">{issueResult.error}</p>}
                <button disabled={!issueMemberId || !issueName || !issuePhone || !issueExpiry || issuing} onClick={handleIssue}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2">
                  {issuing ? <Loader2 size={16} className="animate-spin" /> : <Crown size={16} />} Issue Membership QR
                </button>
                <p className="text-xs text-slate-500 text-center">Any existing active membership pass for this member will be automatically revoked.</p>
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <CheckCircle2 size={48} className="text-emerald-500 mx-auto" />
                <h3 className="text-lg font-bold text-white">Membership QR Pass Issued!</h3>
                <div className="bg-[#0a0e17] rounded-lg p-4 text-left space-y-1.5 text-sm border border-slate-800">
                  <div className="flex justify-between"><span className="text-slate-500">Pass Code:</span><span className="font-mono text-white">{issueResult.pass_code}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Type:</span><span className="text-brand-400">Membership — {issueResult.plan_name || issuePlan}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Expires:</span><span className="text-white">{new Date(issueResult.expires_at).toLocaleDateString('en-IN')}</span></div>
                </div>
                <div className="flex justify-center py-2">
                  <QrCodeThemed
                    payload={issueResult.qr_payload}
                    passCode={issueResult.pass_code}
                    showPicker={true}
                    size={190}
                  />
                </div>
                <button onClick={() => { setIssueModal(false); setIssueResult(null) }} className="px-5 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium text-white">Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="bg-[#131a26] rounded-xl border border-slate-700 p-4">
      <div className={`flex items-center gap-2 ${color}`}>
        {icon}
        <span className="text-xs text-slate-400 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white mt-2">{value}</p>
    </div>
  )
}
