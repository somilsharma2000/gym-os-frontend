import React, { useState, useEffect } from 'react'
import { api } from '../api/client'
import { getWidgetParams } from '../utils/widgetUtils'
import WidgetFooter from '../components/WidgetFooter'
import { SkeletonGrid } from '../components/SkeletonLoader'
import { Calendar, Clock, User, Zap, AlertCircle, CheckCircle, X, Users, RefreshCw } from 'lucide-react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

interface ClassItem {
  id: string
  name: string
  category?: string
  trainer_name?: string
  schedule_time?: string
  time?: string
  day_of_week?: string
  day?: string
  capacity?: number
  enrolled_count?: number
  spots_left?: number
  intensity?: string
  duration?: string
}

export default function WidgetSchedule() {
  const { gymId, isLight } = getWidgetParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [selectedDay, setSelectedDay] = useState<string>('Monday')

  // Booking Modal state
  const [bookingClass, setBookingClass] = useState<ClassItem | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)

  const fetchSchedule = async () => {
    if (!gymId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await api.getClassSchedule(gymId)
      if (res && (res.classes || Array.isArray(res))) {
        const rawClasses = res.classes || (Array.isArray(res) ? res : [])
        setClasses(rawClasses)
      } else if (res && res.error) {
        setError(res.error)
      } else {
        setClasses([])
      }
    } catch {
      setError('Could not load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedule()
    // Auto select today's day of week if valid
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    if (DAYS.includes(today)) {
      setSelectedDay(today)
    }
  }, [gymId])

  const handleBookNow = (cls: ClassItem) => {
    setBookingClass(cls)
    setBookingSuccess(null)
    setBookingError(null)
    setName('')
    setPhone('')
    setEmail('')
  }

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingClass) return
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setBookingError('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    setBookingError(null)

    try {
      const res = await api.enrollInClass({
        gym_id: gymId,
        class_id: bookingClass.id,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim()
      })

      if (res && (res.success || res.enrolled)) {
        const dayStr = bookingClass.day_of_week || bookingClass.day || selectedDay
        const timeStr = bookingClass.schedule_time || bookingClass.time || 'scheduled time'
        setBookingSuccess(`You're booked! See you at ${bookingClass.name} on ${dayStr} at ${timeStr}.`)
        
        // Update spots left locally
        setClasses(prev => prev.map(c => {
          if (c.id === bookingClass.id) {
            const currentEnrolled = c.enrolled_count !== undefined ? c.enrolled_count : 0
            const currentCapacity = c.capacity !== undefined ? c.capacity : 20
            const currentSpots = c.spots_left !== undefined ? c.spots_left : Math.max(0, currentCapacity - currentEnrolled)
            return {
              ...c,
              enrolled_count: currentEnrolled + 1,
              spots_left: Math.max(0, currentSpots - 1)
            }
          }
          return c
        }))
      } else {
        setBookingError(res?.error || 'This class is full or unavailable.')
      }
    } catch {
      setBookingError('Something went wrong, try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Theme styling helpers
  const bgClass = isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0a0e17] text-slate-100'
  const cardClass = isLight 
    ? 'bg-white border-slate-200 shadow-sm' 
    : 'bg-slate-900/90 border-slate-800 shadow-lg shadow-black/30'
  const headerText = isLight ? 'text-slate-900' : 'text-white'
  const subText = isLight ? 'text-slate-600' : 'text-slate-400'
  const borderClass = isLight ? 'border-slate-200' : 'border-slate-800'

  if (!gymId) {
    return (
      <div className={`min-h-screen flex flex-col font-sans ${bgClass}`}>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className={`text-xl font-bold mb-2 ${headerText}`}>No Gym Specified</h2>
          <p className={`max-w-md text-sm mb-6 ${subText}`}>
            Please provide a valid gym ID in the URL query parameter (e.g. <code className="bg-slate-800 px-2 py-1 rounded text-blue-400 font-mono text-xs">?gym=YOUR_GYM_ID</code>) to view the class schedule.
          </p>
        </div>
        <WidgetFooter isLight={isLight} />
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans ${bgClass}`}>
      {/* Header */}
      <header className={`p-4 sm:p-6 border-b ${borderClass} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h1 className={`text-lg sm:text-xl font-bold tracking-tight ${headerText}`}>Class Schedule</h1>
          </div>
          <p className={`text-xs ${subText} mt-0.5`}>Book your spot in live fitness sessions</p>
        </div>
        <button
          onClick={fetchSchedule}
          className={`self-start sm:self-auto text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
            isLight 
              ? 'border-slate-200 text-slate-700 hover:bg-slate-100' 
              : 'border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-500' : ''}`} />
          Refresh
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
        {loading ? (
          <div className="space-y-4">
            <div className="h-10 bg-slate-800/40 rounded-xl animate-pulse"></div>
            <SkeletonGrid />
          </div>
        ) : error ? (
          <div className={`p-8 text-center rounded-2xl border ${borderClass} ${cardClass} my-6`}>
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className={`text-base font-semibold ${headerText} mb-1`}>Unable to Load Schedule</h3>
            <p className={`text-xs ${subText} mb-4`}>{error}</p>
            <button
              onClick={fetchSchedule}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
            >
              Try Again
            </button>
          </div>
        ) : classes.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl border ${borderClass} ${cardClass} my-6`}>
            <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
            <h3 className={`text-base font-semibold ${headerText} mb-1`}>No classes scheduled yet</h3>
            <p className={`text-xs ${subText}`}>Check back soon for updated fitness classes.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Day Selector Tabs for Mobile / Quick Navigation */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {DAYS.map(day => {
                const dayClassesCount = classes.filter(
                  c => (c.day_of_week || c.day || '').toLowerCase() === day.toLowerCase()
                ).length
                const isActive = selectedDay === day
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : isLight
                          ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{day.substring(0, 3)}</span>
                    {dayClassesCount > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {dayClassesCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Selected Day View */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-base font-semibold ${headerText} flex items-center gap-2`}>
                  <span>{selectedDay}'s Classes</span>
                </h2>
                <span className={`text-xs ${subText}`}>
                  Showing {classes.filter(c => (c.day_of_week || c.day || '').toLowerCase() === selectedDay.toLowerCase()).length} sessions
                </span>
              </div>

              {classes.filter(c => (c.day_of_week || c.day || '').toLowerCase() === selectedDay.toLowerCase()).length === 0 ? (
                <div className={`p-8 text-center rounded-2xl border ${borderClass} ${cardClass}`}>
                  <p className={`text-xs ${subText}`}>No classes scheduled for {selectedDay}. Select another day above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classes
                    .filter(c => (c.day_of_week || c.day || '').toLowerCase() === selectedDay.toLowerCase())
                    .map((cls) => {
                      const capacity = cls.capacity !== undefined ? cls.capacity : 20
                      const enrolled = cls.enrolled_count !== undefined ? cls.enrolled_count : 0
                      const spotsLeft = cls.spots_left !== undefined ? cls.spots_left : Math.max(0, capacity - enrolled)
                      const isFull = spotsLeft <= 0

                      const intensityBadge = cls.intensity || cls.category || 'General'

                      return (
                        <div
                          key={cls.id}
                          className={`rounded-2xl border ${borderClass} ${cardClass} p-5 flex flex-col justify-between transition hover:border-blue-500/50 group`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <h3 className={`font-bold text-base ${headerText} group-hover:text-blue-500 transition-colors`}>
                                {cls.name}
                              </h3>
                              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                                isLight
                                  ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              }`}>
                                {intensityBadge}
                              </span>
                            </div>

                            <div className="space-y-2 text-xs mb-4">
                              <div className={`flex items-center gap-2 ${subText}`}>
                                <Clock className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                <span>{cls.schedule_time || cls.time || 'Scheduled Time'}</span>
                                {cls.duration && <span className="opacity-60">&bull; {cls.duration}</span>}
                              </div>

                              {cls.trainer_name && (
                                <div className={`flex items-center gap-2 ${subText}`}>
                                  <User className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                  <span>Trainer: <strong className={headerText}>{cls.trainer_name}</strong></span>
                                </div>
                              )}

                              <div className={`flex items-center gap-2 ${subText}`}>
                                <Users className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                <span>
                                  {isFull ? (
                                    <strong className="text-red-500">Class Full</strong>
                                  ) : (
                                    <span><strong className={headerText}>{spotsLeft}</strong> spots left</span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            disabled={isFull}
                            onClick={() => handleBookNow(cls)}
                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                              isFull
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 active:scale-[0.98]'
                            }`}
                          >
                            <Zap className="w-3.5 h-3.5" />
                            {isFull ? 'Class Full' : 'Book Now'}
                          </button>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {bookingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md rounded-2xl border ${borderClass} ${cardClass} p-6 shadow-2xl relative`}>
            <button
              onClick={() => setBookingClass(null)}
              className={`absolute top-4 right-4 p-1.5 rounded-lg border transition ${
                isLight ? 'border-slate-200 text-slate-500 hover:bg-slate-100' : 'border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className={`text-lg font-bold mb-1 ${headerText}`}>Book Class</h3>
            <p className={`text-xs ${subText} mb-4`}>
              Reserve your spot for <strong className="text-blue-500">{bookingClass.name}</strong>
            </p>

            {/* Class info summary */}
            <div className={`p-3 rounded-xl border ${borderClass} ${isLight ? 'bg-slate-50' : 'bg-slate-950/60'} mb-4 text-xs space-y-1`}>
              <div className="flex justify-between">
                <span className={subText}>Day & Time:</span>
                <span className={`font-semibold ${headerText}`}>
                  {bookingClass.day_of_week || bookingClass.day || selectedDay} @ {bookingClass.schedule_time || bookingClass.time}
                </span>
              </div>
              {bookingClass.trainer_name && (
                <div className="flex justify-between">
                  <span className={subText}>Trainer:</span>
                  <span className={`font-semibold ${headerText}`}>{bookingClass.trainer_name}</span>
                </div>
              )}
            </div>

            {bookingSuccess ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className={`text-base font-semibold ${headerText}`}>Booking Confirmed!</h4>
                <p className={`text-xs ${subText}`}>{bookingSuccess}</p>
                <button
                  onClick={() => setBookingClass(null)}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition mt-2"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnrollSubmit} className="space-y-3.5">
                {bookingError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div>
                  <label className={`block text-xs font-medium ${subText} mb-1`}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition ${
                      isLight 
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500' 
                        : 'bg-slate-950 border-slate-800 text-white focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium ${subText} mb-1`}>Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Enter contact phone"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition ${
                      isLight 
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500' 
                        : 'bg-slate-950 border-slate-800 text-white focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium ${subText} mb-1`}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition ${
                      isLight 
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500' 
                        : 'bg-slate-950 border-slate-800 text-white focus:border-blue-500'
                    }`}
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingClass(null)}
                    className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-semibold transition ${
                      isLight ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-600/20"
                  >
                    {submitting ? 'Confirming...' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <WidgetFooter isLight={isLight} />
    </div>
  )
}
