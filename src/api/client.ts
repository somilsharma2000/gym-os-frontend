// API Client with authentication, env-based config, and proper error handling

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
  } catch (err) {
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
  login: (email: string, password: string): Promise<LoginResponse> =>
    authCall<LoginResponse>('loginUser', { email, password }),

  // Dashboard
  getDashboardData: (): Promise<any> => apiCall('getDashboardData'),

  // Leads
  getLeads: (filters?: Record<string, unknown>): Promise<any> =>
    apiCall('getLeads', filters || {}),
  createLead: (data: Record<string, unknown>): Promise<any> =>
    apiCall('createLeadWithConsent', data),

  // Trials
  getTrialPasses: (filters?: Record<string, unknown>): Promise<any> =>
    apiCall('getTrialPasses', filters || {}),
  createTrialPass: (lead_id: string, preferred_visit_time?: string, validity_days?: number): Promise<any> =>
    apiCall('createTrialPass', { lead_id, branch_id: getBranchId(), preferred_visit_time, validity_days }),

  // Check-in
  getRecentCheckIns: (limit?: number): Promise<any> =>
    apiCall('getRecentCheckIns', { limit: limit || 10 }),
  validateQR: (qr_token: string): Promise<any> =>
    apiCall('validateQR', { qr_token }),
  checkIn: (qr_token: string): Promise<any> =>
    apiCall('checkIn', { qr_token, branch_id: getBranchId(), entry_method: 'qr_scan' }),

  // Members
  getMembers: (filters?: Record<string, unknown>): Promise<any> =>
    apiCall('getMembers', filters || {}),

  // Memberships
  getMemberships: (): Promise<any> => apiCall('getMemberships'),

  // Classes
  getClassSchedule: (branch_id?: string): Promise<any> =>
    apiCall('getClassSchedule', { branch_id: branch_id || getBranchId() }),
  createClassBooking: (class_id: string, member_id: string): Promise<any> =>
    apiCall('createClassBooking', { class_id, member_id }),

  // Renewals
  getRenewals: (): Promise<any> => apiCall('getRenewals'),

  // Staff
  getStaff: (): Promise<any> => apiCall('getStaff'),

  // Referrals
  getReferrals: (): Promise<any> => apiCall('getReferrals'),

  // Gym tenants
  getGymTenants: (): Promise<any> => apiCall('getGymTenants'),
}
