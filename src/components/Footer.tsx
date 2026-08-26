export default function Footer() {
  return (
    <footer className="border-t border-slate-200 px-6 py-3 mt-auto">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <img
            src={`${import.meta.env.BASE_URL}brand/beyond-pixels-logo.jpg`}
            alt="Beyond Pixels"
            className="w-5 h-5 rounded-full object-cover"
          />
          <span className="text-slate-400">Powered by <span className="font-semibold text-brand-600">Beyond Pixels</span></span>
        </div>
        <p className="text-slate-300">GYM OS v2 &copy; 2026</p>
      </div>
    </footer>
  )
}
