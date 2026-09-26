import { useState } from 'react'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'
import { api } from '../api/client'
import {
  Calendar,
  CheckCircle2,
  Loader2,
  Sparkles,
  Building2,
  Mail,
  User,
  MapPin,
  MessageSquare,
  Phone
} from 'lucide-react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    gym_name: '',
    phone: '',
    email: '',
    city: '',
    notes: ''
  })

  const WHATSAPP = '917737077479'
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [viaWhatsApp, setViaWhatsApp] = useState(false)
  const [waLink, setWaLink] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    let captured = false
    try {
      // REAL capture — posts to our own backend (gym-os-app).
      const res = await Promise.race([
        api.captureWebsiteLead({
          name: formData.name,
          gym_name: formData.gym_name,
          phone: formData.phone,
          email: formData.email,
          city: formData.city,
          notes: formData.notes,
          source: 'Contact Form - Book Demo',
          status: 'new',
          consent: true,
          consent_purpose: 'Contact about Gym OS demo',
        }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 7000)),
      ])
      captured = !!(res && res.success)
    } catch {
      captured = false
    }

    if (!captured) {
      // WhatsApp fallback — enquiry prefilled, user clicks (never popup-blocked)
      setViaWhatsApp(true)
      const msg = encodeURIComponent(
        `Hi Beyond Pixells! I want a Gym OS demo.\nName: ${formData.name}\nGym: ${formData.gym_name}\nPhone: ${formData.phone}\nCity: ${formData.city}`
      )
      setWaLink(`https://wa.me/${WHATSAPP}?text=${msg}`)
    }
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white flex flex-col font-sans selection:bg-[#2563eb]/30 selection:text-blue-200">
      <PublicHeader />

      {/* HERO HEADER */}
      <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2563eb]/10 border border-[#2563eb]/30 text-blue-400 text-xs font-semibold mb-6">
          <Calendar size={14} />
          <span>Book a Personalized Demo</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Get in Touch with{' '}
          <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
            Beyond Pixells
          </span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Schedule a live demonstration of Gym OS or send us a message. Our team will tailor a walkthrough for your gym's specific needs.
        </p>
      </section>

      {/* FORM & INSTAGRAM SECTION */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN - DM US ON INSTAGRAM CARD */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#131a26] border border-slate-800 rounded-3xl p-6 sm:p-8">
              <h3 className="text-xl font-bold text-white mb-2">Have a quick question?</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Prefer direct messaging? WhatsApp us for quick answers about Gym OS, custom website options, or onboarding details.
              </p>
              
              <a
                href="https://wa.me/917737077479?text=Hi%20Beyond%20Pixells!%20I%20have%20a%20quick%20question%20about%20Gym%20OS."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <MessageSquare size={18} />
                <span>WhatsApp us directly</span>
              </a>
            </div>

            <div className="bg-[#131a26] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Why Book a Demo?</h4>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300">Live tour of QR check-in & member management</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300">Setup estimate for your custom gym website</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300">WhatsApp automation setup guidance</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - DEMO BOOKING FORM */}
          <div className="lg:col-span-8">
            <div className="bg-[#131a26] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl">
              
              {submitted ? (
                <div className="py-12 text-center space-y-4 animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-2xl font-extrabold text-white">Demo Request Received!</h3>
                  <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                    {viaWhatsApp
                      ? 'We opened WhatsApp with your enquiry prefilled — just hit send and we have you covered. Our product specialist from Beyond Pixells will reach out to schedule your walkthrough.'
                      : 'Thank you! Your demo request has been successfully recorded. Our product specialist from Beyond Pixells will reach out to schedule your walkthrough.'}
                  </p>
                  {viaWhatsApp && waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
                    >
                      <MessageSquare size={16} />
                      Continue on WhatsApp
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setViaWhatsApp(false)
                      setWaLink('')
                      setFormData({ name: '', gym_name: '', phone: '', email: '', city: '', notes: '' })
                    }}
                    className="mt-4 px-6 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-all cursor-pointer"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white">Book a Demo</h2>
                    <p className="text-xs text-slate-400 mt-1">Fill out the details below to schedule your Gym OS preview.</p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name *</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#0a0e17] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2563eb]"
                        />
                      </div>
                    </div>

                    {/* Gym Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Gym Name *</label>
                      <div className="relative">
                        <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          name="gym_name"
                          required
                          value={formData.gym_name}
                          onChange={handleChange}
                          placeholder="e.g. Iron Fitness Gym"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#0a0e17] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2563eb]"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number *</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#0a0e17] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2563eb]"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address *</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="rahul@gym.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#0a0e17] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2563eb]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">City *</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g. Gurgaon / New Delhi"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0a0e17] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2563eb]"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Message / Requirements</label>
                    <div className="relative">
                      <MessageSquare size={16} className="absolute left-3.5 top-3 text-slate-500" />
                      <textarea
                        name="notes"
                        rows={3}
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Tell us about your current gym setup, member count, or specific feature requirements..."
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0a0e17] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2563eb]"
                      />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 rounded-xl text-sm font-bold text-white bg-[#2563eb] hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        <span>Book a Demo</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-500 text-center">
                    By submitting, you consent to Beyond Pixells processing your information to contact you regarding Gym OS.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
