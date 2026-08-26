const API_BASE = 'https://base44.app/api/apps/6a8949954092729194579577/functions'

export function getGymId(): string {
  return localStorage.getItem('gym_os_gym_id') || 'gym_oxigen'
}

export function setGymId(gymId: string) {
  localStorage.setItem('gym_os_gym_id', gymId)
}

export async function apiCall<T = any>(functionName: string, payload?: any): Promise<T> {
  const gym_id = getGymId()
  const res = await fetch(`${API_BASE}/${functionName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gym_id, ...payload })
  })
  return res.json()
}

export const api = {
  getDashboardData: () => apiCall('getDashboardData'),
  getLeads: (filters?: any) => apiCall('getLeads', filters || {}),
  getTrialPasses: (filters?: any) => apiCall('getTrialPasses', filters || {}),
  getMembers: (filters?: any) => apiCall('getMembers', filters || {}),
  getRecentCheckIns: (limit?: number) => apiCall('getRecentCheckIns', { limit: limit || 10 }),
  validateQR: (qr_token: string) => apiCall('validateQR', { qr_token }),
  checkIn: (qr_token: string) => apiCall('checkIn', { qr_token, branch_id: 'branch_c_scheme', entry_method: 'qr_scan' }),
  createTrialPass: (lead_id: string, preferred_visit_time?: string, validity_days?: number) =>
    apiCall('createTrialPass', { lead_id, branch_id: 'branch_c_scheme', preferred_visit_time, validity_days }),
  createLead: (data: any) => apiCall('createLeadWithConsent', data),
  getClassSchedule: (branch_id?: string) => apiCall('getClassSchedule', { branch_id }),
  createClassBooking: (class_id: string, member_id: string) =>
    apiCall('createClassBooking', { class_id, member_id }),
  getMemberships: () => apiCall('getMemberships'),
  getRenewals: () => apiCall('getRenewals'),
  getStaff: () => apiCall('getStaff'),
  getReferrals: () => apiCall('getReferrals'),
  getGymTenants: () => apiCall('getGymTenants')
}
