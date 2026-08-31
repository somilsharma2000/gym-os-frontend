import React, { useState, Suspense } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import SuperAdminRoute from './components/SuperAdminRoute'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Footer from './components/Footer'
import NotFound from './components/NotFound'
import AIAssistant from './components/AIAssistant'
import SkeletonPage from './components/SkeletonLoader'
import Login from './pages/Login'
import Landing from './pages/Landing'

// ── Public marketing & legal pages (lazy) ──
const Features = React.lazy(() => import('./pages/Features'))
const Pricing = React.lazy(() => import('./pages/Pricing'))
const About = React.lazy(() => import('./pages/About'))
const Contact = React.lazy(() => import('./pages/Contact'))
const Blog = React.lazy(() => import('./pages/Blog'))
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'))
const RefundPolicy = React.lazy(() => import('./pages/RefundPolicy'))

// ── Public widget pages (embeddable, no auth) ──
const WidgetSchedule = React.lazy(() => import('./pages/WidgetSchedule'))
const WidgetBooking = React.lazy(() => import('./pages/WidgetBooking'))
const WidgetPlans = React.lazy(() => import('./pages/WidgetPlans'))
const WidgetTrainers = React.lazy(() => import('./pages/WidgetTrainers'))

// ── Dashboard pages (auth required) ──
const Onboarding = React.lazy(() => import('./pages/Onboarding'))
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const Leads = React.lazy(() => import('./pages/Leads'))
const FollowUps = React.lazy(() => import('./pages/FollowUps'))
const Trials = React.lazy(() => import('./pages/Trials'))
const CheckIn = React.lazy(() => import('./pages/CheckIn'))
const Members = React.lazy(() => import('./pages/Members'))
const Memberships = React.lazy(() => import('./pages/Memberships'))
const Payments = React.lazy(() => import('./pages/Payments'))
const Revenue = React.lazy(() => import('./pages/Revenue'))
const Analytics = React.lazy(() => import('./pages/Analytics'))
const Socials = React.lazy(() => import('./pages/Socials'))
const Integrations = React.lazy(() => import('./pages/Integrations'))
const WebsiteSync = React.lazy(() => import('./pages/WebsiteSync'))
const WhatsApp = React.lazy(() => import('./pages/WhatsApp'))
const Classes = React.lazy(() => import('./pages/Classes'))
const Trainers = React.lazy(() => import('./pages/Trainers'))
const Renewals = React.lazy(() => import('./pages/Renewals'))
const AtRisk = React.lazy(() => import('./pages/AtRisk'))
const Staff = React.lazy(() => import('./pages/Staff'))
const Referrals = React.lazy(() => import('./pages/Referrals'))
const SuperAdmin = React.lazy(() => import('./pages/SuperAdmin'))
const Settings = React.lazy(() => import('./pages/Settings'))

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('gym_os_sidebar_collapsed') === 'true'
  })
  const location = useLocation()

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(prev => {
      const next = !prev
      localStorage.setItem('gym_os_sidebar_collapsed', String(next))
      return next
    })
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      <Sidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">
          <div key={location.pathname} className="animate-fade-in-up">
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900"><SkeletonPage /></div>}>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/follow-ups" element={<FollowUps />} />
                <Route path="/trials" element={<Trials />} />
                <Route path="/check-in" element={<CheckIn />} />
                <Route path="/members" element={<Members />} />
                <Route path="/memberships" element={<Memberships />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/revenue" element={<Revenue />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/socials" element={<Socials />} />
                <Route path="/whatsapp" element={<WhatsApp />} />
                <Route path="/classes" element={<Classes />} />
                <Route path="/trainers" element={<Trainers />} />
                <Route path="/renewals" element={<Renewals />} />
                <Route path="/at-risk" element={<AtRisk />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/referrals" element={<Referrals />} />
                <Route path="/integrations" element={<Integrations />} />
                <Route path="/website-sync" element={<WebsiteSync />} />
                <Route path="/super-admin" element={<SuperAdminRoute><SuperAdmin /></SuperAdminRoute>} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
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
          {/* Public routes — no auth required */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/features" element={<Suspense fallback={null}><Features /></Suspense>} />
          <Route path="/pricing" element={<Suspense fallback={null}><Pricing /></Suspense>} />
          <Route path="/about" element={<Suspense fallback={null}><About /></Suspense>} />
          <Route path="/contact" element={<Suspense fallback={null}><Contact /></Suspense>} />
          <Route path="/blog" element={<Suspense fallback={null}><Blog /></Suspense>} />
          <Route path="/privacy-policy" element={<Suspense fallback={null}><PrivacyPolicy /></Suspense>} />
          <Route path="/terms-of-service" element={<Suspense fallback={null}><TermsOfService /></Suspense>} />
          <Route path="/refund-policy" element={<Suspense fallback={null}><RefundPolicy /></Suspense>} />

          {/* Widget routes — public, embeddable via iframe */}
          <Route path="/widget/schedule" element={<Suspense fallback={null}><WidgetSchedule /></Suspense>} />
          <Route path="/widget/booking" element={<Suspense fallback={null}><WidgetBooking /></Suspense>} />
          <Route path="/widget/plans" element={<Suspense fallback={null}><WidgetPlans /></Suspense>} />
          <Route path="/widget/trainers" element={<Suspense fallback={null}><WidgetTrainers /></Suspense>} />

          {/* Dashboard routes — auth required */}
          <Route
            path="/demo/*"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          />
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
