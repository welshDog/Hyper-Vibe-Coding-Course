import { useState, type CSSProperties, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Lock, Rocket } from 'lucide-react'
import { supabase } from '../lib/supabase'
import {
  HVZBrand,
  HVZButton,
  HVZCard,
  HVZTag,
  HVZProgress,
  Starfield,
  type TagColor,
} from '../components/ui/hvz'
import { VIBE_LEVELS } from '../lib/vibeLabs'
import { useProgress } from '../hooks/useProgress'

// ─── Types ────────────────────────────────────────────────────────────────────
type WaitlistStatus = 'idle' | 'loading' | 'success' | 'duplicate' | 'error'

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const isValidEmail = (v: string) => v.length <= 254 && EMAIL_REGEX.test(v.trim())

async function submitWaitlist(
  email: string,
  source: string,
): Promise<Exclude<WaitlistStatus, 'idle' | 'loading'>> {
  const { error } = await supabase.from('waitlist').insert({ email, source, country: 'GB' })
  if (!error) return 'success'
  if (error.code === '23505') return 'duplicate'
  return 'error'
}

// ─── Section sizing ───────────────────────────────────────────────────────────
const CONTAINER: CSSProperties = { maxWidth: 1200, margin: '0 auto', padding: '0 24px' }
const SECTION_PAD = 'clamp(64px, 10vw, 128px) 0'

// ─── Top nav ──────────────────────────────────────────────────────────────────
function TopNav() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(10,14,26,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(168,85,247,0.18)',
      }}
    >
      <div
        style={{
          ...CONTAINER,
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <Link to="/" style={{ textDecoration: 'none' }}>
          <HVZBrand />
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          {[
            ['Courses', '/courses'],
            ['Pets', '/pets'],
            ['Pricing', '/pricing'],
            ['Leaderboard', '/leaderboard'],
          ].map(([label, href]) => (
            <Link
              key={label}
              to={href}
              style={{
                color: 'var(--color-text-primary)',
                opacity: 0.8,
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              {label}
            </Link>
          ))}
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <HVZButton variant="ghost" size="sm">
              Sign in
            </HVZButton>
          </Link>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <HVZButton variant="primary" size="sm">
              Start free →
            </HVZButton>
          </Link>
        </nav>
      </div>
    </header>
  )
}

// ─── Waitlist form ────────────────────────────────────────────────────────────
function WaitlistForm({
  source,
  ctaIdle,
  ctaIcon,
  align = 'left',
}: {
  source: string
  ctaIdle: string
  ctaIcon?: 'arrow' | 'rocket'
  align?: 'left' | 'center'
}) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<WaitlistStatus>('idle')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isValidEmail(email)) return
    setStatus('loading')
    setStatus(await submitWaitlist(email.trim().toLowerCase(), source))
  }

  const Icon = ctaIcon === 'rocket' ? Rocket : ArrowRight

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : 'stretch',
        gap: 8,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          maxWidth: 480,
          width: '100%',
          margin: align === 'center' ? '0 auto' : 0,
        }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={status === 'success'}
          aria-label="Email address"
          style={{
            flex: 1,
            minWidth: 200,
            padding: '14px 16px',
            background: 'var(--color-midnight-blue)',
            border: '1px solid rgba(168,85,247,0.3)',
            borderRadius: 8,
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-body)',
            fontSize: 16,
            outline: 'none',
          }}
        />
        <HVZButton
          type="submit"
          variant="primary"
          size="md"
          disabled={status === 'loading' || status === 'success'}
        >
          {status === 'loading' ? (
            'Wiring up the Z0ne...'
          ) : status === 'success' ? (
            <>
              <CheckCircle size={16} /> You're in!
            </>
          ) : (
            <>
              {ctaIdle} <Icon size={16} />
            </>
          )}
        </HVZButton>
      </div>
      {status !== 'idle' && status !== 'loading' && (
        <p
          role="status"
          style={{
            margin: 0,
            fontSize: 14,
            color:
              status === 'success'
                ? 'var(--color-success-mint)'
                : status === 'duplicate'
                ? 'var(--color-warning-amber)'
                : 'var(--color-danger-red)',
          }}
        >
          {status === 'success' && "🎉 You're on the list — we'll shout when doors open."}
          {status === 'duplicate' && "👀 You're already on the list — nice one BROski♾️."}
          {status === 'error' && "Hmm, let's try that again 🔄"}
        </p>
      )}
    </form>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% -10%, var(--color-deep-violet) 0%, var(--color-space-black) 70%)',
        padding: 'clamp(64px, 10vw, 96px) 24px clamp(72px, 12vw, 128px)',
      }}
    >
      <Starfield count={120} />
      <div
        style={{
          ...CONTAINER,
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
          gap: 64,
          alignItems: 'center',
        }}
        className="hero-grid"
      >
        <div style={{ maxWidth: '65ch' }}>
          <HVZTag color="cyan">⚡ Vibe Coding · Beta · Llanelli 🏴󠁧󠁢󠁷󠁬󠁳󠁿</HVZTag>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(40px, 6vw, 72px)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
              margin: '24px 0 20px',
              textWrap: 'balance' as CSSProperties['textWrap'],
              background: 'none',
              WebkitTextFillColor: 'unset',
            }}
          >
            Built for brains that{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--color-violet-lt), var(--color-neon-cyan))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              build differently
            </span>
            .
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.8,
              color: 'var(--color-text-primary)',
              maxWidth: '62ch',
              margin: '0 0 32px',
              opacity: 0.9,
            }}
          >
            A gamified coding course made for ADHD, dyslexic, and autistic minds. Short lessons. Real ships. Real XP. Real BROski$. No shame, no walls of text — just momentum.
          </p>
          <WaitlistForm source="hero" ctaIdle="Let's GO" />
          <div style={{ marginTop: 14 }}>
            <Link
              to="/vibe-labs"
              className="no-underline"
              aria-label="Try a Vibe Lab free — no signup needed"
            >
              <HVZButton variant="ghost" size="md">
                Try Level 1 free — no signup <ArrowRight size={16} />
              </HVZButton>
            </Link>
          </div>
          <div
            style={{
              marginTop: 24,
              display: 'flex',
              gap: 24,
              flexWrap: 'wrap',
              color: 'var(--color-text-secondary)',
              fontSize: 14,
            }}
          >
            <span>✓ Free to start</span>
            <span>✓ No credit card</span>
            <span>✓ Reduce-motion friendly</span>
          </div>
        </div>

        {/* Hero stat card cluster */}
        <div style={{ position: 'relative', minHeight: 380 }} className="hero-cluster">
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100%',
              background: 'rgba(15,27,53,0.7)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(168,85,247,0.3)',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 0 40px rgba(168,85,247,0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--color-text-secondary)',
                  letterSpacing: '0.1em',
                }}
              >
                YOUR Z0NE · LIVE
              </div>
              <span
                aria-hidden
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--color-success-mint)',
                  boxShadow: '0 0 8px var(--color-success-mint)',
                }}
              />
            </div>
            <HVZProgress value={2840} max={4000} label="⚡ XP · LVL 7" />
            <div style={{ marginTop: 14 }}>
              <HVZProgress value={68} max={100} gradient="gold" label="🪙 BROSKI$ WEEKLY" />
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <HVZTag color="mint">✓ Module 03 complete</HVZTag>
              <HVZTag color="amber">🔥 12-day streak</HVZTag>
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '78%',
              background: 'var(--color-midnight-blue)',
              border: '1px solid rgba(0,212,255,0.25)',
              borderRadius: 14,
              padding: 18,
              boxShadow: '0 0 30px rgba(0,212,255,0.18)',
              transform: 'rotate(-2deg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, var(--color-hyper-violet), var(--color-neon-cyan))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                }}
                aria-hidden
              >
                🤖
              </div>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 14,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Spider · AI Mentor
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                  Qwen2.5 · online
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: 'var(--color-text-primary)',
                opacity: 0.9,
              }}
            >
              "Hey BROski♾️ — you're 1 step from finishing today's quest. Want a hint or shall we just ship it? 🚀"
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES: { icon: string; tag: string; tagColor: TagColor; title: string; body: string }[] = [
  {
    icon: '🎯',
    tag: 'LEARN',
    tagColor: 'violet',
    title: 'Learn by doing',
    body: 'Every lesson is a 10-minute build. Watch a tiny clip, copy the vibe, ship it. No 4-hour theory dumps.',
  },
  {
    icon: '🪙',
    tag: 'EARN',
    tagColor: 'gold',
    title: 'Earn XP & BROski$',
    body: 'Real on-chain BROski$ tokens. Real XP that levels up your profile. Your work earns even when you sleep.',
  },
  {
    icon: '🤖',
    tag: 'GROW',
    tagColor: 'cyan',
    title: 'AI-powered mentor',
    body: '29 AI agents on standby. Stuck? Spider drops a hint. Lonely? Bee cheers you on. Never alone in the Z0ne.',
  },
]

function Features() {
  return (
    <section style={{ padding: SECTION_PAD, background: 'var(--color-space-black)' }}>
      <div style={CONTAINER}>
        <div style={{ marginBottom: 48, maxWidth: '65ch' }}>
          <HVZTag color="violet">⚡ Why Hyper Vibe Z0ne</HVZTag>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(32px, 4vw, 48px)',
              lineHeight: 1.1,
              color: 'var(--color-text-primary)',
              margin: '16px 0 14px',
              textWrap: 'balance' as CSSProperties['textWrap'],
            }}
          >
            Three things every other course gets wrong.
          </h2>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.8,
              color: 'var(--color-text-secondary)',
              maxWidth: '62ch',
              margin: 0,
            }}
          >
            We didn't bolt gamification on top of a boring course. We built the course around the way ND brains actually learn.
          </p>
        </div>
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {FEATURES.map((f) => (
            <HVZCard key={f.title} padding={32}>
              <div
                aria-hidden
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, rgba(123,47,190,0.25), rgba(0,212,255,0.18))',
                  border: '1px solid rgba(168,85,247,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  marginBottom: 20,
                }}
              >
                {f.icon}
              </div>
              <HVZTag color={f.tagColor}>{f.tag}</HVZTag>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 24,
                  color: 'var(--color-text-primary)',
                  margin: '12px 0 10px',
                  lineHeight: 1.2,
                  background: 'none',
                  WebkitTextFillColor: 'unset',
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: 'var(--color-text-primary)',
                  opacity: 0.85,
                  margin: 0,
                }}
              >
                {f.body}
              </p>
            </HVZCard>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Course preview ───────────────────────────────────────────────────────────
const QUESTS: { code: string; emoji: string; level: string; levelColor: TagColor; title: string; xp: number; bro: number }[] = [
  { code: 'M01', emoji: '⚡', level: 'Beginner', levelColor: 'mint', title: 'Your first vibe', xp: 50, bro: 25 },
  { code: 'M04', emoji: '🤖', level: 'Intermediate', levelColor: 'amber', title: 'Make an AI agent listen', xp: 150, bro: 75 },
  { code: 'M07', emoji: '🪙', level: 'Hyper-Pro', levelColor: 'pink', title: 'Mint your own BROski$Pet', xp: 500, bro: 250 },
]

function CoursePreview() {
  return (
    <section
      style={{
        padding: SECTION_PAD,
        background: 'linear-gradient(180deg, var(--color-space-black) 0%, var(--color-midnight-blue) 100%)',
      }}
    >
      <div style={CONTAINER}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 48,
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: '65ch' }}>
            <HVZTag color="cyan">🎓 Quests · 12 modules</HVZTag>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'clamp(32px, 4vw, 48px)',
                lineHeight: 1.1,
                color: 'var(--color-text-primary)',
                margin: '16px 0 14px',
                textWrap: 'balance' as CSSProperties['textWrap'],
              }}
            >
              Pick a module. Vibe hard. Stack XP.
            </h2>
            <p
              style={{
                fontSize: 18,
                lineHeight: 1.8,
                color: 'var(--color-text-secondary)',
                maxWidth: '62ch',
                margin: 0,
              }}
            >
              From "first line of code" to "shipped a dNFT pet contract" — every quest pays out in real progress.
            </p>
          </div>
          <Link to="/courses" style={{ textDecoration: 'none' }}>
            <HVZButton variant="ghost">All courses →</HVZButton>
          </Link>
        </div>
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {QUESTS.map((q) => (
            <HVZCard key={q.code}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 14,
                }}
              >
                <HVZTag color="violet">{q.code}</HVZTag>
                <span style={{ fontSize: 24 }} aria-hidden>
                  {q.emoji}
                </span>
              </div>
              <HVZTag color={q.levelColor}>{q.level}</HVZTag>
              <h4
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 22,
                  color: 'var(--color-text-primary)',
                  margin: '12px 0 18px',
                  lineHeight: 1.3,
                }}
              >
                {q.title}
              </h4>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 14,
                  marginBottom: 18,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <span style={{ color: 'var(--color-gold-light)', fontWeight: 700 }}>+{q.xp} XP</span>
                <span style={{ color: 'var(--color-broski-gold)', fontWeight: 700 }}>
                  🪙 {q.bro} BROski$
                </span>
              </div>
              <Link to="/courses" style={{ textDecoration: 'none', display: 'block' }}>
                <HVZButton variant="primary" size="sm" fullWidth>
                  Start quest →
                </HVZButton>
              </Link>
            </HVZCard>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
type Tier = 'silver' | 'gold' | 'hyper'
const QUOTES: { name: string; role: string; quote: string; tier: Tier }[] = [
  {
    name: 'Marcus T.',
    role: 'Former retail manager → junior dev',
    quote:
      "I tried 3 bootcamps and quit all of them. Two weeks into Hyper Vibe and I've got a deployed app with my name on it. This is genuinely different.",
    tier: 'gold',
  },
  {
    name: 'Priya S.',
    role: 'ADHD · designer levelling up',
    quote:
      'My ADHD brain cannot do 40-hour YouTube tutorials. These sessions are short, punchy, and I actually finish them. The badge system keeps me coming back.',
    tier: 'silver',
  },
  {
    name: 'Jake R.',
    role: 'PM who now ships code',
    quote:
      "I've been coding for years but wasted so much time on boilerplate. The vibe coding approach cut my build time in half. Wish I'd found this sooner.",
    tier: 'hyper',
  },
]

function TierChip({ t }: { t: Tier }) {
  const styles: Record<Tier, { bg: string; col: string; label: string }> = {
    silver: { bg: 'linear-gradient(135deg,#2A3548,#455269)', col: '#DCE5F2', label: 'Silver' },
    gold: { bg: 'linear-gradient(135deg, var(--color-broski-gold), var(--color-gold-light))', col: 'var(--color-deep-violet)', label: 'Gold' },
    hyper: { bg: 'linear-gradient(135deg, var(--color-hyper-violet), var(--color-violet-lt), var(--color-neon-cyan))', col: '#fff', label: 'Hyper ♾️' },
  }
  const s = styles[t]
  return (
    <span
      style={{
        display: 'inline-flex',
        padding: '4px 10px',
        borderRadius: 9999,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        background: s.bg,
        color: s.col,
      }}
    >
      {s.label}
    </span>
  )
}

function Testimonials() {
  return (
    <section style={{ padding: SECTION_PAD, background: 'var(--color-space-black)' }}>
      <div style={CONTAINER}>
        <div style={{ marginBottom: 48, maxWidth: '65ch' }}>
          <HVZTag color="pink">💬 BROski♾️ in the wild</HVZTag>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(32px, 4vw, 48px)',
              lineHeight: 1.1,
              color: 'var(--color-text-primary)',
              margin: '16px 0 0',
              textWrap: 'balance' as CSSProperties['textWrap'],
            }}
          >
            Real ND minds, real first ships.
          </h2>
        </div>
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {QUOTES.map((q) => (
            <HVZCard key={q.name} padding={28}>
              <div
                aria-hidden
                style={{
                  fontSize: 32,
                  lineHeight: 1,
                  color: 'var(--color-violet-lt)',
                  marginBottom: 8,
                  fontFamily: 'var(--font-display)',
                }}
              >
                "
              </div>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.8,
                  color: 'var(--color-text-primary)',
                  margin: '0 0 24px',
                  maxWidth: '40ch',
                }}
              >
                {q.quote}
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  paddingTop: 18,
                  borderTop: '1px solid rgba(168,85,247,0.15)',
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {q.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{q.role}</div>
                </div>
                <TierChip t={q.tier} />
              </div>
            </HVZCard>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section
      style={{
        position: 'relative',
        padding: SECTION_PAD,
        background:
          'radial-gradient(ellipse at 50% 50%, rgba(123,47,190,0.18) 0%, var(--color-space-black) 70%)',
        textAlign: 'center',
      }}
    >
      <div style={{ ...CONTAINER, maxWidth: 720 }}>
        <HVZTag color="violet">🚀 Ready when you are</HVZTag>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(32px, 5vw, 56px)',
            lineHeight: 1.1,
            color: 'var(--color-text-primary)',
            margin: '20px 0 16px',
            background: 'none',
            WebkitTextFillColor: 'unset',
          }}
        >
          Ready to ship your{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, var(--color-violet-lt), var(--color-neon-cyan))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            first real app?
          </span>
        </h2>
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.8,
            color: 'var(--color-text-secondary)',
            maxWidth: '52ch',
            margin: '0 auto 32px',
          }}
        >
          Join the waitlist and be first in when we open the doors. No spam — just a shout when you can start.
        </p>
        <WaitlistForm source="footer" ctaIdle="Let's GO" ctaIcon="rocket" align="center" />
        <p style={{ marginTop: 24, fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Already got an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-neon-cyan)' }}>
            Sign in →
          </Link>
        </p>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function SiteFooter() {
  return (
    <footer
      style={{
        background: '#070912',
        borderTop: '1px solid rgba(168,85,247,0.2)',
        padding: '64px 24px 32px',
      }}
    >
      <div style={CONTAINER}>
        <div className="footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
            gap: 48,
            marginBottom: 48,
          }}
        >
          <div style={{ maxWidth: '40ch' }}>
            <HVZBrand size="md" />
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.8,
                color: 'var(--color-text-secondary)',
                margin: '16px 0 20px',
              }}
            >
              Built in Llanelli 🏴󠁧󠁢󠁷󠁬󠁳󠁿 by @welshDog. For brains that build differently.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <HVZTag color="cyan">v0.9 · Beta</HVZTag>
              <HVZTag color="mint">● All systems green</HVZTag>
            </div>
          </div>
          {(
            [
              { h: 'Product', links: [['Courses', '/courses'], ['BROski$Pets', '/pets'], ['Pricing', '/pricing'], ['Quests', '/quests']] },
              { h: 'Community', links: [['Leaderboard', '/leaderboard'], ['Discord', '#'], ['GitHub', 'https://github.com/welshDog/Hyper-Vibe-Coding-Course'], ['Tokens', '/tokens']] },
              { h: 'Brand', links: [['Manifesto', '#'], ['Press kit', '#'], ['Contact', '#'], ['Made in Wales', '#']] },
            ] as { h: string; links: [string, string][] }[]
          ).map((col) => (
            <div key={col.h}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--color-violet-lt)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 14,
                }}
              >
                {col.h}
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    {href.startsWith('http') || href === '#' ? (
                      <a
                        href={href}
                        style={{
                          color: 'var(--color-text-primary)',
                          opacity: 0.75,
                          textDecoration: 'none',
                          fontSize: 15,
                        }}
                      >
                        {label}
                      </a>
                    ) : (
                      <Link
                        to={href}
                        style={{
                          color: 'var(--color-text-primary)',
                          opacity: 0.75,
                          textDecoration: 'none',
                          fontSize: 15,
                        }}
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 24,
            borderTop: '1px solid rgba(168,85,247,0.15)',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            © 2026 HyperFocus Z0ne · Keep it weird, keep it Welsh.
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--color-violet-lt)',
              letterSpacing: '0.1em',
            }}
          >
            ENTER · THE · Z0NE
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Vibe Labs band ───────────────────────────────────────────────────────────
function VibeLabsBand() {
  const [lead, ...path] = VIBE_LEVELS
  // Public page: useProgress no-ops (no query, empty state) for logged-out
  // visitors, so this is pure progressive enhancement for returners.
  const { isLevelComplete, isLoggedIn, progress } = useProgress()
  const leadDone = isLevelComplete(lead.id)
  const claimedCount = progress.completedLevels.length

  return (
    <section
      style={{
        position: 'relative',
        padding: SECTION_PAD,
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(123,47,190,0.12) 0%, var(--color-space-black) 70%)',
      }}
    >
      <div style={CONTAINER}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 48,
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: '65ch' }}>
            <HVZTag color="cyan">🧪 Vibe Labs · Free · No signup</HVZTag>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'clamp(32px, 4vw, 48px)',
                lineHeight: 1.1,
                color: 'var(--color-text-primary)',
                margin: '16px 0 14px',
                textWrap: 'balance' as CSSProperties['textWrap'],
              }}
            >
              Pick your first Big AI. Build something real.
            </h2>
            <p
              style={{
                fontSize: 18,
                lineHeight: 1.8,
                color: 'var(--color-text-secondary)',
                maxWidth: '62ch',
                margin: 0,
              }}
            >
              Five labs, one path. Start with Claude — no account, no card. Claim
              real BROski$ when you ship each level.
            </p>
          </div>
          <Link to="/vibe-labs" style={{ textDecoration: 'none' }}>
            <HVZButton variant="ghost">See all 5 levels →</HVZButton>
          </Link>
        </div>

        <div
          className="vibe-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
            gap: 24,
            alignItems: 'stretch',
          }}
        >
          {/* Featured — Level 1, the free focal action */}
          <HVZCard style={{ display: 'flex', flexDirection: 'column', padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <HVZTag color={lead.accent as TagColor}>{lead.eyebrow}</HVZTag>
              {leadDone && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-broski-gold)',
                    border: '1px solid rgba(245,158,11,0.4)',
                    background: 'rgba(245,158,11,0.1)',
                    borderRadius: 999,
                    padding: '3px 10px',
                  }}
                >
                  <CheckCircle size={12} aria-hidden /> Claimed
                </span>
              )}
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 'clamp(26px, 3vw, 36px)',
                color: 'var(--color-text-primary)',
                margin: '14px 0 10px',
                lineHeight: 1.15,
              }}
            >
              {lead.title}
            </h3>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.7,
                color: 'var(--color-text-secondary)',
                margin: '0 0 20px',
                flex: 1,
              }}
            >
              {lead.tagline}
            </p>
            <div
              style={{
                display: 'flex',
                gap: 20,
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                marginBottom: 22,
              }}
            >
              <span style={{ color: 'var(--color-neon-cyan)', fontWeight: 700 }}>
                +{lead.xp} XP
              </span>
              <span style={{ color: 'var(--color-broski-gold)', fontWeight: 700 }}>
                🪙 +{lead.coins} BROski$
              </span>
              <span style={{ color: 'var(--color-text-secondary)', marginLeft: 'auto' }}>
                {lead.badge}
              </span>
            </div>
            <Link
              to={lead.path}
              style={{ textDecoration: 'none', display: 'block' }}
              aria-label={
                leadDone
                  ? `Replay ${lead.title}`
                  : `Start ${lead.title} free — no signup`
              }
            >
              <HVZButton variant="primary" fullWidth>
                {leadDone ? 'Replay Level 1' : 'Start Level 1 free'}{' '}
                <ArrowRight size={16} />
              </HVZButton>
            </Link>
          </HVZCard>

          {/* The path ahead — L2–5, progression not 5 clones */}
          <Link
            to="/vibe-labs"
            className="no-underline"
            aria-label="See the full Vibe Labs path"
            style={{ textDecoration: 'none' }}
          >
            <HVZCard style={{ height: '100%', padding: 28 }}>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-secondary)',
                  margin: '0 0 18px',
                }}
              >
                The path ahead
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {path.map((lvl, i) => (
                  <div key={lvl.id}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '10px 0',
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          display: 'grid',
                          placeItems: 'center',
                          width: 30,
                          height: 30,
                          flexShrink: 0,
                          borderRadius: 999,
                          border: '1px solid rgba(168,85,247,0.3)',
                          background: 'rgba(168,85,247,0.08)',
                          color: 'var(--color-violet-lt)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {lvl.id}
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span
                          style={{
                            display: 'block',
                            fontSize: 15,
                            fontWeight: 600,
                            color: 'var(--color-text-primary)',
                          }}
                        >
                          {lvl.short} · {lvl.title}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 12,
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          +{lvl.xp} XP · +{lvl.coins} BROski$
                        </span>
                      </span>
                      {isLevelComplete(lvl.id) ? (
                        <CheckCircle
                          size={15}
                          aria-hidden
                          style={{ color: 'var(--color-broski-gold)', flexShrink: 0 }}
                        />
                      ) : (
                        <Lock
                          size={14}
                          aria-hidden
                          style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }}
                        />
                      )}
                    </div>
                    {i < path.length - 1 && (
                      <div
                        style={{
                          height: 1,
                          background: 'rgba(255,255,255,0.06)',
                          margin: '0 0 0 44px',
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--color-text-secondary)',
                  margin: '18px 0 0',
                }}
              >
                {isLoggedIn && claimedCount > 0
                  ? `${claimedCount}/5 claimed — keep the run going ♾️`
                  : 'Each unlocks when you claim the level before it. 🔓'}
              </p>
            </HVZCard>
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ background: 'var(--color-space-black)', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 880px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .hero-cluster { min-height: 320px !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .vibe-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 520px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <TopNav />
      <Hero />
      <VibeLabsBand />
      <Features />
      <CoursePreview />
      <Testimonials />
      <FinalCTA />
      <SiteFooter />
    </div>
  )
}
