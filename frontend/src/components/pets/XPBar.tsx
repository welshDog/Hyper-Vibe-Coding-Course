// XPBar — shows progress toward the next evolution stage.
//
// Wraps HVZProgress (which already animates width with a cubic-bezier ease)
// and adds the stage-aware label + an optional violet pulse when the pet's
// mood is `evolving`. Reduced-motion is respected by HVZProgress's CSS
// transition (browsers honour prefers-reduced-motion automatically when the
// transition is set in CSS, but we additionally skip the pulse animation).

import { useEffect, useRef, useState } from 'react'

import { HVZProgress } from '../ui/hvz'
import { progressInStage, EVOLUTION_STAGES } from '../../lib/evolution'

type Props = {
  xp:           number
  /** When true, a soft violet glow pulses on the bar. */
  isEvolving?:  boolean
}

export function XPBar({ xp, isEvolving = false }: Props) {
  const { stage, current, next } = progressInStage(xp)
  // Current stage name/emoji already appears in the "Stage: X" caption
  // PetCard renders right above this bar — the label here only names the
  // *next* stage, so the two lines don't repeat the same stage twice.
  const stageIdx = EVOLUTION_STAGES.findIndex((s) => s.key === stage)
  const nextStage = EVOLUTION_STAGES[stageIdx + 1]
  const atMax = next === 0

  // Animate the fill from 0 → current on first mount so the bar reveals
  // itself. HVZProgress renders its own "{value} / {max}" pair whenever a
  // label is set — animate the real XP value (not a 0-100 percent) so that
  // pair shows the actual current/next XP instead of a redundant percent
  // sitting next to hand-written XP numbers in the label text.
  const [renderedCurrent, setRenderedCurrent] = useState(0)
  const initialised = useRef(false)
  useEffect(() => {
    if (!initialised.current) {
      const id = requestAnimationFrame(() => setRenderedCurrent(current))
      initialised.current = true
      return () => cancelAnimationFrame(id)
    }
    setRenderedCurrent(current)
  }, [current])

  const label = atMax ? '👑 Fully evolved' : `Next: ${nextStage.label} ${nextStage.emoji}`

  return (
    <div
      className={isEvolving ? 'rounded-full ring-2 ring-pet-slime-dark/60 shadow-pet-outline motion-safe:animate-border-pulse' : undefined}
    >
      <HVZProgress
        value={atMax ? 100 : renderedCurrent}
        max={atMax ? 100 : next}
        gradient={atMax ? 'gold' : 'xp'}
        label={label}
        trackStyle={{ border: '2px solid #241C3D', background: '#FFF8EC' }}
      />
    </div>
  )
}
