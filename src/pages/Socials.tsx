import { useState, useEffect, useMemo } from 'react'
import {
  Sparkles,
  Share2,
  Calendar,
  BarChart3,
  Flame,
  Target,
  Plus,
  Copy,
  Check,
  Zap,




  Clock,





  X,

  Lightbulb,


} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,


  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'

const MASTER_PROMPT_KEY = 'gym_os_socials_master_prompt'
const SCHEDULED_POSTS_KEY = 'gym_os_socials_scheduled_posts'
const CAMPAIGNS_KEY = 'gym_os_socials_campaigns'

const DEFAULT_MASTER_PROMPT = `Pulse Fitness is a premier high-energy gym in Jaipur offering state-of-the-art strength equipment, HIIT classes, and personalized coaching. Tone: Motivating, authoritative yet approachable, focused on real results, discipline, and community support. Target Audience: Working professionals aged 22-45.`

interface ScheduledPost {
  id: string
  title: string
  caption: string
  platform: 'Instagram' | 'Facebook' | 'WhatsApp' | 'YouTube Shorts'
  date: string
  time: string
  status: 'Scheduled' | 'Published' | 'Draft'
  framework?: string
}

interface Campaign {
  id: string
  title: string
  goal: string
  targetLeads: number
  generatedLeads: number
  budget: number
  startDate: string
  endDate: string
  platforms: string[]
  status: 'Active' | 'Completed' | 'Upcoming'
}

export default function Socials() {
  const [activeTab, setActiveTab] = useState<'generator' | 'frameworks' | 'calendar' | 'analytics' | 'campaigns'>('generator')
  const [masterPrompt, setMasterPrompt] = useState(DEFAULT_MASTER_PROMPT)
  const [promptSaved, setPromptSaved] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [generatingIdeas, setGeneratingIdeas] = useState(false)

  // Posts & Campaigns state
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)

  // Generated Post Ideas state
  const [postIdeas, setPostIdeas] = useState([
    {
      id: 'idea_1',
      title: '3 Workout Habits Ruining Your Progress (And How to Fix Them)',
      caption: 'Stop spinning your wheels! 🛑 Here are 3 subtle mistakes keeping you from hitting your fitness goals this month...\n\n1️⃣ Skipping warm-ups\n2️⃣ Inconsistent sleep\n3️⃣ Ego lifting\n\nDrop a 🔥 below if you want our free 7-day workout plan!',
      framework: 'Hook Formula (Truths & Fixes)',
      platform: 'Instagram'
    },
    {
      id: 'idea_2',
      title: 'Member Spotlight: How Rahul Lost 11kg in 90 Days Without Extreme Diets',
      caption: 'Meet Rahul! 🏋️‍♂️ When he joined Pulse Fitness, he couldn\'t squat 40kg without knee discomfort. Fast forward 90 days: -11kg fat loss & 100kg clean squat.\n\nHis secret? Consistency over intensity.\n\nReady for your own transformation? DM us "TRANSFORM" for a free trial pass!',
      framework: 'Social Proof / Transformation',
      platform: 'Instagram'
    },
    {
      id: 'idea_3',
      title: 'Only 4 Slots Remaining: September 30-Day Shred Challenge',
      caption: '⚡ FLASH ALERT ⚡ Our high-intensity September Fat Loss Cohort is 85% booked!\n\nWhat\'s included:\n✅ Personal nutrition guide\n✅ 4x weekly group HIIT sessions\n✅ Dedicated trainer accountability\n\nClaim your spot before midnight link in bio!',
      framework: 'FOMO Trigger / Urgency',
      platform: 'WhatsApp'
    },
    {
      id: 'idea_4',
      title: 'Behind the Scenes: A Day in the Life of Head Trainer Ankit',
      caption: '5:30 AM alarm ⏰ -> Pre-workout espresso ☕ -> 6 AM clients -> Heavy leg day at 2 PM. Here\'s what dedicated coaching looks like behind the scenes at Pulse Fitness.\n\nComment "ANKIT" to book a 1-on-1 consultation session with him!',
      framework: 'Storytelling / Day in Life',
      platform: 'YouTube Shorts'
    },
    {
      id: 'idea_5',
      title: 'Why Most Gym Members Quit After Week 3 (And How We Stop It)',
      caption: 'Week 3 is where motivation fades and discipline takes over. At Pulse Fitness, we pair every new member with a mentor trainer to smash through the 3-week wall.\n\nDon\'t quit on yourself this season. Tap the link to claim your 3-Day VIP pass!',
      framework: 'Psychological Hook',
      platform: 'Facebook'
    }
  ])

  // New Post Form State
  const [newPostForm, setNewPostForm] = useState({
    title: '',
    caption: '',
    platform: 'Instagram' as ScheduledPost['platform'],
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
    framework: 'General'
  })

  // New Campaign Form State
  const [newCampaignForm, setNewCampaignForm] = useState({
    title: '',
    goal: 'Lead Generation',
    targetLeads: 50,
    budget: 15000,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    platforms: ['Instagram', 'Meta Ads']
  })

  // Load from local storage
  useEffect(() => {
    try {
      const savedPrompt = localStorage.getItem(MASTER_PROMPT_KEY)
      if (savedPrompt) setMasterPrompt(savedPrompt)

      const savedPosts = localStorage.getItem(SCHEDULED_POSTS_KEY)
      if (savedPosts) {
        setScheduledPosts(JSON.parse(savedPosts))
      } else {
        const initialPosts: ScheduledPost[] = [
          {
            id: 'post_101',
            title: '3-Day Trial Pass Announcement',
            caption: 'Get 3 days of unlimited gym & group class access! DM "TRIAL" to claim.',
            platform: 'Instagram',
            date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            time: '17:30',
            status: 'Scheduled',
            framework: 'FOMO Trigger'
          },
          {
            id: 'post_102',
            title: 'Morning Yoga Batch Highlights',
            caption: 'Peaceful mornings start at Pulse Fitness. Join our 7 AM sunrise yoga cohort.',
            platform: 'Facebook',
            date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
            time: '08:00',
            status: 'Scheduled',
            framework: 'Storytelling'
          },
          {
            id: 'post_103',
            title: 'Bench Press Technique Reels',
            caption: 'Common chest press mistakes that slow your gains.',
            platform: 'YouTube Shorts',
            date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
            time: '19:00',
            status: 'Published',
            framework: 'Hook Formula'
          }
        ]
        setScheduledPosts(initialPosts)
        localStorage.setItem(SCHEDULED_POSTS_KEY, JSON.stringify(initialPosts))
      }

      const savedCampaigns = localStorage.getItem(CAMPAIGNS_KEY)
      if (savedCampaigns) {
        setCampaigns(JSON.parse(savedCampaigns))
      } else {
        const initialCampaigns: Campaign[] = [
          {
            id: 'camp_001',
            title: 'September Transformation Challenge',
            goal: 'Get 60 new trial signups',
            targetLeads: 60,
            generatedLeads: 42,
            budget: 20000,
            startDate: '2026-08-20',
            endDate: '2026-09-20',
            platforms: ['Instagram', 'Meta Ads', 'WhatsApp'],
            status: 'Active'
          },
          {
            id: 'camp_002',
            title: 'Corporate Wellness Partnership',
            goal: 'B2B Gym Passes for local IT parks',
            targetLeads: 25,
            generatedLeads: 18,
            budget: 10000,
            startDate: '2026-08-01',
            endDate: '2026-08-31',
            platforms: ['LinkedIn', 'Direct Email'],
            status: 'Active'
          }
        ]
        setCampaigns(initialCampaigns)
        localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(initialCampaigns))
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Save Master Prompt
  const handleSavePrompt = () => {
    localStorage.setItem(MASTER_PROMPT_KEY, masterPrompt)
    setPromptSaved(true)
    setTimeout(() => setPromptSaved(false), 2000)
  }

  // Copy to clipboard helper
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Post Ideas Generator
  const handleGenerateFreshIdeas = () => {
    setGeneratingIdeas(true)
    setTimeout(() => {
      const freshIdeas = [
        {
          id: `idea_${Date.now()}_1`,
          title: 'The Uncomfortable Truth About Losing Belly Fat in 30 Days',
          caption: 'Spoiler alert: Spot reduction is a myth. Here is the exact fat loss math every Jaipur resident needs to know...\n\n1️⃣ Caloric deficit\n2️⃣ 8,000 steps daily\n3️⃣ Progressive overload\n\nDM "MATH" for a custom plan!',
          framework: 'Hook Formula (Hard Truths)',
          platform: 'Instagram'
        },
        {
          id: `idea_${Date.now()}_2`,
          title: 'How Priya Balanced 10-Hour Work Days & Lost 8kg',
          caption: 'No time for gym? Priya thought the same until she switched to our 45-minute Lunchtime Express Workout. Here\'s her breakdown...',
          framework: 'Social Proof / Case Study',
          platform: 'Facebook'
        },
        {
          id: `idea_${Date.now()}_3`,
          title: 'Flash Sale: First 5 Members Get 2 Months Free PT',
          caption: '⚡ September Upgrade Alert! Lock in an annual membership today and get 2 Months of 1-on-1 Personal Training included free.',
          framework: 'FOMO Trigger / Urgency',
          platform: 'WhatsApp'
        },
        {
          id: `idea_${Date.now()}_4`,
          title: 'Stop Doing High-Impact Cardio If You Have Lower Back Pain',
          caption: 'Try these 3 low-impact cardio alternatives that torch calories without stressing your spine...',
          framework: 'Psychological Hook',
          platform: 'YouTube Shorts'
        },
        {
          id: `idea_${Date.now()}_5`,
          title: 'Our Cleanliness & Equipment Standard Tour',
          caption: 'Ever wonder how we keep 10,000 sq.ft of gym space spotless every hour? Here\'s our cleaning protocol in action.',
          framework: 'Trust & Credibility',
          platform: 'Instagram'
        }
      ]
      setPostIdeas(freshIdeas)
      setGeneratingIdeas(false)
    }, 800)
  }

  // Add Scheduled Post
  const handleSchedulePostSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPostForm.title || !newPostForm.caption) return

    const post: ScheduledPost = {
      id: `post_${Date.now()}`,
      title: newPostForm.title,
      caption: newPostForm.caption,
      platform: newPostForm.platform,
      date: newPostForm.date,
      time: newPostForm.time,
      status: 'Scheduled',
      framework: newPostForm.framework
    }

    const updated = [post, ...scheduledPosts]
    setScheduledPosts(updated)
    localStorage.setItem(SCHEDULED_POSTS_KEY, JSON.stringify(updated))
    setShowScheduleModal(false)
    setNewPostForm({
      title: '',
      caption: '',
      platform: 'Instagram',
      date: new Date().toISOString().split('T')[0],
      time: '18:00',
      framework: 'General'
    })
  }

  // Add Campaign
  const handleCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCampaignForm.title) return

    const camp: Campaign = {
      id: `camp_${Date.now()}`,
      title: newCampaignForm.title,
      goal: newCampaignForm.goal,
      targetLeads: Number(newCampaignForm.targetLeads),
      generatedLeads: 0,
      budget: Number(newCampaignForm.budget),
      startDate: newCampaignForm.startDate,
      endDate: newCampaignForm.endDate,
      platforms: newCampaignForm.platforms,
      status: 'Active'
    }

    const updated = [camp, ...campaigns]
    setCampaigns(updated)
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(updated))
    setShowCampaignModal(false)
  }

  // Analytics Chart Sample Data
  const analyticsData = useMemo(() => {
    return [
      { day: 'Mon', reach: 4200, engagement: 820, leads: 6 },
      { day: 'Tue', reach: 5800, engagement: 1150, leads: 9 },
      { day: 'Wed', reach: 6400, engagement: 1320, leads: 12 },
      { day: 'Thu', reach: 5100, engagement: 980, leads: 7 },
      { day: 'Fri', reach: 7900, engagement: 1650, leads: 15 },
      { day: 'Sat', reach: 9200, engagement: 2100, leads: 18 },
      { day: 'Sun', reach: 8400, engagement: 1890, leads: 14 }
    ]
  }, [])

  const platformDistribution = [
    { name: 'Instagram', value: 62, color: '#0066FF' },
    { name: 'Facebook', value: 22, color: '#3B82F6' },
    { name: 'WhatsApp', value: 11, color: '#0066FF' },
    { name: 'YouTube Shorts', value: 5, color: '#EF4444' }
  ]

  // Psychological Framework Presets
  const psychologicalFrameworks = [
    {
      title: '🔥 Hook Formulas (Stop the Scroll)',
      description: 'Disrupt pattern, highlight common pain points, and tease high-value answers.',
      examples: [
        '3 harsh truths about [fitness goal] nobody tells you.',
        'Stop doing [common exercise mistake] if you want to protect your joints.',
        'The #1 reason 80% of gym members quit in week 3 (and the fix).'
      ]
    },
    {
      title: '📖 Storytelling Templates (Build Connection)',
      description: 'Empathy-first stories that bridge member struggles to real physical results.',
      examples: [
        'Before vs After Journey: How [Member Name] balanced work & workouts.',
        'Behind the scenes: What a 5 AM training shift looks like at Pulse Fitness.',
        'Why I started coaching: Our founder’s personal fitness journey.'
      ]
    },
    {
      title: '⚡ FOMO & Scarcity Triggers (Drive Action)',
      description: 'Create urgent call-to-actions that turn passive scrollers into immediate leads.',
      examples: [
        'Only 4 slots remaining for our 30-Day September Shred cohort.',
        'Flash Sale: First 10 trial bookings today receive a complimentary PT session.',
        'Offer ends at midnight: Lock in locked-for-life membership rates.'
      ]
    },
    {
      title: '🏆 Social Proof & Authority Formats (Build Trust)',
      description: 'Validate your gym quality with real member stats, reviews, and video clips.',
      examples: [
        'Member Spotlight: -12kg fat loss in 90 days with zero crash diets.',
        'Client Video Review: "Why I switched from my old gym to Pulse Fitness."',
        'Monthly Transformation Tally: 48 members reached milestone goals this month.'
      ]
    }
  ]

  return (
    <div className="space-y-6 pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-600/10 border border-brand-500/20 rounded-xl text-brand-400">
            <Share2 size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Social Media & Content Hub
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              AI content generation, psychological copy frameworks, campaign manager & analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="cursor-pointer px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            <Calendar size={15} />
            <span>Schedule Post</span>
          </button>

          <button
            onClick={() => setShowCampaignModal(true)}
            className="cursor-pointer px-3.5 py-2.5 bg-brand-600 hover:bg-brand-500 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-brand-600/20"
          >
            <Plus size={15} />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('generator')}
          className={`cursor-pointer px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all flex-shrink-0 ${
            activeTab === 'generator'
              ? 'bg-brand-600 text-slate-950 shadow-lg shadow-brand-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sparkles size={16} />
          <span>AI Content Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('frameworks')}
          className={`cursor-pointer px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all flex-shrink-0 ${
            activeTab === 'frameworks'
              ? 'bg-brand-600 text-slate-950 shadow-lg shadow-brand-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Flame size={16} />
          <span>Copywriting Frameworks</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`cursor-pointer px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all flex-shrink-0 ${
            activeTab === 'calendar'
              ? 'bg-brand-600 text-slate-950 shadow-lg shadow-brand-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Calendar size={16} />
          <span>Content Calendar ({scheduledPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`cursor-pointer px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all flex-shrink-0 ${
            activeTab === 'analytics'
              ? 'bg-brand-600 text-slate-950 shadow-lg shadow-brand-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 size={16} />
          <span>Engagement Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('campaigns')}
          className={`cursor-pointer px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all flex-shrink-0 ${
            activeTab === 'campaigns'
              ? 'bg-brand-600 text-slate-950 shadow-lg shadow-brand-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Target size={16} />
          <span>Marketing Campaigns ({campaigns.length})</span>
        </button>
      </div>

      {/* TAB 1: MASTER PROMPT & AI GENERATOR */}
      {activeTab === 'generator' && (
        <div className="space-y-6">
          {/* MASTER PROMPT CONFIGURATION CARD */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-brand-400" />
                  Gym Brand Voice & Master Prompt
                </h2>
                <p className="text-xs text-slate-400">
                  Define your gym's brand voice, target audience & location tone for tailored post ideas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {promptSaved && (
                  <span className="text-xs font-bold text-brand-400 flex items-center gap-1 bg-brand-600/10 px-2.5 py-1 rounded-lg border border-brand-500/20">
                    <Check size={14} /> Saved!
                  </span>
                )}
                <button
                  onClick={handleSavePrompt}
                  className="cursor-pointer px-4 py-2 bg-brand-600 hover:bg-brand-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md"
                >
                  Save Master Prompt
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              value={masterPrompt}
              onChange={e => setMasterPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500 leading-relaxed"
            />

            {/* QUICK BRAND PRESETS */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quick Tones:</span>
              <button
                onClick={() => setMasterPrompt('Pulse Fitness: High-intensity, energetic, hardcore strength focus in Jaipur. Target: Lifters & athletes seeking peak performance.')}
                className="cursor-pointer text-[11px] font-semibold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
              >
                🔥 High Performance
              </button>
              <button
                onClick={() => setMasterPrompt('Pulse Fitness: Friendly, welcoming, supportive beginner-focused gym in Jaipur. Target: First-time gym goers & weight loss seekers.')}
                className="cursor-pointer text-[11px] font-semibold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
              >
                🌱 Inclusive & Supportive
              </button>
              <button
                onClick={() => setMasterPrompt('Pulse Fitness: Premium luxury fitness club with sauna, personal trainers, & executive membership. Target: Corporate leaders & professionals.')}
                className="cursor-pointer text-[11px] font-semibold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
              >
                💎 Luxury Executive
              </button>
            </div>
          </div>

          {/* GENERATED POST IDEAS GRID */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Lightbulb size={18} className="text-amber-400" />
                  Generated Social Ideas (5 Fresh Ideas)
                </h3>
                <p className="text-xs text-slate-400">Tailored to your Master Prompt with psychological conversion triggers</p>
              </div>

              <button
                onClick={handleGenerateFreshIdeas}
                disabled={generatingIdeas}
                className="cursor-pointer px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-brand-400 border border-brand-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Zap size={14} className={generatingIdeas ? 'animate-bounce' : ''} />
                <span>{generatingIdeas ? 'Generating...' : 'Generate 5 Fresh Ideas'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {postIdeas.map((idea, idx) => (
                <div
                  key={idea.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-xl flex flex-col justify-between space-y-3 transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-600/10 text-brand-400 border border-brand-500/20">
                        {idea.framework}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                        {idea.platform}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors leading-snug">
                      #{idx + 1}. {idea.title}
                    </h4>

                    <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line max-h-36 overflow-y-auto">
                      {idea.caption}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleCopyText(`${idea.title}\n\n${idea.caption}`, idea.id)}
                      className="cursor-pointer text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                    >
                      {copiedId === idea.id ? (
                        <>
                          <Check size={14} className="text-brand-400" />
                          <span className="text-brand-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy Post</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setNewPostForm({
                          title: idea.title,
                          caption: idea.caption,
                          platform: (idea.platform as any) || 'Instagram',
                          date: new Date().toISOString().split('T')[0],
                          time: '18:00',
                          framework: idea.framework
                        })
                        setShowScheduleModal(true)
                      }}
                      className="cursor-pointer text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                    >
                      <Calendar size={14} /> Schedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COPYWRITING FRAMEWORKS */}
      {activeTab === 'frameworks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {psychologicalFrameworks.map((fw, i) => (
            <div key={i} className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">{fw.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{fw.description}</p>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Example Templates:</span>
                {fw.examples.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 flex items-center justify-between gap-3 group hover:border-brand-500/40 transition-colors"
                  >
                    <span className="leading-relaxed">{ex}</span>
                    <button
                      onClick={() => handleCopyText(ex, `fw_${i}_${exIdx}`)}
                      className="cursor-pointer p-1.5 text-slate-400 hover:text-brand-400 bg-slate-900 rounded-lg flex-shrink-0"
                      title="Copy template"
                    >
                      {copiedId === `fw_${i}_${exIdx}` ? <Check size={14} className="text-brand-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: CONTENT CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar size={18} className="text-blue-400" />
                Scheduled Posts Calendar
              </h2>
              <p className="text-xs text-slate-400">Upcoming automated and manual social media publications</p>
            </div>

            <button
              onClick={() => setShowScheduleModal(true)}
              className="cursor-pointer px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md"
            >
              <Plus size={15} /> Add Scheduled Post
            </button>
          </div>

          <div className="space-y-3">
            {scheduledPosts.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">No posts scheduled yet. Click 'Schedule Post' to add one.</div>
            ) : (
              scheduledPosts.map(post => (
                <div
                  key={post.id}
                  className="p-4 bg-slate-800/40 border border-slate-800 hover:border-slate-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white truncate">{post.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        post.status === 'Published'
                          ? 'bg-brand-600/10 text-brand-400 border border-brand-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {post.status}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {post.platform}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 truncate max-w-xl">{post.caption}</p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {post.date} at {post.time}
                      </span>
                      {post.framework && <span>• Framework: {post.framework}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                    <button
                      onClick={() => handleCopyText(`${post.title}\n\n${post.caption}`, post.id)}
                      className="cursor-pointer px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <Copy size={13} /> Copy
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ENGAGEMENT ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Weekly Total Reach</span>
              <div className="text-2xl font-black text-white mt-1">46,900</div>
              <span className="text-xs text-brand-400 font-bold mt-1 inline-block">+18.4% vs last week</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Engagement Rate</span>
              <div className="text-2xl font-black text-white mt-1">8.4%</div>
              <span className="text-xs text-brand-400 font-bold mt-1 inline-block">2x industry average</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Likes & Shares</span>
              <div className="text-2xl font-black text-white mt-1">9,910</div>
              <span className="text-xs text-blue-400 font-bold mt-1 inline-block">1,420 interactions/day</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Direct Lead Inquiries</span>
              <div className="text-2xl font-black text-white mt-1">82 Leads</div>
              <span className="text-xs text-brand-400 font-bold mt-1 inline-block">Converted to 28 trials</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
              <h3 className="text-base font-bold text-white mb-1">Reach & Interactions Trend</h3>
              <p className="text-xs text-slate-400 mb-4">Daily impressions across Instagram, Facebook & Shorts</p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0066FF" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0066FF" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#F8FAFC',
                        fontSize: '12px'
                      }}
                    />
                    <Area type="monotone" dataKey="reach" stroke="#0066FF" strokeWidth={3} fill="url(#reachGrad)" name="Total Reach" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
              <h3 className="text-base font-bold text-white mb-1">Platform Distribution</h3>
              <p className="text-xs text-slate-400 mb-4">Lead generation by social channel</p>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={platformDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                      {platformDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#0F172A" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#F8FAFC',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 mt-2">
                {platformDistribution.map(p => (
                  <div key={p.name} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: p.color }} />
                      {p.name}
                    </span>
                    <span className="font-bold text-white">{p.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MARKETING CAMPAIGNS */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Target size={18} className="text-brand-400" />
                Active Social Media Campaigns
              </h2>
              <p className="text-xs text-slate-400">Track goal progress, lead conversion, and advertising budget</p>
            </div>

            <button
              onClick={() => setShowCampaignModal(true)}
              className="cursor-pointer px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md"
            >
              <Plus size={15} /> Create Campaign
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map(camp => {
              const progressPct = Math.min(100, Math.round((camp.generatedLeads / camp.targetLeads) * 100))
              return (
                <div key={camp.id} className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-600/10 text-brand-400 border border-brand-500/20">
                        {camp.status}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5">{camp.title}</h3>
                      <p className="text-xs text-slate-400">{camp.goal}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg">
                      Budget: ₹{camp.budget.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Leads Generated</span>
                      <span className="font-bold text-brand-400">
                        {camp.generatedLeads} / {camp.targetLeads} ({progressPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-brand-600 h-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                    <span>Platforms: {camp.platforms.join(', ')}</span>
                    <span>{camp.startDate} to {camp.endDate}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* SCHEDULE POST MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Schedule Social Media Post</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSchedulePostSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Post Title / Topic *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. September Shred Challenge Announcement"
                  value={newPostForm.title}
                  onChange={e => setNewPostForm({ ...newPostForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Caption / Copy *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write post caption or copy from generator..."
                  value={newPostForm.caption}
                  onChange={e => setNewPostForm({ ...newPostForm, caption: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Platform</label>
                  <select
                    value={newPostForm.platform}
                    onChange={e => setNewPostForm({ ...newPostForm, platform: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="YouTube Shorts">YouTube Shorts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Schedule Date</label>
                  <input
                    type="date"
                    value={newPostForm.date}
                    onChange={e => setNewPostForm({ ...newPostForm, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 text-slate-950 rounded-xl text-xs font-bold"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CAMPAIGN MODAL */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create Social Media Campaign</h3>
              <button onClick={() => setShowCampaignModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCampaignSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festival Transformation Drive"
                  value={newCampaignForm.title}
                  onChange={e => setNewCampaignForm({ ...newCampaignForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Goal Description</label>
                <input
                  type="text"
                  placeholder="e.g. Generate 50 trial pass leads in 30 days"
                  value={newCampaignForm.goal}
                  onChange={e => setNewCampaignForm({ ...newCampaignForm, goal: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Lead Count</label>
                  <input
                    type="number"
                    value={newCampaignForm.targetLeads}
                    onChange={e => setNewCampaignForm({ ...newCampaignForm, targetLeads: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Budget (₹)</label>
                  <input
                    type="number"
                    value={newCampaignForm.budget}
                    onChange={e => setNewCampaignForm({ ...newCampaignForm, budget: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCampaignModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 text-slate-950 rounded-xl text-xs font-bold"
                >
                  Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
