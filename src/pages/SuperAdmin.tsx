import { useState, useEffect } from 'react'
import { Building2, Plus, Globe, Settings as SettingsIcon, Users, Search, X, TrendingUp, CheckCircle, AlertCircle, Loader, Trash2, Edit, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

const API_BASE = 'https://base44.app/api/apps/6a700b150c8d8b8e923580a1/functions'

interface GymStats {
  leads_count: number
  members_count: number
  active_memberships: number
}

interface Gym {
  id: string
  gym_id: string
  gym_name: string
  subdomain: string
  owner_name: string
  owner_email: string
  owner_phone: string
  address: string
  description: string
  plan: string
  status: string
  website_generated: boolean
  website_url: string
  app_status: string
  branding?: {
    primary_color: string
    accent_color: string
    bg_color: string
    logo_url: string
  }
  stats?: GymStats
  created_date: string
}

export default function SuperAdmin() {
  const [gyms, setGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState({
    gym_name: '', subdomain: '', owner_name: '', owner_email: '', owner_phone: '',
    address: '', description: '', primary_color: '#0066FF', accent_color: '#3B82F6', plan: 'starter'
  })

  const fetchGyms = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/getAllGyms`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({})
      })
      const data = await res.json()
      if (data.success) setGyms(data.gyms)
    } catch (err) {
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

  const totalLeads = gyms.reduce((sum, g) => sum + (g.stats?.leads_count || 0), 0)
  const totalMembers = gyms.reduce((sum, g) => sum + (g.stats?.members_count || 0), 0)
  const totalMemberships = gyms.reduce((sum, g) => sum + (g.stats?.active_memberships || 0), 0)

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
        setMessage({ type: 'success', text: `Gym "${formData.gym_name}" created successfully!` })
        setShowAddModal(false)
        setFormData({ gym_name: '', subdomain: '', owner_name: '', owner_email: '', owner_phone: '', address: '', description: '', primary_color: '#0066FF', accent_color: '#3B82F6', plan: 'starter' })
        fetchGyms()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create gym' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error' })
    }
    setSubmitting(false)
  }

  const handleGenerateWebsite = async (gymId: string, gymName: string) => {
    setGeneratingId(gymId)
    try {
      const res = await fetch(`${API_BASE}/generateGymWebsite`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gym_id: gymId })
      })
      const data = await res.json()
      if (data.success) {
        // Download the HTML
        const blob = new Blob([data.html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${gymName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-website.html`
        a.click()
        URL.revokeObjectURL(url)
        setMessage({ type: 'success', text: `Website generated for ${gymName}! HTML downloaded.` })
        fetchGyms()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to generate website' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error' })
    }
    setGeneratingId(null)
  }

  const planColors: Record<string, string> = {
    starter: 'bg-blue-500/20 text-blue-300',
    standard: 'bg-purple-500/20 text-purple-300',
    premium: 'bg-amber-500/20 text-amber-300'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Super Admin</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage all gyms, websites, and integrations</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus size={18} /> Add New Gym
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto"><X size={16} /></button>
        </div>
      )}

      {/* Stats Summary */}
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
            <div className="p-2.5 bg-purple-500/10 rounded-xl"><CheckCircle size={20} className="text-purple-500" /></div>
            <div><p className="text-2xl font-bold text-slate-900 dark:text-white">{totalMemberships}</p><p className="text-xs text-slate-500">Active Memberships</p></div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search gyms by name, ID, or owner..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Gyms Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={24} className="animate-spin text-brand-500" />
          <span className="ml-3 text-slate-500">Loading gyms...</span>
        </div>
      ) : filteredGyms.length === 0 ? (
        <div className="text-center py-20">
          <Building2 size={48} className="mx-auto text-slate-300 dark:text-slate-600" />
          <p className="mt-4 text-slate-500">No gyms found. Click "Add New Gym" to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGyms.map((gym) => (
            <div key={gym.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Gym header with branding color */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-700" style={{ borderTop: `4px solid ${gym.branding?.primary_color || '#0066FF'}` }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: gym.branding?.primary_color || '#0066FF' }}>
                      {gym.gym_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{gym.gym_name}</h3>
                      <p className="text-xs text-slate-500">{gym.gym_id}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${planColors[gym.plan] || 'bg-slate-500/20 text-slate-400'}`}>
                    {gym.plan?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Gym info */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Owner</span>
                  <span className="font-medium text-slate-900 dark:text-white">{gym.owner_name || '—'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Location</span>
                  <span className="font-medium text-slate-900 dark:text-white">{gym.address || '—'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Website</span>
                  {gym.website_generated ? (
                    <span className="flex items-center gap-1 text-green-600"><CheckCircle size={14} /> Generated</span>
                  ) : (
                    <span className="text-slate-400">Not generated</span>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <div className="text-center"><p className="text-lg font-bold text-slate-900 dark:text-white">{gym.stats?.leads_count || 0}</p><p className="text-xs text-slate-500">Leads</p></div>
                  <div className="text-center"><p className="text-lg font-bold text-slate-900 dark:text-white">{gym.stats?.members_count || 0}</p><p className="text-xs text-slate-500">Members</p></div>
                  <div className="text-center"><p className="text-lg font-bold text-slate-900 dark:text-white">{gym.stats?.active_memberships || 0}</p><p className="text-xs text-slate-500">Active</p></div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3">
                  <button
                    onClick={() => handleGenerateWebsite(gym.gym_id, gym.gym_name)}
                    disabled={generatingId === gym.gym_id}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    {generatingId === gym.gym_id ? <Loader size={14} className="animate-spin" /> : <Globe size={14} />}
                    {generatingId === gym.gym_id ? 'Generating...' : 'Generate Website'}
                  </button>
                  <Link
                    to="/settings"
                    onClick={() => localStorage.setItem('gym_os_gym_id', gym.gym_id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <SettingsIcon size={14} /> Integrations
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Gym Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add New Gym</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddGym} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gym Name *</label>
                  <input type="text" required value={formData.gym_name} onChange={e => setFormData({...formData, gym_name: e.target.value})}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subdomain</label>
                  <input type="text" value={formData.subdomain} onChange={e => setFormData({...formData, subdomain: e.target.value})}
                    placeholder="auto from name"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Owner Name</label>
                  <input type="text" value={formData.owner_name} onChange={e => setFormData({...formData, owner_name: e.target.value})}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Owner Email</label>
                  <input type="email" value={formData.owner_email} onChange={e => setFormData({...formData, owner_email: e.target.value})}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Owner Phone</label>
                <input type="tel" value={formData.owner_phone} onChange={e => setFormData({...formData, owner_phone: e.target.value})}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Primary Color</label>
                  <input type="color" value={formData.primary_color} onChange={e => setFormData({...formData, primary_color: e.target.value})}
                    className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Accent Color</label>
                  <input type="color" value={formData.accent_color} onChange={e => setFormData({...formData, accent_color: e.target.value})}
                    className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Plan</label>
                  <select value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="starter">Starter</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold">
                  {submitting ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
                  {submitting ? 'Creating...' : 'Create Gym'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
