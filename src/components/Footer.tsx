export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 px-6 py-3 mt-auto transition-colors">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <img
            src={`${import.meta.env.BASE_URL}brand/beyond-pixels-logo.png`}
            alt="Beyond Pixels"
            className="w-5 h-5 rounded-full object-cover"
          />
          <span className="text-slate-400 dark:text-slate-500">Powered by <span className="font-semibold text-brand-600 dark:text-brand-400">Beyond Pixels</span></span>
        </div>
        <p className="text-slate-300 dark:text-slate-600">GYM OS v2 &copy; 2026</p>
      </div>
    </footer>
  )
}
