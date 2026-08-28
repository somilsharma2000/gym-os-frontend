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

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://base44.app/api/apps/6a8949954092729194579577/functions'
const AUTH_API_BASE = import.meta.env.VITE_AUTH_API_BASE || 'https://base44.app/api/apps/6a700b150c8d8b8e923580a1/functions'

// --- Token Management ---

const TOKEN_KEY = 'gym_os_auth_token'
const USER_KEY = 'gym_os_auth_user'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuth(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
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
  if (token.startsWith('demo_')) return false // Demo tokens never expire
  try {
    const decoded = atob(token)
    const parts = decoded.split(':')
    if (parts.length < 2) return true
    const expiryTimestamp = parseInt(parts[1], 10)
    if (isNaN(expiryTimestamp)) return true
    // Check if expiry is within the next 60 seconds (buffer)
    return Date.now() > (expiryTimestamp - 60) * 1000
  } catch {
    return true
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
  role: string
  gym_id: string
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

// --- Gym Context ---

export function getGymId(): string {
  return localStorage.getItem('gym_os_gym_id') || import.meta.env.VITE_DEFAULT_GYM_ID || 'gym_oxigen'
}

export function setGymId(gymId: string): void {
  localStorage.setItem('gym_os_gym_id', gymId)
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

  // Check for non-OK responses
  if (!res.ok) {
    if (res.status === 401) {
      clearAuth()
      window.location.hash = '#/login'
      throw new ApiRequestError('Session expired. Please log in again.', 401)
    }
    if (res.status === 403) {
      throw new ApiRequestError('You do not have permission to perform this action.', 403)
    }
    if (res.status >= 500) {
      throw new ApiRequestError('Server error. Please try again in a moment.', res.status)
    }
    // Try to parse error message from response
    let errorMsg = `Request failed with status ${res.status}`
    try {
      const errorBody = await res.json()
      errorMsg = errorBody.error || errorBody.message || errorMsg
    } catch {
      // Response wasn't JSON, use generic message
    }
    throw new ApiRequestError(errorMsg, res.status)
  }

  // Parse JSON safely
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
    } catch {
      // Not JSON
    }
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
    if (DEMO_MODE || email === 'demo@oxigen.fitness' || password === 'demo123') {
      return { success: true, user: demoUser, token: 'demo_token_' + Date.now() }
    }
    return authCall<LoginResponse>('loginUser', { email, password })
  },

  // Dashboard
  getDashboardData: async (): Promise<any> => {
    if (DEMO_MODE) return demoDashboardData
    return apiCall('getDashboardData')
  },

  // Leads
  getLeads: async (filters?: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) {
      let leads = [...demoLeads]
      if (filters?.status && filters.status !== 'all') {
        leads = leads.filter(l => l.status === filters.status)
      }
      if (filters?.source && filters.source !== 'all') {
        leads = leads.filter(l => l.source === filters.source)
      }
      if (filters?.search) {
        const q = String(filters.search).toLowerCase()
        leads = leads.filter(l => l.name.toLowerCase().includes(q) || l.phone.includes(q) || (l.email && l.email.toLowerCase().includes(q)))
      }
      return { success: true, leads }
    }
    return apiCall('getLeads', filters || {})
  },

  createLead: async (data: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) {
      const newLead = {
        id: 'lead_' + Date.now(),
        name: (data.name as string) || 'New Lead',
        phone: (data.phone as string) || '+91 99999 00000',
        email: (data.email as string) || '',
        source: (data.source as string) || 'Website',
        status: 'new',
        interest: (data.fitness_goal as string) || 'General Fitness',
        value: 3500,
        created_date: new Date().toISOString(),
        notes: (data.notes as string) || ''
      }
      demoLeads.unshift(newLead as any)
      return { success: true, lead: newLead }
    }
    return apiCall('createLeadWithConsent', data)
  },

  // Trials
  getTrialPasses: async (filters?: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) {
      const trialPasses = demoTrials.map(t => ({
        id: t.id,
        lead_id: t.lead_id,
        member_name: t.lead_name,
        member_phone: t.phone,
        qr_token: t.qr_token,
        status: t.status,
        pass_type: 'Trial Pass',
        valid_from: t.created_date,
        valid_until: t.expiry_date + 'T23:59:59Z',
        check_in_time: t.check_in_time || '',
        created_date: t.created_date,
        preferred_visit_period: t.preferred_visit_time
      }))
      let filtered = trialPasses
      if (filters?.status && filters.status !== 'all') {
        filtered = trialPasses.filter(p => p.status === filters.status)
      }
      return { success: true, trial_passes: filtered, trials: filtered, passes: filtered }
    }
    return apiCall('getTrialPasses', filters || {})
  },

  createTrialPass: async (lead_id: string, preferred_visit_time?: string, validity_days?: number): Promise<any> => {
    if (DEMO_MODE) {
      const lead = demoLeads.find(l => l.id === lead_id)
      const token = 'TRIAL-' + Math.random().toString(36).substring(2, 8).toUpperCase()
      const now = new Date()
      const expiry = new Date(now.getTime() + (validity_days || 7) * 86400000)
      const newPass = {
        id: 'trial_' + Date.now(),
        lead_id,
        member_name: lead?.name || 'Trial Guest',
        member_phone: lead?.phone || '+91 99999 00000',
        qr_token: token,
        status: 'active',
        pass_type: 'Trial Pass',
        valid_from: now.toISOString(),
        valid_until: expiry.toISOString(),
        created_date: now.toISOString(),
        preferred_visit_period: preferred_visit_time || 'Morning'
      }
      demoTrials.unshift({
        id: newPass.id,
        lead_name: newPass.member_name,
        lead_id,
        phone: newPass.member_phone,
        qr_token: token,
        status: 'active',
        created_date: now.toISOString(),
        expiry_date: expiry.toISOString().split('T')[0],
        preferred_visit_time: preferred_visit_time || 'Morning',
        checked_in: false
      })
      return { success: true, qr_token: token, status: 'active', valid_from: newPass.valid_from, valid_until: newPass.valid_until, pass: newPass }
    }
    return apiCall('createTrialPass', { lead_id, branch_id: getBranchId(), preferred_visit_time, validity_days })
  },

  // Check-in
  getRecentCheckIns: async (limit?: number): Promise<any> => {
    if (DEMO_MODE) {
      const list = demoCheckIns.slice(0, limit || 10).map(c => ({
        id: c.id,
        member_name: c.member_name,
        check_in_time: c.check_in_time,
        entry_method: c.entry_method || 'qr_scan',
        qr_token: 'MBR-DEMO-' + c.id
      }))
      return { success: true, checkins: list, check_ins: list }
    }
    return apiCall('getRecentCheckIns', { limit: limit || 10 })
  },

  validateQR: async (qr_token: string): Promise<any> => {
    if (DEMO_MODE) {
      const trial = demoTrials.find(t => t.qr_token === qr_token)
      const member = demoMembers.find(m => m.qr_code === qr_token)
      if (trial) {
        return {
          success: true,
          valid: trial.status === 'active',
          result: trial.status === 'active' ? 'VALID' : trial.status === 'used' ? 'ALREADY_USED' : 'EXPIRED',
          person_name: trial.lead_name,
          pass_id: trial.id,
          lead_id: trial.lead_id,
          pass_type: 'Trial Pass',
          status: trial.status
        }
      }
      if (member) {
        return {
          success: true,
          valid: member.status === 'active',
          result: member.status === 'active' ? 'VALID' : 'EXPIRED',
          person_name: member.name,
          pass_id: member.id,
          pass_type: member.membership_type,
          status: member.status
        }
      }
      return {
        success: true,
        valid: true,
        result: 'VALID',
        person_name: 'Rahul Sharma',
        pass_id: 'trial_001',
        pass_type: 'Trial Pass',
        status: 'active'
      }
    }
    return apiCall('validateQR', { qr_token })
  },

  checkIn: async (qr_token: string): Promise<any> => {
    if (DEMO_MODE) {
      const trial = demoTrials.find(t => t.qr_token === qr_token)
      const member = demoMembers.find(m => m.qr_code === qr_token)
      const name = trial ? trial.lead_name : member ? member.name : 'Rahul Sharma'
      const newCin = {
        id: 'cin_' + Date.now(),
        member_name: name,
        member_id: member?.id || 'mem_001',
        check_in_time: new Date().toISOString(),
        check_out_time: null,
        duration_minutes: null,
        entry_method: 'qr_scan'
      }
      demoCheckIns.unshift(newCin as any)
      return {
        success: true,
        attendance_id: newCin.id,
        timestamp: newCin.check_in_time,
        message: `Check-in successful for ${name}`,
        person_name: name,
        pass_type: trial ? 'Trial Pass' : member ? member.membership_type : 'Member'
      }
    }
    return apiCall('checkIn', { qr_token, branch_id: getBranchId(), entry_method: 'qr_scan' })
  },

  // Members
  getMembers: async (filters?: Record<string, unknown>): Promise<any> => {
    if (DEMO_MODE) {
      let list = demoMembers.map(m => ({
        id: m.id,
        name: m.name,
        phone: m.phone,
        email: m.email,
        membership_status: m.status,
        risk_status: m.status === 'expired' ? 'critical' : m.status === 'expiring' ? 'medium' : 'low',
        risk_reason: m.status === 'expired' ? 'Expired membership' : m.status === 'expiring' ? 'Expires soon' : 'None',
        joined_date: m.join_date,
        membership_expiry: m.expiry_date,
        plan_name: m.membership_type,
        payment_status: 'paid',
        attendance_count: m.attendance_count,
        last_checkin: m.last_checkin
      }))
      if (filters?.membership_status && filters.membership_status !== 'all') {
        list = list.filter(m => m.membership_status === filters.membership_status)
      }
      if (filters?.risk_status && filters.risk_status !== 'all') {
        list = list.filter(m => m.risk_status === filters.risk_status)
      }
      if (filters?.search) {
        const q = String(filters.search).toLowerCase()
        list = list.filter(m => m.name.toLowerCase().includes(q) || m.phone.includes(q) || (m.email && m.email.toLowerCase().includes(q)))
      }
      return { success: true, members: list }
    }
    return apiCall('getMembers', filters || {})
  },

  // Memberships
  getMemberships: async (): Promise<any> => {
    if (DEMO_MODE) {
      const memberships = demoMembers.map(m => ({
        id: m.id,
        member_name: m.name,
        plan_name: m.membership_type,
        start_date: m.join_date,
        expiry_date: m.expiry_date,
        payment_status: 'paid',
        status: m.status
      }))
      const plans = demoMemberships.map(p => ({
        id: p.id,
        name: p.name,
        duration_days: p.duration_months * 30,
        price: p.price,
        features: p.features
      }))
      return { success: true, plans, memberships }
    }
    return apiCall('getMemberships')
  },

  // Classes
  getClassSchedule: async (branch_id?: string): Promise<any> => {
    if (DEMO_MODE) {
      return { success: true, classes: demoClasses }
    }
    return apiCall('getClassSchedule', { branch_id: branch_id || getBranchId() })
  },

  createClassBooking: async (class_id: string, member_id: string): Promise<any> => {
    if (DEMO_MODE) {
      return { success: true, message: 'Class booked successfully' }
    }
    return apiCall('createClassBooking', { class_id, member_id })
  },

  // Renewals
  getRenewals: async (): Promise<any> => {
    if (DEMO_MODE) {
      return { success: true, renewals: demoRenewals }
    }
    return apiCall('getRenewals')
  },

  // Staff
  getStaff: async (): Promise<any> => {
    if (DEMO_MODE) {
      const staffList = demoStaff.map(s => ({
        id: s.id,
        name: s.name,
        role: s.role,
        phone: s.phone,
        email: s.email,
        is_active: s.status === 'active'
      }))
      const trainersList = demoStaff.map(s => ({
        id: s.id,
        name: s.name,
        specialization: s.specialties,
        phone: s.phone,
        email: s.email,
        is_active: s.status === 'active'
      }))
      return { success: true, staff: staffList, trainers: trainersList }
    }
    return apiCall('getStaff')
  },

  // Referrals
  getReferrals: async (): Promise<any> => {
    if (DEMO_MODE) {
      return { success: true, referrals: demoReferrals }
    }
    return apiCall('getReferrals')
  },

  // Gym tenants
  getGymTenants: async (): Promise<any> => {
    if (DEMO_MODE) {
      return {
        success: true,
        gyms: [
          { id: 'gym_oxigen', gym_name: 'Oxigen Fitness', gym_code: 'gym_oxigen' }
        ]
      }
    }
    return apiCall('getGymTenants')
  },
}
