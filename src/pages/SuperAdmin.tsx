import { useState, useEffect } from 'react'
import { Bot, Building2, Plus, Globe, Settings as SettingsIcon, Users, Search, X, TrendingUp, CheckCircle, AlertCircle, Loader, IndianRupee, ArrowRight, Link2, Trash2, AlertTriangle, Code, Copy } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const API_BASE = 'https://base44.app/api/apps/6a700b150c8d8b8e923580a1/functions'

interface Gym {
  gym_id: string
  gym_name: string
  subdomain: string
  owner_name: string
  owner_email: string
  owner_phone: string
  address: string
  plan: string
  status: string
  website_generated: boolean
  website_url: string
  branding?: { primary_color: string; accent_color: string; bg_color: string }
  stats?: {
    leads_count: number
    members_count: number
    active_members: number
    active_memberships: number
    total_revenue: number
    checkins_today: number
    won_leads: number
    conversion_rate: number
  }
}

export default function SuperAdmin() {
  const navigate = useNavigate()
  const [gyms, setGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [connectingGym, setConnectingGym] = useState<string | null>(null)
  const [connectModal, setConnectModal] = useState<{ gymId: string; gymName: string } | null>(null)
  const [connectUrl, setConnectUrl] = useState('')
  const [deleteModal, setDeleteModal] = useState<{ gymId: string; gymName: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [embedModal, setEmbedModal] = useState<{ gymId: string; gymName: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState({
    gym_name: '', owner_name: '', owner_email: '', owner_phone: '',
    address: '', primary_color: '#0066FF', accent_color: '#3B82F6',
    plan: 'starter', password: '', website_url: ''
  })

  const fetchGyms = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('gym_os_auth_token') || ''
      const res = await fetch(`${API_BASE}/getAllGyms`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': token }, body: JSON.stringify({})
      })
      const data = await res.json()
      if (data.success) setGyms(data.gyms)
    } catch {
      setMessage({ type: 'error', text: 'Failed to load gyms' })
    }
    setLoading(false)
  }

  useEffect(() => { fetchGyms() }, [])

  const filteredGyms = gyms.filter(g =>
    g.gym_name?.toLowerCase().includes(search.toLowerCase()) ||
    g.gym_id?.toLowerCase().includes(search.toLowerCase()) ||
    g.owner_name?.toLowerCase().includes(search.toLowerCase())
  )

  const totalLeads = gyms.reduce((s, g) => s + (g.stats?.leads_count || 0), 0)
  const totalMembers = gyms.reduce((s, g) => s + (g.stats?.members_count || 0), 0)
  const totalRevenue = gyms.reduce((s, g) => s + (g.stats?.total_revenue || 0), 0)
  const totalCheckins = gyms.reduce((s, g) => s + (g.stats?.checkins_today || 0), 0)

  const handleAddGym = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/createGym`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: `Gym "${formData.gym_name}" created! Login: ${data.owner_email} / ${data.owner_password}` })
        setShowAddModal(false)
        setFormData({ gym_name: '', owner_name: '', owner_email: '', owner_phone: '', address: '', primary_color: '#0066FF', accent_color: '#3B82F6', plan: 'starter', password: '', website_url: '' })
        fetchGyms()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create gym' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' })
    }
    setSubmitting(false)
  }

  const handleConnectWebsite = async (gymId: string) => {
    if (!connectUrl.trim()) return
    setConnectingGym(gymId)
    try {
      const res = await fetch(`${API_BASE}/updateGymProfile`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gym_id: gymId, website_url: connectUrl, website_generated: true })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'Website connected! QR check-in, lead capture, and automations are now linked.' })
        setConnectModal(null)
        setConnectUrl('')
        fetchGyms()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to connect website' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' })
    }
    setConnectingGym(null)
  }

  const handleDeleteGym = async (gymId: string, gymName: string) => {
    setDeleting(true)
    try {
      const res = await fetch(`${API_BASE}/deleteGym`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gym_id: gymId })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: "success", text: `Gym "${gymName}" deleted. ${data.deleted ? Object.values(data.deleted as Record<string, number>).reduce((a: number, b: number) => a + b, 0) + " records removed." : ""}` })
        setDeleteModal(null)
        fetchGyms()
      } else {
        setMessage({ type: "error", text: data.error || "Failed to delete gym" })
      }
    } catch {
      setMessage({ type: "error", text: "Network error" })
    }
    setDeleting(false)
  }

  const switchToGym = (gymId: string) => {
    localStorage.setItem('gym_os_gym_id', gymId)
    navigate('/')
    setTimeout(() => window.location.reload(), 100)
  }

  const [aiConfig, setAiConfig] = useState<any>({ ai_provider: 'openrouter', ai_model_id: '', ai_enabled: false, has_key: false, key_preview: '' })
  const [aiKeyInput, setAiKeyInput] = useState('')
  const [aiSaving, setAiSaving] = useState(false)
  const [aiSaved, setAiSaved] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/manageAIConfig`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get' })
    }).then(r => r.json()).then(res => {
      if (res?.success && res.config) setAiConfig(res.config)
    }).catch(() => {})
  }, [])

  const saveAIConfig = async () => {
    setAiSaving(true)
    try {
      await fetch(`${API_BASE}/manageAIConfig`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          ai_provider: aiConfig.ai_provider,
          ai_model_id: aiConfig.ai_model_id,
          ai_enabled: aiConfig.ai_enabled,
          ai_base_url: aiConfig.ai_base_url || '',
          ai_api_key: aiKeyInput || undefined
        })
      })
      setAiKeyInput('')
      setAiSaved(true)
      setTimeout(() => setAiSaved(false), 2000)
    } catch {}
    setAiSaving(false)
  }

  const formatINR = (amt: number) => `₹${(amt || 0).toLocaleString('en-IN')}`

  const planColors: Record<string, string> = {
    starter: 'bg-blue-500/20 text-blue-300',
    standard: 'bg-brand-600/20 text-brand-300',
    premium: 'bg-amber-500/20 text-amber-300'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Super Admin</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage all gyms, websites, and platform stats</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-colors">
          <Plus size={18} /> Add New Gym
        </button>
      </div>

      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium flex-1">{message.text}</span>
          <button onClick={() => setMessage(null)}><X size={16} /></button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-500/10 rounded-xl"><Building2 size={20} className="text-brand-500" /></div>
            <div><p className="text-2xl font-bold text-slate-900 dark:text-white">{gyms.length}</p><p className="text-xs text-slate-500">Total Gyms</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl"><Users size={20} className="text-blue-500" /></div>
            <div><p className="text-2xl font-bold text-slate-900 dark:text-white">{totalLeads}</p><p className="text-xs text-slate-500">Total Leads</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-500/10 rounded-xl"><TrendingUp size={20} className="text-green-500" /></div>
            <div><p className="text-2xl font-bold text-slate-900 dark:text-white">{totalMembers}</p><p className="text-xs text-slate-500">Total Members</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl"><IndianRupee size={20} className="text-amber-500" /></div>
            <div><p className="text-2xl font-bold text-slate-900 dark:text-white">{formatINR(totalRevenue)}</p><p className="text-xs text-slate-500">Total Revenue</p></div>
          </div>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search gyms by name, ID, or owner..." className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader size={24} className="animate-spin text-brand-500" /><span className="ml-3 text-slate-500">Loading gyms...</span></div>
      ) : filteredGyms.length === 0 ? (
        <div className="text-center py-20"><Building2 size={48} className="mx-auto text-slate-300 dark:text-slate-600" /><p className="mt-4 text-slate-500">No gyms found. Click "Add New Gym" to create one.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGyms.map((gym) => (
            <div key={gym.gym_id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700" style={{ borderTop: `4px solid ${gym.branding?.primary_color || '#0066FF'}` }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: gym.branding?.primary_color || '#0066FF' }}>{gym.gym_name?.charAt(0) || '?'}</div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{gym.gym_name}</h3>
                      <p className="text-xs text-slate-500">{gym.gym_id}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${planColors[gym.plan] || 'bg-slate-500/20 text-slate-400'}`}>{gym.plan?.toUpperCase()}</span>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Owner</span>
                  <span className="font-medium text-slate-900 dark:text-white">{gym.owner_name || '—'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Location</span>
                  <span className="font-medium text-slate-900 dark:text-white truncate ml-2">{gym.address || '—'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Website</span>
                  {gym.website_url ? (
                    <div className="flex items-center gap-2">
                      <a href={gym.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-500 hover:text-brand-600 font-medium">
                        <Globe size={14} /> Connected
                      </a>
                      <button onClick={() => { setConnectModal({ gymId: gym.gym_id, gymName: gym.gym_name }); setConnectUrl(gym.website_url) }} className="text-xs text-slate-400 hover:text-brand-500 font-medium">
                        Update
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => { setConnectModal({ gymId: gym.gym_id, gymName: gym.gym_name }); setConnectUrl('') }} className="flex items-center gap-1 text-slate-400 hover:text-brand-500 font-medium">
                      <Link2 size={14} /> Connect
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <div className="text-center"><p className="text-lg font-bold text-slate-900 dark:text-white">{gym.stats?.leads_count || 0}</p><p className="text-[10px] text-slate-500">Leads</p></div>
                  <div className="text-center"><p className="text-lg font-bold text-slate-900 dark:text-white">{gym.stats?.members_count || 0}</p><p className="text-[10px] text-slate-500">Members</p></div>
                  <div className="text-center"><p className="text-lg font-bold text-green-600">{formatINR(gym.stats?.total_revenue || 0)}</p><p className="text-[10px] text-slate-500">Revenue</p></div>
                  <div className="text-center"><p className="text-lg font-bold text-slate-900 dark:text-white">{gym.stats?.checkins_today || 0}</p><p className="text-[10px] text-slate-500">Check-ins</p></div>
                </div>
                <div className="flex gap-2 pt-3">
                  <button onClick={() => switchToGym(gym.gym_id)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold transition-colors">
                    Open Dashboard <ArrowRight size={12} />
                  {gym.website_url && (
                    <button onClick={() => setEmbedModal({ gymId: gym.gym_id, gymName: gym.gym_name })} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-600 rounded-lg text-xs font-semibold" title="Get Embed Code">
                      <Code size={14} />
                    </button>
                  )}
                  </button>
                  {!gym.website_url && (
                    <button onClick={() => { setConnectModal({ gymId: gym.gym_id, gymName: gym.gym_name }); setConnectUrl('') }} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-600/10 hover:bg-brand-600/20 text-brand-600 rounded-lg text-xs font-semibold" title="Connect Website">
                      <Link2 size={14} />
                    </button>
                  )}
                  <Link to="/settings" onClick={() => localStorage.setItem('gym_os_gym_id', gym.gym_id)} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold">
                    <SettingsIcon size={14} />
                  </Link>
                  <button onClick={() => setDeleteModal({ gymId: gym.gym_id, gymName: gym.gym_name })} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg text-xs font-semibold" title="Remove Gym">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/10 rounded-xl"><AlertTriangle size={24} className="text-red-600" /></div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Remove Gym</h2>
                <p className="text-sm text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            <div className="p-4 bg-red-500/5 rounded-xl mb-4">
              <p className="text-sm text-slate-700 dark:text-slate-300">You are about to permanently delete <span className="font-bold text-red-600">{deleteModal.gymName}</span> and ALL associated data (members, leads, payments, check-ins, memberships, trainers, classes, and settings).</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)} className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDeleteGym(deleteModal.gymId, deleteModal.gymName)} disabled={deleting} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                {deleting ? <Loader size={16} className="animate-spin mx-auto" /> : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add New Gym</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddGym} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gym Name *</label>
                  <input type="text" required value={formData.gym_name} onChange={e => setFormData({...formData, gym_name: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Plan</label>
                  <select value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="starter">Starter</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Owner Name</label>
                  <input type="text" value={formData.owner_name} onChange={e => setFormData({...formData, owner_name: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Owner Email *</label>
                  <input type="email" required value={formData.owner_email} onChange={e => setFormData({...formData, owner_email: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Owner Phone</label>
                  <input type="tel" value={formData.owner_phone} onChange={e => setFormData({...formData, owner_phone: e.target.value})} placeholder="+91 XXXXX XXXXX" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Login Password</label>
                  <input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Auto-generated if empty" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Link2 size={14} className="text-brand-500" /> Connect Live Website (Optional)
                </label>
                <input type="text" value={formData.website_url} onChange={e => setFormData({...formData, website_url: e.target.value})} placeholder="https://golds-vaishali-prime.base44.app/ or https://mygym.com or https://username.github.io/gym-site/" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <p className="text-xs text-slate-400 mt-1">Connect ANY website — Base44 app, GitHub Pages, custom domain, or WordPress. Enables QR check-in, lead capture, and data sync.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Primary Color</label>
                  <input type="color" value={formData.primary_color} onChange={e => setFormData({...formData, primary_color: e.target.value})} className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Accent Color</label>
                  <input type="color" value={formData.accent_color} onChange={e => setFormData({...formData, accent_color: e.target.value})} className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold">
                  {submitting ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
                  {submitting ? 'Creating...' : 'Create Gym'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {connectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Link2 size={18} className="text-brand-500" /> {connectUrl ? "Update Website" : "Connect Website"}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{connectModal.gymName}</p>
              </div>
              <button onClick={() => setConnectModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Website URL</label>
                <input type="text" value={connectUrl} onChange={e => setConnectUrl(e.target.value)} placeholder="https://golds-vaishali-prime.base44.app/ or https://mygym.com" autoFocus className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <p className="text-xs text-slate-400 mt-1.5">Connect ANY website — Base44 app, GitHub Pages, custom domain, or WordPress. This enables:</p>
                <ul className="text-xs text-slate-500 mt-1.5 space-y-1 ml-4">
                  <li>• QR code check-in for members</li>
                  <li>• Lead capture from website forms</li>
                  <li>• WhatsApp automations</li>
                  <li>• Real-time data sync with Gym OS</li>
                  <li>• Payment processing</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setConnectModal(null)} className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold">Cancel</button>
                <button onClick={() => handleConnectWebsite(connectModal.gymId)} disabled={connectingGym === connectModal.gymId} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold">
                  {connectingGym === connectModal.gymId ? <Loader size={16} className="animate-spin" /> : <Link2 size={16} />}
                  {connectingGym === connectModal.gymId ? 'Connecting...' : connectUrl ? 'Update Website' : 'Connect Website'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {embedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Code size={18} className="text-green-500" /> Embed Code</h2>
                <p className="text-xs text-slate-500 mt-0.5">{embedModal.gymName} — Add this to any website (.app, .com, .in, anything)</p>
              </div>
              <button onClick={() => setEmbedModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">Add this script tag to your website's <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">&lt;head&gt;</code> or before <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">&lt;/body&gt;</code>:</p>
              <div className="relative">
                <pre className="bg-slate-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto font-mono"><code>&lt;script src="https://somilsharma2000.github.io/gym-os-frontend/gymos-widget.js" data-gym-id="{embedModal.gymId}"&gt;&lt;/script&gt;</code></pre>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('<script src="https://somilsharma2000.github.io/gym-os-frontend/gymos-widget.js" data-gym-id="' + embedModal.gymId + '"></' + 'script>')
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="absolute top-2 right-2 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
                  title="Copy"
                >
                  {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
              <div className="bg-blue-500/10 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-blue-600">What this adds to your website:</p>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 ml-4">
                  <li>• <span className="font-medium">Floating Gym OS button</span> — opens a panel with trial pass, lead capture, QR check-in, and class schedule</li>
                  <li>• <span className="font-medium">Real-time sync</span> — all leads, trials, and check-ins flow directly into Gym OS dashboard</li>
                  <li>• <span className="font-medium">48-hour trial pass</span> — visitors can sign up for a trial directly from your website</li>
                  <li>• <span className="font-medium">QR check-in</span> — members scan in/out using their QR token</li>
                  <li>• <span className="font-medium">Branded UI</span> — matches Beyond Pixells navy/blue design</li>
                </ul>
              </div>
              <p className="text-xs text-slate-400">Works with Base44 apps, WordPress, Wix, Squarespace, custom HTML, GitHub Pages — any website that supports script tags.</p>
              <button onClick={() => setEmbedModal(null)} className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Single Unified AI Provider — powers the whole OS */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bot size={20} className="text-brand-500" /> AI Provider (One Key, Whole OS)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              One external AI key powers the AI Assistant, social content generation, and website copy across every gym. Super Admin only.
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${aiConfig.ai_enabled && aiConfig.has_key ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
            {aiConfig.ai_enabled && aiConfig.has_key ? 'Active' : 'Not Connected'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Provider</label>
            <select value={aiConfig.ai_provider} onChange={e => setAiConfig({ ...aiConfig, ai_provider: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md">
              <option value="openrouter">OpenRouter</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="custom">Custom (self-hosted / other)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Model ID</label>
            <input value={aiConfig.ai_model_id} onChange={e => setAiConfig({ ...aiConfig, ai_model_id: e.target.value })}
              placeholder="e.g. meta-llama/llama-3.3-70b-instruct:free"
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md" />
          </div>
          {aiConfig.ai_provider === 'custom' && (
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Base URL</label>
              <input value={aiConfig.ai_base_url || ''} onChange={e => setAiConfig({ ...aiConfig, ai_base_url: e.target.value })}
                placeholder="https://your-endpoint.com/v1/chat/completions"
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md" />
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              API Key {aiConfig.has_key && <span className="text-slate-400">(currently set: {aiConfig.key_preview})</span>}
            </label>
            <input type="password" value={aiKeyInput} onChange={e => setAiKeyInput(e.target.value)}
              placeholder={aiConfig.has_key ? 'Enter a new key to replace it' : 'Paste your API key'}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-md" />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            <input type="checkbox" checked={!!aiConfig.ai_enabled} onChange={e => setAiConfig({ ...aiConfig, ai_enabled: e.target.checked })} className="w-4 h-4" />
            Enable AI features across the OS
          </label>
          <button onClick={saveAIConfig} disabled={aiSaving} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-md flex items-center gap-2">
            {aiSaving ? 'Saving...' : aiSaved ? 'Saved ✓' : 'Save AI Config'}
          </button>
        </div>
        {!aiConfig.has_key && (
          <p className="text-xs text-amber-500 mt-2">No key set yet — AI Assistant and content generation will show "Not Connected" until you add one here.</p>
        )}
      </div>
    </div>
  )
}
