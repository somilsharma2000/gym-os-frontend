import { HashRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Footer from './components/Footer'
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

export default function App() {
  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
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
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </HashRouter>
  )
}
