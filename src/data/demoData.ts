export const DEMO_MODE = true

export const demoUser = {
  id: 'demo-user-001',
  name: 'Gym Admin',
  email: 'demo@oxigen.fitness',
  role: 'admin',
  gym_id: 'gym_oxigen',
  gym_name: 'Oxigen Fitness'
}

export const demoDashboardData = {
  success: true,
  metrics: {
    total_leads: 47,
    new_leads: 12,
    trial_passes_active: 8,
    trial_visitors_checked_in: 5,
    pending_followups: 14,
    active_memberships: 156,
    expiring_memberships: 12,
    at_risk_members: 7,
    today_attendance: 43,
    pending_referrals: 3
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

export const demoLeads = [
  // 15 leads with varied statuses: new, follow_up, won, lost
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

export const demoTrials = [
  { id: 'trial_001', lead_name: 'Rahul Sharma', lead_id: 'lead_001', phone: '+91 98765 43210', qr_token: 'TRIAL-RSL-001', status: 'active', created_date: '2026-08-26T10:30:00Z', expiry_date: '2026-08-29', preferred_visit_time: 'Morning 7 AM', checked_in: false },
  { id: 'trial_002', lead_name: 'Sneha Gupta', lead_id: 'lead_004', phone: '+91 90011 22334', qr_token: 'TRIAL-SGP-004', status: 'active', created_date: '2026-08-26T16:45:00Z', expiry_date: '2026-08-29', preferred_visit_time: 'Evening 6 PM', checked_in: false },
  { id: 'trial_003', lead_name: 'Deepika Nair', lead_id: 'lead_008', phone: '+91 89012 34567', qr_token: 'TRIAL-DNR-008', status: 'active', created_date: '2026-08-26T08:00:00Z', expiry_date: '2026-08-29', preferred_visit_time: 'Morning 6 AM', checked_in: false },
  { id: 'trial_004', lead_name: 'Aditya Kapoor', lead_id: 'lead_011', phone: '+91 91234 56789', qr_token: 'TRIAL-AKP-011', status: 'active', created_date: '2026-08-27T09:00:00Z', expiry_date: '2026-08-30', preferred_visit_time: 'Evening 7 PM', checked_in: false },
  { id: 'trial_005', lead_name: 'Priya Patel', lead_id: 'lead_002', phone: '+91 98765 12345', qr_token: 'TRIAL-PPT-002', status: 'used', created_date: '2026-08-25T14:20:00Z', expiry_date: '2026-08-28', preferred_visit_time: 'Morning 8 AM', checked_in: true, check_in_time: '2026-08-27T08:15:00Z' },
  { id: 'trial_006', lead_name: 'Vikram Reddy', lead_id: 'lead_005', phone: '+91 98765 99988', qr_token: 'TRIAL-VRD-005', status: 'used', created_date: '2026-08-23T11:00:00Z', expiry_date: '2026-08-26', preferred_visit_time: 'Evening 5 PM', checked_in: true, check_in_time: '2026-08-25T17:30:00Z' },
  { id: 'trial_007', lead_name: 'Ananya Iyer', lead_id: 'lead_006', phone: '+91 87654 32109', qr_token: 'TRIAL-AYR-006', status: 'expired', created_date: '2026-08-22T13:00:00Z', expiry_date: '2026-08-25', preferred_visit_time: 'Morning 7 AM', checked_in: false },
  { id: 'trial_008', lead_name: 'Tanya Malhotra', lead_id: 'lead_014', phone: '+91 98765 11223', qr_token: 'TRIAL-TMH-014', status: 'active', created_date: '2026-08-27T14:00:00Z', expiry_date: '2026-08-30', preferred_visit_time: 'Evening 6 PM', checked_in: false }
]

export const demoMembers = [
  { id: 'mem_001', name: 'Arjun Singh', email: 'arjun@email.com', phone: '+91 99887 76655', membership_type: 'Annual VIP', status: 'active', join_date: '2026-08-24', expiry_date: '2027-08-24', attendance_count: 42, last_checkin: '2026-08-28T06:30:00Z', qr_code: 'MBR-AJS-001', trainer_id: 'trn_001', notes: '', emergency_contact: '+91 99887 11111' },
  { id: 'mem_002', name: 'Karan Mehta', email: 'karan@email.com', phone: '+91 70123 45678', membership_type: 'Quarterly Standard', status: 'active', join_date: '2026-08-20', expiry_date: '2026-11-20', attendance_count: 12, last_checkin: '2026-08-28T07:15:00Z', qr_code: 'MBR-KMH-002', trainer_id: 'trn_002', notes: '', emergency_contact: '+91 70123 22222' },
  { id: 'mem_003', name: 'Sanjay Rao', email: 'sanjay@email.com', phone: '+91 90011 88776', membership_type: 'Annual VIP', status: 'active', join_date: '2026-08-18', expiry_date: '2027-08-18', attendance_count: 28, last_checkin: '2026-08-27T19:30:00Z', qr_code: 'MBR-SRO-003', trainer_id: 'trn_001', notes: '', emergency_contact: '+91 90011 33333' },
  { id: 'mem_004', name: 'John Doe', email: 'john@email.com', phone: '+91 98111 22233', membership_type: 'Monthly Premium', status: 'active', join_date: '2026-06-15', expiry_date: '2026-09-15', attendance_count: 56, last_checkin: '2026-08-28T07:15:00Z', qr_code: 'MBR-JDE-004', trainer_id: 'trn_002', notes: 'Regular morning attendee', emergency_contact: '+91 98111 44444' },
  { id: 'mem_005', name: 'Sarah Chen', email: 'sarah@email.com', phone: '+91 98222 33445', membership_type: 'Monthly Premium', status: 'active', join_date: '2026-07-01', expiry_date: '2026-09-01', attendance_count: 38, last_checkin: '2026-08-28T06:45:00Z', qr_code: 'MBR-SCH-005', trainer_id: 'trn_003', notes: '', emergency_contact: '+91 98222 55555' },
  { id: 'mem_006', name: 'Mike Ross', email: 'mike@email.com', phone: '+91 98333 44556', membership_type: 'Quarterly Standard', status: 'active', join_date: '2026-07-10', expiry_date: '2026-10-10', attendance_count: 31, last_checkin: '2026-08-28T06:30:00Z', qr_code: 'MBR-MRS-006', trainer_id: 'trn_001', notes: '', emergency_contact: '+91 98333 66666' },
  { id: 'mem_007', name: 'Emma Wilson', email: 'emma@email.com', phone: '+91 98444 55667', membership_type: 'Monthly Basic', status: 'active', join_date: '2026-08-01', expiry_date: '2026-09-01', attendance_count: 18, last_checkin: '2026-08-28T05:45:00Z', qr_code: 'MBR-EWL-007', trainer_id: 'trn_003', notes: '', emergency_contact: '+91 98444 77777' },
  { id: 'mem_008', name: 'Alex Turner', email: 'alex@email.com', phone: '+91 98555 66778', membership_type: 'Annual VIP', status: 'active', join_date: '2026-05-20', expiry_date: '2027-05-20', attendance_count: 89, last_checkin: '2026-08-27T19:30:00Z', qr_code: 'MBR-ATR-008', trainer_id: 'trn_002', notes: 'Top attendee', emergency_contact: '+91 98555 88888' },
  { id: 'mem_009', name: 'Raj Kumar', email: 'raj@email.com', phone: '+91 98666 77889', membership_type: 'Monthly Premium', status: 'expiring', join_date: '2026-05-28', expiry_date: '2026-08-30', attendance_count: 45, last_checkin: '2026-08-26T07:00:00Z', qr_code: 'MBR-RKM-009', trainer_id: 'trn_001', notes: 'Renewal due soon', emergency_contact: '+91 98666 99999' },
  { id: 'mem_010', name: 'Nisha Agarwal', email: 'nisha@email.com', phone: '+91 98777 88990', membership_type: 'Monthly Basic', status: 'expired', join_date: '2026-05-01', expiry_date: '2026-08-01', attendance_count: 22, last_checkin: '2026-08-10T18:00:00Z', qr_code: 'MBR-NAG-010', trainer_id: 'trn_003', notes: 'Needs win-back', emergency_contact: '+91 98777 00000' }
]

export const demoMemberships = [
  { id: 'plan_001', name: 'Monthly Basic', price: 2500, duration_months: 1, features: 'Gym access, QR check-in', active_members: 34, status: 'active' },
  { id: 'plan_002', name: 'Monthly Premium', price: 3500, duration_months: 1, features: 'Gym access, QR check-in, 4 classes/month, 1 PT session', active_members: 67, status: 'active' },
  { id: 'plan_003', name: 'Quarterly Standard', price: 9000, duration_months: 3, features: 'Gym access, QR check-in, unlimited classes', active_members: 28, status: 'active' },
  { id: 'plan_004', name: 'Annual VIP', price: 24000, duration_months: 12, features: 'Everything + unlimited PT, nutrition plan, guest passes', active_members: 27, status: 'active' }
]

export const demoCheckIns = [
  { id: 'cin_001', member_name: 'John Doe', member_id: 'mem_004', check_in_time: '2026-08-28T07:15:00Z', check_out_time: '2026-08-28T08:30:00Z', duration_minutes: 75, entry_method: 'qr_scan' },
  { id: 'cin_002', member_name: 'Sarah Chen', member_id: 'mem_005', check_in_time: '2026-08-28T06:45:00Z', check_out_time: '2026-08-28T07:45:00Z', duration_minutes: 60, entry_method: 'qr_scan' },
  { id: 'cin_003', member_name: 'Mike Ross', member_id: 'mem_006', check_in_time: '2026-08-28T06:30:00Z', check_out_time: '2026-08-28T08:00:00Z', duration_minutes: 90, entry_method: 'qr_scan' },
  { id: 'cin_004', member_name: 'Emma Wilson', member_id: 'mem_007', check_in_time: '2026-08-28T05:45:00Z', check_out_time: '2026-08-28T06:30:00Z', duration_minutes: 45, entry_method: 'qr_scan' },
  { id: 'cin_005', member_name: 'Alex Turner', member_id: 'mem_008', check_in_time: '2026-08-27T19:30:00Z', check_out_time: '2026-08-27T21:30:00Z', duration_minutes: 120, entry_method: 'qr_scan' },
  { id: 'cin_006', member_name: 'Arjun Singh', member_id: 'mem_001', check_in_time: '2026-08-28T06:30:00Z', check_out_time: null, duration_minutes: null, entry_method: 'qr_scan' },
  { id: 'cin_007', member_name: 'Karan Mehta', member_id: 'mem_002', check_in_time: '2026-08-28T07:15:00Z', check_out_time: null, duration_minutes: null, entry_method: 'qr_scan' },
  { id: 'cin_008', member_name: 'Sanjay Rao', member_id: 'mem_003', check_in_time: '2026-08-27T19:30:00Z', check_out_time: '2026-08-27T21:00:00Z', duration_minutes: 90, entry_method: 'qr_scan' },
  { id: 'cin_009', member_name: 'Raj Kumar', member_id: 'mem_009', check_in_time: '2026-08-26T07:00:00Z', check_out_time: '2026-08-26T08:15:00Z', duration_minutes: 75, entry_method: 'qr_scan' },
  { id: 'cin_010', member_name: 'Emma Wilson', member_id: 'mem_007', check_in_time: '2026-08-27T05:45:00Z', check_out_time: '2026-08-27T06:30:00Z', duration_minutes: 45, entry_method: 'qr_scan' }
]

export const demoClasses = [
  { id: 'cls_001', name: 'HIIT Blast', day: 'Mon', time: '07:00', trainer_name: 'Coach Vikas', trainer_id: 'trn_001', capacity: 20, enrolled: 18, spots_left: 2, intensity: 'High' },
  { id: 'cls_002', name: 'Yoga Flow', day: 'Tue', time: '08:00', trainer_name: 'Coach Anjali', trainer_id: 'trn_003', capacity: 15, enrolled: 12, spots_left: 3, intensity: 'Low' },
  { id: 'cls_003', name: 'Boxing Fundamentals', day: 'Wed', time: '18:00', trainer_name: 'Coach Vikas', trainer_id: 'trn_001', capacity: 12, enrolled: 12, spots_left: 0, intensity: 'High' },
  { id: 'cls_004', name: 'Strength & Power', day: 'Thu', time: '07:00', trainer_name: 'Coach Rajesh', trainer_id: 'trn_002', capacity: 16, enrolled: 10, spots_left: 6, intensity: 'High' },
  { id: 'cls_005', name: 'Zumba Dance', day: 'Fri', time: '18:00', trainer_name: 'Coach Anjali', trainer_id: 'trn_003', capacity: 25, enrolled: 20, spots_left: 5, intensity: 'Medium' },
  { id: 'cls_006', name: 'CrossFit WOD', day: 'Sat', time: '09:00', trainer_name: 'Coach Rajesh', trainer_id: 'trn_002', capacity: 15, enrolled: 14, spots_left: 1, intensity: 'High' }
]

export const demoStaff = [
  { id: 'trn_001', name: 'Coach Vikas', email: 'vikas@oxigen.fitness', phone: '+91 90000 11111', role: 'Senior Trainer', specialties: 'HIIT, Boxing, Strength', rating: 4.8, members_count: 42, classes_count: 8, status: 'active', monthly_salary: 35000, revenue_generated: 145000 },
  { id: 'trn_002', name: 'Coach Rajesh', email: 'rajesh@oxigen.fitness', phone: '+91 90000 22222', role: 'Trainer', specialties: 'Strength, CrossFit, Powerlifting', rating: 4.6, members_count: 35, classes_count: 6, status: 'active', monthly_salary: 28000, revenue_generated: 98000 },
  { id: 'trn_003', name: 'Coach Anjali', email: 'anjali@oxigen.fitness', phone: '+91 90000 33333', role: 'Trainer', specialties: 'Yoga, Zumba, Flexibility', rating: 4.9, members_count: 38, classes_count: 7, status: 'active', monthly_salary: 30000, revenue_generated: 133000 }
]

export const demoReferrals = [
  { id: 'ref_001', referrer_name: 'Raj Kumar', referrer_id: 'mem_009', referred_name: 'Arjun Singh', referred_id: 'mem_001', status: 'converted', date: '2026-08-24', reward: '1 month free' },
  { id: 'ref_002', referrer_name: 'Priya Patel', referrer_id: 'lead_002', referred_name: 'Deepika Nair', referred_id: 'lead_008', status: 'pending', date: '2026-08-26', reward: '15% discount' },
  { id: 'ref_003', referrer_name: 'Alex Turner', referrer_id: 'mem_008', referred_name: 'Nikhil Jain', referred_id: 'lead_015', status: 'lost', date: '2026-08-10', reward: '1 month free' }
]

export const demoAtRisk = [
  { id: 'risk_001', member_name: 'Nisha Agarwal', member_id: 'mem_010', days_absent: 18, last_checkin: '2026-08-10', risk_level: 'critical', action: 'Call immediately', membership_status: 'expired' },
  { id: 'risk_002', member_name: 'Raj Kumar', member_id: 'mem_009', days_absent: 2, last_checkin: '2026-08-26', risk_level: 'medium', action: 'Send WhatsApp reminder', membership_status: 'expiring' },
  { id: 'risk_003', member_name: 'Emma Wilson', member_id: 'mem_007', days_absent: 1, last_checkin: '2026-08-28', risk_level: 'low', action: 'Monitor', membership_status: 'active' }
]

export const demoRenewals = [
  { id: 'ren_001', member_name: 'Raj Kumar', member_id: 'mem_009', membership_type: 'Monthly Premium', expiry_date: '2026-08-30', amount: 3500, status: 'pending', days_left: 2 },
  { id: 'ren_002', member_name: 'Nisha Agarwal', member_id: 'mem_010', membership_type: 'Monthly Basic', expiry_date: '2026-08-01', amount: 2500, status: 'overdue', days_left: -27 },
  { id: 'ren_003', member_name: 'Sarah Chen', member_id: 'mem_005', membership_type: 'Monthly Premium', expiry_date: '2026-09-01', amount: 3500, status: 'upcoming', days_left: 4 },
  { id: 'ren_004', member_name: 'Emma Wilson', member_id: 'mem_007', membership_type: 'Monthly Basic', expiry_date: '2026-09-01', amount: 2500, status: 'upcoming', days_left: 4 }
]

export const demoPayments = [
  { id: 'pay_001', member_name: 'Arjun Singh', member_id: 'mem_001', amount: 24000, date: '2026-08-24', method: 'UPI', status: 'paid', type: 'Annual VIP', invoice_number: 'INV-2026-001' },
  { id: 'pay_002', member_name: 'Karan Mehta', member_id: 'mem_002', amount: 9000, date: '2026-08-20', method: 'Card', status: 'paid', type: 'Quarterly Standard', invoice_number: 'INV-2026-002' },
  { id: 'pay_003', member_name: 'Sanjay Rao', member_id: 'mem_003', amount: 24000, date: '2026-08-18', method: 'UPI', status: 'paid', type: 'Annual VIP', invoice_number: 'INV-2026-003' },
  { id: 'pay_004', member_name: 'John Doe', member_id: 'mem_004', amount: 3500, date: '2026-08-15', method: 'Cash', status: 'paid', type: 'Monthly Premium', invoice_number: 'INV-2026-004' },
  { id: 'pay_005', member_name: 'Sarah Chen', member_id: 'mem_005', amount: 3500, date: '2026-08-01', method: 'UPI', status: 'paid', type: 'Monthly Premium', invoice_number: 'INV-2026-005' },
  { id: 'pay_006', member_name: 'Mike Ross', member_id: 'mem_006', amount: 9000, date: '2026-08-10', method: 'Card', status: 'paid', type: 'Quarterly Standard', invoice_number: 'INV-2026-006' },
  { id: 'pay_007', member_name: 'Raj Kumar', member_id: 'mem_009', amount: 3500, date: '2026-08-28', method: 'UPI', status: 'pending', type: 'Monthly Premium', invoice_number: 'INV-2026-007' },
  { id: 'pay_008', member_name: 'Nisha Agarwal', member_id: 'mem_010', amount: 2500, date: '2026-08-01', method: 'Cash', status: 'overdue', type: 'Monthly Basic', invoice_number: 'INV-2026-008' },
  { id: 'pay_009', member_name: 'Emma Wilson', member_id: 'mem_007', amount: 2500, date: '2026-08-01', method: 'UPI', status: 'paid', type: 'Monthly Basic', invoice_number: 'INV-2026-009' },
  { id: 'pay_010', member_name: 'Alex Turner', member_id: 'mem_008', amount: 24000, date: '2026-05-20', method: 'Bank Transfer', status: 'paid', type: 'Annual VIP', invoice_number: 'INV-2026-010' }
]

export const demoRevenue = {
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
    { id: 'exp_002', category: 'Salaries', amount: 93000, date: '2026-08-01', description: 'Trainer and staff salaries', recurring: true },
    { id: 'exp_003', category: 'Equipment', amount: 15000, date: '2026-08-15', description: 'New dumbbells and plates', recurring: false },
    { id: 'exp_004', category: 'Utilities', amount: 12000, date: '2026-08-01', description: 'Electricity and water', recurring: true },
    { id: 'exp_005', category: 'Marketing', amount: 8000, date: '2026-08-10', description: 'Instagram and Google ads', recurring: false },
    { id: 'exp_006', category: 'Maintenance', amount: 5000, date: '2026-08-20', description: 'AC service and repairs', recurring: false }
  ]
}

export const demoWhatsApp = {
  stats: {
    messages_sent: 1247,
    delivery_rate: 98.4,
    automations_active: 7,
    pending_queued: 12
  },
  templates: [
    { id: 'tpl_001', name: 'Welcome New Member', active: true, body: 'Welcome to {gym_name}, {member_name}! Your fitness journey begins today. Pass ID: {member_id}. See you on the floor!' },
    { id: 'tpl_002', name: 'Renewal Reminder', active: true, body: 'Hi {member_name}, your membership at {gym_name} expires on {expiry_date}. Renew today to keep your streak going!' },
    { id: 'tpl_003', name: 'Birthday Wish', active: true, body: 'Happy Birthday {member_name}! {gym_name} wishes you a power-packed year ahead. Enjoy a complimentary smoothie on us today!' },
    { id: 'tpl_004', name: 'Payment Confirmation', active: true, body: 'Hi {member_name}, thank you! We received your payment of {amount} for {plan_name}. Invoice: {invoice_no}.' },
    { id: 'tpl_005', name: 'Win-back Inactive', active: true, body: 'Hi {member_name}, we miss you at {gym_name}! It has been {days} days since your last visit. Come back this week for a free PT session!' },
    { id: 'tpl_006', name: 'Class Reminder', active: true, body: 'Reminder: {class_name} starts at {class_time} tomorrow with {trainer_name}. See you there!' },
    { id: 'tpl_007', name: 'Trial Follow-up', active: true, body: 'Hi {lead_name}, how was your trial at {gym_name}? We would love to have you as a member. Reply to this message for a special offer!' }
  ],
  broadcasts: [
    { id: 'bc_001', title: 'Summer Offer 2026', audience: 'All Active Members', sent_date: '2026-08-20', recipients: 156, delivered: 154, status: 'completed' },
    { id: 'bc_002', title: 'New Yoga Class Launch', audience: 'Active Members', sent_date: '2026-08-18', recipients: 120, delivered: 119, status: 'completed' },
    { id: 'bc_003', title: 'Membership Renewal Drive', audience: 'Expiring Members', sent_date: '2026-08-25', recipients: 12, delivered: 12, status: 'completed' },
    { id: 'bc_004', title: 'Independence Day Wishes', audience: 'All Members', sent_date: '2026-08-15', recipients: 156, delivered: 156, status: 'completed' }
  ]
}
