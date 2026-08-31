import { useEffect } from 'react'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'
import { FileText } from 'lucide-react'

export default function TermsOfService() {
  useEffect(() => { document.title = 'Terms of Service — Gym OS by Beyond Pixells' }, [])
  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-300">
      <PublicHeader />
      <div className="max-w-3xl mx-auto px-5 py-16 space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#2563eb]/10 border border-[#2563eb]/20"><FileText size={24} className="text-[#2563eb]" /></div>
          <div>
            <h1 className="text-2xl font-bold text-white">Terms of Service</h1>
            <p className="text-sm text-slate-400">Last updated: 31 August 2026</p>
          </div>
        </div>

        <Section title="1. Service Description">
          Gym OS is a cloud-based gym management platform provided by <strong className="text-white">Beyond Pixells</strong>. The service includes
          member management, lead CRM, QR check-in, class scheduling, payments, analytics, WhatsApp automation, and social media management tools.
        </Section>

        <Section title="2. Account & Eligibility">
          You must be an authorized representative of a gym or fitness business to create an account. You are responsible for maintaining the security of your login credentials and for all activities under your account.
        </Section>

        <Section title="3. Acceptable Use">
          <ul className="list-disc list-inside space-y-1.5 text-sm">
            <li>You agree to enter accurate member and payment data.</li>
            <li>You will not use the service for any illegal or fraudulent activity.</li>
            <li>You will not attempt to access another gym's data or share your API key with unauthorized parties.</li>
            <li>You are responsible for obtaining consent from your members before sending them WhatsApp messages or storing their data.</li>
          </ul>
        </Section>

        <Section title="4. Payment Terms">
          <ul className="list-disc list-inside space-y-1.5 text-sm">
            <li>Setup fee (₹15,000–₹30,000) is a one-time charge, non-refundable after website delivery.</li>
            <li>Monthly subscription fee (₹3,500–₹4,500/month) is billed in advance.</li>
            <li>Payments are processed via Razorpay or bank transfer.</li>
            <li>GST at 18% is applicable on all invoices as per Indian tax law.</li>
            <li>If payment is not received within 7 days of the due date, the service may be paused until payment is received.</li>
          </ul>
        </Section>

        <Section title="5. Refunds">
          See our <a href="#/refund-policy" className="text-[#2563eb] underline">Refund Policy</a> for details. In brief: setup fee is non-refundable after website delivery; monthly fee is refundable within 7 days if the service is not functioning as described.
        </Section>

        <Section title="6. Limitations">
          <ul className="list-disc list-inside space-y-1.5 text-sm">
            <li>The service is provided "as is" without warranties of any kind.</li>
            <li>We are not liable for loss of revenue, data loss, or business interruption beyond the amount paid in the preceding 3 months.</li>
            <li>We are not responsible for issues caused by third-party services (WhatsApp, Razorpay, hosting providers).</li>
            <li>Maximum liability is limited to the total fees paid in the 3 months preceding the claim.</li>
          </ul>
        </Section>

        <Section title="7. Termination">
          Either party may terminate this agreement with 30 days written notice. Upon termination, you can export your data. We will delete your data 90 days after termination unless you request sooner.
        </Section>

        <Section title="8. Intellectual Property">
          The Gym OS software, branding, and code are the property of Beyond Pixells. Your gym's data (members, leads, payments) belongs to you. We retain the right to use aggregate, anonymized data for product improvement.
        </Section>

        <Section title="9. Govering Law">
          These terms are governed by Indian law. Any disputes will be resolved in the courts of Jaipur, Rajasthan, India.
        </Section>

        <Section title="10. Changes">
          We may update these terms with 30 days notice. Continued use after changes constitutes acceptance.
        </Section>

        <Section title="11. Contact">
          For questions about these terms, email <span className="text-[#2563eb]">beyondpixells@gmail.com</span>.
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
