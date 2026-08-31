import { useEffect } from 'react'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'
import { RotateCcw } from 'lucide-react'

export default function RefundPolicy() {
  useEffect(() => { document.title = 'Refund Policy — Gym OS by Beyond Pixells' }, [])
  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-300">
      <PublicHeader />
      <div className="max-w-3xl mx-auto px-5 py-16 space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#2563eb]/10 border border-[#2563eb]/20"><RotateCcw size={24} className="text-[#2563eb]" /></div>
          <div>
            <h1 className="text-2xl font-bold text-white">Refund Policy</h1>
            <p className="text-sm text-slate-400">Last updated: 31 August 2026</p>
          </div>
        </div>

        <Section title="1. Setup Fee (One-time)">
          The setup fee covers website creation, Gym OS dashboard configuration, and onboarding. Once the website is delivered and the dashboard is configured, the setup fee is <strong className="text-white">non-refundable</strong>. If the website has not been delivered yet, the setup fee is refundable minus a ₹3,000 processing charge.
        </Section>

        <Section title="2. Monthly Subscription Fee">
          <ul className="list-disc list-inside space-y-1.5 text-sm">
            <li>If the service is not working as described within the first 7 days of a billing cycle, you can request a full refund for that month.</li>
            <li>After 7 days, the monthly fee for that cycle is non-refundable.</li>
            <li>If you cancel your subscription, no further charges will be made from the next billing cycle.</li>
            <li>Partial-month refunds are not provided. If you cancel mid-month, the service remains active until the end of that billing cycle.</li>
          </ul>
        </Section>

        <Section title="3. Refund Process">
          <ul className="list-decimal list-inside space-y-1.5 text-sm">
            <li>Email <span className="text-[#2563eb]">beyondpixells@gmail.com</span> with your gym name and reason for refund.</li>
            <li>We review the request within 3 business days.</li>
            <li>Approved refunds are processed within 7 business days to the original payment method.</li>
            <li>You will receive a confirmation email once the refund is processed.</li>
          </ul>
        </Section>

        <Section title="4. Non-Refundable Items">
          <ul className="list-disc list-inside space-y-1.5 text-sm">
            <li>Third-party costs (WhatsApp API charges, Razorpay transaction fees, domain registration) are non-refundable.</li>
            <li>Custom development work beyond the standard package is non-refundable once delivered.</li>
            <li>Setup fee after website delivery (see Section 1).</li>
          </ul>
        </Section>

        <Section title="5. Service Cancellation">
          If we cancel your service due to a violation of our Terms of Service, no refund will be provided. If we cancel for any other reason, a prorated refund will be issued for the unused portion of the billing cycle.
        </Section>

        <Section title="6. Contact">
          For refund requests or questions, email <span className="text-[#2563eb]">beyondpixells@gmail.com</span>.
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
