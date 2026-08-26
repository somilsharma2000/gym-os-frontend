interface StatusBadgeProps {
  status?: string
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  trial_booked: 'bg-purple-50 text-purple-700 border-purple-200',
  trial_checked_in: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  trial_completed: 'bg-teal-50 text-teal-700 border-teal-200',
  follow_up: 'bg-amber-50 text-amber-700 border-amber-200',
  joined: 'bg-green-50 text-green-700 border-green-200',
  converted: 'bg-green-50 text-green-700 border-green-200',
  lost: 'bg-red-50 text-red-700 border-red-200',
  active: 'bg-green-50 text-green-700 border-green-200',
  checked_in: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  expired: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-slate-50 text-slate-600 border-slate-200',
  expiring: 'bg-amber-50 text-amber-700 border-amber-200',
  frozen: 'bg-blue-50 text-blue-700 border-blue-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  at_risk: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
  none: 'bg-slate-50 text-slate-500 border-slate-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  urgent: 'bg-red-50 text-red-700 border-red-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  low: 'bg-slate-50 text-slate-600 border-slate-200',
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) return <span className="text-slate-400 text-xs">—</span>
  const colorClass = statusColors[status] || 'bg-slate-50 text-slate-600 border-slate-200'
  const label = status.replace(/_/g, ' ')

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium capitalize ${colorClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
      {label}
    </span>
  )
}
