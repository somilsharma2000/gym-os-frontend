import { useState, useEffect } from 'react'
import { api, getGymId, isSuperAdmin } from '../api/client'

const API_BASE = 'https://base44.app/api/apps/6a700b150c8d8b8e923580a1/functions'

const ENDPOINTS = [
  {
    title: 'Website Lead API',
    method: 'POST',
    path: '/functions/ingestWebsiteLead',
    description: 'Capture leads from your website forms directly into Gym OS',
    example: { name: 'John Doe', phone: '9876543210', email: 'john@example.com', source: 'website', fitness_goal: 'Weight loss', message: 'Interested in membership' }
  },
  {
    title: 'Member Sign-up API',
    method: 'POST',
    path: '/functions/ingestMember',
    description: 'Create new members from website checkouts and forms',
    example: { name: 'John Doe', email: 'john@example.com', phone: '9876543210', membership_type: 'Monthly', emergency_contact: '9876543211' }
  },
  {
    title: 'Class Booking API',
    method: 'POST',
    path: '/functions/ingestBooking',
    description: 'Record class registrations from your website',
    example: { member_id: 'member_id', class_id: 'class_id', session_date: '2026-09-01T10:00:00Z', status: 'confirmed' }
  },
  {
    title: 'Class Schedules',
    method: 'POST',
    path: '/functions/getGymClasses',
    description: 'Fetch live class timetables for your gym website',
    example: {}
  },
  {
    title: 'Trainer Profiles',
    method: 'POST',
    path: '/functions/getGymTrainers',
    description: 'Display active trainer profiles on your website',
    example: {}
  },
  {
    title: 'Store Orders',
    method: 'POST',
    path: '/functions/ingestOrder',
    description: 'Record merchandise and package purchases',
    example: { customer_name: 'John Doe', product_id: 'product_id', quantity: 1, payment_status: 'paid', payment_method: 'razorpay' }
  }
]

export default function Integrations() {
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState('')
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const result = await api.getAllGyms()
        const gymId = getGymId()
        const gym = result.gyms?.find((g: any) => g.gym_id === gymId)
        if (gym?.api_key) setApiKey(gym.api_key)
      } catch (e) {
        console.error('Failed to fetch API key:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchApiKey()
  }, [])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  const getUrl = (path: string) => `https://base44.app/api/apps/6a700b150c8d8b8e923580a1${path}`

  const getExample = (example: any) => JSON.stringify({ ...example, api_key: apiKey || 'YOUR_API_KEY' }, null, 2)

  return (
    <div className="min-h-screen bg-[#0A0E27] p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">API & Integrations</h1>
          <p className="text-sm text-slate-400">Connect your gym website and external apps to Gym OS</p>
        </div>

        {/* API Key */}
        <div className="mb-6 bg-[#0F1535] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-white mb-0.5">Your Gym API Key</h2>
              <p className="text-xs text-slate-400">Authenticate all API requests with this key</p>
            </div>
            <div className="px-2.5 py-1 bg-[#0066FF]/10 text-[#0066FF] text-[10px] font-mono rounded-full border border-[#0066FF]/30">Secure</div>
          </div>
          {loading ? (
            <div className="h-10 bg-slate-800 rounded-lg animate-pulse" />
          ) : (
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-[#0A0E27] border border-slate-800 rounded-lg text-[#0066FF] font-mono text-xs sm:text-sm overflow-x-auto">
                {showKey ? (apiKey || 'No API key set') : (apiKey ? '••••••••••••••••••••' : 'No API key set')}
              </code>
              <button onClick={() => setShowKey(!showKey)} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs whitespace-nowrap">{showKey ? 'Hide' : 'Show'}</button>
              <button onClick={() => copyToClipboard(apiKey, 'key')} disabled={!apiKey} className="px-3 py-2 bg-[#0066FF] hover:bg-[#0052cc] disabled:opacity-50 text-white rounded-lg text-xs font-medium whitespace-nowrap">{copied === 'key' ? '✓' : 'Copy'}</button>
            </div>
          )}
        </div>

        {/* Social Integration Status */}
        <div className="mb-6 bg-[#0F1535] border border-slate-800 rounded-xl p-5">
          <h2 className="text-base font-semibold text-white mb-3">Connected Channels</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: 'WhatsApp', status: 'Configure in Settings', color: 'text-green-400', icon: '💬' },
              { name: 'Instagram', status: 'Add API Token', color: 'text-pink-400', icon: '📷' },
              { name: 'Facebook', status: 'Add API Token', color: 'text-blue-400', icon: '👤' },
              { name: 'Website API', status: apiKey ? 'Active' : 'Set API key', color: apiKey ? 'text-green-400' : 'text-amber-400', icon: '🌐' },
            ].map((ch) => (
              <div key={ch.name} className="bg-[#0A0E27] border border-slate-800 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">{ch.icon}</div>
                <div className="text-xs font-semibold text-white">{ch.name}</div>
                <div className={`text-[10px] ${ch.color}`}>{ch.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* API Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {ENDPOINTS.map((ep, idx) => (
            <div key={idx} className="bg-[#0F1535] border border-slate-800 rounded-xl p-5 hover:border-[#0066FF]/30 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-white font-semibold text-sm mb-0.5">{ep.title}</h3>
                  <p className="text-[11px] text-slate-400">{ep.description}</p>
                </div>
                <span className="px-2 py-0.5 bg-[#0066FF]/10 text-[#0066FF] text-[10px] font-bold rounded">{ep.method}</span>
              </div>
              <div className="mb-3">
                <label className="text-[10px] text-slate-500 mb-1 block">Endpoint</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-2 py-1.5 bg-[#0A0E27] border border-slate-800 rounded text-slate-300 font-mono text-[10px] overflow-x-auto">{getUrl(ep.path)}</code>
                  <button onClick={() => copyToClipboard(getUrl(ep.path), `u${idx}`)} className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]">{copied === `u${idx}` ? '✓' : 'Copy'}</button>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block">Example Body</label>
                <div className="relative">
                  <pre className="px-2 py-1.5 bg-[#0A0E27] border border-slate-800 rounded text-slate-300 font-mono text-[10px] overflow-x-auto max-h-32">{getExample(ep.example)}</pre>
                  <button onClick={() => copyToClipboard(getExample(ep.example), `b${idx}`)} className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]">{copied === `b${idx}` ? '✓' : 'Copy'}</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Guide */}
        <div className="mt-6 bg-[#0F1535] border border-slate-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3 text-sm">How to Connect</h3>
          <div className="space-y-2 text-xs text-slate-400">
            <p><span className="text-white font-medium">1.</span> Copy your API key from above.</p>
            <p><span className="text-white font-medium">2.</span> Use the endpoint URL for the API you need.</p>
            <p><span className="text-white font-medium">3.</span> Include <code className="text-[#0066FF]">api_key</code> in every request body or as <code className="text-[#0066FF]">x-api-key</code> header.</p>
            <p><span className="text-white font-medium">4.</span> All data is scoped to your gym — secure isolation enforced server-side.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
