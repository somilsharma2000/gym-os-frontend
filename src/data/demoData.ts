// Demo mode is activated when user clicks "View Live Demo" on login page
// This shows seeded data so visitors can see Gym OS in action

export const DEMO_MODE = typeof window !== 'undefined' && localStorage.getItem('gym_os_demo_mode') === 'true'

export function getDemoScale(): 'small' | 'large' {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('gym_os_demo_scale') as 'small' | 'large') || 'small'
  }
  return 'small'
}

export function enableDemoMode() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('gym_os_demo_mode', 'true')
    localStorage.setItem('gym_os_gym_id', 'gym_demo')
    localStorage.setItem('gym_os_gym_name', 'PULSE Fitness Hyderabad')
  }
}

export function disableDemoMode() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('gym_os_demo_mode')
    localStorage.removeItem('gym_os_gym_id')
    localStorage.removeItem('gym_os_gym_name')
    localStorage.removeItem('gym_os_branch_id')
    localStorage.removeItem('gym_os_token')
    localStorage.removeItem('gym_os_user')
    localStorage.removeItem('gym_os_demo_scale')
  }
}

export const demoUser = {
  id: 'demo-user-001',
  name: 'Demo Viewer',
  email: 'demo@pulse.fitness',
  role: 'gym_owner',
  gym_id: 'gym_demo',
  gym_name: 'PULSE Fitness Hyderabad'
}

// ==========================================
// SMALL DEMO DATASET (Default Small Gym)
// ==========================================

const smallDashboardData = {
  success: true,
  metrics: {
    total_leads: 124,
    new_leads: 18,
    trial_passes_active: 14,
    trial_visitors_checked_in: 9,
    pending_followups: 23,
    active_memberships: 287,
    expiring_memberships: 19,
    at_risk_members: 11,
    today_attendance: 86,
    pending_referrals: 8
  },
  recent_leads: [
    { id: 'lead_001', name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'rahul@email.com', source: 'Instagram', status: 'new', interest: 'Weight Loss', created_date: '2026-08-26T10:30:00Z', notes: 'Saw our Instagram post about HIIT classes' },
    { id: 'lead_002', name: 'Priya Patel', phone: '+91 98765 12345', email: 'priya@email.com', source: 'Walk-in', status: 'follow_up', interest: 'General Fitness', created_date: '2026-08-25T14:20:00Z', notes: 'Walked in asking about monthly plans' },
    { id: 'lead_003', name: 'Arjun Singh', phone: '+91 99887 76655', email: 'arjun@email.com', source: 'Referral', status: 'won', interest: 'Muscle Building', created_date: '2026-08-24T09:15:00Z', notes: 'Referred by existing member Raj' },
    { id: 'lead_004', name: 'Sneha Gupta', phone: '+91 90011 22334', email: 'sneha@email.com', source: 'Website', status: 'new', interest: 'Yoga Classes', created_date: '2026-08-26T16:45:00Z', notes: 'Filled trial form on website' },
    { id: 'lead_005', name: 'Vikram Reddy', phone: '+91 98765 99988', email: 'vikram@email.com', source: 'Google Ads', status: 'follow_up', interest: 'Strength Training', created_date: '2026-08-23T11:00:00Z', notes: 'Clicked Google ad, wants personal training' }
  ],
  recent_check_ins: [
    { id: 'cin_001', member_name: 'John Doe', check_in_time: '2026-08-28T07:15:00Z', duration_minutes: 75, entry_method: 'QR Scan' },
    { id: 'cin_002', member_name: 'Sarah Chen', check_in_time: '2026-08-28T06:45:00Z', duration_minutes: 60, entry_method: 'QR Scan' },
    { id: 'cin_003', member_name: 'Mike Ross', check_in_time: '2026-08-28T06:30:00Z', duration_minutes: 90, entry_method: 'Manual' },
    { id: 'cin_004', member_name: 'Emma Wilson', check_in_time: '2026-08-28T05:45:00Z', duration_minutes: 45, entry_method: 'QR Scan' },
    { id: 'cin_005', member_name: 'Alex Turner', check_in_time: '2026-08-27T19:30:00Z', duration_minutes: 120, entry_method: 'QR Scan' }
  ],
  recent_checkins: [
    { id: 'cin_001', member_name: 'John Doe', check_in_time: '2026-08-28T07:15:00Z', duration_minutes: 75, entry_method: 'QR Scan' },
    { id: 'cin_002', member_name: 'Sarah Chen', check_in_time: '2026-08-28T06:45:00Z', duration_minutes: 60, entry_method: 'QR Scan' },
    { id: 'cin_003', member_name: 'Mike Ross', check_in_time: '2026-08-28T06:30:00Z', duration_minutes: 90, entry_method: 'Manual' },
    { id: 'cin_004', member_name: 'Emma Wilson', check_in_time: '2026-08-28T05:45:00Z', duration_minutes: 45, entry_method: 'QR Scan' },
    { id: 'cin_005', member_name: 'Alex Turner', check_in_time: '2026-08-27T19:30:00Z', duration_minutes: 120, entry_method: 'QR Scan' }
  ],
  pending_followup_tasks: [
    { id: 'task_001', entity_name: 'Priya Patel', task_type: 'Phone Call', due_date: '2026-08-28T18:00:00Z', priority: 'high' },
    { id: 'task_002', entity_name: 'Vikram Reddy', task_type: 'WhatsApp Message', due_date: '2026-08-29T12:00:00Z', priority: 'medium' },
    { id: 'task_003', entity_name: 'Ananya Iyer', task_type: 'Tour Booking', due_date: '2026-08-28T16:00:00Z', priority: 'high' },
    { id: 'task_004', entity_name: 'Ishita Bose', task_type: 'Phone Call', due_date: '2026-08-29T10:00:00Z', priority: 'low' },
    { id: 'task_005', entity_name: 'Meera Joshi', task_type: 'Follow-up Email', due_date: '2026-08-30T14:00:00Z', priority: 'medium' }
  ],
  expiring_memberships: [
    { id: 'mem_008', member_name: 'Raj Kumar', plan_name: 'Monthly Standard', expiry_date: '2026-09-02' },
    { id: 'mem_012', member_name: 'Neha Singh', plan_name: 'Quarterly Premium', expiry_date: '2026-09-05' },
    { id: 'mem_015', member_name: 'Amit Verma', plan_name: 'Monthly Standard', expiry_date: '2026-09-08' },
    { id: 'mem_019', member_name: 'Pooja Bhatt', plan_name: 'Annual VIP', expiry_date: '2026-09-12' },
    { id: 'mem_022', member_name: 'Sahil Khan', plan_name: 'Quarterly Standard', expiry_date: '2026-09-15' }
  ]
}

const smallLeads = [
  { id: 'lead_001', name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'rahul@email.com', source: 'Instagram', status: 'new', interest: 'Weight Loss', value: 3500, created_date: '2026-08-26T10:30:00Z', notes: 'Saw our Instagram post about HIIT classes', converted_to_member_id: null, lost_reason: null },
  { id: 'lead_002', name: 'Priya Patel', phone: '+91 98765 12345', email: 'priya@email.com', source: 'Walk-in', status: 'follow_up', interest: 'General Fitness', value: 3500, created_date: '2026-08-25T14:20:00Z', notes: 'Walked in asking about monthly plans', converted_to_member_id: null, lost_reason: null },
  { id: 'lead_003', name: 'Arjun Singh', phone: '+91 99887 76655', email: 'arjun@email.com', source: 'Referral', status: 'won', interest: 'Muscle Building', value: 24000, created_date: '2026-08-24T09:15:00Z', notes: 'Referred by existing member Raj', converted_to_member_id: 'mem_001', lost_reason: null },
  { id: 'lead_004', name: 'Sneha Gupta', phone: '+91 90011 22334', email: 'sneha@email.com', source: 'Website', status: 'new', interest: 'Yoga Classes', value: 3500, created_date: '2026-08-26T16:45:00Z', notes: 'Filled trial form on website', converted_to_member_id: null, lost_reason: null },
  { id: 'lead_005', name: 'Vikram Reddy', phone: '+91 98765 99988', email: 'vikram@email.com', source: 'Google Ads', status: 'follow_up', interest: 'Strength Training', value: 9000, created_date: '2026-08-23T11:00:00Z', notes: 'Clicked Google ad, wants personal training', converted_to_member_id: null, lost_reason: null },
  { id: 'lead_006', name: 'Ananya Iyer', phone: '+91 87654 32109', email: 'ananya@email.com', source: 'Instagram', status: 'follow_up', interest: 'Weight Loss', value: 3500, created_date: '2026-08-22T13:00:00Z', notes: 'DM on Instagram about trial', converted_to_member_id: null, lost_reason: null },
  { id: 'lead_007', name: 'Karan Mehta', phone: '+91 70123 45678', email: 'karan@email.com', source: 'Walk-in', status: 'won', interest: 'Muscle Building', value: 9000, created_date: '2026-08-20T10:00:00Z', notes: 'Took annual plan', converted_to_member_id: 'mem_002', lost_reason: null },
  { id: 'lead_008', name: 'Deepika Nair', phone: '+91 89012 34567', email: 'deepika@email.com', source: 'Referral', status: 'new', interest: 'General Fitness', value: 3500, created_date: '2026-08-26T08:00:00Z', notes: 'Referred by Priya', converted_to_member_id: null, lost_reason: null },
  { id: 'lead_009', name: 'Rohit Verma', phone: '+91 99001 23456', email: 'rohit@email.com', source: 'Website', status: 'lost', interest: 'Weight Loss', value: 3500, created_date: '2026-08-15T12:00:00Z', notes: 'Went to competitor', converted_to_member_id: null, lost_reason: 'Chose competitor with lower price' },
  { id: 'lead_010', name: 'Ishita Bose', phone: '+91 88001 22334', email: 'ishita@email.com', source: 'Instagram', status: 'follow_up', interest: 'Yoga Classes', value: 3500, created_date: '2026-08-25T15:30:00Z', notes: 'Interested in morning batch', converted_to_member_id: null, lost_reason: null },
  { id: 'lead_011', name: 'Aditya Kapoor', phone: '+91 91234 56789', email: 'aditya@email.com', source: 'Google Ads', status: 'new', interest: 'Strength Training', value: 9000, created_date: '2026-08-27T09:00:00Z', notes: 'Wants personal trainer', converted_to_member_id: null, lost_reason: null },
  { id: 'lead_012', name: 'Meera Joshi', phone: '+91 81100 99887', email: 'meera@email.com', source: 'Walk-in', status: 'follow_up', interest: 'General Fitness', value: 3500, created_date: '2026-08-24T16:00:00Z', notes: 'Comparing options', converted_to_member_id: null, lost_reason: null },
  { id: 'lead_013', name: 'Sanjay Rao', phone: '+91 90011 88776', email: 'sanjay@email.com', source: 'Referral', status: 'won', interest: 'Muscle Building', value: 24000, created_date: '2026-08-18T11:00:00Z', notes: 'Annual plan', converted_to_member_id: 'mem_003', lost_reason: null },
  { id: 'lead_014', name: 'Tanya Malhotra', phone: '+91 98765 11223', email: 'tanya@email.com', source: 'Instagram', status: 'new', interest: 'Weight Loss', value: 3500, created_date: '2026-08-27T14:00:00Z', notes: 'Asked about Zumba', converted_to_member_id: null, lost_reason: null },
  { id: 'lead_015', name: 'Nikhil Jain', phone: '+91 89001 45678', email: 'nikhil@email.com', source: 'Website', status: 'lost', interest: 'General Fitness', value: 3500, created_date: '2026-08-10T10:00:00Z', notes: 'Budget constraints', converted_to_member_id: null, lost_reason: 'Could not afford the plan' }
]

const smallTrials = [
  { id: 'trial_001', lead_id: 'lead_001', lead_name: 'Rahul Sharma', phone: '+91 98765 43210', preferred_visit_time: 'morning', status: 'active', created_date: '2026-08-26', expiry_date: '2026-08-29', check_in_time: '2026-08-27T08:00:00Z', qr_token: 'TRL-001' },
  { id: 'trial_002', lead_id: 'lead_002', lead_name: 'Priya Patel', phone: '+91 98765 12345', preferred_visit_time: 'evening', status: 'used', created_date: '2026-08-25', expiry_date: '2026-08-28', check_in_time: '2026-08-26T18:30:00Z', qr_token: 'TRL-002' },
  { id: 'trial_003', lead_id: 'lead_004', lead_name: 'Sneha Gupta', phone: '+91 90011 22334', preferred_visit_time: 'morning', status: 'active', created_date: '2026-08-26', expiry_date: '2026-08-29', check_in_time: null, qr_token: 'TRL-003' },
  { id: 'trial_004', lead_id: 'lead_006', lead_name: 'Ananya Iyer', phone: '+91 87654 32109', preferred_visit_time: 'evening', status: 'expired', created_date: '2026-08-20', expiry_date: '2026-08-23', check_in_time: null, qr_token: 'TRL-004' },
  { id: 'trial_005', lead_id: 'lead_008', lead_name: 'Deepika Nair', phone: '+91 89012 34567', preferred_visit_time: 'morning', status: 'active', created_date: '2026-08-26', expiry_date: '2026-08-29', check_in_time: null, qr_token: 'TRL-005' },
  { id: 'trial_006', lead_id: 'lead_010', lead_name: 'Ishita Bose', phone: '+91 88001 22334', preferred_visit_time: 'morning', status: 'used', created_date: '2026-08-25', expiry_date: '2026-08-28', check_in_time: '2026-08-26T07:00:00Z', qr_token: 'TRL-006' }
]

const smallMembers = [
  { id: 'mem_001', name: 'Arjun Singh', email: 'arjun@email.com', phone: '+91 99887 76655', membership_type: 'Annual VIP', plan: 'Annual VIP', status: 'active', join_date: '2026-08-24', expiry_date: '2027-08-24', attendance_count: 42, last_checkin: '2026-08-28T06:30:00Z', last_visit: '2026-08-28T06:30:00Z', qr_code: 'MBR-AJS-001', trainer_id: 'trn_001', notes: '', emergency_contact: '+91 99887 11111' },
  { id: 'mem_002', name: 'Karan Mehta', email: 'karan@email.com', phone: '+91 70123 45678', membership_type: 'Quarterly Standard', plan: 'Quarterly Standard', status: 'active', join_date: '2026-08-20', expiry_date: '2026-11-20', attendance_count: 12, last_checkin: '2026-08-28T07:15:00Z', last_visit: '2026-08-28T07:15:00Z', qr_code: 'MBR-KMH-002', trainer_id: 'trn_002', notes: '', emergency_contact: '+91 70123 22222' },
  { id: 'mem_003', name: 'Sanjay Rao', email: 'sanjay@email.com', phone: '+91 90011 88776', membership_type: 'Annual VIP', plan: 'Annual VIP', status: 'active', join_date: '2026-08-18', expiry_date: '2027-08-18', attendance_count: 28, last_checkin: '2026-08-27T19:30:00Z', last_visit: '2026-08-27T19:30:00Z', qr_code: 'MBR-SRO-003', trainer_id: 'trn_001', notes: '', emergency_contact: '+91 90011 33333' },
  { id: 'mem_004', name: 'John Doe', email: 'john@email.com', phone: '+91 98111 22233', membership_type: 'Monthly Premium', plan: 'Monthly Premium', status: 'active', join_date: '2026-06-15', expiry_date: '2026-09-15', attendance_count: 56, last_checkin: '2026-08-28T07:15:00Z', last_visit: '2026-08-28T07:15:00Z', qr_code: 'MBR-JDE-004', trainer_id: null, notes: 'Regular morning attendee', emergency_contact: '+91 98111 44444' },
  { id: 'mem_005', name: 'Sarah Chen', email: 'sarah@email.com', phone: '+91 98222 33344', membership_type: 'Monthly Premium', plan: 'Monthly Premium', status: 'active', join_date: '2026-07-01', expiry_date: '2026-09-01', attendance_count: 34, last_checkin: '2026-08-28T06:45:00Z', last_visit: '2026-08-28T06:45:00Z', qr_code: 'MBR-SCH-005', trainer_id: 'trn_002', notes: '', emergency_contact: '+91 98222 55555' },
  { id: 'mem_006', name: 'Mike Ross', email: 'mike@email.com', phone: '+91 98333 44455', membership_type: 'Quarterly Standard', plan: 'Quarterly Standard', status: 'active', join_date: '2026-05-10', expiry_date: '2026-08-10', attendance_count: 18, last_checkin: '2026-08-28T06:30:00Z', last_visit: '2026-08-28T06:30:00Z', qr_code: 'MBR-MRS-006', trainer_id: null, notes: '', emergency_contact: '+91 98333 66666' },
  { id: 'mem_007', name: 'Emma Wilson', email: 'emma@email.com', phone: '+91 98444 55566', membership_type: 'Monthly Standard', plan: 'Monthly Standard', status: 'active', join_date: '2026-07-20', expiry_date: '2026-08-20', attendance_count: 8, last_checkin: '2026-08-28T05:45:00Z', last_visit: '2026-08-28T05:45:00Z', qr_code: 'MBR-EWL-007', trainer_id: null, notes: '', emergency_contact: '+91 98444 77777' },
  { id: 'mem_008', name: 'Raj Kumar', email: 'raj@email.com', phone: '+91 98555 66677', membership_type: 'Monthly Standard', plan: 'Monthly Standard', status: 'active', join_date: '2026-08-02', expiry_date: '2026-09-02', attendance_count: 22, last_checkin: '2026-08-26T18:00:00Z', last_visit: '2026-08-26T18:00:00Z', qr_code: 'MBR-RKM-008', trainer_id: null, notes: '', emergency_contact: '+91 98555 88888' },
  { id: 'mem_009', name: 'Nisha Agarwal', email: 'nisha@email.com', phone: '+91 98666 77788', membership_type: 'Quarterly Premium', plan: 'Quarterly Premium', status: 'active', join_date: '2026-06-01', expiry_date: '2026-09-01', attendance_count: 45, last_checkin: '2026-08-27T10:00:00Z', last_visit: '2026-08-27T10:00:00Z', qr_code: 'MBR-NAG-009', trainer_id: 'trn_001', notes: '', emergency_contact: '+91 98666 99999' },
  { id: 'mem_010', name: 'Amit Verma', email: 'amit@email.com', phone: '+91 98777 88899', membership_type: 'Monthly Standard', plan: 'Monthly Standard', status: 'expired', join_date: '2026-07-08', expiry_date: '2026-08-08', attendance_count: 5, last_checkin: '2026-08-05T17:30:00Z', last_visit: '2026-08-05T17:30:00Z', qr_code: 'MBR-AVM-010', trainer_id: null, notes: '', emergency_contact: '+91 98777 00000' },
  { id: 'mem_011', name: 'Pooja Bhatt', email: 'pooja@email.com', phone: '+91 98888 99900', membership_type: 'Annual VIP', plan: 'Annual VIP', status: 'active', join_date: '2025-09-12', expiry_date: '2026-09-12', attendance_count: 110, last_checkin: '2026-08-27T08:00:00Z', last_visit: '2026-08-27T08:00:00Z', qr_code: 'MBR-PBH-011', trainer_id: null, notes: '', emergency_contact: '+91 98888 11111' },
  { id: 'mem_012', name: 'Sahil Khan', email: 'sahil@email.com', phone: '+91 98999 00011', membership_type: 'Quarterly Standard', plan: 'Quarterly Standard', status: 'active', join_date: '2026-06-15', expiry_date: '2026-09-15', attendance_count: 19, last_checkin: '2026-08-20T19:00:00Z', last_visit: '2026-08-20T19:00:00Z', qr_code: 'MBR-SKH-012', trainer_id: null, notes: '', emergency_contact: '+91 98999 22222' }
]

const smallMemberships = smallMembers.map(m => ({
  id: 'ms_' + m.id,
  member_id: m.id,
  member_name: m.name,
  plan_name: m.membership_type,
  status: m.status,
  amount: m.membership_type.includes('Annual') ? 24000 : m.membership_type.includes('Quarterly') ? 9000 : 3500,
  expiry_date: m.expiry_date,
  created_date: m.join_date
}))

const smallCheckIns = [
  { id: 'cin_001', member_id: 'mem_004', member_name: 'John Doe', check_in_time: '2026-08-28T07:15:00Z', duration_minutes: 75, entry_method: 'QR Scan' },
  { id: 'cin_002', member_id: 'mem_005', member_name: 'Sarah Chen', check_in_time: '2026-08-28T06:45:00Z', duration_minutes: 60, entry_method: 'QR Scan' },
  { id: 'cin_003', member_id: 'mem_006', member_name: 'Mike Ross', check_in_time: '2026-08-28T06:30:00Z', duration_minutes: 90, entry_method: 'Manual' },
  { id: 'cin_004', member_id: 'mem_007', member_name: 'Emma Wilson', check_in_time: '2026-08-28T05:45:00Z', duration_minutes: 45, entry_method: 'QR Scan' },
  { id: 'cin_005', member_id: 'mem_003', member_name: 'Sanjay Rao', check_in_time: '2026-08-27T19:30:00Z', duration_minutes: 120, entry_method: 'QR Scan' },
  { id: 'cin_006', member_id: 'mem_001', member_name: 'Arjun Singh', check_in_time: '2026-08-28T06:30:00Z', duration_minutes: 80, entry_method: 'QR Scan' },
  { id: 'cin_007', member_id: 'mem_002', member_name: 'Karan Mehta', check_in_time: '2026-08-28T07:15:00Z', duration_minutes: 60, entry_method: 'Manual' }
]

const smallClasses = [
  { id: 'cls_001', name: 'Morning HIIT Blast', category: 'HIIT', trainer_name: 'Vikram Strength', schedule_time: '07:00 AM', day_of_week: 'Monday', capacity: 20, enrolled_count: 18, duration: '45 mins' },
  { id: 'cls_002', name: 'Power Yoga', category: 'Yoga', trainer_name: 'Priya Yoga', schedule_time: '08:00 AM', day_of_week: 'Tuesday', capacity: 15, enrolled_count: 12, duration: '60 mins' },
  { id: 'cls_003', name: 'Heavy Strength & Conditioning', category: 'Strength', trainer_name: 'Vikram Strength', schedule_time: '06:00 PM', day_of_week: 'Wednesday', capacity: 25, enrolled_count: 22, duration: '60 mins' },
  { id: 'cls_004', name: 'Zumba Fitness Party', category: 'Dance', trainer_name: 'Ananya Dance', schedule_time: '07:00 PM', day_of_week: 'Thursday', capacity: 30, enrolled_count: 28, duration: '60 mins' },
  { id: 'cls_005', name: 'CrossFit Core', category: 'CrossFit', trainer_name: 'Karan Crossfit', schedule_time: '06:30 AM', day_of_week: 'Friday', capacity: 18, enrolled_count: 16, duration: '50 mins' }
]

const smallStaff = [
  { id: 'trn_001', name: 'Vikram Strength', role: 'Head Trainer', specialty: 'Strength & Conditioning', phone: '+91 98000 11111', status: 'active' },
  { id: 'trn_002', name: 'Priya Yoga', role: 'Yoga Instructor', specialty: 'Power Yoga & Flexibility', phone: '+91 98000 22222', status: 'active' },
  { id: 'trn_003', name: 'Ananya Dance', role: 'Group Trainer', specialty: 'Zumba & Aerobics', phone: '+91 98000 33333', status: 'active' },
  { id: 'trn_004', name: 'Karan Crossfit', role: 'CrossFit Coach', specialty: 'Functional Training', phone: '+91 98000 44444', status: 'active' },
  { id: 'stf_001', name: 'Rahul Reception', role: 'Front Desk', specialty: 'Member Services', phone: '+91 98000 55555', status: 'active' },
  { id: 'stf_002', name: 'Deepak Admin', role: 'Facility Manager', specialty: 'Operations', phone: '+91 98000 66666', status: 'active' }
]

const smallReferrals = [
  { id: 'ref_001', referrer_name: 'Raj Kumar', referred_name: 'Arjun Singh', date: '2026-08-24', status: 'converted', bonus_reward: '1 Month Free' },
  { id: 'ref_002', referrer_name: 'Priya Patel', referred_name: 'Deepika Nair', date: '2026-08-26', status: 'pending', bonus_reward: '₹500 Voucher' },
  { id: 'ref_003', referrer_name: 'John Doe', referred_name: 'Mike Ross', date: '2026-05-10', status: 'converted', bonus_reward: '1 Month Free' },
  { id: 'ref_004', referrer_name: 'Sarah Chen', referred_name: 'Nisha Agarwal', date: '2026-06-01', status: 'converted', bonus_reward: 'Protein Shaker' }
]

const smallAtRisk = [
  { id: 'mem_010', member_name: 'Amit Verma', phone: '+91 98777 88899', days_inactive: 23, risk_score: 85, plan_name: 'Monthly Standard', expiry_date: '2026-08-08' },
  { id: 'mem_007', member_name: 'Emma Wilson', phone: '+91 98444 55566', days_inactive: 14, risk_score: 65, plan_name: 'Monthly Standard', expiry_date: '2026-08-20' },
  { id: 'mem_012', member_name: 'Sahil Khan', phone: '+91 98999 00011', days_inactive: 8, risk_score: 50, plan_name: 'Quarterly Standard', expiry_date: '2026-09-15' }
]

const smallRenewals = [
  { member_name: 'Emma Wilson', plan_name: 'Monthly Standard', days_until_expiry: -8, stage: 'lost_14d', phone: '+91 98444 55566', amount: 3500 },
  { member_name: 'Amit Verma', plan_name: 'Monthly Standard', days_until_expiry: -20, stage: 'lost_14d', phone: '+91 98777 88899', amount: 3500 },
  { member_name: 'Raj Kumar', plan_name: 'Monthly Standard', days_until_expiry: 2, stage: 'urgent_3d', phone: '+91 98555 66677', amount: 3500 },
  { member_name: 'Nisha Agarwal', plan_name: 'Quarterly Premium', days_until_expiry: 1, stage: 'urgent_3d', phone: '+91 98666 77788', amount: 9000 },
  { member_name: 'Pooja Bhatt', plan_name: 'Annual VIP', days_until_expiry: 12, stage: 'reminder_7d', phone: '+91 98888 99900', amount: 24000 }
]

const smallPayments = [
  { id: 'pay_001', member_name: 'Arjun Singh', member_id: 'mem_001', amount: 24000, date: '2026-08-24', method: 'UPI', status: 'paid', type: 'Annual VIP', invoice_number: 'INV-2026-001' },
  { id: 'pay_002', member_name: 'Karan Mehta', member_id: 'mem_002', amount: 9000, date: '2026-08-20', method: 'Card', status: 'paid', type: 'Quarterly Standard', invoice_number: 'INV-2026-002' },
  { id: 'pay_003', member_name: 'Sanjay Rao', member_id: 'mem_003', amount: 24000, date: '2026-08-18', method: 'UPI', status: 'paid', type: 'Annual VIP', invoice_number: 'INV-2026-003' },
  { id: 'pay_004', member_name: 'John Doe', member_id: 'mem_004', amount: 3500, date: '2026-08-15', method: 'Cash', status: 'paid', type: 'Monthly Premium', invoice_number: 'INV-2026-004' },
  { id: 'pay_005', member_name: 'Sarah Chen', member_id: 'mem_005', amount: 3500, date: '2026-08-01', method: 'UPI', status: 'paid', type: 'Monthly Premium', invoice_number: 'INV-2026-005' },
  { id: 'pay_006', member_name: 'Mike Ross', member_id: 'mem_006', amount: 9000, date: '2026-08-10', method: 'Card', status: 'paid', type: 'Quarterly Standard', invoice_number: 'INV-2026-006' },
  { id: 'pay_007', member_name: 'Raj Kumar', member_id: 'mem_008', amount: 3500, date: '2026-08-28', method: 'UPI', status: 'pending', type: 'Monthly Premium', invoice_number: 'INV-2026-007' },
  { id: 'pay_008', member_name: 'Nisha Agarwal', member_id: 'mem_009', amount: 9000, date: '2026-08-01', method: 'Cash', status: 'paid', type: 'Quarterly Premium', invoice_number: 'INV-2026-008' },
  { id: 'pay_009', member_name: 'Pooja Bhatt', member_id: 'mem_011', amount: 24000, date: '2026-08-05', method: 'Bank Transfer', status: 'paid', type: 'Annual VIP', invoice_number: 'INV-2026-009' },
  { id: 'pay_010', member_name: 'Sahil Khan', member_id: 'mem_012', amount: 9000, date: '2026-08-12', method: 'UPI', status: 'paid', type: 'Quarterly Standard', invoice_number: 'INV-2026-010' }
]

const smallRevenue = {
  summary: {
    revenue_this_month: 84000,
    revenue_last_month: 78500,
    growth_percent: 7,
    projected_annual: 1008000,
    expenses_this_month: 73000,
    net_profit: 11000,
    profit_margin: 13.1
  },
  by_plan: [
    { plan: 'Monthly Memberships', amount: 54000, percent: 64.3 },
    { plan: 'Quarterly Memberships', amount: 18000, percent: 21.4 },
    { plan: 'Annual VIP', amount: 12000, percent: 14.3 }
  ],
  by_method: [
    { method: 'UPI', amount: 35000, percent: 41.7 },
    { method: 'Cash', amount: 28000, percent: 33.3 },
    { method: 'Card', amount: 15000, percent: 17.9 },
    { method: 'Bank Transfer', amount: 6000, percent: 7.1 }
  ],
  monthly_chart: [
    { month: 'Mar', revenue: 62000, expenses: 58000 },
    { month: 'Apr', revenue: 68000, expenses: 61000 },
    { month: 'May', revenue: 72000, expenses: 64000 },
    { month: 'Jun', revenue: 75000, expenses: 68000 },
    { month: 'Jul', revenue: 78500, expenses: 71000 },
    { month: 'Aug', revenue: 84000, expenses: 73000 }
  ],
  expenses: [
    { id: 'exp_001', category: 'Rent', amount: 35000, date: '2026-08-01', description: 'Monthly gym rent', recurring: true },
    { id: 'exp_002', category: 'Salaries', amount: 23000, date: '2026-08-01', description: 'Trainer and staff salaries', recurring: true },
    { id: 'exp_003', category: 'Equipment', amount: 8000, date: '2026-08-15', description: 'New dumbbells and plates', recurring: false },
    { id: 'exp_004', category: 'Utilities', amount: 7000, date: '2026-08-05', description: 'Electricity & AC maintenance', recurring: true }
  ]
}

const smallWhatsApp = [
  { id: 'wa_001', recipient: 'Priya Patel', phone: '+91 98765 12345', message: 'Hi Priya, thanks for visiting PULSE Fitness! Here is your 3-day trial pass QR code.', sent_at: '2026-08-25T14:30:00Z', status: 'delivered' },
  { id: 'wa_002', recipient: 'Vikram Reddy', phone: '+91 98765 99988', message: 'Hello Vikram, saw you were interested in personal training. Would you like a free consultation tomorrow?', sent_at: '2026-08-23T11:15:00Z', status: 'read' }
]


// ==========================================
// LARGE DEMO DATASET (Established Gym 300+)
// ==========================================

function generateLargeData() {
  const firstNames = [
    'Aarav', 'Aditi', 'Akash', 'Ananya', 'Anish', 'Anjali', 'Arjun', 'Bhavya', 'Chirag', 'Dev',
    'Diya', 'Divya', 'Gaurav', 'Harsh', 'Ishaan', 'Isha', 'Kabir', 'Kavya', 'Krish', 'Manish',
    'Meera', 'Neha', 'Nikhil', 'Pooja', 'Pranav', 'Rohan', 'Riya', 'Siddharth', 'Simran', 'Tanvi',
    'Tarun', 'Utkarsh', 'Varun', 'Vidya', 'Yash', 'Zoya', 'Alex', 'Chris', 'David', 'Elena',
    'Hannah', 'Jessica', 'Kevin', 'Liam', 'Marcus', 'Natasha', 'Oliver', 'Rachel', 'Sam', 'Tina'
  ]
  const lastNames = [
    'Sharma', 'Verma', 'Patel', 'Reddy', 'Singh', 'Gupta', 'Iyer', 'Mehta', 'Nair', 'Jain',
    'Rao', 'Bose', 'Kapoor', 'Joshi', 'Malhotra', 'Agarwal', 'Khan', 'Deshmukh', 'Chawla', 'Kulkarni',
    'Chopra', 'Saxena', 'Bhatt', 'Trivedi', 'Pandey', 'Mishra', 'Roy', 'Sen', 'Dutta', 'Das',
    'Wilson', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia'
  ]
  const plans = ['Annual VIP', 'Quarterly Standard', 'Monthly Premium', 'Quarterly Premium', 'Monthly Standard']
  const sources = ['Instagram', 'Walk-in', 'Referral', 'Google Ads', 'Website']
  const interests = ['Weight Loss', 'Muscle Building', 'General Fitness', 'Yoga Classes', 'Strength Training']

  // 1. Generate 320 Members
  const members = []
  for (let i = 1; i <= 320; i++) {
    const fn = firstNames[(i * 3 + 7) % firstNames.length]
    const ln = lastNames[(i * 5 + 11) % lastNames.length]
    const name = `${fn} ${ln}`
    const id = `mem_${String(i).padStart(3, '0')}`
    const plan = plans[i % plans.length]
    const status = i % 14 === 0 ? 'expired' : i % 22 === 0 ? 'paused' : 'active'
    
    // Dates
    const month = (i % 12) + 1
    const joinYear = i > 150 ? 2025 : 2026
    const joinDate = `${joinYear}-${String(month).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`
    const expYear = plan.includes('Annual') ? joinYear + 1 : plan.includes('Quarterly') ? joinYear + (month > 9 ? 1 : 0) : joinYear
    const expMonth = plan.includes('Annual') ? month : plan.includes('Quarterly') ? ((month + 2) % 12) + 1 : ((month % 12) + 1)
    const expDate = `${expYear}-${String(expMonth).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`

    const phone = `+91 ${98000 + (i % 900)} ${10000 + (i * 13) % 90000}`
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@gmail.com`
    const trainer_id = i % 4 === 0 ? `trn_00${(i % 3) + 1}` : null

    members.push({
      id,
      name,
      email,
      phone,
      membership_type: plan,
      plan,
      status,
      join_date: joinDate,
      expiry_date: expDate,
      attendance_count: Math.floor(10 + (i * 7) % 140),
      last_checkin: `2026-08-${String(28 - (i % 10)).padStart(2, '0')}T07:15:00Z`,
      last_visit: `2026-08-${String(28 - (i % 10)).padStart(2, '0')}T07:15:00Z`,
      qr_code: `MBR-${fn.substring(0, 3).toUpperCase()}-${String(i).padStart(3, '0')}`,
      trainer_id,
      notes: i % 10 === 0 ? 'High intent member' : '',
      emergency_contact: phone
    })
  }

  // 2. Generate 65 Payments
  const payments = []
  for (let i = 1; i <= 65; i++) {
    const mem = members[(i * 4) % members.length]
    const amount = mem.plan.includes('Annual') ? 24000 : mem.plan.includes('Quarterly') ? 9000 : 3500
    const method = i % 3 === 0 ? 'UPI' : i % 3 === 1 ? 'Card' : i % 5 === 0 ? 'Bank Transfer' : 'Cash'
    const status = i % 12 === 0 ? 'pending' : 'paid'
    const day = (i % 28) + 1

    payments.push({
      id: `pay_${String(i).padStart(3, '0')}`,
      member_name: mem.name,
      member_id: mem.id,
      amount,
      date: `2026-08-${String(day).padStart(2, '0')}`,
      method,
      status,
      type: mem.plan,
      invoice_number: `INV-2026-${String(i).padStart(3, '0')}`
    })
  }

  // 3. Generate 60 Leads
  const leads = []
  for (let i = 1; i <= 60; i++) {
    const fn = firstNames[(i * 2 + 3) % firstNames.length]
    const ln = lastNames[(i * 4 + 5) % lastNames.length]
    const status = i % 5 === 0 ? 'won' : i % 7 === 0 ? 'lost' : i % 3 === 0 ? 'follow_up' : 'new'
    const source = sources[i % sources.length]
    const interest = interests[i % interests.length]

    leads.push({
      id: `lead_${String(i).padStart(3, '0')}`,
      name: `${fn} ${ln}`,
      phone: `+91 ${91000 + (i % 800)} ${20000 + (i * 17) % 80000}`,
      email: `${fn.toLowerCase()}${i}@email.com`,
      source,
      status,
      interest,
      value: interest.includes('Muscle') || interest.includes('Strength') ? 9000 : 3500,
      created_date: `2026-08-${String((i % 25) + 1).padStart(2, '0')}T10:00:00Z`,
      notes: `Interested in ${interest} packages`,
      converted_to_member_id: status === 'won' ? `mem_${String(i).padStart(3, '0')}` : null,
      lost_reason: status === 'lost' ? 'Price considerations' : null
    })
  }

  // 4. Generate 30 Trials
  const trials = []
  for (let i = 1; i <= 30; i++) {
    const lead = leads[i % leads.length]
    trials.push({
      id: `trial_${String(i).padStart(3, '0')}`,
      lead_id: lead.id,
      lead_name: lead.name,
      phone: lead.phone,
      preferred_visit_time: i % 2 === 0 ? 'morning' : 'evening',
      status: i % 3 === 0 ? 'used' : i % 5 === 0 ? 'expired' : 'active',
      created_date: `2026-08-${String((i % 20) + 1).padStart(2, '0')}`,
      expiry_date: `2026-08-${String((i % 20) + 4).padStart(2, '0')}`,
      check_in_time: i % 3 === 0 ? `2026-08-${String((i % 20) + 2).padStart(2, '0')}T08:00:00Z` : null,
      qr_token: `TRL-LG-${String(i).padStart(3, '0')}`
    })
  }

  // 5. Generate Check-Ins
  const checkIns = []
  for (let i = 1; i <= 50; i++) {
    const mem = members[i % members.length]
    checkIns.push({
      id: `cin_${String(i).padStart(3, '0')}`,
      member_id: mem.id,
      member_name: mem.name,
      check_in_time: `2026-08-${String(28 - (i % 7)).padStart(2, '0')}T${String((i % 12) + 6).padStart(2, '0')}:15:00Z`,
      duration_minutes: 45 + (i * 5) % 60,
      entry_method: i % 4 === 0 ? 'Manual' : 'QR Scan'
    })
  }

  // 6. Generate 15 Classes
  const classes = [
    { id: 'cls_001', name: 'Morning HIIT Blast A', category: 'HIIT', trainer_name: 'Vikram Strength', schedule_time: '06:00 AM', day_of_week: 'Monday', capacity: 30, enrolled_count: 28, duration: '45 mins' },
    { id: 'cls_002', name: 'Morning HIIT Blast B', category: 'HIIT', trainer_name: 'Vikram Strength', schedule_time: '07:15 AM', day_of_week: 'Monday', capacity: 30, enrolled_count: 30, duration: '45 mins' },
    { id: 'cls_003', name: 'Power Yoga & Breathwork', category: 'Yoga', trainer_name: 'Priya Yoga', schedule_time: '08:00 AM', day_of_week: 'Tuesday', capacity: 25, enrolled_count: 24, duration: '60 mins' },
    { id: 'cls_004', name: 'Spin & Cardio Inferno', category: 'Spin', trainer_name: 'Ananya Dance', schedule_time: '06:00 PM', day_of_week: 'Tuesday', capacity: 20, enrolled_count: 20, duration: '45 mins' },
    { id: 'cls_005', name: 'Heavy Barbell Strength', category: 'Strength', trainer_name: 'Karan Crossfit', schedule_time: '07:00 PM', day_of_week: 'Wednesday', capacity: 25, enrolled_count: 22, duration: '60 mins' },
    { id: 'cls_006', name: 'CrossFit WOD Pro', category: 'CrossFit', trainer_name: 'Karan Crossfit', schedule_time: '06:30 AM', day_of_week: 'Thursday', capacity: 20, enrolled_count: 19, duration: '60 mins' },
    { id: 'cls_007', name: 'Zumba High Energy', category: 'Dance', trainer_name: 'Ananya Dance', schedule_time: '07:00 PM', day_of_week: 'Thursday', capacity: 35, enrolled_count: 35, duration: '60 mins' },
    { id: 'cls_008', name: 'Pilates Core Sculpt', category: 'Pilates', trainer_name: 'Priya Yoga', schedule_time: '08:30 AM', day_of_week: 'Friday', capacity: 20, enrolled_count: 18, duration: '50 mins' },
    { id: 'cls_009', name: 'Boxing & Functional', category: 'Boxing', trainer_name: 'Vikram Strength', schedule_time: '06:00 PM', day_of_week: 'Friday', capacity: 25, enrolled_count: 23, duration: '60 mins' },
    { id: 'cls_010', name: 'Weekend Warrior Bootcamp', category: 'Bootcamp', trainer_name: 'Karan Crossfit', schedule_time: '08:00 AM', day_of_week: 'Saturday', capacity: 40, enrolled_count: 38, duration: '75 mins' }
  ]

  // 7. Generate Staff
  const staff = [
    { id: 'trn_001', name: 'Vikram Strength', role: 'Head Trainer', specialty: 'Strength & Conditioning', phone: '+91 98000 11111', status: 'active' },
    { id: 'trn_002', name: 'Priya Yoga', role: 'Senior Yoga Master', specialty: 'Power Yoga & Pilates', phone: '+91 98000 22222', status: 'active' },
    { id: 'trn_003', name: 'Ananya Dance', role: 'Group Fitness Director', specialty: 'Zumba & Spin', phone: '+91 98000 33333', status: 'active' },
    { id: 'trn_004', name: 'Karan Crossfit', role: 'CrossFit Lead Coach', specialty: 'Functional Movement', phone: '+91 98000 44444', status: 'active' },
    { id: 'trn_005', name: 'Rajesh Bodybuilding', role: 'Personal Trainer', specialty: 'Hypertrophy & Prep', phone: '+91 98000 77777', status: 'active' },
    { id: 'trn_006', name: 'Sneha Rehab', role: 'Physiotherapist & Trainer', specialty: 'Injury Rehab', phone: '+91 98000 88888', status: 'active' },
    { id: 'stf_001', name: 'Rahul Reception', role: 'Front Desk Lead', specialty: 'Member Services', phone: '+91 98000 55555', status: 'active' },
    { id: 'stf_002', name: 'Deepak Admin', role: 'Operations Manager', specialty: 'Gym Maintenance & Facilities', phone: '+91 98000 66666', status: 'active' },
    { id: 'stf_003', name: 'Megha Accounts', role: 'Accountant', specialty: 'Billing & Invoicing', phone: '+91 98000 99999', status: 'active' }
  ]

  // 8. Generate Referrals
  const referrals = []
  for (let i = 1; i <= 25; i++) {
    const referrer = members[i % members.length]
    const referred = members[(i + 15) % members.length]
    referrals.push({
      id: `ref_${String(i).padStart(3, '0')}`,
      referrer_name: referrer.name,
      referred_name: referred.name,
      date: `2026-08-${String((i % 25) + 1).padStart(2, '0')}`,
      status: i % 4 === 0 ? 'pending' : 'converted',
      bonus_reward: i % 2 === 0 ? '1 Month Free Extension' : '₹1000 PT Coupon'
    })
  }

  // 9. Generate At Risk
  const atRisk = []
  for (let i = 1; i <= 18; i++) {
    const mem = members[i * 7 % members.length]
    atRisk.push({
      id: mem.id,
      member_name: mem.name,
      phone: mem.phone,
      days_inactive: 10 + (i * 3) % 25,
      risk_score: 55 + (i * 2) % 40,
      plan_name: mem.plan,
      expiry_date: mem.expiry_date
    })
  }

  // 10. Generate Renewals
  const renewals = []
  for (let i = 1; i <= 25; i++) {
    const mem = members[i * 9 % members.length]
    const days = (i % 5 === 0) ? -12 : (i % 4 === 0) ? -2 : (i % 3 === 0) ? 2 : 6
    const stage = days <= -7 ? 'lost_14d' : days < 0 ? 'winback_7d' : days <= 3 ? 'urgent_3d' : 'reminder_7d'
    renewals.push({
      member_name: mem.name,
      plan_name: mem.plan,
      days_until_expiry: days,
      stage,
      phone: mem.phone,
      amount: mem.plan.includes('Annual') ? 24000 : mem.plan.includes('Quarterly') ? 9000 : 3500
    })
  }

  // 11. Dashboard Data for Large Scale
  const dashboardData = {
    success: true,
    metrics: {
      total_leads: 340,
      new_leads: 42,
      trial_passes_active: 38,
      trial_visitors_checked_in: 24,
      pending_followups: 56,
      active_memberships: 312,
      expiring_memberships: 28,
      at_risk_members: 18,
      today_attendance: 142,
      pending_referrals: 22
    },
    recent_leads: leads.slice(0, 10),
    recent_check_ins: checkIns.slice(0, 10),
    recent_checkins: checkIns.slice(0, 10),
    pending_followup_tasks: [
      { id: 'task_001', entity_name: 'Aarav Sharma', task_type: 'Phone Call', due_date: '2026-08-28T18:00:00Z', priority: 'high' },
      { id: 'task_002', entity_name: 'Aditi Verma', task_type: 'WhatsApp Message', due_date: '2026-08-29T12:00:00Z', priority: 'medium' },
      { id: 'task_003', entity_name: 'Akash Patel', task_type: 'Tour Booking', due_date: '2026-08-28T16:00:00Z', priority: 'high' },
      { id: 'task_004', entity_name: 'Ananya Reddy', task_type: 'Phone Call', due_date: '2026-08-29T10:00:00Z', priority: 'low' },
      { id: 'task_005', entity_name: 'Anish Singh', task_type: 'Follow-up Email', due_date: '2026-08-30T14:00:00Z', priority: 'medium' }
    ],
    expiring_memberships: renewals.slice(0, 10).map((r, idx) => ({
      id: `exp_${idx}`,
      member_name: r.member_name,
      plan_name: r.plan_name,
      expiry_date: '2026-09-05'
    }))
  }

  // 12. Revenue Data for Large Scale
  const revenue = {
    summary: {
      revenue_this_month: 890000,
      revenue_last_month: 820000,
      growth_percent: 8.5,
      projected_annual: 10680000,
      expenses_this_month: 520000,
      net_profit: 370000,
      profit_margin: 41.5
    },
    by_plan: [
      { plan: 'Monthly Memberships', amount: 450000, percent: 50.6 },
      { plan: 'Quarterly Memberships', amount: 260000, percent: 29.2 },
      { plan: 'Annual VIP', amount: 180000, percent: 20.2 }
    ],
    by_method: [
      { method: 'UPI', amount: 410000, percent: 46.1 },
      { method: 'Card', amount: 240000, percent: 27.0 },
      { method: 'Cash', amount: 160000, percent: 18.0 },
      { method: 'Bank Transfer', amount: 80000, percent: 8.9 }
    ],
    monthly_chart: [
      { month: 'Mar', revenue: 620000, expenses: 420000 },
      { month: 'Apr', revenue: 680000, expenses: 440000 },
      { month: 'May', revenue: 740000, expenses: 460000 },
      { month: 'Jun', revenue: 790000, expenses: 480000 },
      { month: 'Jul', revenue: 820000, expenses: 500000 },
      { month: 'Aug', revenue: 890000, expenses: 520000 }
    ],
    expenses: [
      { id: 'exp_001', category: 'Rent', amount: 180000, date: '2026-08-01', description: 'Commercial Gym Hall Rent (10,000 sq ft)', recurring: true },
      { id: 'exp_002', category: 'Salaries', amount: 220000, date: '2026-08-01', description: 'Trainers, Admin & Cleaning Staff Payroll', recurring: true },
      { id: 'exp_003', category: 'Equipment & Maintenance', amount: 65000, date: '2026-08-15', description: 'Treadmill Motors & Cable Machine Cable Upgrades', recurring: false },
      { id: 'exp_004', category: 'Utilities & AC', amount: 55000, date: '2026-08-05', description: 'Commercial Electricity & Central AC Chiller Service', recurring: true }
    ]
  }

  const memberships = members.map(m => ({
    id: 'ms_' + m.id,
    member_id: m.id,
    member_name: m.name,
    plan_name: m.membership_type,
    status: m.status,
    amount: m.membership_type.includes('Annual') ? 24000 : m.membership_type.includes('Quarterly') ? 9000 : 3500,
    expiry_date: m.expiry_date,
    created_date: m.join_date
  }))

  return {
    dashboardData,
    leads,
    trials,
    members,
    memberships,
    checkIns,
    classes,
    staff,
    referrals,
    atRisk,
    renewals,
    payments,
    revenue,
    whatsApp: smallWhatsApp
  }
}

const largeDemoData = generateLargeData()

// ==========================================
// EXPORT SCALED DATA ACCESS
// ==========================================

export function getDemoDataForScale(scale: 'small' | 'large') {
  if (scale === 'large') {
    return largeDemoData
  }
  return {
    dashboardData: smallDashboardData,
    leads: smallLeads,
    trials: smallTrials,
    members: smallMembers,
    memberships: smallMemberships,
    checkIns: smallCheckIns,
    classes: smallClasses,
    staff: smallStaff,
    referrals: smallReferrals,
    atRisk: smallAtRisk,
    renewals: smallRenewals,
    payments: smallPayments,
    revenue: smallRevenue,
    whatsApp: smallWhatsApp
  }
}

// Active dataset based on localStorage scale
const activeScale = getDemoScale()
const activeData = getDemoDataForScale(activeScale)

export const demoDashboardData = activeData.dashboardData
export const demoLeads = activeData.leads
export const demoTrials = activeData.trials
export const demoMembers = activeData.members
export const demoMemberships = activeData.memberships
export const demoCheckIns = activeData.checkIns
export const demoClasses = activeData.classes
export const demoStaff = activeData.staff
export const demoReferrals = activeData.referrals
export const demoAtRisk = activeData.atRisk
export const demoRenewals = activeData.renewals
export const demoPayments = activeData.payments
export const demoRevenue = activeData.revenue
export const demoWhatsApp = activeData.whatsApp
