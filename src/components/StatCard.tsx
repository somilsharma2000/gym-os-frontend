interface StatCardProps {
  label: string
  value: number | string
  icon?: React.ReactNode
  color?: string
  onClick?: () => void
}

export default function StatCard({ label, value, icon, color = 'text-brand-600 dark:text-brand-400', onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-all ${onClick ? 'cursor-pointer hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-sm' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
        {icon && <span className={color}>{icon}</span>}
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
