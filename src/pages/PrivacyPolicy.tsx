import { useEffect } from 'react'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'
import { Shield } from 'lucide-react'

export default function PrivacyPolicy() {
  useEffect(() => { document.title = 'Privacy Policy — Gym OS by Beyond Pixells' }, [])
  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-300">
      <PublicHeader />
      <div className="max-w-3xl mx-auto px-5 py-16 space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#2563eb]/10 border border-[#2563eb]/20"><Shield size={24} className="text-[#2563eb]" /></div>
          <div>
            <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
            <p className="text-sm text-slate-400">Last updated: 31 August 2026</p>
          </div>
        </div>

        <Section title="1. Who We Are">
          Gym OS is a product of <strong className="text-white">Beyond Pixells</strong>. We provide gym management software (SaaS) to gym owners across India.
          This policy explains what data we collect, how we use it, and the rights you have over your data.
        </Section>

        <Section title="2. Data We Collect">
          <ul className="list-disc list-inside space-y-1.5 text-sm">
            <li><strong className="text-slate-200">Gym Account Data:</strong> Name, email, phone, gym name, address — provided when you create an account.</li>
            <li><strong className="text-slate-200">Member Data:</strong> Names, phone numbers, emails, membership plans, attendance records, payment history — entered by you (the gym owner) or your staff.</li>
            <li><strong className="text-slate-200">Lead Data:</strong> Prospective member names, phone numbers, email addresses, source, and follow-up status.</li>
            <li><strong className="text-slate-200">Payment Data:</strong> Transaction amounts, payment methods, invoice numbers. We do <strong className="text-white">not</strong> store card numbers or UPI PINs — payments are processed by Razorpay/Stripe.</li>
            <li><strong className="text-slate-200">Usage Data:</strong> Login times, feature usage, device information — used to improve the product.</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Data">
          <ul className="list-disc list-inside space-y-1.5 text-sm">
            <li>To provide the Gym OS dashboard, website widget, and related services.</li>
            <li>To send WhatsApp reminders, renewal notifications, and automated alerts on your behalf.</li>
            <li>To generate analytics, revenue reports, and business insights for your gym.</li>
            <li>To provide customer support and respond to your queries.</li>
            <li>To improve and develop new features based on aggregate usage patterns.</li>
          </ul>
        </Section>

        <Section title="4. Data Storage & Security">
          All data is stored on secure cloud infrastructure with encryption in transit (TLS 1.2+) and at rest (AES-256).
          Each gym's data is isolated using per-tenant API keys and database-level row-level security.
          We do not store payment card data — all payments are handled by PCI-DSS compliant payment processors.
        </Section>

        <Section title="5. Data Sharing">
          We <strong className="text-white">never sell</strong> your data. Your gym's data belongs to you.
          We share data only with:
          <ul className="list-disc list-inside space-y-1.5 text-sm mt-2">
            <li>Payment processors (Razorpay, Stripe) — only payment-related data needed to process transactions.</li>
            <li>WhatsApp/Meta — phone numbers and message content, to send messages you authorize.</li>
            <li>Cloud hosting providers — infrastructure providers who store and transmit data.</li>
          </ul>
          We will only disclose data to law enforcement if legally required to do so by Indian law.
        </Section>

        <Section title="6. Your Rights">
          <ul className="list-disc list-inside space-y-1.5 text-sm">
            <li><strong className="text-slate-200">Access:</strong> You can view all data stored about your gym at any time through the dashboard.</li>
            <li><strong className="text-slate-200">Correction:</strong> You can edit or delete any member, lead, or payment record at any time.</li>
            <li><strong className="text-slate-200">Export:</strong> You can export your member and payment data as CSV at any time.</li>
            <li><strong className="text-slate-200">Deletion:</strong> You can request complete deletion of your gym's data by contacting us. We will delete it within 30 days.</li>
          </ul>
        </Section>

        <Section title="7. Data Retention">
          We retain your data for as long as your account is active. If you cancel your subscription, we retain data for 90 days (in case you reactivate), then permanently delete it.
        </Section>

        <Section title="8. Cookies">
          We use essential cookies for authentication and session management. We do not use third-party advertising cookies.
        </Section>

        <Section title="9. Contact">
          For privacy questions or data requests, email <span className="text-[#2563eb]">beyondpixells@gmail.com</span>.
        </Section>
      </div>
      <PublicFooter />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="text-sm text-slate-400 leading-relaxed">{children}</div>
    </div>
  )
}
