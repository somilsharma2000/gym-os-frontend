import React, { useState, useEffect } from 'react'
import {
  MessageCircle,
  Instagram,
  Facebook,
  Linkedin,
  CreditCard,
  Zap,
  Smartphone,
  Save,
  Check,
  AlertCircle,
  Loader,
  Eye,
  EyeOff,
  Sparkles,
  Link as LinkIcon, Globe
} from 'lucide-react'

// Helper function to get current gym ID from localStorage
const getCurrentGymId = (): string => {
  return localStorage.getItem('gym_os_gym_id') || 'gym_oxigen'
}

export interface IntegrationSettings {
  // WhatsApp
  whatsapp_waba_id: string
  whatsapp_phone_number_id: string
  whatsapp_access_token: string
  whatsapp_verify_token: string

  // Social Media
  instagram_account_id: string
  instagram_access_token: string
  facebook_page_id: string
  facebook_access_token: string
  linkedin_org_id: string
  linkedin_access_token: string

  // Payments
  razorpay_key_id: string
  razorpay_key_secret: string
  stripe_secret_key: string

  // Automations
  auto_welcome_lead: boolean
  auto_renewal_reminder: boolean
  auto_payment_receipt: boolean
  auto_at_risk_alert: boolean
  auto_daily_report: boolean
  auto_low_attendance_alert: boolean
  auto_trial_reminder: boolean
  auto_class_capacity_alert: boolean
  auto_weekly_revenue_report: boolean
  daily_report_time: string
  low_attendance_threshold_days: number
  renewal_reminder_days_before: number

  // Website & App
  website_url: string
  website_status: string
  pwa_enabled: boolean
}

const defaultSettings: IntegrationSettings = {
  whatsapp_waba_id: '',
  whatsapp_phone_number_id: '',
  whatsapp_access_token: '',
  whatsapp_verify_token: '',

  instagram_account_id: '',
  instagram_access_token: '',
  facebook_page_id: '',
  facebook_access_token: '',
  linkedin_org_id: '',
  linkedin_access_token: '',

  razorpay_key_id: '',
  razorpay_key_secret: '',
  stripe_secret_key: '',

  auto_welcome_lead: true,
  auto_renewal_reminder: true,
  auto_payment_receipt: true,
  auto_at_risk_alert: true,
  auto_daily_report: true,
  auto_low_attendance_alert: true,
  auto_trial_reminder: true,
  auto_class_capacity_alert: false,
  auto_weekly_revenue_report: true,
  daily_report_time: '09:00',
  low_attendance_threshold_days: 7,
  renewal_reminder_days_before: 3,

  website_url: '',
  website_status: 'not_started',
  pwa_enabled: false
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'social' | 'payments' | 'automations' | 'website'>('whatsapp')
  const [formData, setFormData] = useState<IntegrationSettings>(defaultSettings)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [errorInitial, setErrorInitial] = useState('')

  // Tab action states
  const [savingTab, setSavingTab] = useState<string | null>(null)
  const [tabFeedback, setTabFeedback] = useState<{ tab: string; type: 'success' | 'error'; message: string } | null>(null)
  const [generatingWebsite, setGeneratingWebsite] = useState(false)
  const [connectingWebsite, setConnectingWebsite] = useState(false)
  const [connectUrlInput, setConnectUrlInput] = useState('')

  // Password fields visibility state
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  const toggleSecret = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }))
  }

  // Load settings on component mount
  const fetchSettings = async () => {
    setLoadingInitial(true)
    setErrorInitial('')
    try {
      const response = await fetch('https://base44.app/api/apps/6a700b150c8d8b8e923580a1/functions/getIntegrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gym_id: getCurrentGymId() })
      })
      const res = await response.json()
      if (res.success && res.settings) {
        const fetched = res.settings.data || res.settings
        setFormData(prev => ({
          ...prev,
          ...fetched
        }))
      } else if (res.error) {
        setErrorInitial(res.error)
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err)
      setErrorInitial(err.message || 'Failed to connect to integration service.')
    } finally {
      setLoadingInitial(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  // Input change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? (value === '' ? '' : Number(value)) : value
    }))
  }

  // Toggle switch helper
  const handleToggle = (name: keyof IntegrationSettings) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name]
    }))
  }

  // Generic Save Handler for Tabs
  const saveTabSettings = async (tabId: string, fieldsPayload: Partial<IntegrationSettings>) => {
    setSavingTab(tabId)
    setTabFeedback(null)
    try {
      const response = await fetch('https://base44.app/api/apps/6a700b150c8d8b8e923580a1/functions/updateIntegrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gym_id: getCurrentGymId(),
          ...fieldsPayload
        })
      })
      const res = await response.json()
      if (res.success) {
        setTabFeedback({
          tab: tabId,
          type: 'success',
          message: res.message || 'Settings updated successfully!'
        })
        if (res.settings) {
          const updated = res.settings.data || res.settings
          setFormData(prev => ({ ...prev, ...updated }))
        }
      } else {
        setTabFeedback({
          tab: tabId,
          type: 'error',
          message: res.error || 'Failed to save settings.'
        })
      }
    } catch (err: any) {
      setTabFeedback({
        tab: tabId,
        type: 'error',
        message: err.message || 'Network error while saving settings.'
      })
    } finally {
      setSavingTab(null)
    }
  }

  // Generate Gym Website Handler
  const handleGenerateWebsite = async () => {
    setGeneratingWebsite(true)
    setTabFeedback(null)
    try {
      const response = await fetch('https://base44.app/api/apps/6a700b150c8d8b8e923580a1/functions/updateGymProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gym_id: getCurrentGymId() })
      })
      const res = await response.json()
      if (res.success) {
        setFormData(prev => ({
          ...prev,
          website_status: 'generated',
          website_url: prev.website_url || `https://${getCurrentGymId()}.base44.app`
        }))
        setTabFeedback({
          tab: 'website',
          type: 'success',
          message: res.message || 'Website generated successfully!'
        })
      } else {
        setTabFeedback({
          tab: 'website',
          type: 'error',
          message: res.error || 'Failed to generate website.'
        })
      }
    } catch (err: any) {
      setTabFeedback({
        tab: 'website',
        type: 'error',
        message: err.message || 'Error triggering website generation.'
      })
    } finally {
      setGeneratingWebsite(false)
    }
  }

  // Connect Existing Website Handler
  const handleConnectExistingWebsite = async () => {
    if (!connectUrlInput.trim()) {
      setTabFeedback({ tab: 'website', type: 'error', message: 'Please enter a website URL.' })
      return
    }
    let url = connectUrlInput.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url
    setConnectingWebsite(true)
    setTabFeedback(null)
    try {
      const response = await fetch('https://base44.app/api/apps/6a700b150c8d8b8e923580a1/functions/updateIntegrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gym_id: getCurrentGymId(), website_url: url, website_status: 'connected' })
      })
      const res = await response.json()
      if (res.success) {
        setFormData(prev => ({ ...prev, website_url: url, website_status: 'connected' }))
        setConnectUrlInput('')
        setTabFeedback({ tab: 'website', type: 'success', message: 'Existing website connected successfully!' })
      } else {
        setTabFeedback({ tab: 'website', type: 'error', message: res.error || 'Failed to connect website.' })
      }
    } catch (err: any) {
      setTabFeedback({ tab: 'website', type: 'error', message: err.message || 'Error connecting website.' })
    } finally {
      setConnectingWebsite(false)
    }
  }

  // Render input field with optional secret toggle
  const renderInput = (
    label: string,
    name: keyof IntegrationSettings,
    placeholder: string = '',
    isSecret: boolean = false,
    type: string = 'text',
    description?: string
  ) => {
    const isShowing = showSecrets[name]
    const inputType = isSecret ? (isShowing ? 'text' : 'password') : type

    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-200">
          {label}
        </label>
        {description && <p className="text-xs text-slate-400">{description}</p>}
        <div className="relative">
          <input
            type={inputType}
            name={name}
            value={formData[name] as string | number}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all pr-12"
          />
          {isSecret && (
            <button
              type="button"
              onClick={() => toggleSecret(name)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg focus:outline-none"
              title={isShowing ? 'Hide secret' : 'Show secret'}
            >
              {isShowing ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      </div>
    )
  }

  // Render Toggle Switch for Automations & Features
  const renderToggle = (
    name: keyof IntegrationSettings,
    label: string,
    description?: string,
    icon?: React.ReactNode
  ) => {
    const isChecked = Boolean(formData[name])
    return (
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
        <div className="flex items-start gap-3 pr-4">
          {icon && <div className="mt-0.5 text-emerald-400">{icon}</div>}
          <div>
            <div className="text-sm font-medium text-white">{label}</div>
            {description && <div className="text-xs text-slate-400 mt-0.5">{description}</div>}
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isChecked}
          onClick={() => handleToggle(name)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
            isChecked ? 'bg-emerald-500' : 'bg-slate-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isChecked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    )
  }

  // Render Save Button for Active Tab
  const renderSaveButton = (tabId: string, payload: Partial<IntegrationSettings>) => {
    const isSaving = savingTab === tabId
    return (
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div>
          {tabFeedback && tabFeedback.tab === tabId && (
            <div
              className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border ${
                tabFeedback.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {tabFeedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
              <span>{tabFeedback.message}</span>
            </div>
          )}
        </div>
        <button
          type="button"
          disabled={isSaving}
          onClick={() => saveTabSettings(tabId, payload)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
          <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
        </button>
      </div>
    )
  }

  if (loadingInitial) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center bg-slate-900 rounded-2xl border border-slate-800 p-8 text-white space-y-4">
        <Loader size={36} className="animate-spin text-emerald-500" />
        <p className="text-slate-400 text-sm animate-pulse">Loading Integration Hub settings...</p>
      </div>
    )
  }

  if (errorInitial) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center bg-slate-900 rounded-2xl border border-slate-800 p-8 text-white space-y-4 text-center">
        <div className="p-3 bg-red-500/10 rounded-full border border-red-500/30 text-red-400">
          <AlertCircle size={32} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Failed to Load Settings</h3>
          <p className="text-sm text-slate-400 mt-1">{errorInitial}</p>
        </div>
        <button
          onClick={fetchSettings}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium border border-slate-700 transition-colors"
        >
          Retry Loading
        </button>
      </div>
    )
  }

  const tabs = [
    { id: 'whatsapp', label: 'WhatsApp Business API', icon: MessageCircle },
    { id: 'social', label: 'Social Media', icon: Instagram },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'automations', label: 'Automations', icon: Zap },
    { id: 'website', label: 'Website & App', icon: Globe }
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Zap className="text-emerald-400" size={28} /> Integration Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Connect third-party API services, payment gateways, and automated gym marketing workflows.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Gym ID: <code className="font-mono text-white">{getCurrentGymId()}</code>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar space-x-2 pb-1">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any)
                setTabFeedback(null)
              }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200 border ${
                isActive
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-md shadow-emerald-950/20'
                  : 'bg-white/5 border-transparent text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* TAB 1: WhatsApp Business API */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <MessageCircle size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">WhatsApp Business API Configuration</h2>
                  <p className="text-xs text-slate-400">
                    Configure Meta WhatsApp Business Cloud API keys for sending automated member alerts and broadcasts.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInput(
                  'WhatsApp Business Account (WABA) ID',
                  'whatsapp_waba_id',
                  'e.g. 109823479218374',
                  false,
                  'text',
                  'Found in Meta Business Manager settings'
                )}
                {renderInput(
                  'Phone Number ID',
                  'whatsapp_phone_number_id',
                  'e.g. 104820394820194',
                  false,
                  'text',
                  'Meta Phone Number ID associated with WABA'
                )}
                {renderInput(
                  'Permanent Access Token',
                  'whatsapp_access_token',
                  'EAAG...',
                  true,
                  'password',
                  'System User access token with whatsapp_business_messaging permission'
                )}
                {renderInput(
                  'Webhook Verify Token',
                  'whatsapp_verify_token',
                  'Your secret verify token',
                  true,
                  'password',
                  'Custom string used to verify incoming Webhook requests'
                )}
              </div>

              {renderSaveButton('whatsapp', {
                whatsapp_waba_id: formData.whatsapp_waba_id,
                whatsapp_phone_number_id: formData.whatsapp_phone_number_id,
                whatsapp_access_token: formData.whatsapp_access_token,
                whatsapp_verify_token: formData.whatsapp_verify_token
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Social Media */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  <Instagram size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Social Media Integrations</h2>
                  <p className="text-xs text-slate-400">
                    Connect Meta Instagram, Facebook Pages, and LinkedIn Organization accounts for social lead sync.
                  </p>
                </div>
              </div>

              {/* Instagram Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <Instagram size={16} /> Instagram Business
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderInput('Instagram Account ID', 'instagram_account_id', 'e.g. 178414000000000')}
                  {renderInput('Instagram Access Token', 'instagram_access_token', 'Token string', true)}
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-4">
                <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                  <Facebook size={16} /> Facebook Page
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderInput('Facebook Page ID', 'facebook_page_id', 'e.g. 102938475610293')}
                  {renderInput('Facebook Access Token', 'facebook_access_token', 'Page Access Token', true)}
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-4">
                <h3 className="text-sm font-semibold text-blue-500 flex items-center gap-2">
                  <Linkedin size={16} /> LinkedIn Organization
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderInput('LinkedIn Organization ID', 'linkedin_org_id', 'e.g. 98765432')}
                  {renderInput('LinkedIn Access Token', 'linkedin_access_token', 'OAuth Access Token', true)}
                </div>
              </div>

              {renderSaveButton('social', {
                instagram_account_id: formData.instagram_account_id,
                instagram_access_token: formData.instagram_access_token,
                facebook_page_id: formData.facebook_page_id,
                facebook_access_token: formData.facebook_access_token,
                linkedin_org_id: formData.linkedin_org_id,
                linkedin_access_token: formData.linkedin_access_token
              })}
            </div>
          </div>
        )}

        {/* TAB 3: Payments */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <CreditCard size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Payment Gateway Settings</h2>
                  <p className="text-xs text-slate-400">
                    Set up Razorpay and Stripe API credentials for automated membership renewals and online payments.
                  </p>
                </div>
              </div>

              {/* Razorpay */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-indigo-400">Razorpay Credentials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderInput('Razorpay Key ID', 'razorpay_key_id', 'rzp_live_...')}
                  {renderInput('Razorpay Key Secret', 'razorpay_key_secret', 'Secret Key', true)}
                </div>
              </div>

              {/* Stripe */}
              <div className="border-t border-white/10 pt-4 space-y-4">
                <h3 className="text-sm font-semibold text-purple-400">Stripe Credentials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderInput('Stripe Secret Key', 'stripe_secret_key', 'sk_live_...', true)}
                </div>
              </div>

              {renderSaveButton('payments', {
                razorpay_key_id: formData.razorpay_key_id,
                razorpay_key_secret: formData.razorpay_key_secret,
                stripe_secret_key: formData.stripe_secret_key
              })}
            </div>
          </div>
        )}

        {/* TAB 4: Automations */}
        {activeTab === 'automations' && (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Zap size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Automated Triggers & Reminders</h2>
                  <p className="text-xs text-slate-400">
                    Enable or disable automated messaging workflows and configure timing parameters.
                  </p>
                </div>
              </div>

              {/* Toggle Switches */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderToggle('auto_welcome_lead', 'Auto Welcome Lead', 'Send instant greeting when a lead registers', <MessageCircle size={18} />)}
                {renderToggle('auto_renewal_reminder', 'Auto Renewal Reminder', 'Notify members prior to membership expiry', <Zap size={18} />)}
                {renderToggle('auto_payment_receipt', 'Auto Payment Receipt', 'Dispatch WhatsApp receipt on payment confirmation', <CreditCard size={18} />)}
                {renderToggle('auto_at_risk_alert', 'Auto At-Risk Alert', 'Alert staff when member attendance drops', <AlertCircle size={18} />)}
                {renderToggle('auto_daily_report', 'Auto Daily Report', 'Generate and send daily summary to owner', <Sparkles size={18} />)}
                {renderToggle('auto_low_attendance_alert', 'Auto Low Attendance Alert', 'Trigger re-engagement message for absent members', <Zap size={18} />)}
                {renderToggle('auto_trial_reminder', 'Auto Trial Reminder', 'Remind leads before their trial session starts', <MessageCircle size={18} />)}
                {renderToggle('auto_class_capacity_alert', 'Auto Class Capacity Alert', 'Notify trainers when class booking is full', <AlertCircle size={18} />)}
                {renderToggle('auto_weekly_revenue_report', 'Auto Weekly Revenue Report', 'Send weekly financial overview on Mondays', <CreditCard size={18} />)}
              </div>

              {/* Threshold & Timing Inputs */}
              <div className="border-t border-white/10 pt-6 space-y-4">
                <h3 className="text-sm font-semibold text-white">Automation Thresholds & Scheduling</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {renderInput(
                    'Daily Report Time',
                    'daily_report_time',
                    '09:00',
                    false,
                    'text',
                    '24-hour time format (e.g. 09:00 or 21:00)'
                  )}
                  {renderInput(
                    'Low Attendance Threshold (Days)',
                    'low_attendance_threshold_days',
                    '7',
                    false,
                    'number',
                    'Days absent before marking member at risk'
                  )}
                  {renderInput(
                    'Renewal Reminder Days Before',
                    'renewal_reminder_days_before',
                    '3',
                    false,
                    'number',
                    'Days prior to expiry to send renewal link'
                  )}
                </div>
              </div>

              {renderSaveButton('automations', {
                auto_welcome_lead: formData.auto_welcome_lead,
                auto_renewal_reminder: formData.auto_renewal_reminder,
                auto_payment_receipt: formData.auto_payment_receipt,
                auto_at_risk_alert: formData.auto_at_risk_alert,
                auto_daily_report: formData.auto_daily_report,
                auto_low_attendance_alert: formData.auto_low_attendance_alert,
                auto_trial_reminder: formData.auto_trial_reminder,
                auto_class_capacity_alert: formData.auto_class_capacity_alert,
                auto_weekly_revenue_report: formData.auto_weekly_revenue_report,
                daily_report_time: formData.daily_report_time,
                low_attendance_threshold_days: formData.low_attendance_threshold_days,
                renewal_reminder_days_before: formData.renewal_reminder_days_before
              })}
            </div>
          </div>
        )}

        {/* TAB 5: Website & App */}
        {activeTab === 'website' && (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Globe size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Website & Mobile App (PWA) Settings</h2>
                  <p className="text-xs text-slate-400">
                    Generate branded gym microsite and manage Progressive Web App options for member mobile devices.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-200">Website URL</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="website_url"
                      value={formData.website_url || `https://${getCurrentGymId()}.base44.app`}
                      onChange={handleChange}
                      placeholder="https://yourgym.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-200">Website Status</label>
                  <div className="flex items-center gap-3 pt-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        ['generated', 'connected'].includes(formData.website_status)
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          ['generated', 'connected'].includes(formData.website_status) ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />
                      {formData.website_status === 'connected' ? 'Connected' : formData.website_status === 'generated' ? 'Active / Generated' : 'Not Generated'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Generator Box */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-blue-900/30 to-slate-800 border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Globe size={16} className="text-blue-400" /> Auto-Generate Branded Landing Page
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Creates a custom HTML/CSS responsive landing page with your gym's brand colors, schedule, and lead contact forms.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={generatingWebsite}
                  onClick={handleGenerateWebsite}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 whitespace-nowrap"
                >
                  {generatingWebsite ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  <span>{generatingWebsite ? 'Generating HTML...' : 'Generate Website'}</span>
                </button>
              </div>

              {/* Connect Existing Website */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-900/30 to-slate-800 border border-emerald-500/20 flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <LinkIcon size={16} className="text-emerald-400" /> Connect Your Existing Website
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Already have a gym website? Paste the URL below to link it to your Gym OS dashboard. Leads from your site will flow directly into your CRM.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={connectUrlInput}
                    onChange={(e) => setConnectUrlInput(e.target.value)}
                    placeholder="https://yourgym.com"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                  />
                  <button
                    type="button"
                    disabled={connectingWebsite}
                    onClick={handleConnectExistingWebsite}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 whitespace-nowrap"
                  >
                    {connectingWebsite ? <Loader size={16} className="animate-spin" /> : <LinkIcon size={16} />}
                    <span>{connectingWebsite ? 'Connecting...' : 'Connect Website'}</span>
                  </button>
                </div>
                {formData.website_status === 'connected' && (
                  <div className="flex items-center gap-2 text-sm text-emerald-400">
                    <Check size={16} /> Currently connected: <span className="text-white font-medium">{formData.website_url}</span>
                  </div>
                )}
              </div>

              {/* PWA Switch */}
              <div className="pt-2">
                {renderToggle(
                  'pwa_enabled',
                  'Enable Progressive Web App (PWA)',
                  'Allow members to install gym portal directly to their smartphone home screen',
                  <Smartphone size={18} />
                )}
              </div>

              {renderSaveButton('website', {
                website_url: formData.website_url,
                website_status: formData.website_status,
                pwa_enabled: formData.pwa_enabled
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
