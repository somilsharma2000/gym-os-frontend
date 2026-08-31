import React from 'react'

export function WidgetFooter({ isLight = false }: { isLight?: boolean }) {
  return (
    <footer className={`py-4 px-6 text-center text-xs border-t transition-colors mt-auto ${
      isLight 
        ? 'border-slate-200 text-slate-500 bg-white' 
        : 'border-slate-800/80 text-slate-500 bg-[#0a0e17]'
    }`}>
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        <span>Powered by</span>
        <a 
          href="https://gymos.in" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="font-semibold text-blue-500 hover:text-blue-400 hover:underline inline-flex items-center gap-1"
        >
          Gym OS
        </a>
        <span className="text-slate-600 dark:text-slate-700">&bull;</span>
        <span className="font-medium text-slate-400">Beyond Pixells</span>
      </div>
    </footer>
  )
}
export default WidgetFooter
