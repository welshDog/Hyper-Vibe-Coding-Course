import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, Sparkles, Trophy } from 'lucide-react'
import type { VibeLevel } from '../../lib/vibeLabs'
import type { ClaimOutcome } from '../../hooks/useProgress'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

interface Props {
  level: VibeLevel
  claimed: boolean
  unlocked: boolean
  isLoggedIn: boolean
  claiming: boolean
  onClaim: () => Promise<ClaimOutcome>
}

/**
 * Count up to `target` while `run` is true. Reduced-motion users get the
 * final value with no animation (derived, never set in an effect body).
 */
function useCountUp(target: number, run: boolean): number {
  const reduced = usePrefersReducedMotion()
  const [value, setValue] = useState(0)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    if (!run || reduced) return
    const start = performance.now()
    const dur = 900
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur)
      // easeOutCubic — fast then settle. setState here is in an rAF
      // callback (external), not the effect body — safe.
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))))
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [target, run, reduced])

  if (!run) return 0
  if (reduced) return target
  return value
}

const ERROR_COPY: Record<string, string> = {
  already_claimed: "You've already claimed this one — those BROski$ are safely in your wallet. 🪙",
  locked: 'Finish the level before this one first, then come back and claim.',
  unauthorized: 'Log in to claim your reward.',
  invalid_level: 'Something looked off with that level — try a refresh.',
  error: "Hmm, that didn't go through. Give it another go in a sec. 🔄",
}

export function RewardCard({
  level,
  claimed,
  unlocked,
  isLoggedIn,
  claiming,
  onClaim,
}: Props) {
  const [celebrating, setCelebrating] = useState(false)
  const [justClaimed, setJustClaimed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Derived — no prop→state effect. Earned if the server already had it,
  // or we just claimed it this session.
  const earned = claimed || justClaimed
  const xp = useCountUp(level.xp, earned)
  const coins = useCountUp(level.coins, earned)

  const handleClaim = async () => {
    setError(null)
    const res = await onClaim()
    if (res.ok) {
      setJustClaimed(true)
      setCelebrating(true)
    } else {
      setError(ERROR_COPY[res.reason] ?? ERROR_COPY.error)
      if (res.reason === 'already_claimed') setJustClaimed(true)
    }
  }

  // ---- Locked ----
  if (!unlocked && !earned) {
    return (
      <div className="rounded-hfz-lg border border-hfz-border-soft bg-hfz-midnight/50 p-hfz-6 text-center">
        <Lock className="mx-auto mb-hfz-3 text-hfz-text-disabled" size={24} />
        <p className="text-hfz-body text-hfz-text-secondary">
          Locked — claim <strong className="text-hfz-text-primary">Level {level.id - 1}</strong>{' '}
          first to open this reward.
        </p>
      </div>
    )
  }

  return (
    <div
      className={[
        'relative overflow-hidden rounded-hfz-lg border p-hfz-7 text-center transition-[box-shadow,border-color] duration-500',
        earned
          ? 'border-hfz-gold/60 bg-hfz-deep-violet shadow-hfz-glow-gold'
          : 'border-hfz-border-violet bg-hfz-midnight',
        celebrating &&
          'motion-safe:animate-[vl-reward_700ms_cubic-bezier(0.16,1,0.3,1)]',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        aria-hidden
        className={[
          'mx-auto mb-hfz-4 grid h-14 w-14 place-items-center rounded-hfz-full',
          earned ? 'bg-hfz-gold/15 text-hfz-gold' : 'bg-hfz-violet/15 text-hfz-violet-light',
        ].join(' ')}
      >
        {earned ? <Trophy size={26} /> : <Sparkles size={26} />}
      </div>

      <p className="font-display text-hfz-h3 text-hfz-text-primary">
        {earned ? 'Level Complete' : 'Claim Your Reward'}
      </p>

      <div className="mt-hfz-4 flex items-center justify-center gap-hfz-6">
        <div>
          <div
            className={`font-mono text-hfz-h2 tabular-nums ${
              earned ? 'text-hfz-cyan' : 'text-hfz-text-disabled'
            }`}
          >
            +{earned ? xp : level.xp}
          </div>
          <div className="text-hfz-caption uppercase tracking-hfz-label text-hfz-text-secondary">
            XP
          </div>
        </div>
        <div className="h-10 w-px bg-hfz-border-soft" />
        <div>
          <div
            className={`font-mono text-hfz-h2 tabular-nums ${
              earned ? 'text-hfz-gold' : 'text-hfz-text-disabled'
            }`}
          >
            +{earned ? coins : level.coins}
          </div>
          <div className="text-hfz-caption uppercase tracking-hfz-label text-hfz-text-secondary">
            BROski$
          </div>
        </div>
      </div>

      <p className="mt-hfz-4 text-hfz-body text-hfz-text-secondary">
        Badge: <strong className="text-hfz-text-primary">{level.badge}</strong>
      </p>

      {earned ? (
        <p className="mt-hfz-5 font-display text-hfz-body-lg text-hfz-gold">
          Nice one BROski♾️ — that's yours.
        </p>
      ) : !isLoggedIn ? (
        <Link
          to="/login"
          className="mt-hfz-5 inline-block w-full rounded-hfz-md bg-hfz-violet px-hfz-6 py-hfz-4 font-display text-hfz-body-lg font-bold text-white transition-[transform,filter] duration-150 hover:brightness-110 active:scale-[0.98] sm:w-auto"
        >
          Log in to claim →
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleClaim}
          disabled={claiming}
          className="mt-hfz-5 inline-flex w-full items-center justify-center gap-hfz-2 rounded-hfz-md bg-hfz-violet px-hfz-6 py-hfz-4 font-display text-hfz-body-lg font-bold text-white transition-[transform,filter] duration-150 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 outline-none focus-visible:ring-2 focus-visible:ring-hfz-violet-light/70 focus-visible:ring-offset-2 focus-visible:ring-offset-hfz-deep-violet sm:w-auto"
        >
          {claiming ? 'Claiming…' : `Claim +${level.xp} XP · +${level.coins} BROski$`}
        </button>
      )}

      {error && (
        <p role="status" className="mt-hfz-4 text-hfz-body text-hfz-text-secondary">
          {error}
        </p>
      )}
    </div>
  )
}
