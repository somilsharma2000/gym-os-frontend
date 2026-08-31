import { useState, useEffect } from 'react'
import { api } from '../api/client'
import { Calendar, Clock, Loader2, User, Flame, Zap, Activity, CheckCircle2 } from 'lucide-react'

export default function WidgetBooking() {
  const gymId = new URLSearchParams(window.location.search).get('gym') || localStorage.getItem('gym_os_gym_id') || ''
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!gymId) { setLoading(false); return }
    api.getClassSchedule(gymId).then((res: any) => {
      if (res.success) setClasses(res.classes || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (!gymId) return <NoGym />
  if (loading) return <Loading />
  if (success) {
    const cls = classes.find(c => c.id === selectedClass)
    return (
      <div className="min-h-screen bg-[#0a0e17] text-white flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <CheckCircle2 size={48} className="text-emerald-500 mx-auto" />
          <h2 className="text-xl font-bold">You're Booked!</h2>
          <p className="text-slate-400 text-sm">See you at <strong className="text-white">{cls?.name}</strong> on {cls?.day} at {cls?.time}.</p>
          <p className="text-xs text-slate-500">We'll send you a reminder via WhatsApp. See you there!</p>
          <button onClick={() => { setSuccess(false); setSelectedClass(''); setName(''); setPhone(''); setEmail('') }} className="px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg text-sm font-semibold">Book Another Class</button>
          <PoweredBy />
        </div>
      </div>
    )
  }

  const available = classes.filter(c => (c.spots_left ?? 0) > 0)

  const handleSubmit = async () => {
    if (!selectedClass || !name || !phone) return
    setSubmitting(true); setError('')
    try {
      const res = await api.enrollInClass({ gym_id: gymId, class_id: selectedClass, name, phone, email })
      if (res.success) setSuccess(true)
      else setError(res.error || 'This class is full. Please try another class.')
    } catch { setError('Something went wrong. Please try again.') }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white p-5 max-w-lg mx-auto space-y-5">
      <div className="text-center">
        <Calendar size={28} className="text-[#2563eb] mx-auto mb-2" />
        <h1 className="text-xl font-bold">Book a Class</h1>
        <p className="text-sm text-slate-400">Select a class and enter your details</p>
      </div>

      {classes.length === 0 ? (
        <EmptyState message="No classes available for booking right now. Please check back soon!" />
      ) : (
        <>
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1.5 block">SELECT CLASS</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#131a26] border border-slate-700 rounded-lg text-sm focus:border-[#2563eb] focus:outline-none">
              <option value="">Choose a class...</option>
              {available.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name} — {c.day} at {c.time} ({c.spots_left} spots left)</option>
              ))}
            </select>
          </div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your Name *"
            className="w-full px-3 py-2.5 bg-[#131a26] border border-slate-700 rounded-lg text-sm focus:border-[#2563eb] focus:outline-none" />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number *" type="tel"
            className="w-full px-3 py-2.5 bg-[#131a26] border border-slate-700 rounded-lg text-sm focus:border-[#2563eb] focus:outline-none" />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (optional)" type="email"
            className="w-full px-3 py-2.5 bg-[#131a26] border border-slate-700 rounded-lg text-sm focus:border-[#2563eb] focus:outline-none" />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button disabled={!selectedClass || !name || !phone || submitting} onClick={handleSubmit}
            className="w-full py-3 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Confirm Booking
          </button>
        </>
      )}
      <PoweredBy />
    </div>
  )
}

function Loading() { return <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center"><Loader2 className="animate-spin text-[#2563eb]" size={32} /></div> }
function NoGym() { return <div className="min-h-screen bg-[#0a0e17] text-white flex items-center justify-center p-6"><p className="text-sm text-slate-400 text-center">No gym specified. Add <code className="text-[#2563eb]">?gym=YOUR_GYM_ID</code> to the URL.</p></div> }
function EmptyState({ message }: { message: string }) { return <div className="text-center py-8 text-sm text-slate-500">{message}</div> }
function PoweredBy() { return <div className="text-center pt-4"><a href="https://gymos.in" className="text-[10px] text-slate-600 hover:text-slate-400">Powered by Gym OS</a></div> }
