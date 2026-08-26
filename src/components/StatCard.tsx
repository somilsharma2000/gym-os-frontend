interface StatCardProps {
  label: string
  value: number
  icon?: React.ReactNode
  color?: string
  onClick?: () => void
}

export default function StatCard({ label, value, icon, color = 'text-brand-600', onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-slate-200 p-4 ${onClick ? 'cursor-pointer hover:border-brand-300 hover:shadow-sm transition-all' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        {icon && <span className={color}>{icon}</span>}
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
