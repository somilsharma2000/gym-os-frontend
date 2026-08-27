import { useNavigate } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <p className="text-6xl font-bold text-slate-300">404</p>
      <div>
        <p className="text-lg font-semibold text-slate-700">Page not found</p>
        <p className="text-sm text-slate-400 mt-1">The page you're looking for doesn't exist or has been moved.</p>
      </div>
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 transition-colors"
      >
        <Home size={16} /> Back to Dashboard
      </button>
    </div>
  )
}
