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
  if (token.startsWith('demo_')) return false
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
    // If token parsing fails, assume NOT expired to avoid false logouts
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
    return authCall<LoginResponse>('loginUser', { email, password })
  },

  // Dashboard
  getDashboardData: async (): Promise<any> => {
    if (DEMO_MODE) return demoDashboardData
    const res = await apiCall('getDashboardData')
    // Fetch fresh leads to replace recent_leads (GYMOS returns junk/test leads there)
    try {
      const leadsRes = await apiCall('getLeads', {})
      if (leadsRes.success && leadsRes.leads) {
        const cleanLeads = leadsRes.leads
          .filter((l: any) => l.status !== 'archived' && l.status !== 'Archived')
          .sort((a: any, b: any) => (b.created_date || '').localeCompare(a.created_date || ''))
          .slice(0, 5)
        res.recent_leads = cleanLeads
        // Update total_leads to reflect non-archived count
        if (res.stats) {
          res.stats.total_leads = leadsRes.leads.filter((l: any) => l.status !== 'archived' && l.status !== 'Archived').length
        }
        if (res.metrics) {
          res.metrics.total_leads = leadsRes.leads.filter((l: any) => l.status !== 'archived' && l.status !== 'Archived').length
        }
      }
    } catch {}
    // Ensure metrics exists (fallback to stats)
    if (!res.metrics && res.stats) res.metrics = res.stats
    if (!res.metrics && !res.stats) res.metrics = {}
    if (!res.stats) res.stats = res.metrics
    return res
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
    const res = await apiCall('getLeads', filters || {})
    // Filter out archived/junk leads
    if (res.success && res.leads) {
      res.leads = res.leads.filter((l: any) => l.status !== 'archived' && l.status !== 'Archived')
    }
    return res
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
      const classes = demoClasses.map(c => ({
        id: c.id,
        title: c.name,
        name: c.name,
        trainer_name: c.trainer_name,
        trainer_id: c.trainer_id,
        day_of_week: c.day,
        day: c.day,
        start_time: c.time,
        time: c.time,
        duration_minutes: 60,
        capacity: c.capacity,
        booked_count: c.enrolled,
        enrolled: c.enrolled,
        spots_left: c.spots_left,
        intensity: c.intensity,
        status: c.spots_left === 0 ? 'full' : 'active'
      }))
      return { success: true, classes }
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
      const renewals = demoRenewals.map(r => {
        const days = r.days_left ?? 0
        let stage = 'safe'
        if (days < 0) stage = 'expired'
        else if (days < 7) stage = r.status === 'overdue' ? 'critical' : 'urgent'
        else if (days < 30) stage = 'warning'
        else stage = 'notice'
        return {
          id: r.id,
          member_name: r.member_name,
          member_id: r.member_id,
          plan_name: r.membership_type,
          expiry_date: r.expiry_date,
          amount: r.amount,
          status: r.status,
          days_to_expiry: days,
          days_left: days,
          stage,
          assigned_to: 'Front Desk'
        }
      })
      return { success: true, renewals }
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
      const referrals = demoReferrals.map((r, i) => ({
        ...r,
        referral_code: 'REF' + String(i + 1).padStart(4, '0'),
        conversion_date: r.status === 'converted' ? r.date : null
      }))
      return { success: true, referrals }
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

  // Helper to format ISO date to clean date string
  formatDate: (dateStr: string): string => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch { return dateStr }
  },

  // Payments — derived from getMemberships (GYMOS app has membership payment data)
  getPayments: async (filters?: Record<string, unknown>): Promise<any> => {
    try {
      const res = await apiCall('getMemberships', {})
      if (!res.success) return { success: true, payments: [], count: 0 }

      let memberships = res.memberships || []

      // Transform memberships into payment records
      let payments = memberships.map((m: any) => ({
        id: m.id || '',
        member_id: m.member_id || '',
        member_name: m.member_name || 'Unknown Member',
        amount: m.amount || m.plan_price || 0,
        date: (() => {
          const raw = m.payment_date || m.start_date || m.created_date || ''
          if (!raw) return ''
          try {
            const d = new Date(raw)
            if (isNaN(d.getTime())) return raw
            return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          } catch { return raw }
        })(),
        method: m.payment_method || 'cash',
        status: m.payment_status || m.status || 'paid',
        type: m.payment_type || 'membership',
        invoice_number: m.invoice_number || ('INV-' + String(m.id || '').slice(-8).toUpperCase()),
        gst_amount: m.gst_amount || 0,
        plan_name: m.plan_name || '',
        created_date: m.created_date || ''
      }))

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        payments = payments.filter((p: any) => String(p.status).toLowerCase() === String(filters.status).toLowerCase())
      }
      if (filters?.search) {
        const q = String(filters.search).toLowerCase()
        payments = payments.filter((p: any) =>
          (p.member_name || '').toLowerCase().includes(q) ||
          (p.invoice_number || '').toLowerCase().includes(q)
        )
      }

      // Sort by date descending
      payments.sort((a: any, b: any) => (b.date || '').localeCompare(a.date || ''))

      return { success: true, payments, count: payments.length }
    } catch (e) {
      return { success: true, payments: [], count: 0 }
    }
  },

  // Revenue — derived from getMemberships
  getRevenue: async (): Promise<any> => {
    try {
      const res = await apiCall('getMemberships', {})
      if (!res.success) {
        return {
          success: true,
          summary: { total_revenue: 0, monthly_revenue: 0, total_expenses: 0, net_revenue: 0, payments_count: 0 },
          monthly_data: [],
          category_breakdown: [],
          by_method: {},
          by_type: {},
          expenses: [],
          recent_payments: []
        }
      }

      const memberships = res.memberships || []
      const currentMonthStr = new Date().toISOString().slice(0, 7)

      let total_revenue = 0
      let monthly_revenue = 0

      const by_method: any = { cash: { count: 0, total: 0 }, upi: { count: 0, total: 0 }, card: { count: 0, total: 0 }, other: { count: 0, total: 0 } }
      const by_type: any = { membership: { count: 0, total: 0 }, personal_training: { count: 0, total: 0 }, merchandise: { count: 0, total: 0 }, other: { count: 0, total: 0 } }

      // Monthly data (6 months)
      const monthlyData: any[] = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        monthlyData.push({ month: d.toLocaleString('default', { month: 'short' }), revenue: 0, expenses: 0 })
      }

      const recentPayments: any[] = []

      for (const m of memberships) {
        const amount = Number(m.amount || m.plan_price || 0)
        const status = String(m.payment_status || m.status || '').toLowerCase()
        const dateStr = String(m.payment_date || m.start_date || m.created_date || '')

        if (status === 'paid' || status === 'active' || status === 'confirmed' || status === '') {
          total_revenue += amount
          if (dateStr.startsWith(currentMonthStr)) monthly_revenue += amount

          // Monthly chart
          const monthKey = dateStr.slice(0, 7)
          for (let j = 0; j < monthlyData.length; j++) {
            const d = new Date()
            d.setMonth(d.getMonth() - (5 - j))
            if (d.toISOString().slice(0, 7) === monthKey) {
              monthlyData[j].revenue += amount
            }
          }

          // By method
          let methodKey = String(m.payment_method || '').toLowerCase().trim()
          if (!['cash', 'upi', 'card'].includes(methodKey)) methodKey = 'other'
          if (by_method[methodKey]) { by_method[methodKey].count += 1; by_method[methodKey].total += amount }

          // By type
          let typeKey = String(m.payment_type || 'membership').toLowerCase().trim()
          if (typeKey === 'pt' || typeKey === 'personal training') typeKey = 'personal_training'
          if (!['membership', 'personal_training', 'merchandise'].includes(typeKey)) typeKey = 'other'
          if (by_type[typeKey]) { by_type[typeKey].count += 1; by_type[typeKey].total += amount }

          recentPayments.push({
            id: m.id,
            member_name: m.member_name || 'Unknown',
            amount,
            date: (() => {
              try {
                const d = new Date(dateStr)
                if (isNaN(d.getTime())) return dateStr
                return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              } catch { return dateStr }
            })(),
            method: m.payment_method || 'cash',
            status
          })
        }
      }

      recentPayments.sort((a: any, b: any) => (b.date || '').localeCompare(a.date || ''))

      const categoryBreakdown = Object.entries(by_type).map(([key, val]: any) => ({
        category: key, count: val.count, total: val.total,
        percentage: total_revenue > 0 ? Math.round((val.total / total_revenue) * 100) : 0
      }))

      return {
        success: true,
        summary: { total_revenue, monthly_revenue, total_expenses: 0, net_revenue: total_revenue, payments_count: recentPayments.length },
        monthly_data: monthlyData,
        category_breakdown: categoryBreakdown,
        by_method,
        by_type,
        expenses: [],
        recent_payments: recentPayments.slice(0, 10)
      }
    } catch (e) {
      return {
        success: true,
        summary: { total_revenue: 0, monthly_revenue: 0, total_expenses: 0, net_revenue: 0, payments_count: 0 },
        monthly_data: [], category_breakdown: [], by_method: {}, by_type: {}, expenses: [], recent_payments: []
      }
    }
  },
}