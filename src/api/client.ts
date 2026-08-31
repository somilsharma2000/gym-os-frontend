// API Client with authentication, env-based config, and proper error handling
import {
  DEMO_MODE,

  demoDashboardData,
  demoLeads,
  demoTrials,
  demoMembers,
  demoMemberships,
  demoCheckIns,
  demoClasses,
  demoStaff,
  demoReferrals,
  demoRenewals,
  demoPayments,
  demoRevenue
} from '../data/demoData'

// GYMOS app (6a8949954092729194579577) — has real data: leads, members, memberships, check-ins, classes
const GYMOS_API_BASE = 'https://base44.app/api/apps/6a8949954092729194579577/functions'
// Superagent app (6a700b150c8d8b8e923580a1) — auth, gym management, settings, integrations
const ADMIN_API_BASE = 'https://base44.app/api/apps/6a700b150c8d8b8e923580a1/functions'
// Legacy aliases (for backward compat)
const API_BASE = GYMOS_API_BASE
const AUTH_API_BASE = ADMIN_API_BASE

// Functions that live on the GYMOS app (data operations)
const GYMOS_FUNCTIONS = new Set([
  'getDashboardData', 'getLeads', 'getTrialPasses', 'getMembers', 'getRecentCheckIns',
  'getMemberships', 'getReferrals', 'getStaff', 'getRenewals', 'getGymTenants',
  'getCommandCenterMetrics', 'getClassSchedule', 'createLeadWithConsent', 'createLead',
  'createTrialPass', 'createClassBooking', 'checkIn', 'validateQR', 'validateQRPass',
  'checkInWithAttendance', 'connectGymWebsite', 'setupGymProfile', 'detectAtRiskMembers',
  'expireTrialPasses', 'autoFollowUpTask', 'sendDailySummary', 'updateRenewalPipeline',
  'seedGymData', 'createTrialBooking',
  'activateTrial', 'getPayments', 'getRevenue', 'fetchExpiringMembers',
  'getApiKey', 'regenerateApiKey', 'ingestFeedback',
  'createTrialPassV2', 'createMembershipPass', 'validatePass', 'getPassStatus',
  'memberLogin', 'memberGetMyPass', 'getPublicGymData', 'createRazorpayOrder', 'recordCashPayment'
])

// Functions handled by the unified gymAdmin backend function
const GYM_ADMIN_ACTIONS = new Set([
  'getExpenses', 'addExpense', 'deleteExpense',
  'getNotifications', 'createNotification', 'markNotificationRead',
  'updateLeadStatus', 'convertLeadToMember',
  'getAtRiskMembers', 'addMember', 'updateMember',
  'recordPayment', 'createPayment',
  'qrCheckIn', 'enrollInClass',
  'sendWhatsAppMessage',
  'createGym', 'updateGymProfile', 'deleteGym'
])

// Functions that live on the Superagent/Admin app (separate deployed functions)
const ADMIN_FUNCTIONS = new Set([
  'login', 'getGymSettings', 'updateGymSettings', 'getAllGyms', 'getGymProfile',
  'getIntegrations', 'updateIntegrations', 'generateGymWebsite',
  ...GYM_ADMIN_ACTIONS
])

// Route to the correct API based on function name
function getApiBase(functionName: string): string {
  if (GYMOS_FUNCTIONS.has(functionName)) return GYMOS_API_BASE
  if (ADMIN_FUNCTIONS.has(functionName)) return ADMIN_API_BASE
  return GYMOS_API_BASE
}

// Check if a function should be routed through the unified gymAdmin function
function isGymAdminAction(functionName: string): boolean {
  return GYM_ADMIN_ACTIONS.has(functionName)
}

// --- Token Management ---

const TOKEN_KEY = 'gym_os_auth_token'
const USER_KEY = 'gym_os_auth_user'
const GYM_KEY = 'gym_os_gym_id'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuth(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  // If gym_owner, lock their gym_id
  if (user.role === 'gym_owner' && user.gym_id && user.gym_id !== 'ALL') {
    localStorage.setItem(GYM_KEY, user.gym_id)
  }
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  // Don't clear gym_id — super admin might want to keep their selection
}

export function getAuthUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  if (token.startsWith('demo_') || token.startsWith('gymos_')) return false
  try {
    const parts = token.split('.')
    // JWT format: header.payload.signature (3 parts)
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      if (payload.exp) return Math.floor(Date.now() / 1000) > payload.exp
      return false
    }
    // Legacy base64 format: payload.signature (2 parts)
    if (parts.length === 2) {
      const payload = atob(parts[0])
      const [expiryStr] = payload.split(':')
      if (!expiryStr) return true
      const expiryTimestamp = parseInt(expiryStr, 10)
      if (isNaN(expiryTimestamp)) return true
      return Math.floor(Date.now() / 1000) > expiryTimestamp
    }
    return true
  } catch {
    return false
  }
}

export function isAuthenticated(): boolean {
  const token = getToken()
  if (!token) return false
  if (isTokenExpired(token)) {
    clearAuth()
    return false
  }
  return true
}

export function getGymIdFromToken(): string | null {
  const token = getToken()
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      return payload.gym_id || null
    }
  } catch {}
  return null
}

export function getRoleFromToken(): string | null {
  const token = getToken()
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      return payload.role || null
    }
  } catch {}
  return null
}

// --- Types ---

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string       // 'super_admin' | 'gym_owner'
  gym_id: string     // 'ALL' for super_admin, specific gym_id for gym_owner
  gym_name: string
}

export interface LoginResponse {
  success: boolean
  user: AuthUser
  token: string
  error?: string
}

export interface ApiError {
  success: false
  error: string
}

// --- Gym Context (Role-Aware) ---

export function getGymId(): string {
  // GYM OWNERS are locked to their gym — ignore localStorage
  const user = getAuthUser()
  if (user && user.role === 'gym_owner' && user.gym_id && user.gym_id !== 'ALL') {
    return user.gym_id
  }
  // SUPER ADMIN can switch gyms — use localStorage selection
  return localStorage.getItem(GYM_KEY) || import.meta.env.VITE_DEFAULT_GYM_ID || ''
}

export function setGymId(gymId: string): void {
  // Only super admin can switch gyms
  const user = getAuthUser()
  if (user && user.role === 'gym_owner') {
    return // Lock gym owners to their assigned gym
  }
  localStorage.setItem(GYM_KEY, gymId)
}

export function canSwitchGym(): boolean {
  const user = getAuthUser()
  return user?.role === 'super_admin'
}

export function isSuperAdmin(): boolean {
  const user = getAuthUser()
  return user?.role === 'super_admin'
}

export function getBranchId(): string {
  return localStorage.getItem('gym_os_branch_id') || import.meta.env.VITE_DEFAULT_BRANCH_ID || 'demo_branch'
}

export function setBranchId(branchId: string): void {
  localStorage.setItem('gym_os_branch_id', branchId)
}

// --- API Call ---

export class ApiRequestError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
  }
}

export async function apiCall<T = any>(functionName: string, payload?: Record<string, unknown>): Promise<T> {
  const gym_id = getGymId()
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let res: Response
  const apiBase = getApiBase(functionName)
  
  // Route gymAdmin actions through the unified function
  if (isGymAdminAction(functionName)) {
    try {
      res = await fetch(`${ADMIN_API_BASE}/gymAdmin`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: functionName, gym_id: getGymId(), ...payload }),
      })
    } catch {
      throw new ApiRequestError('Network error — unable to reach the server.', 0)
    }
    if (!res.ok) {
      if (res.status === 401) {
        clearAuth()
        window.dispatchEvent(new CustomEvent('auth:unauthorized'))
        window.location.hash = '#/login'
        throw new ApiRequestError('Session expired.', 401)
      }
      const errBody = await res.json().catch(() => ({}))
      throw new ApiRequestError(errBody.error || `Request failed (${res.status})`, res.status)
    }
    return await res.json() as T
  }
  // STRICT DATA ISOLATION: Never default to another gym's data
  // Gym owners are locked to their gym_id via getGymId()
  // Super admin with 'ALL' must select a gym before accessing data
  let effectiveGymId = gym_id
  if (gym_id === 'ALL' || !gym_id) {
    const user = getAuthUser()
    if (user && user.role === 'gym_owner' && user.gym_id && user.gym_id !== 'ALL') {
      effectiveGymId = user.gym_id  // Use locked gym_id
    } else {
      // Super admin with ALL — use last selected gym, don't default to a hardcoded gym
      effectiveGymId = localStorage.getItem(GYM_KEY) || ''
    }
  }
  try {
    res = await fetch(`${apiBase}/${functionName}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ gym_id: effectiveGymId, ...payload }),
    })
  } catch {
    throw new ApiRequestError('Network error — unable to reach the server. Please check your connection.', 0)
  }

  if (!res.ok) {
    if (res.status === 401) {
      clearAuth()
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      window.location.hash = '#/login'
      throw new ApiRequestError('Session expired. Please log in again.', 401)
    }
    if (res.status === 403) {
      throw new ApiRequestError('You do not have permission to perform this action.', 403)
    }
    if (res.status >= 500) {
      throw new ApiRequestError('Server error. Please try again in a moment.', res.status)
    }
    let errorMsg = `Request failed with status ${res.status}`
    try {
      const errorBody = await res.json()
      errorMsg = errorBody.error || errorBody.message || errorMsg
    } catch {}
    throw new ApiRequestError(errorMsg, res.status)
  }

  try {
    return await res.json() as T
  } catch {
    throw new ApiRequestError('Received an invalid response from the server.', res.status)
  }
}

// --- Auth API ---

async function authCall<T = any>(functionName: string, payload?: Record<string, unknown>): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${AUTH_API_BASE}/${functionName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new ApiRequestError('Network error — unable to reach the auth server.', 0)
  }

  if (!res.ok) {
    let errorMsg = `Auth request failed with status ${res.status}`
    try {
      const errorBody = await res.json()
      errorMsg = errorBody.error || errorBody.message || errorMsg
    } catch {}
    throw new ApiRequestError(errorMsg, res.status)
  }

  try {
    return await res.json() as T
  } catch {
    throw new ApiRequestError('Received an invalid response from the auth server.', res.status)
  }
}

// --- API Surface ---

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return authCall<LoginResponse>('login', { email, password })
  },

  // Dashboard
  getDashboardData: async (): Promise<any> => {
    if (DEMO_MODE) return demoDashboardData
    const res = await apiCall('getDashboardData')
    try {
      const leadsRes = await apiCall('getLeads', {})
      if (leadsRes.success && leadsRes.leads) {
        const cleanLeads = leadsRes.leads
          .filter((l: any) => l.status !== 'archived' && l.status !== 'Archived')
          .sort((a: any, b: any) => (b.created_date || '').localeCompare(a.created_date || ''))
          .slice(0, 5)
        res.recent_leads = cleanLeads
        if (res.stats) res.stats.total_leads = leadsRes.leads.filter((l: any) => l.status !== 'archived' && l.status !== 'Archived').length
        if (res.metrics) res.metrics.total_leads = leadsRes.leads.filter((l: any) => l.status !== 'archived' && l.status !== 'Archived').length
      }
    } catch {}
    if (!res.metrics && res.stats) res.metrics = res.stats
    if (!res.metrics && !res.stats) res.metrics = {}
    if (!res.stats) res.stats = res.metrics
    return res
  },

  // Leads
  getLeads: async (filters?: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) {
      let leads = [...demoLeads]
      if (filters?.status && filters.status !== 'all') leads = leads.filter(l => l.status === filters.status)
      if (filters?.source && filters.source !== 'all') leads = leads.filter(l => l.source === filters.source)
      if (filters?.search) {
        const q = String(filters.search).toLowerCase()
        leads = leads.filter(l => l.name.toLowerCase().includes(q) || l.phone.includes(q) || (l.email && l.email.toLowerCase().includes(q)))
      }
      return { success: true, leads }
    }
    const res = await apiCall('getLeads', filters || {})
    if (res.success && res.leads) {
      res.leads = res.leads.filter((l: any) => l.status !== 'archived' && l.status !== 'Archived')
    }
    return res
  },

  createLead: async (data: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) {
      const newLead = { id: 'lead_' + Date.now(), name: (data.name as string) || 'New Lead', phone: (data.phone as string) || '+91 99999 00000', email: (data.email as string) || '', source: (data.source as string) || 'Website', status: 'new', interest: (data.fitness_goal as string) || 'General Fitness', value: 3500, created_date: new Date().toISOString(), notes: (data.notes as string) || '' }
      demoLeads.unshift(newLead as any)
      return { success: true, lead: newLead }
    }
    return apiCall('createLeadWithConsent', data)
  },

  // Trials
  getTrialPasses: async (filters?: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) return { success: true, trial_passes: demoTrials.map(t => ({ id: t.id, lead_id: t.lead_id, member_name: t.lead_name, member_phone: t.phone, qr_token: t.qr_token, status: t.status, pass_type: 'Trial Pass', valid_from: t.created_date, valid_until: t.expiry_date + 'T23:59:59Z', check_in_time: t.check_in_time || '', created_date: t.created_date, preferred_visit_period: t.preferred_visit_time })) }
    return apiCall('getTrialPasses', filters || {})
  },

  createTrialPass: async (lead_id: string, preferred_visit_time?: string, validity_days?: number): Promise<any> => {
    if (DEMO_MODE) return { success: true }
    return apiCall('createTrialPass', { lead_id, preferred_visit_time, validity_days: validity_days || 3 })
  },

  // Class enrollment
  enrollInClass: async (arg1: any, arg2?: string, arg3?: string): Promise<any> => {
    let gym_id = ''
    let member_id = ''
    let class_id = ''
    let name = ''
    let phone = ''
    let email = ''

    if (typeof arg1 === 'object' && arg1 !== null) {
      gym_id = arg1.gym_id || ''
      class_id = arg1.class_id || ''
      member_id = arg1.member_id || ''
      name = arg1.name || ''
      phone = arg1.phone || ''
      email = arg1.email || ''
    } else {
      gym_id = arg1
      member_id = arg2 || ''
      class_id = arg3 || ''
    }

    if (DEMO_MODE) return { success: true, enrolled: true }
    return apiCall('enrollInClass', { gym_id, class_id, member_id, name, phone, email })
  },

  createLeadWithConsent: async (data: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) {
      const newLead = { id: 'lead_' + Date.now(), name: (data.name as string) || 'New Lead', phone: (data.phone as string) || '', email: (data.email as string) || '', source: (data.source as string) || 'Website', status: 'new', interest: (data.interest as string) || (data.fitness_goal as string) || 'General Fitness', value: 3500, created_date: new Date().toISOString(), notes: (data.notes as string) || '' }
      demoLeads.unshift(newLead as any)
      return { success: true, lead: newLead }
    }
    return apiCall('createLeadWithConsent', data)
  },

  // Payments
  createPayment: async (data: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) return { success: true, invoice_number: 'DEMO-' + Date.now() }
    return apiCall('createPayment', data)
  },

  // Members
  addMember: async (data: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) {
      const name = (data.name as string) || 'New Member'
      const initials = name.trim().split(/\s+/).map(p => p[0]).join('').substring(0,3).toUpperCase()
      const qr_code = 'MBR-' + initials + '-' + String(Date.now()).slice(-4)
      return { success: true, member_id: 'demo_' + Date.now(), qr_code, member: { ...data, qr_code } }
    }
    return apiCall('addMember', data)
  },
  updateMember: async (member_id: string, data: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) return { success: true }
    return apiCall('updateMember', { member_id, ...data })
  },

  // Lead conversion
  convertLeadToMember: async (gym_id: string, lead_id: string, data?: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) return { success: true, member_id: 'demo_' + Date.now() }
    return apiCall('convertLeadToMember', { gym_id, lead_id, ...data })
  },

  // Trial activation
  activateTrial: async (gym_id: string, lead_id: string): Promise<any> => {
    if (DEMO_MODE) return { success: true, qr_token: 'trial_demo', trial_end: new Date(Date.now() + 48*3600000).toISOString() }
    return apiCall('activateTrial', { gym_id, lead_id })
  },

  // At-risk members
  getAtRiskMembers: async (gym_id: string, days_threshold?: number): Promise<any> => {
    if (DEMO_MODE) return { success: true, at_risk_members: demoMembers.filter((m: any) => m.risk_status === "high"), count: demoMembers.filter((m: any) => m.risk_status === "high").length }
    return apiCall('getAtRiskMembers', { gym_id, days_threshold })
  },

  // Gym settings
  getGymSettings: async (gym_id: string): Promise<any> => {
    if (DEMO_MODE) return { success: true, settings: {} }
    return apiCall('getGymSettings', { gym_id })
  },
  updateGymSettings: async (gym_id: string, settings: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) return { success: true }
    return apiCall('updateGymSettings', { gym_id, ...settings })
  },

  // Expenses
  getExpenses: async (gym_id: string): Promise<any> => {
    if (DEMO_MODE) return { success: true, expenses: [], count: 0 }
    return apiCall('getExpenses', { gym_id })
  },
  addExpense: async (data: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) return { success: true }
    return apiCall('addExpense', data)
  },
  deleteExpense: async (expense_id: string): Promise<any> => {
    if (DEMO_MODE) return { success: true }
    return apiCall('deleteExpense', { id: expense_id })
  },
  // Check-in
  getCheckIns: async (): Promise<any> => {
    if (DEMO_MODE) return { success: true, check_ins: demoCheckIns }
    return apiCall('getRecentCheckIns')
  },

  // Members
  getMembers: async (filters?: Record<string, unknown> | string): Promise<any> => {
    const opts = typeof filters === 'string' ? { gym_id: filters } : (filters || {})
    if (DEMO_MODE) return { success: true, members: demoMembers }
    return apiCall("getMembers", opts)
  },

  // Memberships
  getMemberships: async (gym_id?: string): Promise<any> => {
    if (DEMO_MODE) return { success: true, memberships: demoMemberships }
    return apiCall('getMemberships', gym_id ? { gym_id } : {})
  },

  // Payments
  getPayments: async (): Promise<any> => {
    if (DEMO_MODE) return { success: true, payments: demoPayments }
    return apiCall('getPayments')
  },

  recordPayment: async (data: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) return { success: true }
    return apiCall('recordPayment', data)
  },

  // Revenue
  getRevenue: async (): Promise<any> => {
    if (DEMO_MODE) return { success: true, ...demoRevenue }
    return apiCall('getRevenue')
  },

  // Classes
  getClassSchedule: async (gym_id?: string): Promise<any> => {
    if (DEMO_MODE) return { success: true, classes: demoClasses }
    return apiCall('getClassSchedule', gym_id ? { gym_id } : {})
  },

  // Staff
  getStaff: async (gym_id?: string): Promise<any> => {
    if (DEMO_MODE) return { success: true, staff: demoStaff }
    return apiCall('getStaff', gym_id ? { gym_id } : {})
  },

  // Referrals
  getReferrals: async (gym_id?: string): Promise<any> => {
    if (DEMO_MODE) return { success: true, referrals: demoReferrals }
    return apiCall('getReferrals', { gym_id: gym_id || getGymId() })
  },

  // Renewals
  getRenewals: async (days: number = 30): Promise<any> => {
    if (DEMO_MODE) return { success: true, renewals: demoRenewals, expiring_members: demoRenewals }
    return apiCall('fetchExpiringMembers', { days })
  },

  fetchExpiringMembers: async (gym_id?: string, days: number = 30): Promise<any> => {
    if (DEMO_MODE) return { success: true, expiring_members: demoRenewals, renewals: demoRenewals }
    return apiCall('fetchExpiringMembers', { gym_id: gym_id || getGymId(), days })
  },

  // Notifications
  getNotifications: async (): Promise<any> => {
    if (DEMO_MODE) return { success: true, notifications: [] }
    return apiCall('getNotifications')
  },

  // WhatsApp
  sendWhatsApp: async (phone: string, message: string): Promise<any> => {
    if (DEMO_MODE) return { success: true }
    return apiCall('sendWhatsAppMessage', { phone, message })
  },

  sendWhatsAppMessage: async (phone: string, message: string): Promise<any> => {
    if (DEMO_MODE) return { success: true }
    return apiCall('sendWhatsAppMessage', { phone, message })
  },

  // Lead status update
  updateLeadStatus: async (lead_id: string, status: string, notes?: string, lost_reason?: string): Promise<any> => {
    if (DEMO_MODE) return { success: true }
    return apiCall('updateLeadStatus', { lead_id, status, notes, lost_reason })
  },

  // Super Admin — gym management
  getAllGyms: async (): Promise<any> => {
    if (DEMO_MODE) return { success: true, gyms: [] }
    return apiCall('getAllGyms')
  },

  createGym: async (data: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) return { success: true }
    return apiCall('createGym', data)
  },

  // QR Check-in
  qrCheckIn: async (qr_token: string): Promise<any> => {
    if (DEMO_MODE) return { success: true }
    return apiCall('qrCheckIn', { qr_code: qr_token })
  },

  // Gym Settings
  getGymProfile: async (): Promise<any> => {
    if (DEMO_MODE) return { success: true, profile: {} }
    return apiCall('getGymProfile')
  },

  updateGymProfile: async (data: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) return { success: true }
    return apiCall('updateGymProfile', data)
  },

  // Integrations
  getIntegrations: async (): Promise<any> => {
    if (DEMO_MODE) return { success: true, settings: {} }
    return apiCall('getIntegrations')
  },

  updateIntegrations: async (data: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) return { success: true }
    return apiCall('updateIntegrations', data)
  },

  generateGymWebsite: async (): Promise<any> => {
    if (DEMO_MODE) return { success: true, website_url: 'https://example.com' }
    return apiCall('generateGymWebsite')
  },
  // Gym tenants (Header)
  getGymTenants: async (): Promise<any> => {
    if (DEMO_MODE) return { success: true, tenants: [] }
    return apiCall('getAllGyms')
  },
  // Check-in specific
  getRecentCheckIns: async (limit?: number): Promise<any> => {
    if (DEMO_MODE) return { success: true, checkins: [] }
    return apiCall('getRecentCheckIns', { limit: limit || 10 })
  },
  validateQR: async (qr_token: string): Promise<any> => {
    if (DEMO_MODE) return { success: true }
    return apiCall('validateQR', { qr_token })
  },
  checkIn: async (qr_token: string): Promise<any> => {
    if (DEMO_MODE) return { success: true }
    return apiCall('checkIn', { qr_token })
  },

  // Feedback
  submitFeedback: async (data: any): Promise<any> => {
    if (DEMO_MODE) return { success: true }
    return apiCall('ingestFeedback', data)
  },

  // API Key management
  getApiKey: async (): Promise<any> => {
    if (DEMO_MODE) return { success: true, api_key: 'demo_api_key_GYM_DEMO' }
    return apiCall('getApiKey', { gym_id: getGymId() })
  },

  regenerateApiKey: async (): Promise<any> => {
    if (DEMO_MODE) return { success: true, api_key: 'demo_api_key_' + Date.now().toString(36).toUpperCase() }
    return apiCall('regenerateApiKey', { gym_id: getGymId() })
  },

  // Feature Toggles
  getFeatureToggles: async (): Promise<any> => {
    if (DEMO_MODE) return { success: true, plan: 'premium' };
    return apiCall('getFeatureToggles');
  },

  // QR Pass System v2
  validatePass: async (pass_code: string, scanned_by?: string): Promise<any> => {
    if (DEMO_MODE) {
      const isTrial = pass_code.toLowerCase().includes('trial')
      const isInvalid = pass_code.toLowerCase().includes('invalid') || pass_code.toLowerCase().includes('expire')
      if (isInvalid) {
        return { valid: false, reason: 'Pass is invalid or expired' }
      }
      return {
        valid: true,
        type: isTrial ? 'trial' : 'membership',
        name: isTrial ? 'Demo Trial Visitor' : 'Demo Member',
        phone: '+91 98765 43210',
        expires_at: isTrial ? new Date(Date.now() + 86400000).toISOString() : '2026-12-31T23:59:59Z',
        plan_name: isTrial ? '48hr Free Trial' : 'Gold Annual Membership',
        used: isTrial
      }
    }
    return apiCall('validatePass', { pass_code, scanned_by: scanned_by || 'front_desk' })
  },

  getPassStatus: async (pass_code: string): Promise<any> => {
    if (DEMO_MODE) {
      return {
        success: true,
        status: 'active',
        type: 'membership',
        expires_at: '2026-12-31T23:59:59Z',
        remaining_ms: 864000000,
        name: 'Demo Member',
        phone: '+91 98765 43210',
        plan_name: 'Gold Annual Membership'
      }
    }
    return apiCall('getPassStatus', { pass_code })
  },

  // ── Member Portal ──
  memberLogin: async (gym_id: string, phone: string, password?: string): Promise<any> => {
    return apiCall('memberLogin', { gym_id, phone, password })
  },
  memberGetMyPass: async (token: string): Promise<any> => {
    return apiCall('memberGetMyPass', { token })
  },
  // ── Public Gym Data (no auth) ──
  getPublicGymData: async (gym_id: string): Promise<any> => {
    return apiCall('getPublicGymData', { gym_id })
  },
  // ── Payments ──
  createRazorpayOrder: async (gym_id: string, amount: number, member_id?: string, plan_name?: string): Promise<any> => {
    return apiCall('createRazorpayOrder', { gym_id, amount, member_id, plan_name })
  },
  recordCashPayment: async (data: { gym_id: string; member_id: string; member_name: string; amount: number; plan_name?: string; expires_at?: string }): Promise<any> => {
    return apiCall('recordCashPayment', data)
  },

  createMembershipPass: async (data: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) {
      return { success: true, qr_payload: 'MEMB-' + Date.now(), pass: { id: 'pass_' + Date.now(), ...data } }
    }
    return apiCall('createMembershipPass', data)
  },

  createTrialPassV2: async (data: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) {
      return { success: true, qr_payload: 'TRIAL-' + Date.now(), pass: { id: 'pass_' + Date.now(), ...data } }
    }
    return apiCall('createTrialPassV2', data)
  },

  getAllEntities: async (entity_name: string, gym_id?: string): Promise<any> => {
    if (DEMO_MODE) return { success: true, records: [] }
    return apiCall('getAllEntities', { entity_name, gym_id })
  },
}