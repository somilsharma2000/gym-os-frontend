import { useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import SuperAdminRoute from './components/SuperAdminRoute'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Footer from './components/Footer'
import NotFound from './components/NotFound'
import AIAssistant from './components/AIAssistant'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import FollowUps from './pages/FollowUps'
import Trials from './pages/Trials'
import CheckIn from './pages/CheckIn'
import Members from './pages/Members'
import Memberships from './pages/Memberships'
import Payments from './pages/Payments'
import Revenue from './pages/Revenue'
import RevenueEngine from './pages/RevenueEngine'
import Analytics from './pages/Analytics'
import Socials from './pages/Socials'
import WhatsApp from './pages/WhatsApp'
import Classes from './pages/Classes'
import Trainers from './pages/Trainers'
import Renewals from './pages/Renewals'
import AtRisk from './pages/AtRisk'
import Staff from './pages/Staff'
import Referrals from './pages/Referrals'
import SuperAdmin from './pages/SuperAdmin'
import Settings from './pages/Settings'

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
            <Route path="/follow-ups" element={<FollowUps />} />
            <Route path="/trials" element={<Trials />} />
            <Route path="/check-in" element={<CheckIn />} />
            <Route path="/members" element={<Members />} />
            <Route path="/memberships" element={<Memberships />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="/revenue-engine" element={<RevenueEngine />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/socials" element={<Socials />} />
            <Route path="/whatsapp" element={<WhatsApp />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/trainers" element={<Trainers />} />
            <Route path="/renewals" element={<Renewals />} />
            <Route path="/at-risk" element={<AtRisk />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/super-admin" element={<SuperAdminRoute><SuperAdmin /></SuperAdminRoute>} />
            <Route path="/settings" element={<SuperAdminRoute><Settings /></SuperAdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <AIAssistant />
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
