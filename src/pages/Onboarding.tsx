import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  CreditCard,
  Users,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Upload,
  Sparkles,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Check,
  AlertCircle,
  X
} from 'lucide-react'

// Interfaces
interface DayHours {
  open: string
  close: string
  closed: boolean
}

interface GymHours {
  mon: DayHours
  tue: DayHours
  wed: DayHours
  thu: DayHours
  fri: DayHours
  sat: DayHours
  sun: DayHours
}

interface MembershipPlan {
  id: string
  name: string
  price: string
  durationMonths: string
}

interface Trainer {
  id: string
  name: string
  phone: string
  specialization: string
}

interface GymClass {
  id: string
  name: string
  day: string
  time: string
  capacity: string
  trainerId: string
}

interface OnboardingData {
  profile: {
    name: string
    city: string
    address: string
    phone: string
    description: string
    logoUrl: string
    hours: GymHours
  }
  plans: MembershipPlan[]
  trainers: Trainer[]
  classes: GymClass[]
  completedAt?: string
}

const DAYS_KEYS: Array<{ key: keyof GymHours; label: string }> = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
]

const DEFAULT_HOURS: GymHours = {
  mon: { open: '06:00', close: '22:00', closed: false },
  tue: { open: '06:00', close: '22:00', closed: false },
  wed: { open: '06:00', close: '22:00', closed: false },
  thu: { open: '06:00', close: '22:00', closed: false },
  fri: { open: '06:00', close: '22:00', closed: false },
  sat: { open: '07:00', close: '20:00', closed: false },
  sun: { open: '08:00', close: '18:00', closed: false },
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [validationError, setValidationError] = useState('')

  // Step 1 State
  const [profile, setProfile] = useState({
    name: '',
    city: '',
    address: '',
    phone: '',
    description: '',
    logoUrl: '',
    hours: DEFAULT_HOURS,
  })

  // Step 2 State - Start with 2 empty plan rows
  const [plans, setPlans] = useState<MembershipPlan[]>([
    { id: '1', name: '', price: '', durationMonths: '1' },
    { id: '2', name: '', price: '', durationMonths: '12' },
  ])

  // Step 3 State - Start with 1 empty row
  const [trainers, setTrainers] = useState<Trainer[]>([
    { id: '1', name: '', phone: '', specialization: '' },
  ])

  // Step 4 State - Start with 1 empty row
  const [classesList, setClassesList] = useState<GymClass[]>([
    { id: '1', name: '', day: 'Monday', time: '07:00', capacity: '20', trainerId: '' },
  ])

  const totalSteps = 5

  // Logo upload preview handler
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfile((prev) => ({ ...prev, logoUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Hours change handler
  const handleHourChange = (
    dayKey: keyof GymHours,
    field: keyof DayHours,
    value: string | boolean
  ) => {
    setProfile((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [dayKey]: {
          ...prev.hours[dayKey],
          [field]: value,
        },
      },
    }))
  }

  // Step Validation
  const validateStep = (step: number): boolean => {
    setValidationError('')
    if (step === 1) {
      if (!profile.name.trim()) {
        setValidationError('Gym Name is required.')
        return false
      }
      if (!profile.phone.trim()) {
        setValidationError('Phone Number is required.')
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep((prev) => prev + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const handleBack = () => {
    setValidationError('')
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Final Complete Handler
  const handleComplete = () => {
    // Clean up empty plans/trainers/classes if necessary
    const cleanedPlans = plans.filter((p) => p.name.trim() !== '' || p.price.trim() !== '')
    const cleanedTrainers = trainers.filter((t) => t.name.trim() !== '')
    const cleanedClasses = classesList.filter((c) => c.name.trim() !== '')

    const finalData: OnboardingData = {
      profile,
      plans: cleanedPlans.length > 0 ? cleanedPlans : plans,
      trainers: cleanedTrainers.length > 0 ? cleanedTrainers : trainers,
      classes: cleanedClasses.length > 0 ? cleanedClasses : classesList,
      completedAt: new Date().toISOString(),
    }

    localStorage.setItem('gym_os_onboarding_data', JSON.stringify(finalData))
    navigate('/dashboard')
  }

  // Step Row Handlers
  const addPlanRow = () => {
    setPlans((prev) => [
      ...prev,
      { id: Date.now().toString(), name: '', price: '', durationMonths: '1' },
    ])
  }

  const removePlanRow = (id: string) => {
    if (plans.length > 1) {
      setPlans((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const addTrainerRow = () => {
    setTrainers((prev) => [
      ...prev,
      { id: Date.now().toString(), name: '', phone: '', specialization: '' },
    ])
  }

  const removeTrainerRow = (id: string) => {
    if (trainers.length > 1) {
      setTrainers((prev) => prev.filter((t) => t.id !== id))
    }
  }

  const addClassRow = () => {
    setClassesList((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: '',
        day: 'Monday',
        time: '07:00',
        capacity: '20',
        trainerId: '',
      },
    ])
  }

  const removeClassRow = (id: string) => {
    if (classesList.length > 1) {
      setClassesList((prev) => prev.filter((c) => c.id !== id))
    }
  }

  // Step headers configuration
  const stepsConfig = [
    { num: 1, label: 'Gym Profile', icon: Building2 },
    { num: 2, label: 'Membership Plans', icon: CreditCard },
    { num: 3, label: 'Trainers', icon: Users },
    { num: 4, label: 'Classes', icon: Calendar },
    { num: 5, label: 'Review & Complete', icon: ShieldCheck },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0e17] text-slate-100 overflow-y-auto font-sans flex flex-col min-h-screen">
      {/* Top Header Bar */}
      <div className="border-b border-slate-800/80 bg-[#0d1322] px-4 py-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/30">
            G
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Gym OS Setup Wizard
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                Onboarding
              </span>
            </h1>
          </div>
        </div>
        <div className="text-xs sm:text-sm text-slate-400 font-medium">
          Step <span className="text-blue-400 font-bold">{currentStep}</span> of {totalSteps}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Progress Bar & Steps Indicator */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-slate-400">
              <span>{stepsConfig[currentStep - 1].label}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}% Completed</span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className="bg-[#2563eb] h-full rounded-full transition-all duration-300 ease-out shadow-sm shadow-blue-500"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>

            {/* Step Pills */}
            <div className="hidden sm:grid grid-cols-5 gap-2 pt-2">
              {stepsConfig.map((s) => {
                const Icon = s.icon
                const isCurrent = s.num === currentStep
                const isPast = s.num < currentStep
                return (
                  <button
                    key={s.num}
                    onClick={() => {
                      if (s.num < currentStep || validateStep(currentStep)) {
                        setCurrentStep(s.num)
                      }
                    }}
                    className={`flex items-center gap-1.5 p-2 rounded-lg text-xs font-medium transition-all text-left ${
                      isCurrent
                        ? 'bg-blue-600/20 border border-blue-500 text-blue-400'
                        : isPast
                        ? 'bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:border-slate-600'
                        : 'bg-slate-900/40 border border-slate-800/40 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : isPast
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isPast ? <Check size={11} /> : s.num}
                    </div>
                    <span className="truncate">{s.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Validation Error Banner */}
          {validationError && (
            <div className="p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl text-red-200 text-sm flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* STEP 1: GYM PROFILE */}
          {currentStep === 1 && (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 sm:p-8 space-y-6 shadow-xl">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  Gym Profile
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Tell us about your facility, operating hours, and contact information.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Gym Name */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-medium text-slate-300">
                    Gym Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="e.g. Iron Pulse Fitness"
                    className="w-full bg-[#1a233a] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-medium text-slate-300">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-[#1a233a] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-medium text-slate-300">City</label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="w-full bg-[#1a233a] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-medium text-slate-300">Full Address</label>
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder="e.g. 102 Park Avenue, Bandra West"
                    className="w-full bg-[#1a233a] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={profile.description}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                  placeholder="A brief overview of your gym, equipment, and training philosophy..."
                  className="w-full bg-[#1a233a] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Logo Upload Placeholder */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-slate-300">Gym Logo</label>
                <div className="flex items-center gap-4 p-4 border-2 border-dashed border-slate-700 rounded-xl bg-[#0f172a] hover:border-blue-500/50 transition-all">
                  {profile.logoUrl ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-600 shrink-0">
                      <img
                        src={profile.logoUrl}
                        alt="Gym Logo"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setProfile({ ...profile, logoUrl: '' })}
                        className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0 text-slate-400">
                      <Upload size={24} />
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <p className="text-xs text-slate-300 font-medium">Upload logo or branding icon</p>
                    <p className="text-[11px] text-slate-500">PNG, JPG, or SVG up to 5MB</p>
                    <label className="inline-block mt-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-medium rounded border border-slate-700 cursor-pointer transition-colors">
                      Select File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="space-y-3 pt-2">
                <label className="text-xs sm:text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <Clock size={16} className="text-blue-400" />
                  Operating Hours (Mon - Sun)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DAYS_KEYS.map(({ key, label }) => {
                    const dayHours = profile.hours[key]
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-[#0f172a] border border-slate-800/80 text-xs"
                      >
                        <span className="font-medium text-slate-300 w-24">{label}</span>
                        {dayHours.closed ? (
                          <span className="text-red-400 font-medium px-2 py-1">Closed</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="time"
                              value={dayHours.open}
                              onChange={(e) => handleHourChange(key, 'open', e.target.value)}
                              className="bg-[#1a233a] border border-slate-700 rounded px-2 py-1 text-white focus:outline-none focus:border-blue-500"
                            />
                            <span className="text-slate-500">to</span>
                            <input
                              type="time"
                              value={dayHours.close}
                              onChange={(e) => handleHourChange(key, 'close', e.target.value)}
                              className="bg-[#1a233a] border border-slate-700 rounded px-2 py-1 text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleHourChange(key, 'closed', !dayHours.closed)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                            dayHours.closed
                              ? 'bg-slate-800 text-slate-400 hover:text-white'
                              : 'bg-red-950/40 text-red-400 border border-red-900/40 hover:bg-red-900/60'
                          }`}
                        >
                          {dayHours.closed ? 'Open' : 'Close'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: MEMBERSHIP PLANS */}
          {currentStep === 2 && (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 sm:p-8 space-y-6 shadow-xl">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  Membership Plans
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Define membership options for your gym members.
                </p>
              </div>

              <div className="space-y-3">
                {plans.map((plan, index) => (
                  <div
                    key={plan.id}
                    className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-3 transition-all"
                  >
                    <div className="text-xs font-bold text-slate-500 w-6 shrink-0">
                      #{index + 1}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 w-full">
                      {/* Plan Name */}
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Plan Name</label>
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => {
                            const updated = [...plans]
                            updated[index].name = e.target.value
                            setPlans(updated)
                          }}
                          placeholder="e.g. Monthly Unlimited"
                          className="w-full bg-[#1a233a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Price */}
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Price (₹)</label>
                        <input
                          type="number"
                          value={plan.price}
                          onChange={(e) => {
                            const updated = [...plans]
                            updated[index].price = e.target.value
                            setPlans(updated)
                          }}
                          placeholder="e.g. 2500"
                          className="w-full bg-[#1a233a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Duration */}
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">
                          Duration (Months)
                        </label>
                        <select
                          value={plan.durationMonths}
                          onChange={(e) => {
                            const updated = [...plans]
                            updated[index].durationMonths = e.target.value
                            setPlans(updated)
                          }}
                          className="w-full bg-[#1a233a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="1">1 Month</option>
                          <option value="3">3 Months</option>
                          <option value="6">6 Months</option>
                          <option value="12">12 Months (1 Year)</option>
                        </select>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removePlanRow(plan.id)}
                      disabled={plans.length <= 1}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed self-end sm:self-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addPlanRow}
                  className="w-full py-3 border-2 border-dashed border-slate-700/80 hover:border-blue-500/60 rounded-xl text-blue-400 hover:text-blue-300 text-sm font-semibold flex items-center justify-center gap-2 bg-slate-900/30 transition-all cursor-pointer"
                >
                  <Plus size={16} /> Add Another Plan
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: TRAINERS */}
          {currentStep === 3 && (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 sm:p-8 space-y-6 shadow-xl">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Trainers & Staff
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Add fitness trainers and instructors who conduct sessions at your gym.
                </p>
              </div>

              <div className="space-y-3">
                {trainers.map((trainer, index) => (
                  <div
                    key={trainer.id}
                    className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-3 transition-all"
                  >
                    <div className="text-xs font-bold text-slate-500 w-6 shrink-0">
                      #{index + 1}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 w-full">
                      {/* Name */}
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Trainer Name</label>
                        <input
                          type="text"
                          value={trainer.name}
                          onChange={(e) => {
                            const updated = [...trainers]
                            updated[index].name = e.target.value
                            setTrainers(updated)
                          }}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full bg-[#1a233a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={trainer.phone}
                          onChange={(e) => {
                            const updated = [...trainers]
                            updated[index].phone = e.target.value
                            setTrainers(updated)
                          }}
                          placeholder="e.g. 9876543210"
                          className="w-full bg-[#1a233a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Specialization */}
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">
                          Specialization
                        </label>
                        <input
                          type="text"
                          value={trainer.specialization}
                          onChange={(e) => {
                            const updated = [...trainers]
                            updated[index].specialization = e.target.value
                            setTrainers(updated)
                          }}
                          placeholder="e.g. Bodybuilding / Yoga"
                          className="w-full bg-[#1a233a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeTrainerRow(trainer.id)}
                      disabled={trainers.length <= 1}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed self-end sm:self-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addTrainerRow}
                  className="w-full py-3 border-2 border-dashed border-slate-700/80 hover:border-blue-500/60 rounded-xl text-blue-400 hover:text-blue-300 text-sm font-semibold flex items-center justify-center gap-2 bg-slate-900/30 transition-all cursor-pointer"
                >
                  <Plus size={16} /> Add Another Trainer
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CLASSES */}
          {currentStep === 4 && (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 sm:p-8 space-y-6 shadow-xl">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Group Classes
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Set up recurring fitness classes, schedules, and trainer assignments.
                </p>
              </div>

              <div className="space-y-3">
                {classesList.map((cls, index) => (
                  <div
                    key={cls.id}
                    className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 space-y-3 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Class #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeClassRow(cls.id)}
                        disabled={classesList.length <= 1}
                        className="p-1 text-slate-400 hover:text-red-400 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      {/* Class Name */}
                      <div className="lg:col-span-1">
                        <label className="text-[11px] text-slate-400 block mb-1">Class Name</label>
                        <input
                          type="text"
                          value={cls.name}
                          onChange={(e) => {
                            const updated = [...classesList]
                            updated[index].name = e.target.value
                            setClassesList(updated)
                          }}
                          placeholder="e.g. Morning Crossfit"
                          className="w-full bg-[#1a233a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Day */}
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Day</label>
                        <select
                          value={cls.day}
                          onChange={(e) => {
                            const updated = [...classesList]
                            updated[index].day = e.target.value
                            setClassesList(updated)
                          }}
                          className="w-full bg-[#1a233a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                          <option value="Sunday">Sunday</option>
                        </select>
                      </div>

                      {/* Time */}
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Time</label>
                        <input
                          type="time"
                          value={cls.time}
                          onChange={(e) => {
                            const updated = [...classesList]
                            updated[index].time = e.target.value
                            setClassesList(updated)
                          }}
                          className="w-full bg-[#1a233a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Capacity */}
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Capacity</label>
                        <input
                          type="number"
                          value={cls.capacity}
                          onChange={(e) => {
                            const updated = [...classesList]
                            updated[index].capacity = e.target.value
                            setClassesList(updated)
                          }}
                          placeholder="20"
                          className="w-full bg-[#1a233a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Trainer Assignment */}
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">
                          Assign Trainer
                        </label>
                        <select
                          value={cls.trainerId}
                          onChange={(e) => {
                            const updated = [...classesList]
                            updated[index].trainerId = e.target.value
                            setClassesList(updated)
                          }}
                          className="w-full bg-[#1a233a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="">Unassigned</option>
                          {trainers.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name || `Trainer #${t.id}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addClassRow}
                  className="w-full py-3 border-2 border-dashed border-slate-700/80 hover:border-blue-500/60 rounded-xl text-blue-400 hover:text-blue-300 text-sm font-semibold flex items-center justify-center gap-2 bg-slate-900/30 transition-all cursor-pointer"
                >
                  <Plus size={16} /> Add Another Class
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & COMPLETE */}
          {currentStep === 5 && (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 sm:p-8 space-y-6 shadow-xl">
              <div className="text-center space-y-2 pb-2">
                <div className="w-14 h-14 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30 flex items-center justify-center mx-auto shadow-inner">
                  <Sparkles size={28} />
                </div>
                <h2 className="text-2xl font-bold text-white">Review Your Gym OS Setup</h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                  Verify your configuration below. You can modify these settings anytime from your dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Profile Summary */}
                <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Building2 size={16} className="text-blue-400" /> Gym Profile
                    </h3>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <p>
                      <span className="text-slate-500">Name:</span>{' '}
                      <strong className="text-white">{profile.name || 'Not set'}</strong>
                    </p>
                    <p>
                      <span className="text-slate-500">Phone:</span> {profile.phone || 'Not set'}
                    </p>
                    <p>
                      <span className="text-slate-500">City / Address:</span>{' '}
                      {[profile.city, profile.address].filter(Boolean).join(', ') || 'Not set'}
                    </p>
                    {profile.description && (
                      <p className="text-slate-400 italic text-[11px] pt-1">"{profile.description}"</p>
                    )}
                  </div>
                </div>

                {/* Plans Summary */}
                <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <CreditCard size={16} className="text-blue-400" /> Membership Plans
                    </h3>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    {plans.filter((p) => p.name || p.price).length > 0 ? (
                      plans
                        .filter((p) => p.name || p.price)
                        .map((p, idx) => (
                          <div key={p.id || idx} className="flex justify-between items-center">
                            <span>{p.name || 'Unnamed Plan'}</span>
                            <span className="font-semibold text-emerald-400">
                              ₹{p.price || '0'} / {p.durationMonths} mo
                            </span>
                          </div>
                        ))
                    ) : (
                      <p className="text-slate-500 italic">No plans added</p>
                    )}
                  </div>
                </div>

                {/* Trainers Summary */}
                <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Users size={16} className="text-blue-400" /> Trainers ({trainers.filter((t) => t.name).length})
                    </h3>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    {trainers.filter((t) => t.name).length > 0 ? (
                      trainers
                        .filter((t) => t.name)
                        .map((t, idx) => (
                          <div key={t.id || idx} className="flex justify-between items-center">
                            <span>{t.name}</span>
                            <span className="text-slate-400">{t.specialization || t.phone || 'General'}</span>
                          </div>
                        ))
                    ) : (
                      <p className="text-slate-500 italic">No trainers added</p>
                    )}
                  </div>
                </div>

                {/* Classes Summary */}
                <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Calendar size={16} className="text-blue-400" /> Classes ({classesList.filter((c) => c.name).length})
                    </h3>
                    <button
                      onClick={() => setCurrentStep(4)}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    {classesList.filter((c) => c.name).length > 0 ? (
                      classesList
                        .filter((c) => c.name)
                        .map((c, idx) => (
                          <div key={c.id || idx} className="flex justify-between items-center">
                            <span>{c.name}</span>
                            <span className="text-slate-400">
                              {c.day} @ {c.time}
                            </span>
                          </div>
                        ))
                    ) : (
                      <p className="text-slate-500 italic">No classes scheduled</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Launch Button */}
              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={handleComplete}
                  className="w-full sm:w-auto px-10 py-4 bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-base rounded-xl shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-3 mx-auto"
                >
                  <Sparkles size={20} /> Launch Gym OS
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation Control Bar */}
        <div className="pt-8 pb-4 flex items-center justify-between border-t border-slate-800/80 mt-8">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium text-xs sm:text-sm rounded-xl border border-slate-700/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft size={16} /> Back
          </button>

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-[#2563eb] hover:bg-blue-600 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={16} /> Complete & Launch
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
