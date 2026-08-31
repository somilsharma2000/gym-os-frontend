import { useState, useEffect } from 'react'
import { api } from '../api/client'
import { Dumbbell, Star, CheckCircle2, Loader2 } from 'lucide-react'

export default function WidgetTrainers() {
  const gymId = new URLSearchParams(window.location.search).get('gym') || localStorage.getItem('gym_os_gym_id') || ''
  const [trainers, setTrainers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!gymId) { setLoading(false); return }
    api.getStaff(gymId).then((res: any) => {
      if (res.success) setTrainers((res.trainers || []).filter((t: any) => t.is_active || t.status === 'active'))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (!gymId) return <div className="min-h-screen bg-[#0a0e17] text-white flex items-center justify-center p-6"><p className="text-sm text-slate-400 text-center">No gym specified. Add <code className="text-[#2563eb]">?gym=YOUR_GYM_ID</code> to the URL.</p></div>
  if (loading) return <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center"><Loader2 className="animate-spin text-[#2563eb]" size={32} /></div>

  const handleEnquire = async (trainerName: string) => {
    if (!name || !phone) return
    setSubmitting(true)
    try {
      await api.createLeadWithConsent({
        gym_id: gymId,
        name, phone,
        interest: `Personal training with ${trainerName}`,
        source: 'website',
        fitness_goal: 'Personal training'
      } as any)
      setSuccess(true)
    } catch { /* */ }
    setSubmitting(false)
  }

  const initials = (n: string) => n.trim().split(/\s+/).map(p => p[0]).join('').substring(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white p-5 max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <Dumbbell size={28} className="text-[#2563eb] mx-auto mb-2" />
        <h1 className="text-xl font-bold">Our Trainers</h1>
        <p className="text-sm text-slate-400">Meet the team that will help you reach your goals</p>
      </div>

      {trainers.length === 0 ? (
        <div className="text-center py-8 text-sm text-slate-500">No trainers found.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {trainers.map((t: any) => (
            <div key={t.id} className="bg-[#131a26] rounded-xl border border-slate-700 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#2563eb]/20 border border-[#2563eb]/30 flex items-center justify-center text-lg font-bold text-[#2563eb]">
                  {initials(t.name || '?')}
                </div>
                <div>
                  <h3 className="font-bold">{t.name}</h3>
                  <p className="text-xs text-slate-400">{t.specialization || t.specialties || t.role || 'Certified Trainer'}</p>
                </div>
              </div>
              {t.bio && <p className="text-xs text-slate-500 leading-relaxed">{t.bio}</p>}
              <div className="flex items-center gap-3 text-xs">
                {t.rating && (
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star size={12} fill="currentColor" /> {t.rating}
                  </span>
                )}
                {t.members_count != null && <span className="text-slate-400">{t.members_count} active members</span>}
              </div>
              <button onClick={() => { setShowForm(t.id); setSuccess(false) }}
                className="w-full py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg text-sm font-semibold">
                Book a Session
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && !success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#131a26] border border-slate-700 rounded-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-bold">Book a Training Session</h3>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your Name *"
              className="w-full px-3 py-2.5 bg-[#0a0e17] border border-slate-700 rounded-lg text-sm focus:border-[#2563eb] focus:outline-none" />
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number *" type="tel"
              className="w-full px-3 py-2.5 bg-[#0a0e17] border border-slate-700 rounded-lg text-sm focus:border-[#2563eb] focus:outline-none" />
            <div className="flex gap-3">
              <button onClick={() => setShowForm(null)} className="flex-1 py-2.5 bg-slate-800 rounded-lg text-sm">Cancel</button>
              <button disabled={!name || !phone || submitting} onClick={() => handleEnquire(trainers.find(t => t.id === showForm)?.name || 'Trainer')}
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
            <h3 className="text-lg font-bold">Request sent! The trainer will contact you soon.</h3>
            <button onClick={() => { setShowForm(null); setSuccess(false); setName(''); setPhone('') }} className="px-5 py-2 bg-slate-800 rounded-lg text-sm">Close</button>
          </div>
        </div>
      )}
      <div className="text-center pt-2"><a href="https://gymos.in" className="text-[10px] text-slate-600 hover:text-slate-400">Powered by Gym OS</a></div>
    </div>
  )
}
