import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { enableDemoMode } from '../data/demoData'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  // Auto-enable demo mode if hitting /demo/* routes
  if (location.pathname.startsWith('/demo')) {
    enableDemoMode()
    return <>{children}</>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
