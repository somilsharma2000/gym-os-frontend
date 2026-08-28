// API Client with authentication, env-based config, and proper error handling
import {
  DEMO_MODE,
  demoUser,
  demoDashboardData,
  demoLeads,
  demoTrials,
  demoMembers,
  demoMemberships,
  demoCheckIns,
  demoClasses,
  demoStaff,
  demoReferrals,
  demoRenewals
} from '../data/demoData'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://base44.app/api/apps/6a700b150c8d8b8e923580a1/functions'
const AUTH_API_BASE = import.meta.env.VITE_AUTH_API_BASE || 'https://base44.app/api/apps/6a700b150c8d8b8e923580a1/functions'

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
    if (parts.length !== 2) return true
    const payload = atob(parts[0])
    const [accountId, gymId, expiryStr] = payload.split(':')
    if (!expiryStr) return true
    const expiryTimestamp = parseInt(expiryStr, 10)
    if (isNaN(expiryTimestamp)) return true
    return Math.floor(Date.now() / 1000) > expiryTimestamp
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
  return localStorage.getItem(GYM_KEY) || import.meta.env.VITE_DEFAULT_GYM_ID || 'gym_oxigen'
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
  return localStorage.getItem('gym_os_branch_id') || import.meta.env.VITE_DEFAULT_BRANCH_ID || 'branch_c_scheme'
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

async function apiCall<T = any>(functionName: string, payload?: Record<string, unknown>): Promise<T> {
  const gym_id = getGymId()
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE}/${functionName}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ gym_id, ...payload }),
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

  // Check-in
  getCheckIns: async (): Promise<any> => {
    if (DEMO_MODE) return { success: true, check_ins: demoCheckIns }
    return apiCall('getRecentCheckIns')
  },

  // Members
  getMembers: async (filters?: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) return { success: true, members: demoMembers }
    return apiCall("getMembers", filters || {})
  },

  addMember: async (data: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) return { success: true }
    return apiCall('addMember', data)
  },

  // Memberships
  getMemberships: async (): Promise<any> => {
    if (DEMO_MODE) return { success: true, memberships: demoMemberships }
    return apiCall('getMemberships')
  },

  // Payments
  getPayments: async (): Promise<any> => {
    if (DEMO_MODE) return { success: true, payments: [] }
    return apiCall('getPayments')
  },

  recordPayment: async (data: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) return { success: true }
    return apiCall('recordPayment', data)
  },

  // Expenses
  getExpenses: async (): Promise<any> => {
    if (DEMO_MODE) return { success: true, expenses: [] }
    return apiCall('getExpenses')
  },

  createExpense: async (data: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) return { success: true }
    return apiCall('createExpense', data)
  },

  // Revenue
  getRevenue: async (): Promise<any> => {
    if (DEMO_MODE) return { success: true, revenue: { monthly: [], breakdown: {} } }
    return apiCall('getRevenue')
  },

  // Classes
  getClassSchedule: async (): Promise<any> => {
    if (DEMO_MODE) return { success: true, classes: demoClasses }
    return apiCall('getClassSchedule')
  },

  // Staff
  getStaff: async (): Promise<any> => {
    if (DEMO_MODE) return { success: true, staff: demoStaff }
    return apiCall('getStaff')
  },

  // Referrals
  getReferrals: async (): Promise<any> => {
    if (DEMO_MODE) return { success: true, referrals: demoReferrals }
    return apiCall('getReferrals')
  },

  // Renewals
  getRenewals: async (): Promise<any> => {
    if (DEMO_MODE) return { success: true, renewals: demoRenewals }
    return apiCall('fetchExpiringMembers')
  },

  // At-Risk
  getAtRiskMembers: async (): Promise<any> => {
    if (DEMO_MODE) return { success: true, members: [] }
    return apiCall('fetchAtRiskMembers')
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
    return apiCall('qrCheckIn', { qr_token })
  },

  // Gym Settings
  getGymSettings: async (): Promise<any> => {
    if (DEMO_MODE) return { success: true, settings: {} }
    return apiCall('getGymSettings')
  },

  updateGymSettings: async (data: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) return { success: true }
    return apiCall('updateGymSettings', data)
  },

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
  }
}
