import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import Trials from './pages/Trials'
import CheckIn from './pages/CheckIn'
import Members from './pages/Members'

export default function App() {
  return (
    <BrowserRouter>
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
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}
