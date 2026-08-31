import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'
import { BookOpen, Clock, Calendar, ArrowLeft, X, Sparkles, ArrowRight, Share2, Tag } from 'lucide-react'

export interface Article {
  slug: string
  title: string
  category: string
  date: string
  readTime: string
  excerpt: string
  content: string[]
}

export const articles: Article[] = [
  {
    slug: 'reduce-member-churn-with-data',
    title: 'How to Reduce Member Churn by 40% with Data',
    category: 'Retention',
    date: 'August 28, 2026',
    readTime: '5 min read',
    excerpt: 'Discover how tracking attendance drop-offs and automated re-engagement triggers on WhatsApp can help your gym keep members active for longer.',
    content: [
      'Member retention is the lifeblood of any successful fitness business. While acquiring new members is essential for growth, losing 20-30% of your member base every quarter severely undermines your revenue potential. Data-driven gyms are flipping the script by identifying churn risks before members actually quit.',
      'The key metric to monitor is attendance frequency. Most members who eventually cancel stop attending regularly 3 to 4 weeks prior to cancellation. By deploying an automated tracking system like Gym OS, you can establish automated triggers: when an active member drops below 1 visit per week, the system immediately flags them as "At-Risk".',
      'Once flagged, automated re-engagement workflows kick in. A friendly WhatsApp check-in from their preferred trainer or a complimentary personal training invite can re-ignite their motivation. Gyms leveraging this structured attendance alert system report a 40% reduction in annual member churn.',
      'In conclusion, member retention is not about luck — it is about timely intervention. By turning raw attendance logs into proactive retention alerts, your gym retains revenue, builds stronger relationships, and fosters a thrives community.'
    ]
  },
  {
    slug: 'why-gym-needs-qr-checkin',
    title: 'Why Your Gym Needs a QR Check-in System',
    category: 'Operations',
    date: 'August 22, 2026',
    readTime: '4 min read',
    excerpt: 'Replace outdated register books and plastic cards with touchless QR code scanning. Streamline morning rushes and capture exact attendance data.',
    content: [
      'Paper logbooks and physical swipe cards are relics of the past. Paper registers are easily faked, slow down peak-hour front desk traffic, and offer zero actionable insights. Plastic key tags, on the other hand, carry recurring procurement costs and are frequently misplaced by members.',
      'A dynamic QR check-in system transforms the front-desk experience. Members simply scan their unique QR pass on their smartphone at the entrance counter. The scan takes under 1 second, automatically logs attendance in your central dashboard, and verifies active membership status in real time.',
      'Beyond speed, QR check-ins give gym owners incredible operational visibility. You gain immediate access to hourly heatmaps showing exact peak times, class attendance numbers, and instant alerts if an expired member attempts entry.',
      'Implementing QR check-ins with Gym OS requires no expensive biometric hardware — a standard tablet or smartphone at your front desk is all you need to elevate your brand perception and secure entry.'
    ]
  },
  {
    slug: 'complete-guide-gym-lead-conversion',
    title: 'The Complete Guide to Gym Lead Conversion',
    category: 'Marketing',
    date: 'August 15, 2026',
    readTime: '7 min read',
    excerpt: 'Learn the exact 5-step lead follow-up strategy used by top-performing gyms to convert website visitors and walk-ins into paying members.',
    content: [
      'Converting prospective leads into paying members requires a disciplined, structured follow-up framework. Studies show that over 60% of gym leads go cold simply because front desk staff fail to follow up within the first 15 minutes of an inquiry.',
      'Step 1 is Immediate Response. When a prospective member fills out a trial request on your website, an instant automated WhatsApp confirmation builds trust instantly. Step 2 is the 1-on-1 Consult: book them for a structured walk-through or a free 1-day pass rather than just handing out pricing sheets.',
      'Step 3 is the Trial Experience. Ensure their initial workout is welcoming and memorable. Step 4 is the Post-Trial Offer: present structured membership options (Starter, Standard, Premium) while their enthusiasm is at its peak.',
      'Finally, Step 5 is Automated Nurturing. For leads who do not join immediately, automated follow-up sequences deliver motivational fitness tips, member transformation stories, and seasonal joining incentives over a 14-day window.'
    ]
  },
  {
    slug: 'whatsapp-automation-turning-leads-into-members',
    title: 'WhatsApp Automation: Turning Leads into Members on Autopilot',
    category: 'Automation',
    date: 'August 10, 2026',
    readTime: '6 min read',
    excerpt: 'Leverage automated WhatsApp messages to deliver trial passes, send payment reminders, and keep leads warm without manual effort.',
    content: [
      'Traditional email marketing open rates hover around 15-20% in the fitness industry, while WhatsApp boasts open rates exceeding 98%. For fitness centers in India, WhatsApp is undeniably the most effective communication channel available.',
      'With Gym OS WhatsApp Automation, manual messaging is eliminated. When a lead requests a pass online, a customized QR trial pass is instantly generated and delivered to their WhatsApp number alongside your gym location details and hours.',
      'Automation extends throughout the entire member lifecycle: daily check-in receipts, birthday greetings, class booking reminders, and upcoming renewal alerts. When memberships are due for renewal, automated messages include direct UPI payment links for effortless collections.',
      'By turning repetitive messaging tasks over to intelligent workflows, your gym staff saves hours every week while members enjoy a seamless, professional experience.'
    ]
  },
  {
    slug: 'how-analytics-can-double-gym-revenue',
    title: 'How Analytics Can Double Your Gym Revenue',
    category: 'Growth',
    date: 'August 02, 2026',
    readTime: '5 min read',
    excerpt: 'Uncover hidden revenue streams by analyzing peak hours, membership plan popularity, renewal cycles, and personal training upsells.',
    content: [
      'Most gym owners track only two financial metrics: total revenue collected and bank balance. However, deep operational analytics reveal hidden growth levers that can double your profitability without expanding floor space.',
      'Start by analyzing Average Revenue Per User (ARPU). By cross-referencing member profiles with workout habits, you can identify high-value segments interested in personal training, nutrition plans, or premium class packages.',
      'Next, audit plan popularity and renewal rates. If 80% of members drop off on 1-month plans, offering attractive quarterly or annual tiers backed by automated renewal discounts locks in predictable cash flow and improves Lifetime Value (LTV).',
      'Gym OS provides real-time financial dashboards, automated revenue forecasting, and expense tracking. Armed with these insights, you make data-driven decisions that optimize pricing, reduce operating costs, and accelerate business growth.'
    ]
  }
]

export default function Blog() {
  const { slug } = useParams<{ slug?: string }>()
  const navigate = useNavigate()
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  useEffect(() => {
    if (slug) {
      const found = articles.find(a => a.slug === slug)
      if (found) {
        setSelectedArticle(found)
      } else {
        setSelectedArticle(null)
      }
    } else {
      setSelectedArticle(null)
    }
  }, [slug])

  const openArticle = (article: Article) => {
    setSelectedArticle(article)
    navigate(`/blog/${article.slug}`)
  }

  const closeArticle = () => {
    setSelectedArticle(null)
    navigate('/blog')
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white flex flex-col font-sans selection:bg-[#2563eb]/30 selection:text-blue-200">
      <PublicHeader />

      {/* HERO HEADER */}
      <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2563eb]/10 border border-[#2563eb]/30 text-blue-400 text-xs font-semibold mb-6">
          <BookOpen size={14} />
          <span>Gym OS Insights & Guides</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Articles & Strategies for{' '}
          <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
            Modern Gym Owners
          </span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Actionable strategies on member retention, automation, lead conversion, and gym revenue scaling from the team at Beyond Pixells.
        </p>
      </section>

      {/* ARTICLE LIST GRID */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((art) => (
            <div
              key={art.slug}
              onClick={() => openArticle(art)}
              className="bg-[#131a26] border border-slate-800 hover:border-[#2563eb]/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-[#2563eb]/10 cursor-pointer group hover:-translate-y-1"
            >
              <div>
                {/* CATEGORY & READ TIME */}
                <div className="flex items-center justify-between gap-2 mb-4 text-xs">
                  <span className="px-3 py-1 rounded-full bg-[#2563eb]/15 border border-[#2563eb]/30 text-blue-400 font-bold">
                    {art.category}
                  </span>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock size={13} />
                    <span>{art.readTime}</span>
                  </div>
                </div>

                {/* TITLE */}
                <h2 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors leading-snug">
                  {art.title}
                </h2>

                {/* EXCERPT */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3 mb-6 font-normal">
                  {art.excerpt}
                </p>
              </div>

              {/* FOOTER STRIP */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  <span>{art.date}</span>
                </div>
                <span className="text-blue-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Read Article
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ARTICLE READER MODAL / VIEW */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-[#0a0e17]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#131a26] border border-slate-700/80 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-10 shadow-2xl relative my-auto">
            {/* CLOSE BUTTON */}
            <button
              onClick={closeArticle}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
              aria-label="Close article"
            >
              <X size={20} />
            </button>

            {/* BACK BUTTON */}
            <button
              onClick={closeArticle}
              className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 mb-6 cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back to all articles</span>
            </button>

            {/* CATEGORY & METADATA */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-4">
              <span className="px-3 py-1 rounded-full bg-[#2563eb]/20 text-blue-400 font-bold border border-[#2563eb]/30">
                {selectedArticle.category}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1"><Calendar size={13} /> {selectedArticle.date}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock size={13} /> {selectedArticle.readTime}</span>
            </div>

            {/* TITLE */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-6 leading-tight">
              {selectedArticle.title}
            </h1>

            {/* AUTHOR BADGE */}
            <div className="flex items-center gap-3 pb-6 mb-8 border-b border-slate-800">
              <img
                src={`${import.meta.env.BASE_URL}brand/beyond-pixells-logo.png`}
                alt="Beyond Pixells"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#2563eb]/40"
              />
              <div>
                <div className="text-xs font-bold text-white">Beyond Pixells Editorial Team</div>
                <div className="text-[11px] text-slate-400">Gym OS Growth & Operations Guides</div>
              </div>
            </div>

            {/* BODY PARAGRAPHS */}
            <div className="space-y-5 text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
              {selectedArticle.content.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* CTA FOOTER INSIDE ARTICLE */}
            <div className="mt-10 pt-8 border-t border-slate-800 bg-[#0a0e17] p-6 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-white">Want to implement this in your gym?</h4>
                <p className="text-xs text-slate-400 mt-1">Gym OS includes automated retention workflows and QR check-ins out of the box.</p>
              </div>
              <Link
                to="/contact"
                onClick={closeArticle}
                className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
              >
                <Sparkles size={15} />
                <span>Book a Demo</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  )
}
