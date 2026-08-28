import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { getToken, getAuthUser, setAuth, clearAuth, isAuthenticated, type AuthUser } from '../api/client'

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    // Check for existing auth on mount
    if (isAuthenticated()) {
      const t = getToken()
      const u = getAuthUser()
      if (t && u) {
        setToken(t)
        setUser(u)
        setAuthed(true)
      }
    } else {
      setAuthed(false)
    }
    
    // Listen for auth:unauthorized events from API client (401 responses)
    const handleUnauthorized = () => {
      setToken(null)
      setUser(null)
      setAuthed(false)
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  const login = useCallback((newToken: string, newUser: AuthUser) => {
    setAuth(newToken, newUser)
    setToken(newToken)
    setUser(newUser)
    setAuthed(true)
  }, [])

  const logout = useCallback(() => {
    clearAuth()
    setToken(null)
    setUser(null)
    setAuthed(false)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: authed, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
