const API_BASE = 'https://base44.app/api/apps/6a8949954092729194579577/functions'

export async function apiCall<T = any>(functionName: string, payload?: any): Promise<T> {
  const res = await fetch(`${API_BASE}/${functionName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {})
  })
  return res.json()
}

export const api = {
  getDashboardData: () => apiCall('getDashboardData'),
  getLeads: (filters?: any) => apiCall('getLeads', filters || {}),
  getTrialPasses: (filters?: any) => apiCall('getTrialPasses', filters || {}),
  getMembers: (filters?: any) => apiCall('getMembers', filters || {}),
  getRecentCheckIns: (limit?: number) => apiCall('getRecentCheckIns', { limit: limit || 10 }),
  validateQR: (qr_token: string) => apiCall('validateQR', { qr_token, gym_id: 'gym_oxigen_demo' }),
  checkIn: (qr_token: string) => apiCall('checkIn', { qr_token, gym_id: 'gym_oxigen_demo', branch_id: 'branch_c_scheme', entry_method: 'qr_scan' }),
  createTrialPass: (lead_id: string, preferred_visit_time?: string, validity_days?: number) =>
    apiCall('createTrialPass', { lead_id, branch_id: 'branch_c_scheme', gym_id: 'gym_oxigen_demo', preferred_visit_time, validity_days }),
  createLead: (data: any) => apiCall('createLeadWithConsent', { ...data, gym_id: 'gym_oxigen_demo' }),
  getClassSchedule: (branch_id?: string) => apiCall('getClassSchedule', { branch_id, gym_id: 'gym_oxigen_demo' }),
  createClassBooking: (class_id: string, member_id: string) =>
    apiCall('createClassBooking', { class_id, member_id, gym_id: 'gym_oxigen_demo' })
}
