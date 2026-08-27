import { useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Footer from './components/Footer'
import NotFound from './components/NotFound'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import Trials from './pages/Trials'
import CheckIn from './pages/CheckIn'
import Members from './pages/Members'
import Memberships from './pages/Memberships'
import Classes from './pages/Classes'
import Renewals from './pages/Renewals'
import AtRisk from './pages/AtRisk'
import Staff from './pages/Staff'
import Referrals from './pages/Referrals'

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/trials" element={<Trials />} />
            <Route path="/check-in" element={<CheckIn />} />
            <Route path="/members" element={<Members />} />
            <Route path="/memberships" element={<Memberships />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/renewals" element={<Renewals />} />
            <Route path="/at-risk" element={<AtRisk />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
