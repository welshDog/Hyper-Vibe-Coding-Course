import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, PartyPopper, Sparkles, Trophy } from 'lucide-react'
import type { VibeLevel } from '../../lib/vibeLabs'
import type { ClaimOutcome } from '../../hooks/useProgress'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

interface Props {
  level: VibeLevel
  /** Level complete — local (anon) OR server-banked. */
  earned: boolean
  /** Complete AND server-backed (logged-in). */
  banked: boolean
  unlocked: boolean
  isLoggedIn: boolean
  claiming: boolean
  onClaim: () => Promise<ClaimOutcome>
  /** Anon-only: mark earned locally ("I built it ✓"). */
  onCompleteLocally: () => void
  /** Signup URL carrying a returnTo back to this lab. */
  bankHref: string
  /** Login URL (returning users) carrying the same returnTo. */
  loginHref: string
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
  earned,
  banked,
  unlocked,
  isLoggedIn,
  claiming,
  onClaim,
  onCompleteLocally,
  bankHref,
  loginHref,
}: Props) {
  const [celebrating, setCelebrating] = useState(false)
  const [justClaimed, setJustClaimed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Derived — no prop→state effect. Earned if the server/store already had
  // it, or it was just earned this session (server claim or local mark).
  const earnedNow = earned || justClaimed
  // Banked = it's truly in their wallet (logged-in + server). An anon who
  // earned locally is earnedNow-but-NOT-banked → the conversion moment.
  const bankedNow = (banked || (justClaimed && isLoggedIn))
  const xp = useCountUp(level.xp, earnedNow)
  const coins = useCountUp(level.coins, earnedNow)

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

  const handleCompleteLocally = () => {
    setError(null)
    setCelebrating(true)
    onCompleteLocally() // parent re-renders with `earned` → drives the count-up
  }

  // ---- Locked ----
  if (!unlocked && !earnedNow) {
    return (
      <div className="rounded-hfz-lg border border-hfz-border-soft bg-hfz-midnight/50 p-hfz-6 text-center">
        <Lock className="mx-auto mb-hfz-3 text-hfz-text-disabled" size={24} />
        <p className="text-hfz-body text-hfz-text-secondary">
          Locked — {isLoggedIn ? 'claim' : 'finish'}{' '}
          <strong className="text-hfz-text-primary">Level {level.id - 1}</strong>{' '}
          first to open this reward.
        </p>
      </div>
    )
  }

  const accentEarned = bankedNow ? 'text-hfz-gold' : 'text-hfz-cyan'

  return (
    <div
      className={[
        'relative overflow-hidden rounded-hfz-lg border p-hfz-7 text-center transition-[box-shadow,border-color] duration-500',
        earnedNow
          ? bankedNow
            ? 'border-hfz-gold/60 bg-hfz-deep-violet shadow-hfz-glow-gold'
            : 'border-hfz-cyan/50 bg-hfz-deep-violet shadow-hfz-glow-violet'
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
          earnedNow
            ? bankedNow
              ? 'bg-hfz-gold/15 text-hfz-gold'
              : 'bg-hfz-cyan/15 text-hfz-cyan'
            : 'bg-hfz-violet/15 text-hfz-violet-light',
        ].join(' ')}
      >
        {!earnedNow ? (
          <Sparkles size={26} />
        ) : bankedNow ? (
          <Trophy size={26} />
        ) : (
          <PartyPopper size={26} />
        )}
      </div>

      <p className="font-display text-hfz-h3 text-hfz-text-primary">
        {!earnedNow
          ? 'Claim Your Reward'
          : bankedNow
            ? 'Level Complete'
            : 'You earned it'}
      </p>

      <div className="mt-hfz-4 flex items-center justify-center gap-hfz-6">
        <div>
          <div
            className={`font-mono text-hfz-h2 tabular-nums ${
              earnedNow ? accentEarned : 'text-hfz-text-disabled'
            }`}
          >
            +{earnedNow ? xp : level.xp}
          </div>
          <div className="text-hfz-caption uppercase tracking-hfz-label text-hfz-text-secondary">
            XP
          </div>
        </div>
        <div className="h-10 w-px bg-hfz-border-soft" />
        <div>
          <div
            className={`font-mono text-hfz-h2 tabular-nums ${
              earnedNow ? accentEarned : 'text-hfz-text-disabled'
            }`}
          >
            +{earnedNow ? coins : level.coins}
          </div>
          <div className="text-hfz-caption uppercase tracking-hfz-label text-hfz-text-secondary">
            BROski$
          </div>
        </div>
      </div>

      <p className="mt-hfz-4 text-hfz-body text-hfz-text-secondary">
        Badge: <strong className="text-hfz-text-primary">{level.badge}</strong>
      </p>

      {/* ---- Closing action: depends on banked / earned / who ---- */}
      {bankedNow ? (
        <p className="mt-hfz-5 font-display text-hfz-body-lg text-hfz-gold">
          Nice one BROski♾️ — that's yours.
        </p>
      ) : earnedNow ? (
        // Anon earned, unbanked — THE conversion moment.
        <div className="mt-hfz-5">
          <p className="font-display text-hfz-body-lg text-hfz-cyan">
            Boom — you did that. 🎉
          </p>
          <p className="mt-hfz-2 text-hfz-body text-hfz-text-secondary">
            Your <strong className="text-hfz-text-primary">+{level.xp} XP</strong> and{' '}
            <strong className="text-hfz-text-primary">+{level.coins} BROski$</strong> are
            waiting. Create a free account to bank them — and unlock the next level.
          </p>
          <Link
            to={bankHref}
            className="mt-hfz-5 inline-block w-full rounded-hfz-md bg-hfz-violet px-hfz-6 py-hfz-4 font-display text-hfz-body-lg font-bold text-white transition-[transform,filter] duration-150 hover:brightness-110 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-hfz-violet-light/70 focus-visible:ring-offset-2 focus-visible:ring-offset-hfz-deep-violet sm:w-auto"
          >
            Create a free account to bank it →
          </Link>
          <p className="mt-hfz-3 text-hfz-caption text-hfz-text-secondary">
            Already have one?{' '}
            <Link to={loginHref} className="text-hfz-cyan hover:text-hfz-violet-light">
              Log in to bank it
            </Link>
          </p>
        </div>
      ) : !isLoggedIn ? (
        // Anon, unlocked, not yet earned — the dopamine trigger.
        <div className="mt-hfz-5">
          <button
            type="button"
            onClick={handleCompleteLocally}
            className="inline-flex w-full items-center justify-center gap-hfz-2 rounded-hfz-md bg-hfz-violet px-hfz-6 py-hfz-4 font-display text-hfz-body-lg font-bold text-white transition-[transform,filter] duration-150 hover:brightness-110 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-hfz-violet-light/70 focus-visible:ring-offset-2 focus-visible:ring-offset-hfz-midnight sm:w-auto"
          >
            I built it — mark complete ✓
          </button>
          <p className="mt-hfz-3 text-hfz-caption text-hfz-text-secondary">
            Free · no account needed yet
          </p>
        </div>
      ) : (
        // Logged-in, unlocked, not yet claimed — server claim (unchanged).
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
