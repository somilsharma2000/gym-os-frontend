export interface DashboardData {
  stats?: any;
  success: boolean
  metrics: {
    total_leads: number
    new_leads: number
    trial_passes_active: number
    trial_visitors_checked_in: number
    pending_followups: number
    active_memberships: number
    expiring_memberships: number
    at_risk_members: number
    today_attendance: number
    pending_referrals: number
  }
  recent_leads: Lead[]
  pending_followup_tasks: FollowUpTask[]
  recent_checkins: CheckIn[]
  expiring_memberships: any[]
}

export interface Lead {
  id: string
  name: string
  phone: string
  email?: string
  fitness_goal?: string
  source?: string
  status?: string
  assigned_staff_name?: string
  preferred_visit_period?: string
  consent_status?: string
  branch_id?: string
  trial_id?: string
  notes?: string
  created_date?: string
  next_follow_up_date?: string
}

export interface TrialPass {
  id: string
  lead_id: string
  member_name: string
  member_phone: string
  qr_token: string
  status: string
  pass_type: string
  valid_from: string
  valid_until: string
  check_in_time: string
  conversion_result: string
  preferred_visit_period?: string
  branch_id?: string
  created_date?: string
}

export interface Member {
  id: string
  name: string
  phone: string
  email?: string
  membership_status: string
  risk_status: string
  risk_reason?: string
  branch_id?: string
  joined_date?: string
  membership_expiry?: string
  plan_name?: string | null
  membership_status_detail?: string | null
  membership_expiry_date?: string | null
  payment_status?: string | null
  notes?: string
  created_date?: string
}

export interface CheckIn {
  id: string
  member_name: string
  check_in_time: string
  entry_method: string
  qr_token: string
  attendance_status?: string
  branch_id?: string
  trial_pass_id?: string
  member_id?: string
  lead_id?: string
  validated_by?: string
}

export interface FollowUpTask {
  id: string
  entity_name: string
  task_type: string
  priority: string
  due_date: string
  status: string
}

export interface ValidationResult {
  success: boolean
  valid: boolean
  result: 'VALID' | 'INVALID' | 'EXPIRED' | 'REVOKED' | 'WRONG_BRANCH' | 'ALREADY_USED'
  person_name?: string
  pass_id?: string
  lead_id?: string
  pass_type?: string
  status?: string
  reason?: string
}

export interface CheckInResult {
  success: boolean
  attendance_id?: string
  timestamp?: string
  message?: string
  person_name?: string
  pass_type?: string
  error?: string
}
