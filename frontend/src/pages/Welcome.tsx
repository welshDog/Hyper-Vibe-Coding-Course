import { Link, useNavigate } from 'react-router-dom';
import { Coins, Trophy, Sparkles, Users, Copy, Check, ArrowRight, Rocket } from 'lucide-react';
import { useAuthStore } from '../context/auth';
import { supabase } from '../lib/supabase';
import { useReferralLink } from '../hooks/useReferralLink';
import {
  HVZBrand,
  HVZButton,
  HVZCard,
  HVZTag,
  Starfield,
} from '../components/ui/hvz';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function markOnboarded() {
  const { data: { user } } = await supabase.auth.getUser();
  const existing = (user?.user_metadata ?? {}) as Record<string, unknown>;
  if (existing.onboarded_at) return;
  await supabase.auth.updateUser({
    data: { ...existing, onboarded_at: new Date().toISOString() },
  });
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

function PerkCard({
  icon,
  title,
  body,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  tone: 'violet' | 'cyan' | 'gold' | 'pink';
}) {
  const toneBg: Record<typeof tone, string> = {
    violet: 'rgba(168,85,247,0.15)',
    cyan: 'rgba(0,212,255,0.15)',
    gold: 'rgba(245,158,11,0.15)',
    pink: 'rgba(217,70,239,0.15)',
  };
  const toneBorder: Record<typeof tone, string> = {
    violet: 'rgba(168,85,247,0.3)',
    cyan: 'rgba(0,212,255,0.3)',
    gold: 'rgba(245,158,11,0.3)',
    pink: 'rgba(217,70,239,0.3)',
  };
  const toneText: Record<typeof tone, string> = {
    violet: 'var(--color-violet-lt)',
    cyan: 'var(--color-neon-cyan)',
    gold: 'var(--color-gold-light)',
    pink: 'var(--color-reward-pink)',
  };

  return (
    <HVZCard padding={24} style={{ height: '100%' }}>
      <div
        className="h-12 w-12 rounded-hfz-md flex items-center justify-center mb-4"
        style={{
          background: toneBg[tone],
          border: `1px solid ${toneBorder[tone]}`,
          color: toneText[tone],
        }}
        aria-hidden
      >
        {icon}
      </div>
      <h3
        className="font-display font-bold text-base text-hfz-text-primary mb-2"
        style={{ background: 'none', WebkitTextFillColor: 'unset' }}
      >
        {title}
      </h3>
      <p className="text-sm text-hfz-text-secondary leading-relaxed m-0">
        {body}
      </p>
    </HVZCard>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Welcome() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { referralLink, copied, error, copyReferralLink } = useReferralLink();

  const firstName = (user?.full_name || user?.email || 'BROski♾️').split(' ')[0];

  const enterMissionControl = async () => {
    await markOnboarded();
    navigate('/dashboard');
  };

  const skipForNow = async () => {
    await markOnboarded();
    navigate('/dashboard');
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        background:
          'radial-gradient(ellipse at 50% -10%, var(--color-deep-violet) 0%, var(--color-space-black) 60%)',
        color: 'var(--color-text-primary)',
      }}
    >
      <Starfield count={120} seed={108} />

      {/* Top bar — minimal, focus-first */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
        <HVZBrand size="sm" />
        <button
          type="button"
          onClick={skipForNow}
          className="text-sm font-medium text-hfz-text-secondary hover:text-hfz-text-primary transition-colors"
        >
          Skip the tour →
        </button>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Hero */}
        <section className="text-center pt-8 pb-14 sm:pb-20 flex flex-col items-center gap-5">
          <HVZTag color="cyan">🎉 You made it in</HVZTag>
          <h1
            className="font-display font-extrabold tracking-tight"
            style={{
              fontSize: 'clamp(36px, 6vw, 64px)',
              lineHeight: 1.05,
              background: 'none',
              WebkitTextFillColor: 'unset',
              maxWidth: 760,
            }}
          >
            Welcome to the Z0ne,{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, var(--color-violet-lt), var(--color-neon-cyan))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {firstName}
            </span>
          </h1>
          <p
            className="text-base sm:text-lg text-hfz-text-secondary leading-relaxed"
            style={{ maxWidth: 580 }}
          >
            This is your launchpad, BROski♾️. Three quick beats, then you're loose
            in Mission Control. No reading walls — just the good stuff. 🧠⚡
          </p>
          <div className="mt-2 flex items-center gap-3 flex-wrap justify-center">
            <HVZButton variant="primary" size="lg" onClick={enterMissionControl}>
              <Rocket className="h-5 w-5" />
              Enter Mission Control
            </HVZButton>
          </div>
        </section>

        {/* Step 1: What's waiting */}
        <section className="mb-14 sm:mb-20">
          <div className="mb-6 flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-hfz-full flex items-center justify-center font-bold font-display text-sm"
              style={{
                background:
                  'linear-gradient(135deg, var(--color-hyper-violet), var(--color-neon-cyan))',
                color: '#fff',
              }}
              aria-hidden
            >
              1
            </div>
            <h2
              className="font-display font-bold text-hfz-h3 text-hfz-text-primary m-0"
              style={{ background: 'none', WebkitTextFillColor: 'unset' }}
            >
              What's waiting for you
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PerkCard
              tone="violet"
              icon={<Trophy className="h-6 w-6" />}
              title="XP for shipping"
              body="Every lesson you finish, every quest you crack — XP racks up. Levels unlock. Streaks snowball."
            />
            <PerkCard
              tone="gold"
              icon={<Coins className="h-6 w-6" />}
              title="BROski$ to spend"
              body="Real tokens for real perks: prompt packs, bonus content, agent sandbox access — all in the Shop."
            />
            <PerkCard
              tone="pink"
              icon={<Sparkles className="h-6 w-6" />}
              title="Pets that grow with you"
              body="dNFT companions level up as you do. Holographic, on-chain, ride-or-die."
            />
          </div>
        </section>

        {/* Step 2: Pick your first quest */}
        <section className="mb-14 sm:mb-20">
          <div className="mb-6 flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-hfz-full flex items-center justify-center font-bold font-display text-sm"
              style={{
                background:
                  'linear-gradient(135deg, var(--color-hyper-violet), var(--color-neon-cyan))',
                color: '#fff',
              }}
              aria-hidden
            >
              2
            </div>
            <h2
              className="font-display font-bold text-hfz-h3 text-hfz-text-primary m-0"
              style={{ background: 'none', WebkitTextFillColor: 'unset' }}
            >
              Pick your first quest
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HVZCard padding={24} glow="violet">
              <HVZTag color="cyan">FREE • START HERE</HVZTag>
              <h3
                className="font-display font-bold text-lg text-hfz-text-primary mt-3 mb-2"
                style={{ background: 'none', WebkitTextFillColor: 'unset' }}
              >
                Vibe Coding Foundations
              </h3>
              <p className="text-sm text-hfz-text-secondary leading-relaxed mb-5">
                Your first vibe. Free. No card. Build something tiny that
                actually runs — under an hour. 🎯
              </p>
              <Link to="/courses" className="no-underline">
                <HVZButton variant="primary" size="md" fullWidth>
                  Browse all courses
                  <ArrowRight className="h-4 w-4" />
                </HVZButton>
              </Link>
            </HVZCard>

            <HVZCard padding={24}>
              <HVZTag color="gold">PREMIUM</HVZTag>
              <h3
                className="font-display font-bold text-lg text-hfz-text-primary mt-3 mb-2"
                style={{ background: 'none', WebkitTextFillColor: 'unset' }}
              >
                Vibe Code The Hyper Way
              </h3>
              <p className="text-sm text-hfz-text-secondary leading-relaxed mb-5">
                The flagship. 20 modules, agents, dNFTs, and a graduation
                certificate. £49 — pay once, learn forever.
              </p>
              <Link to="/pricing" className="no-underline">
                <HVZButton variant="ghost" size="md" fullWidth>
                  See plans &amp; pricing
                  <ArrowRight className="h-4 w-4" />
                </HVZButton>
              </Link>
            </HVZCard>
          </div>
        </section>

        {/* Step 3: Bring your crew */}
        <section className="mb-14 sm:mb-20">
          <div className="mb-6 flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-hfz-full flex items-center justify-center font-bold font-display text-sm"
              style={{
                background:
                  'linear-gradient(135deg, var(--color-hyper-violet), var(--color-neon-cyan))',
                color: '#fff',
              }}
              aria-hidden
            >
              3
            </div>
            <h2
              className="font-display font-bold text-hfz-h3 text-hfz-text-primary m-0"
              style={{ background: 'none', WebkitTextFillColor: 'unset' }}
            >
              Bring your crew
            </h2>
          </div>
          <HVZCard padding={28}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div
                className="h-14 w-14 rounded-hfz-md flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(168,85,247,0.15)',
                  border: '1px solid rgba(168,85,247,0.3)',
                }}
                aria-hidden
              >
                <Users className="h-7 w-7 text-hfz-violet-light" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-display font-bold text-base text-hfz-text-primary"
                  style={{ background: 'none', WebkitTextFillColor: 'unset' }}
                >
                  Refer a friend, earn 100 BROski$ 🤝
                </p>
                <p className="text-sm text-hfz-text-secondary mt-1 leading-relaxed">
                  Share your link. When they sign up, 100 BROski$ drops in your
                  account instantly. Both of you win.
                </p>
                {referralLink && (
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <code
                      className="text-xs px-3 py-2 rounded-hfz-sm font-mono truncate max-w-full"
                      style={{
                        background: 'rgba(0,212,255,0.08)',
                        border: '1px solid rgba(0,212,255,0.2)',
                        color: 'var(--color-neon-cyan)',
                        maxWidth: 360,
                      }}
                    >
                      {referralLink}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        void copyReferralLink();
                      }}
                      aria-label="Copy referral link"
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-hfz-sm transition-colors"
                      style={{
                        background: copied
                          ? 'rgba(16,245,160,0.12)'
                          : 'rgba(168,85,247,0.12)',
                        border: `1px solid ${
                          copied ? 'rgba(16,245,160,0.4)' : 'rgba(168,85,247,0.3)'
                        }`,
                        color: copied
                          ? 'var(--color-success-mint)'
                          : 'var(--color-violet-lt)',
                        minHeight: 36,
                      }}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy link
                        </>
                      )}
                    </button>
                  </div>
                )}
                {error && (
                  <span className="sr-only" role="status" aria-live="polite">
                    {error}
                  </span>
                )}
              </div>
            </div>
          </HVZCard>
        </section>

        {/* Final CTA */}
        <section className="text-center pt-4">
          <p className="text-sm text-hfz-text-secondary mb-5">
            Ready when you are. The Z0ne is yours. 🌌
          </p>
          <HVZButton variant="primary" size="lg" onClick={enterMissionControl}>
            <Rocket className="h-5 w-5" />
            Enter Mission Control
          </HVZButton>
        </section>
      </main>
    </div>
  );
}
