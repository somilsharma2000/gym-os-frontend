import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function SuperAdminRoute({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Only super_admin can access Super Admin page
  if (user?.role !== 'super_admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
