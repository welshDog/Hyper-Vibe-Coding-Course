// XPBar — shows progress toward the next evolution stage.
//
// Wraps HVZProgress (which already animates width with a cubic-bezier ease)
// and adds the stage-aware label + an optional violet pulse when the pet's
// mood is `evolving`. Reduced-motion is respected by HVZProgress's CSS
// transition (browsers honour prefers-reduced-motion automatically when the
// transition is set in CSS, but we additionally skip the pulse animation).

import { useEffect, useRef, useState } from 'react'

import { HVZProgress } from '../ui/hvz'
import { progressInStage, STAGE_BY_KEY } from '../../lib/evolution'

type Props = {
  xp:           number
  /** When true, a soft violet glow pulses on the bar. */
  isEvolving?:  boolean
}

export function XPBar({ xp, isEvolving = false }: Props) {
  const { stage, current, next, percent } = progressInStage(xp)
  const stageInfo = STAGE_BY_KEY[stage]
  const atMax = next === 0

  // Animate width from 0 → percent on first mount so the bar fills in.
  // After the first render we let HVZProgress handle live updates.
  const [renderedPct, setRenderedPct] = useState(0)
  const initialised = useRef(false)
  useEffect(() => {
    if (!initialised.current) {
      const id = requestAnimationFrame(() => setRenderedPct(percent))
      initialised.current = true
      return () => cancelAnimationFrame(id)
    }
    setRenderedPct(percent)
  }, [percent])

  const label = atMax
    ? `${stageInfo.label} ${stageInfo.emoji} — Fully evolved`
    : `${stageInfo.label} ${stageInfo.emoji} → next stage`

  return (
    <div
      className={isEvolving ? 'rounded-full ring-2 ring-hfz-violet-light/60 shadow-hfz-glow-violet motion-safe:animate-border-pulse' : undefined}
    >
      <HVZProgress
        value={atMax ? 100 : Math.round(renderedPct)}
        max={100}
        gradient={atMax ? 'gold' : 'xp'}
        label={atMax ? label : `${label} · ${current.toLocaleString()} / ${next.toLocaleString()} XP`}
      />
    </div>
  )
}
