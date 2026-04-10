import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
  ArrowRight,
  Zap,
  Trophy,
  Code2,
  Rocket,
  Star,
  CheckCircle,
  Play,
  Clock,
  Users,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ─── Static featured courses ───────────────────────────────────────────────
const FEATURED_COURSES = [
  {
    title: 'Vibe Coding Foundations',
    subtitle: 'Build 3 real apps. Zero prior coding needed.',
    level: 'Beginner',
    levelColor: 'bg-green-100 text-green-800',
    duration: '4 weeks',
    price: 'FREE',
    priceColor: 'text-green-600',
    tags: ['AI Prompting', 'React', 'Deploy'],
    href: '/courses',
  },
  {
    title: 'Hyper Prompt Master',
    subtitle: 'Stop guessing. Start engineering prompts that ship.',
    level: 'Intermediate',
    levelColor: 'bg-purple-100 text-purple-800',
    duration: '5 hours',
    price: '$29',
    priceColor: 'text-gray-900',
    tags: ['Prompt Engineering', 'Debugging', 'Refactors'],
    href: '/courses',
  },
  {
    title: 'Ship Your First Full Stack Thing',
    subtitle: 'React + Supabase + Stripe + Vercel. One weekend.',
    level: 'Intermediate',
    levelColor: 'bg-purple-100 text-purple-800',
    duration: '14 hours',
    price: '$49.99',
    priceColor: 'text-gray-900',
    tags: ['Full Stack', 'Auth', 'Payments'],
    href: '/courses',
  },
];

// ─── Testimonials ──────────────────────────────────────────────────────────
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
];

// ─── How It Works steps ────────────────────────────────────────────────────
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
    body: 'Your job isn\'t to write code — it\'s to know when it\'s good. We train the taste that AI can\'t replace.',
    icon: Zap,
  },
  {
    step: '03',
    title: 'Ship something real',
    body: 'Every session ends with a deployed URL you can share. Portfolio-ready from week one.',
    icon: Rocket,
  },
];

// ─── Stats bar ─────────────────────────────────────────────────────────────
const STATS = [
  { value: '6', label: 'Courses', icon: TrendingUp },
  { value: '< 2h', label: 'First app shipped', icon: Clock },
  { value: '100%', label: 'Project-based', icon: Trophy },
  { value: 'Free', label: 'To start', icon: Users },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative bg-gray-950 overflow-hidden">
        {/* Background glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(107,70,193,0.35) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
            <Zap className="h-3.5 w-3.5" />
            Vibe Coding — the AI-native way to build
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight">
            Stop memorising syntax.
            <br />
            <span className="text-primary">Start shipping</span> apps.
          </h1>

          {/* Sub */}
          <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
            Hyper Vibe teaches you to build real, deployed applications using AI as your co-pilot —
            no prior coding experience needed. ADHD-friendly sessions, project-based from day one.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto px-8 text-base font-semibold">
                Start for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/courses">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 text-base border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <Play className="mr-2 h-4 w-4" />
                Browse courses
              </Button>
            </Link>
          </div>

          {/* Social proof micro-line */}
          <p className="mt-6 text-sm text-gray-500">
            Free to start · No credit card needed · Ship your first app in under 2 hours
          </p>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────── */}
      <section className="bg-gray-900 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center mb-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <dt className="text-2xl font-extrabold text-white">{value}</dt>
                <dd className="text-sm text-gray-400">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── THE PROBLEM ───────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            Why traditional learning fails
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            Tutorials got you 40 hours in
            <br />
            and still can't build anything real.
          </h2>
          <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto">
            Traditional coding courses optimise for syllabus completion, not shipping.
            You memorise syntax. You debug other people's examples. You never build
            <em> your</em> thing. And if you have ADHD, you quit in week 2 — not because
            you're not smart, but because the format is designed for a different brain.
          </p>
          <div className="mt-10 grid sm:grid-cols-3 gap-6 text-left">
            {[
              { problem: 'Syntax memorisation', result: 'Boring and instantly forgotten' },
              { problem: 'Watch-only videos', result: 'No muscle memory, no retention' },
              { problem: 'Mega-tutorials (40h+)', result: 'ADHD brains tap out in hour 2' },
            ].map(({ problem, result }) => (
              <div
                key={problem}
                className="p-5 rounded-xl border border-red-100 bg-red-50"
              >
                <p className="font-semibold text-red-700 text-sm">❌ {problem}</p>
                <p className="mt-1 text-sm text-red-600">{result}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              The Hyper Vibe method
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900">
              Build → taste → ship. Repeat.
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
              Every session is a short, focused build. You leave with deployed code and
              a shareable URL. No exceptions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, body, icon: Icon }) => (
              <div
                key={step}
                className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="absolute -top-3 left-6 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  Step {step}
                </div>
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-5 mt-2">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED COURSES ──────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                What you'll build
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
                Six courses. Zero fluff.
              </h2>
            </div>
            <Link
              to="/courses"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              View all courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURED_COURSES.map((course) => (
              <Link
                to={course.href}
                key={course.title}
                className="group flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-200"
              >
                {/* Card header */}
                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn('text-xs font-semibold px-2.5 py-0.5 rounded-full', course.levelColor)}>
                      {course.level}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {course.duration}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors leading-snug">
                    {course.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{course.subtitle}</p>

                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {course.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <span className={cn('text-lg font-extrabold', course.priceColor)}>
                    {course.price}
                  </span>
                  <span className="text-xs font-semibold text-primary group-hover:underline flex items-center gap-1">
                    Explore <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link to="/courses">
              <Button variant="outline" className="w-full">
                View all courses <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Real results
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
              Students who shipped
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(({ quote, name, role, stars }) => (
              <div
                key={name}
                className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 flex flex-col"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="flex-1 text-gray-700 text-sm leading-relaxed italic">
                  "{quote}"
                </blockquote>
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="font-semibold text-gray-900 text-sm">{name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING PREVIEW ───────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Pricing
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
              Start free. Upgrade when you're hooked.
            </h2>
            <p className="mt-4 text-gray-500 text-lg">No subscription traps. Pay once per course.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {/* Free */}
            <div className="rounded-2xl border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900">Free Forever</h3>
              <p className="mt-1 text-sm text-gray-500">The full Course 1 — no card needed.</p>
              <p className="mt-4 text-4xl font-extrabold text-gray-900">
                $0
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Vibe Coding Foundations (full)',
                  '4 weeks of project-based lessons',
                  'Badge system + XP',
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

            {/* Paid courses */}
            <div className="rounded-2xl border-2 border-primary bg-primary/5 p-8 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most popular
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Individual Courses</h3>
              <p className="mt-1 text-sm text-gray-500">Pick the skills you need, when you need them.</p>
              <p className="mt-4 text-4xl font-extrabold text-gray-900">
                $19–$49
                <span className="text-lg font-normal text-gray-500 ml-1">/ course</span>
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Hyper Prompt Master ($29)',
                  'Component Chaos Lab ($39.99)',
                  'Ship Your First Full Stack Thing ($49.99)',
                  'Hyperfocus HTML & CSS Quick Wins ($19.99)',
                  'Lifetime access, no expiry',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/courses" className="block mt-8">
                <Button className="w-full">
                  Browse courses <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
      <section className="bg-gray-950 py-24">
        <div
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(107,70,193,0.25) 0%, transparent 70%)',
          }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Your first deployed app
            <br />
            <span className="text-primary">is two hours away.</span>
          </h2>
          <p className="mt-6 text-gray-400 text-lg max-w-xl mx-auto">
            Join Hyper Vibe Foundations — free, project-based, and built for brains that don't do boring.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto px-10 text-base font-semibold">
                Start building — it's free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/courses">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-10 text-base border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                See all courses
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-xs text-gray-600">
            No credit card · No syntax · Just ship
          </p>
        </div>
      </section>

    </div>
  );
}
