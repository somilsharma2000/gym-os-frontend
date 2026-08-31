import { useState, useEffect } from 'react'
import { api } from '../api/client'
import { CreditCard, CheckCircle2, Loader2, Sparkles } from 'lucide-react'

export default function WidgetPlans() {
  const gymId = new URLSearchParams(window.location.search).get('gym') || localStorage.getItem('gym_os_gym_id') || ''
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!gymId) { setLoading(false); return }
    api.getMemberships(gymId).then((res: any) => {
      if (res.success) setPlans(res.memberships || res.plans || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (!gymId) return <div className="min-h-screen bg-[#0a0e17] text-white flex items-center justify-center p-6"><p className="text-sm text-slate-400 text-center">No gym specified. Add <code className="text-[#2563eb]">?gym=YOUR_GYM_ID</code> to the URL.</p></div>
  if (loading) return <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center"><Loader2 className="animate-spin text-[#2563eb]" size={32} /></div>

  const handleEnquire = async (planName: string) => {
    if (!name || !phone) return
    setSubmitting(true)
    try {
      await api.createLeadWithConsent({
        gym_id: gymId,
        name, phone,
        interest: planName,
        source: 'website',
        fitness_goal: 'Membership enquiry'
      } as any)
      setSuccess(true)
    } catch { /* */ }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white p-5 max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <CreditCard size={28} className="text-[#2563eb] mx-auto mb-2" />
        <h1 className="text-xl font-bold">Membership Plans</h1>
        <p className="text-sm text-slate-400">Choose a plan that fits your fitness journey</p>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-8 text-sm text-slate-500">No plans published yet. Please contact the gym directly.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((p: any, i: number) => (
            <div key={p.id || i} className={`bg-[#131a26] rounded-xl border ${i === 1 ? 'border-[#2563eb]' : 'border-slate-700'} p-5 space-y-3 flex flex-col`}>
              {i === 1 && <div className="text-[10px] font-bold text-[#2563eb] bg-[#2563eb]/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1 w-fit"><Sparkles size={10} /> POPULAR</div>}
              <h3 className="text-lg font-bold">{p.plan_name || p.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#2563eb]">₹{p.plan_price || p.price}</span>
                <span className="text-xs text-slate-400">/{p.plan_duration === 'Monthly' ? 'month' : p.plan_duration || 'month'}</span>
              </div>
              <div className="text-xs text-slate-400 space-y-1 flex-1">
                <p>✓ Full gym access</p>
                <p>✓ QR check-in</p>
                <p>✓ Class booking</p>
                <p>✓ {p.plan_duration === 'Annual' ? '12 months' : p.plan_duration === 'Quarterly' ? '3 months' : '1 month'} membership</p>
              </div>
              <button onClick={() => { setShowForm(p.id || String(i)); setSuccess(false) }}
                className="w-full py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg text-sm font-semibold">
                Get This Plan
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && !success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#131a26] border border-slate-700 rounded-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-bold">Enquire About This Plan</h3>
            <p className="text-xs text-slate-400">We'll contact you via WhatsApp with details.</p>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your Name *"
              className="w-full px-3 py-2.5 bg-[#0a0e17] border border-slate-700 rounded-lg text-sm focus:border-[#2563eb] focus:outline-none" />
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number *" type="tel"
              className="w-full px-3 py-2.5 bg-[#0a0e17] border border-slate-700 rounded-lg text-sm focus:border-[#2563eb] focus:outline-none" />
            <div className="flex gap-3">
              <button onClick={() => setShowForm(null)} className="flex-1 py-2.5 bg-slate-800 rounded-lg text-sm">Cancel</button>
              <button disabled={!name || !phone || submitting} onClick={() => handleEnquire(plans.find(p => (p.id || '') === showForm)?.plan_name || 'Membership')}
                className="flex-1 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="text-center space-y-3">
            <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold">Thank you! We'll reach out to you soon.</h3>
            <button onClick={() => { setShowForm(null); setSuccess(false); setName(''); setPhone('') }} className="px-5 py-2 bg-slate-800 rounded-lg text-sm">Close</button>
          </div>
        </div>
      )}
      <div className="text-center pt-2"><a href="https://gymos.in" className="text-[10px] text-slate-600 hover:text-slate-400">Powered by Gym OS</a></div>
    </div>
  )
}
