import { Link } from 'react-router-dom'
import { Dumbbell, ShieldCheck, FileText, RotateCcw, Calendar, Instagram } from 'lucide-react'

export default function PublicFooter() {
  return (
    <footer className="bg-[#0a0e17] border-t border-slate-800 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80">
        {/* BRAND COL */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}brand/beyond-pixells-logo.png`}
              alt="Beyond Pixells"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#2563eb]/40"
            />
            <span className="text-lg font-black text-white tracking-tight">Gym OS</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The ultimate Operating System for modern fitness centers and multi-branch gyms. Built by Beyond Pixells.
          </p>
          <div className="pt-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all"
            >
              <Instagram size={15} className="text-pink-400" />
              <span>DM us on Instagram</span>
            </a>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">Product</h3>
          <ul className="space-y-2 text-xs">
            <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
            <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing Plans</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">About Beyond Pixells</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Book a Demo</Link></li>
            <li><Link to="/blog" className="hover:text-white transition-colors">Blog & Guides</Link></li>
            <li><Link to="/dashboard" className="hover:text-white transition-colors">Gym OS Dashboard</Link></li>
          </ul>
        </div>

        {/* LEGAL LINKS */}
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">Legal</h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/privacy-policy" className="hover:text-white transition-colors flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-slate-500" />
                <span>Privacy Policy</span>
              </Link>
            </li>
            <li>
              <Link to="/terms-of-service" className="hover:text-white transition-colors flex items-center gap-1.5">
                <FileText size={14} className="text-slate-500" />
                <span>Terms of Service</span>
              </Link>
            </li>
            <li>
              <Link to="/refund-policy" className="hover:text-white transition-colors flex items-center gap-1.5">
                <RotateCcw size={14} className="text-slate-500" />
                <span>Refund Policy</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* GET STARTED COL */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">Get Started</h3>
          <p className="text-xs text-slate-400">
            Transform your gym operations today with custom websites, automated WhatsApp follow-ups, and QR check-ins.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#2563eb] hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-600/20"
          >
            <Calendar size={14} />
            <span>Book a Demo</span>
          </Link>
        </div>
      </div>

      {/* COPYRIGHT BOTTOM */}
      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>
          © {new Date().getFullYear()} Beyond Pixells. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <Link to="/privacy-policy" className="hover:text-slate-400">Privacy</Link>
          <span>•</span>
          <Link to="/terms-of-service" className="hover:text-slate-400">Terms</Link>
          <span>•</span>
          <Link to="/refund-policy" className="hover:text-slate-400">Refunds</Link>
        </div>
      </div>
    </footer>
  )
}
