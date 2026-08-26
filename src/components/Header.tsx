export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-sm font-semibold text-slate-800">
          Oxigen Fitness — C-Scheme, Jaipur
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          DEMO MODE — Sample data
        </span>
      </div>
    </header>
  )
}
