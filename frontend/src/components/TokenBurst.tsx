// TokenBurst — celebration micro-interaction for BROski$ earn events.
//
// Renders a fixed overlay anchored near the HUD token pill that:
//   1. Pops a "+N BROski$" gold callout (springy entrance + float-up exit)
//   2. Bursts 6 emoji particles (🪙 ✨ 💫) outward in a fan
//
// Driven by HUDContext.pendingTokens — set by either awardTokens(n) or by
// the delta-watcher in HUDContext when `tokens` jumps positive from any
// source (poll, edge fn, manual setTokens).
//
// Reduced-motion: renders the static "+N BROski$" text only — no particles,
// no transforms, no animation.

import { useMemo } from 'react'
import { useHUD } from '../hooks/useHUD'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const PARTICLE_EMOJI = ['🪙', '✨', '💫', '🪙', '✨', '💫'] as const

type Particle = {
  emoji: string
  // Final position offsets in px (animated to via transform)
  dx: number
  dy: number
  rot: number
  delayMs: number
}

function makeParticles(seed: number): Particle[] {
  // Deterministic from seed so re-renders during the animation don't reshuffle.
  const rng = mulberry32(seed)
  return PARTICLE_EMOJI.map((emoji, i) => {
    const angle = (i / PARTICLE_EMOJI.length) * Math.PI * 2 + rng() * 0.4
    const dist = 60 + rng() * 30
    return {
      emoji,
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist - 20, // bias upward — feels like a pop
      rot: (rng() - 0.5) * 240,
      delayMs: i * 35,
    }
  })
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function TokenBurst() {
  const { pendingTokens } = useHUD()
  const reduceMotion = usePrefersReducedMotion()

  // Reseed particle vectors per burst so each celebration looks slightly
  // different (no two earns identical).
  const seed = pendingTokens ?? 0
  const particles = useMemo(() => makeParticles(seed * 9301 + 49297), [seed])

  if (!pendingTokens) return null

  return (
    <div
      aria-live="polite"
      className="fixed top-12 right-6 z-[60] pointer-events-none select-none"
      key={seed} // restart animations on each new burst
    >
      {/* Callout chip */}
      <div
        className={[
          'relative px-3 py-1.5 rounded-hfz-full',
          'bg-gradient-to-br from-hfz-gold/90 to-amber-400/90',
          'shadow-hfz-glow-gold border border-hfz-gold/60',
          'font-mono font-bold text-sm text-hfz-space-black',
          reduceMotion
            ? ''
            : 'motion-safe:animate-[tokenPop_2200ms_cubic-bezier(0.16,1,0.3,1)_forwards]',
        ].join(' ')}
      >
        +{pendingTokens.toLocaleString()} BROski$
      </div>

      {/* Particle burst — skipped under reduced-motion */}
      {!reduceMotion && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {particles.map((p, i) => (
            <span
              key={i}
              className="absolute text-lg motion-safe:animate-[tokenParticle_1100ms_cubic-bezier(0.16,1,0.3,1)_forwards]"
              style={
                {
                  '--dx': `${p.dx}px`,
                  '--dy': `${p.dy}px`,
                  '--rot': `${p.rot}deg`,
                  animationDelay: `${p.delayMs}ms`,
                } as React.CSSProperties
              }
            >
              {p.emoji}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
