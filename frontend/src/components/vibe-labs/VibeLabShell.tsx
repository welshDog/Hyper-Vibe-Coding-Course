import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getLevel, VIBE_LEVELS } from '../../lib/vibeLabs'
import { useProgress } from '../../hooks/useProgress'
import { LevelProgressBar } from './LevelProgressBar'
import { RewardCard } from './RewardCard'

interface Props {
  levelId: number
  children: ReactNode
}

/**
 * Page chrome shared by all 5 lab pages. Standalone dark (skips the light
 * app Layout, like LandingPage). Owns the progress bar, the reward claim,
 * the next-level bridge, and the scoped motion keyframes.
 */
export function VibeLabShell({ levelId, children }: Props) {
  const level = getLevel(levelId)
  const {
    progress,
    claiming,
    reconciliation,
    claimReward,
    completeLevelLocally,
    levelUnlocked,
    isLevelComplete,
    isLoggedIn,
  } = useProgress()

  if (!level) return null

  const next = VIBE_LEVELS.find((l) => l.id === level.id + 1)
  const earnedThis = isLevelComplete(level.id)
  const banked = earnedThis && isLoggedIn
  const nextUnlocked = next ? earnedThis : false
  const returnTo = encodeURIComponent(level.path)

  return (
    <main className="relative min-h-screen overflow-hidden bg-hfz-space-black text-hfz-text-primary">
      {/* Scoped motion — fully disabled under prefers-reduced-motion */}
      <style>{`
        @keyframes vl-pulse {
          0%,100% { box-shadow: 0 0 8px rgba(168,85,247,0.55); }
          50%     { box-shadow: 0 0 22px rgba(168,85,247,0.95), 0 0 40px rgba(168,85,247,0.35); }
        }
        @keyframes vl-reward {
          0%   { transform: scale(0.97); }
          55%  { transform: scale(1.015); }
          100% { transform: scale(1); }
        }
        @keyframes vl-drift {
          from { transform: translate3d(0,0,0); }
          to   { transform: translate3d(-40px,-30px,0); }
        }
        @keyframes vl-rise {
          from { opacity: 0; transform: translate3d(0,14px,0); }
          to   { opacity: 1; transform: translate3d(0,0,0); }
        }
        .vl-rise { animation: vl-rise 500ms cubic-bezier(0.16,1,0.3,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .vl-rise, [class*="vl-pulse"], [class*="vl-reward"], .vl-stars {
            animation: none !important;
          }
          .vl-rise { opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      {/* Starfield — subtle, slow, behind everything */}
      <div
        aria-hidden
        className="vl-stars pointer-events-none absolute inset-0 opacity-40 motion-safe:animate-[vl-drift_60s_linear_infinite_alternate]"
        style={{
          backgroundImage:
            'radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.5) 0, transparent 100%), radial-gradient(1px 1px at 70% 60%, rgba(0,212,255,0.4) 0, transparent 100%), radial-gradient(1px 1px at 45% 85%, rgba(255,255,255,0.35) 0, transparent 100%), radial-gradient(1px 1px at 85% 20%, rgba(168,85,247,0.4) 0, transparent 100%)',
          backgroundSize: '480px 480px',
        }}
      />

      {/* Hero wash */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b ${level.heroGradient}`}
      />

      <div className="relative mx-auto w-full max-w-3xl px-hfz-5 py-hfz-7">
        <div className="flex items-center justify-between">
          <Link
            to="/vibe-labs"
            className="inline-flex items-center gap-1.5 rounded-hfz-sm text-hfz-label text-hfz-text-secondary transition-colors hover:text-hfz-cyan outline-none focus-visible:ring-2 focus-visible:ring-hfz-violet-light/70 focus-visible:ring-offset-2 focus-visible:ring-offset-hfz-space-black"
          >
            <ArrowLeft size={15} /> Back to Labs
          </Link>
          {earnedThis &&
            (banked ? (
              <span className="rounded-hfz-full border border-hfz-gold/40 bg-hfz-gold/10 px-hfz-3 py-1 text-hfz-caption font-semibold uppercase tracking-hfz-label text-hfz-gold">
                ✓ Claimed
              </span>
            ) : (
              <span className="rounded-hfz-full border border-hfz-cyan/40 bg-hfz-cyan/10 px-hfz-3 py-1 text-hfz-caption font-semibold uppercase tracking-hfz-label text-hfz-cyan">
                ✓ Earned · unbanked
              </span>
            ))}
        </div>

        <div className="mt-hfz-6">
          <LevelProgressBar
            currentId={level.id}
            completedLevels={progress.completedLevels}
            unlocked={levelUnlocked}
          />
        </div>

        {/* Anon→signup bank celebration — greets the returning new account */}
        {reconciliation && (
          <div
            role="status"
            className="vl-rise mt-hfz-6 rounded-hfz-lg border border-hfz-gold/50 bg-hfz-gold/10 p-hfz-5 text-center"
          >
            <p className="font-display text-hfz-body-lg text-hfz-gold">
              🎉 Banked {reconciliation.banked}{' '}
              {reconciliation.banked === 1 ? 'level' : 'levels'} — +
              {reconciliation.xp} XP · +{reconciliation.coins} BROski$ are in
              your wallet. Nice one BROski♾️
            </p>
          </div>
        )}

        {/* Hero */}
        <header className="vl-rise mt-hfz-7">
          <p className="font-mono text-hfz-label uppercase tracking-hfz-caps text-hfz-cyan">
            {level.eyebrow}
          </p>
          <h1 className="mt-hfz-3 font-display text-hfz-h1 tracking-hfz-tight text-hfz-text-primary sm:text-hfz-display">
            {level.title}
          </h1>
          <p className="mt-hfz-4 max-w-xl text-hfz-body-lg text-hfz-text-secondary">
            {level.tagline}
          </p>
        </header>

        {/* Pedagogy content */}
        <div className="mt-hfz-8 space-y-hfz-7">{children}</div>

        {/* Reward — always the closing beat */}
        <div className="mt-hfz-8 border-t border-hfz-border-soft pt-hfz-7">
          <div className="mb-hfz-4 flex items-baseline gap-hfz-3">
            <span aria-hidden className="text-2xl leading-none">
              💰
            </span>
            <h2 className="font-display text-hfz-h3 text-hfz-text-primary">
              <span className="mr-hfz-3 font-mono text-hfz-label uppercase tracking-hfz-label text-hfz-gold">
                reward
              </span>
              Claim Your XP + BROski$
            </h2>
          </div>
          <RewardCard
            level={level}
            earned={earnedThis}
            banked={banked}
            unlocked={levelUnlocked(level.id)}
            isLoggedIn={isLoggedIn}
            claiming={claiming === level.id}
            onClaim={() => claimReward(level.id)}
            onCompleteLocally={() => completeLevelLocally(level.id)}
            bankHref={`/register?returnTo=${returnTo}`}
            loginHref={`/login?returnTo=${returnTo}`}
          />
        </div>

        {/* Next-level bridge — never a dead end */}
        {next && (
          <div className="mt-hfz-7">
            {nextUnlocked ? (
              <Link
                to={next.path}
                className="group flex items-center justify-between rounded-hfz-lg border border-hfz-border-violet bg-hfz-midnight p-hfz-6 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-hfz-violet/50 hover:shadow-hfz-glow-violet outline-none focus-visible:ring-2 focus-visible:ring-hfz-violet-light/70 focus-visible:ring-offset-2 focus-visible:ring-offset-hfz-space-black"
              >
                <span>
                  <span className="block text-hfz-caption uppercase tracking-hfz-label text-hfz-text-secondary">
                    Next · Level {next.id}
                  </span>
                  <span className="mt-1 block font-display text-hfz-h4 text-hfz-text-primary">
                    {next.title}
                  </span>
                </span>
                <ArrowRight
                  className="text-hfz-violet-light transition-transform duration-200 group-hover:translate-x-1"
                  size={22}
                />
              </Link>
            ) : (
              <div className="rounded-hfz-lg border border-hfz-border-soft bg-hfz-midnight/40 p-hfz-6 text-hfz-body text-hfz-text-secondary">
                <span className="block text-hfz-caption uppercase tracking-hfz-label text-hfz-text-disabled">
                  Next · Level {next.id}
                </span>
                <span className="mt-1 block">
                  <strong className="text-hfz-text-primary">{next.title}</strong> unlocks
                  the moment you {isLoggedIn ? "claim this level's reward" : 'complete this level'}.
                </span>
              </div>
            )}
          </div>
        )}

        <footer className="mt-hfz-9 border-t border-hfz-border-soft pt-hfz-5 text-center text-hfz-caption text-hfz-text-disabled">
          Hyperfocus z0ne — Stop apologising for your brain. Start building. ♾️
        </footer>
      </div>
    </main>
  )
}
