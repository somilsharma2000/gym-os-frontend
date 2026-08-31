import { useState } from 'react'
import { Link } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'
import { Check, Sparkles, Zap, ShieldCheck, HelpCircle } from 'lucide-react'

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      name: 'Starter',
      setupFee: '₹15,000',
      monthlyPrice: isAnnual ? '₹2,916' : '₹3,500',
      periodText: isAnnual ? '/month (billed ₹35,000/year)' : '/month',
      description: 'Perfect for single-location gyms getting started',
      highlight: false,
      features: [
        'Custom Gym Website',
        'Command Center Dashboard',
        'QR Code Check-in System',
        'Lead CRM & Profiles',
        'Member Management',
        'Basic Class Scheduling',
        'Email Support',
        '1 Location Included'
      ]
    },
    {
      name: 'Standard',
      setupFee: '₹20,000',
      monthlyPrice: isAnnual ? '₹3,333' : '₹4,000',
      periodText: isAnnual ? '/month (billed ₹40,000/year)' : '/month',
      description: 'Most popular — for growing gyms that want automation',
      highlight: true,
      badgeText: 'Most Popular',
      features: [
        'Everything in Starter, plus:',
        'WhatsApp Automation Engine',
        'Automated Lead Follow-up',
        'GST Invoicing & Payments',
        'Member Retention Alerts',
        'Class & Trainer Management',
        'Priority Phone & Chat Support',
        'Up to 2 Locations'
      ]
    },
    {
      name: 'Premium',
      setupFee: '₹30,000',
      monthlyPrice: isAnnual ? '₹3,750' : '₹4,500',
      periodText: isAnnual ? '/month (billed ₹45,000/year)' : '/month',
      description: 'For multi-branch gyms that need everything',
      highlight: false,
      features: [
        'Everything in Standard, plus:',
        'Multi-Branch Management',
        'Advanced Analytics & Forecasting',
        'Social Media Manager',
        'Custom Domain & SSL',
        'Dedicated Account Manager',
        'Custom API & Webhooks',
        'Unlimited Locations'
      ]
    }
  ]

  const faqs = [
    {
      q: 'What is included in the one-time setup fee?',
      a: 'The setup fee covers custom website design & hosting setup, initial member database migration, staff onboarding, QR code configuration, and personalized WhatsApp messaging setup by Beyond Pixells.'
    },
    {
      q: 'Can I switch plans later as my gym grows?',
      a: 'Yes, absolutely. You can upgrade or downgrade your Gym OS plan at any time. Plan adjustments take effect on your next billing cycle.'
    },
    {
      q: 'Is there a long-term contract?',
      a: 'No long-term contracts required for monthly plans. You can pay month-to-month, or choose annual billing to save 2 months worth of subscription fees.'
    },
    {
      q: 'How does WhatsApp automation work?',
      a: 'Gym OS connects directly to automated WhatsApp messaging pipelines to deliver check-in receipts, renewal reminders, payment alerts, and promo broadcasts automatically.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white flex flex-col font-sans selection:bg-[#2563eb]/30 selection:text-blue-200">
      <PublicHeader />

      {/* HERO HEADER */}
      <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2563eb]/10 border border-[#2563eb]/30 text-blue-400 text-xs font-semibold mb-6">
          <Zap size={14} />
          <span>Simple, Transparent Pricing</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Invest in Your Gym’s{' '}
          <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
            Automated Growth
          </span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          No hidden fees or surprise costs. Choose the plan that fits your gym size and start streamlining operations with Beyond Pixells.
        </p>

        {/* BILLING TOGGLE */}
        <div className="mt-10 flex items-center justify-center">
          <div className="bg-[#131a26] p-1.5 rounded-2xl border border-slate-800 flex items-center gap-2">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                !isAnnual
                  ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                isAnnual
                  ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                Save 2 months
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                plan.highlight
                  ? 'bg-[#131a26] border-2 border-[#2563eb] shadow-2xl shadow-[#2563eb]/20 scale-100 lg:-translate-y-2'
                  : 'bg-[#131a26] border border-slate-800 hover:border-slate-700'
              }`}
            >
              {plan.badgeText && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#2563eb] text-white text-xs font-bold tracking-wider uppercase shadow-md">
                  {plan.badgeText}
                </div>
              )}

              <div>
                {/* PLAN TITLE & DESCR */}
                <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                <p className="text-xs text-slate-400 mt-2 min-h-[36px]">{plan.description}</p>

                {/* PRICING NUMBERS */}
                <div className="my-6 pb-6 border-b border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white tracking-tight">{plan.monthlyPrice}</span>
                    <span className="text-xs text-slate-400 font-medium">{plan.periodText}</span>
                  </div>
                  <div className="mt-2 inline-block px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-semibold">
                    + {plan.setupFee} one-time setup
                  </div>
                </div>

                {/* FEATURES LIST */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-[#2563eb]/20 text-[#2563eb] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={13} className="text-blue-400" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA BUTTON */}
              <Link
                to="/contact"
                className={`w-full py-3.5 px-6 rounded-xl text-sm font-bold text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  plan.highlight
                    ? 'bg-[#2563eb] hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                <span>Get Started</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 mb-2">
            <HelpCircle size={16} />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Got Questions About Gym OS Pricing?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-[#131a26] border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-2">{faq.q}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
