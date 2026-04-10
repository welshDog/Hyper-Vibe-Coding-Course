import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Zap,
  Trophy,
  Rocket,
  Code2,
  Star,
  Users,
  CheckCircle,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
type WaitlistStatus = 'idle' | 'loading' | 'success' | 'duplicate' | 'error'

// ─── Static data ──────────────────────────────────────────────────────────────
const FEATURED_COURSES = [
  {
    title: 'Vibe Coding Foundations',
    subtitle: 'Build 3 real apps in 4 weeks. Zero prior coding needed.',
    level: 'Beginner',
    levelColor: 'bg-green-100 text-green-800',
    duration: '4 weeks',
    price: 'FREE',
    priceColor: 'text-green-600 font-extrabold',
    tags: ['AI Prompting', 'React', 'Deploy'],
    href: '/courses',
  },
  {
    title: 'Hyper Prompt Master',
    subtitle: 'Stop guessing. Start engineering prompts that actually ship.',
    level: 'Intermediate',
    levelColor: 'bg-violet-100 text-violet-800',
    duration: '5 hours',
    price: '£29',
    priceColor: 'text-gray-900 font-extrabold',
    tags: ['Prompt Engineering', 'Debugging', 'Refactors'],
    href: '/courses',
  },
  {
    title: 'Ship Your First Full Stack Thing',
    subtitle: 'React + Supabase + Stripe + Vercel. One brain, one weekend.',
    level: 'Intermediate',
    levelColor: 'bg-violet-100 text-violet-800',
    duration: '14 hours',
    price: '£49.99',
    priceColor: 'text-gray-900 font-extrabold',
    tags: ['Full Stack', 'Auth', 'Payments'],
    href: '/courses',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Describe what you want',
    body: 'No syntax memorisation. Tell Claude what to build in plain English — the app, the vibe, the feeling.',
    icon: Code2,
  },
  {
    step: '02',
    title: 'Iterate with taste',
    body: "Your job isn't to write code — it's to know when it's good. We train the taste that AI can't replace.",
    icon: Zap,
  },
  {
    step: '03',
    title: 'Ship something real',
    body: 'Every session ends with a deployed URL you can share. Portfolio-ready from week one.',
    icon: Rocket,
  },
]

const TESTIMONIALS = [
  {
    quote:
      "I tried 3 bootcamps and quit all of them. Two weeks into Hyper Vibe and I've got a deployed app with my name on it. This is genuinely different.",
    name: 'Marcus T.',
    role: 'Former retail manager → junior dev',
    stars: 5,
  },
  {
    quote:
      "My ADHD brain cannot do 40-hour YouTube tutorials. These sessions are short, punchy, and I actually finish them. The badge system keeps me coming back.",
    name: 'Priya S.',
    role: 'Graphic designer levelling up',
    stars: 5,
  },
  {
    quote:
      "I've been coding for years but wasted so much time on boilerplate. The vibe coding approach cut my build time in half. Wish I'd found this sooner.",
    name: 'Jake R.',
    role: 'Product manager who now ships code',
    stars: 5,
  },
]

const VIBE_VS_TRADITIONAL = [
  { old: 'Memorise syntax for weeks', vibe: 'Describe it, AI writes it' },
  { old: '40-hour video marathons', vibe: 'Focused 2-hour build sessions' },
  { old: 'Debug tutorials you didn\'t write', vibe: 'Debug YOUR app, YOUR ideas' },
  { old: 'CS theory before you ship anything', vibe: 'Ship in session one' },
  { old: 'Quit when ADHD hits', vibe: 'Short loops designed for your brain' },
]

// ─── Shared waitlist submit ────────────────────────────────────────────────────
async function submitWaitlist(
  email: string,
  source: string,
): Promise<Exclude<WaitlistStatus, 'idle' | 'loading'>> {
  const { error } = await supabase.from('waitlist').insert({ email, source, country: 'GB' })
  if (!error) return 'success'
  if (error.code === '23505') return 'duplicate'
  return 'error'
}

// ─── Waitlist status message ───────────────────────────────────────────────────
function WaitlistMessage({ status }: { status: WaitlistStatus }) {
  if (status === 'idle' || status === 'loading') return null
  return (
    <p
      className={cn('text-sm mt-2', {
        'text-green-400': status === 'success',
        'text-yellow-400': status === 'duplicate',
        'text-red-400': status === 'error',
      })}
    >
      {status === 'success' && "🎉 You're on the list! We'll shout when doors open."}
      {status === 'duplicate' && "👀 You're already on the list — nice one!"}
      {status === 'error' && 'Something went wrong. Try again in a sec.'}
    </p>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [heroEmail, setHeroEmail] = useState('')
  const [heroStatus, setHeroStatus] = useState<WaitlistStatus>('idle')
  const [footerEmail, setFooterEmail] = useState('')
  const [footerStatus, setFooterStatus] = useState<WaitlistStatus>('idle')

  async function submitHeroWaitlist(e: React.FormEvent) {
    e.preventDefault()
    if (!heroEmail || !heroEmail.includes('@')) return
    setHeroStatus('loading')
    setHeroStatus(await submitWaitlist(heroEmail, 'hero'))
  }

  async function submitFooterWaitlist(e: React.FormEvent) {
    e.preventDefault()
    if (!footerEmail || !footerEmail.includes('@')) return
    setFooterStatus('loading')
    setFooterStatus(await submitWaitlist(footerEmail, 'footer'))
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1 — HERO
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative bg-gray-950 min-h-screen flex items-center overflow-hidden">
        {/* Background glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(139,92,246,0.4) 0%, rgba(6,182,212,0.1) 50%, transparent 70%)',
          }}
        />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          {/* Welsh badge */}
          <div className="mb-8">
            <span className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 px-4 py-1 text-sm font-medium">
              🏴󠁧󠁢󠁷󠁬󠁳󠁠 Built in Wales for ADHD builders — not CS students
            </span>
          </div>

          {/* Headline */}
          <h1 className="max-w-3xl">
            <span className="block text-6xl font-black text-white leading-none tracking-tight">
              Vibe Code
            </span>
            <span className="block text-6xl font-black leading-none tracking-tight bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mt-1">
              The Hyper Way
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-gray-400 text-xl max-w-2xl leading-relaxed">
            If you've got ADHD, dyslexia, or a brain that won't sit still in a classroom —
            this was built for you. Ship real apps with AI. No CS degree. No gatekeeping.
            Just you, Claude, and a laptop.
          </p>

          {/* Waitlist form */}
          <form onSubmit={submitHeroWaitlist} className="mt-10">
            <div className="flex gap-3 max-w-md">
              <input
                type="email"
                value={heroEmail}
                onChange={(e) => setHeroEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={heroStatus === 'success'}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 flex-1 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={heroStatus === 'loading' || heroStatus === 'success'}
                className="bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                {heroStatus === 'loading' ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Joining...
                  </>
                ) : heroStatus === 'success' ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    You're in!
                  </>
                ) : (
                  <>
                    Join waitlist
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
            <WaitlistMessage status={heroStatus} />
          </form>

          {/* Secondary CTAs */}
          <div className="mt-5 flex items-center gap-6">
            <Link
              to="/courses"
              className="text-violet-400 hover:text-violet-300 text-sm underline-offset-4 hover:underline transition-colors"
            >
              Browse Courses →
            </Link>
            <Link
              to="/courses/vibe-coding-foundations"
              className="text-gray-500 hover:text-gray-400 text-sm transition-colors"
            >
              ▶ Free Lesson
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2 — SOCIAL PROOF BAR
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-gray-900 py-6 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex flex-wrap justify-center gap-8 text-gray-400 text-sm">
            <li>🧠 Neurodivergent-first design</li>
            <li>⭐ BROski XP gamification</li>
            <li>🚀 Ship real apps from week 1</li>
            <li>⚡ AI-powered learning</li>
            <li>💰 Start free · from £29</li>
            <li>🏴󠁧󠁢󠁷󠁬󠁳󠁠 Built by a builder, not a corporation</li>
          </ul>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3 — WHAT IS VIBE CODING?
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div>
              <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest">
                What is vibe coding?
              </p>
              <h2 className="mt-3 text-4xl font-black text-gray-900 leading-tight">
                Taste over syntax.
                <br />
                <span className="text-violet-600">You direct. AI builds.</span>
              </h2>
              <p className="mt-5 text-gray-500 text-lg leading-relaxed">
                Vibe coding is the idea that in 2026, the limiting factor isn't technical
                skill — it's creative direction. AI writes the code. You decide what to build,
                how it should feel, and whether it's any good.
              </p>
              <p className="mt-4 text-gray-500 text-lg leading-relaxed">
                That's a taste problem. And taste? That's very much a human thing.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  { icon: Code2, text: 'No syntax to memorise — describe it in plain English' },
                  { icon: Zap,   text: 'Instant feedback loops — build → see → tweak in seconds' },
                  { icon: Trophy, text: 'Ship from day one — every lesson ends with deployed code' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-gray-700">
                    <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-violet-600" />
                    </div>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — Before vs After comparison */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
              <div className="grid grid-cols-2 text-xs font-bold uppercase tracking-wider">
                <div className="bg-red-50 text-red-600 px-5 py-3 border-b border-gray-200">
                  ❌ Old way
                </div>
                <div className="bg-violet-50 text-violet-600 px-5 py-3 border-b border-gray-200">
                  ✅ Vibe way
                </div>
              </div>
              {VIBE_VS_TRADITIONAL.map(({ old, vibe }, i) => (
                <div
                  key={i}
                  className={cn(
                    'grid grid-cols-2 text-sm',
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50',
                  )}
                >
                  <div className="px-5 py-4 text-gray-400 border-r border-gray-100">{old}</div>
                  <div className="px-5 py-4 text-gray-800 font-medium">{vibe}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4 — THE PROBLEM
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-sm font-semibold text-violet-400 uppercase tracking-wider mb-4">
            Why traditional learning fails
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            Tutorials got you 40 hours in
            <br />
            and you still can't build anything real.
          </h2>
          <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
            Traditional courses optimise for syllabus completion, not shipping. You memorise
            syntax. You debug other people's examples. And if you have ADHD, you're gone by
            week two — not because you're not smart, but because the format is broken.
          </p>
          <div className="mt-10 grid sm:grid-cols-3 gap-6 text-left">
            {[
              { problem: 'Syntax memorisation', result: 'Boring and forgotten by Sunday' },
              { problem: 'Watch-only tutorials', result: 'No muscle memory, no retention' },
              { problem: 'Mega-courses (40h+)', result: 'ADHD brains tap out in hour 2' },
            ].map(({ problem, result }) => (
              <div key={problem} className="p-5 rounded-xl border border-red-900/40 bg-red-950/30">
                <p className="font-semibold text-red-400 text-sm">❌ {problem}</p>
                <p className="mt-1 text-sm text-red-300/70">{result}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5 — HOW IT WORKS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest">
              The Hyper Vibe method
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-gray-900">
              Describe. Build. Ship. Repeat.
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
              Every session is a focused build. You leave with deployed code and a shareable
              URL. No exceptions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, body, icon: Icon }) => (
              <div
                key={step}
                className="relative bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all"
              >
                <div className="absolute -top-3.5 left-6">
                  <span className="text-xs font-bold text-violet-600 bg-violet-100 px-2.5 py-1 rounded-full">
                    Step {step}
                  </span>
                </div>
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-violet-100 mb-5 mt-2">
                  <Icon className="h-6 w-6 text-violet-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 6 — FEATURED COURSES
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-violet-400 font-semibold text-sm uppercase tracking-widest">
                What you'll build
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black text-white">
                Six courses. Zero fluff.
              </h2>
            </div>
            <Link
              to="/courses"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURED_COURSES.map((course) => (
              <Link
                key={course.title}
                to={course.href}
                className="group flex flex-col rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-200"
              >
                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn('text-xs font-semibold px-2.5 py-0.5 rounded-full', course.levelColor)}>
                      {course.level}
                    </span>
                    <span className="text-xs text-gray-500">{course.duration}</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors leading-snug">
                    {course.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-400 leading-relaxed">{course.subtitle}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {course.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-gray-800 text-gray-400 border border-gray-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
                  <span className={cn('text-lg', course.priceColor)}>{course.price}</span>
                  <span className="text-xs font-semibold text-violet-400 group-hover:text-violet-300 flex items-center gap-1 transition-colors">
                    Explore <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link to="/courses">
              <Button variant="outline" className="w-full border-gray-700 text-gray-300">
                View all courses <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 7 — TESTIMONIALS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest">
              Real results
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-gray-900">
              Students who shipped.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(({ quote, name, role, stars }) => (
              <div
                key={name}
                className="bg-gray-50 rounded-2xl p-7 border border-gray-100 flex flex-col hover:border-violet-200 transition-colors"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="flex-1 text-gray-600 text-sm leading-relaxed">
                  "{quote}"
                </blockquote>
                <div className="mt-5 pt-5 border-t border-gray-200">
                  <p className="font-bold text-gray-900 text-sm">{name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 8 — PRICING PREVIEW
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest">
              Pricing
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-gray-900">
              Start free. Upgrade when you're hooked.
            </h2>
            <p className="mt-4 text-gray-500 text-lg">No subscription traps. Pay once per course.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {/* Free tier */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="text-xl font-bold text-gray-900">Free Forever</h3>
              <p className="mt-1 text-sm text-gray-500">The full Course 1 — no card needed.</p>
              <p className="mt-6 text-5xl font-black text-gray-900">£0</p>
              <ul className="mt-6 space-y-3">
                {[
                  'Vibe Coding Foundations (full)',
                  '4 weeks of project-based lessons',
                  'XP + badge system',
                  'Community Discord access',
                  'Deploy 3 real apps',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block mt-8">
                <Button variant="outline" className="w-full">
                  Start for free
                </Button>
              </Link>
            </div>

            {/* Paid tier */}
            <div className="rounded-2xl border-2 border-violet-500 bg-violet-50 p-8 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most popular
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Individual Courses</h3>
              <p className="mt-1 text-sm text-gray-500">Pick the skills you need, when you need them.</p>
              <p className="mt-6 text-5xl font-black text-gray-900">
                £19–£49
                <span className="text-lg font-normal text-gray-500 ml-2">/ course</span>
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Hyper Prompt Master (£29)',
                  'Component Chaos Lab (£39.99)',
                  'Ship Your First Full Stack Thing (£49.99)',
                  'Hyperfocus HTML & CSS Quick Wins (£19.99)',
                  'Lifetime access, no expiry',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-violet-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/courses" className="block mt-8">
                <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white">
                  Browse courses <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-400">
            <Users className="inline h-4 w-4 mr-1 align-middle" />
            Joined by builders from 🇬🇧 🇺🇸 🇨🇦 🇦🇺 🇳🇬 and counting.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 9 — FINAL CTA
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-gray-950 py-24">
        <div
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          style={{
            background: 'none',
          }}
        >
          {/* Glow */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          <div className="relative">
            <Trophy className="h-10 w-10 text-violet-400 mx-auto mb-6" />
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
              Ready to ship your
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                first real app?
              </span>
            </h2>
            <p className="mt-5 text-gray-400 text-lg max-w-xl mx-auto">
              Join the waitlist and be first in when we open the doors.
              No spam. Just a shout when you can start.
            </p>

            {/* Footer waitlist form */}
            <form onSubmit={submitFooterWaitlist} className="mt-10">
              <div className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={footerStatus === 'success'}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 flex-1 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={footerStatus === 'loading' || footerStatus === 'success'}
                  className="bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
                >
                  {footerStatus === 'loading' ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Joining...
                    </>
                  ) : footerStatus === 'success' ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      You're in!
                    </>
                  ) : (
                    <>
                      Let's go
                      <Rocket className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
              <div className="flex justify-center">
                <WaitlistMessage status={footerStatus} />
              </div>
            </form>

            <p className="mt-6 text-xs text-gray-600">
              Already got an account?{' '}
              <Link to="/login" className="text-violet-500 hover:text-violet-400 underline underline-offset-2">
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}
