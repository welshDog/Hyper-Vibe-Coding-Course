// EvolutionTimeline — Section 4 of /pets.
//
// Static educational element: shows all six evolution stages and where the
// student currently sits based on their HUD XP. Locked stages dim, the
// current stage glows violet, unlocked ones get a checkmark. A progress
// bar underneath shows XP toward the next stage (or a "fully evolved"
// callout once at Legend).

import { HVZCard, HVZProgress, HVZTag } from '../ui/hvz'
import { useHUD } from '../../hooks/useHUD'
import {
  EVOLUTION_STAGES,
  progressInStage,
} from '../../lib/evolution'

type Props = {
  /** Override the XP value (otherwise read from useHUD). */
  xpOverride?: number
}

export function EvolutionTimeline({ xpOverride }: Props) {
  const hud = useHUD()
  const xp = xpOverride ?? hud?.xp ?? 0
  const { stage: currentKey, current, next } = progressInStage(xp)
  const currentIdx = EVOLUTION_STAGES.findIndex((s) => s.key === currentKey)
  const nextStage = EVOLUTION_STAGES[currentIdx + 1]
  const atMax = !nextStage

  return (
    <HVZCard variant="chunky">
      <header className="flex items-baseline justify-between gap-3 mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-pet-wood-dark">
          Evolution path
        </h3>
        <p className="text-[11px] text-pet-ink-soft">
          Total XP:{' '}
          <span className="font-mono text-pet-ink">
            {xp.toLocaleString()}
          </span>
        </p>
      </header>

      {/*
        Asymmetric grid:
          mobile: 2 cols, sm: 3 cols (no col-span — current stays normal width)
          lg: 7 cols total (5 stages × 1 col + current × 2 cols) so current has visual weight
        Connector line sits behind tiles at lg only; lit portion ends at the
        center of the current tile — `(currentIdx + 1) / 7 × 100%`.
      */}
      <ol className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-3">
        {/* Dim base trajectory — full width */}
        <div
          aria-hidden
          className="hidden lg:block absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-pet-ink/15 z-0"
        />
        {/* Lit XP-gradient trajectory — up to current stage center */}
        <div
          aria-hidden
          className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 h-[3px] bg-pet-slime shadow-pet-outline z-0 motion-safe:transition-[width] motion-safe:duration-700 motion-safe:ease-out"
          style={{ width: `${atMax ? 100 : ((currentIdx + 1) / 7) * 100}%` }}
        />

        {EVOLUTION_STAGES.map((s, i) => {
          const reached = i <= currentIdx
          const isCurrent = i === currentIdx
          const isLegend = s.key === 'legend' && reached

          return (
            <li
              key={s.key}
              className={`relative z-10 ${isCurrent ? 'lg:col-span-2' : ''}`}
            >
              <div
                aria-current={isCurrent ? 'step' : undefined}
                className={[
                  'flex flex-col items-center text-center gap-1.5 rounded-hfz-md border-2 p-3 h-full transition-colors duration-300 motion-safe:animate-fade-in-up',
                  isCurrent
                    ? 'border-pet-gold-dark bg-pet-gold/20 shadow-pet-outline motion-safe:animate-border-pulse'
                    : isLegend
                    ? 'border-pet-gold-dark/50 bg-pet-gold/10'
                    : reached
                    ? 'border-pet-slime-dark/50 bg-pet-slime/10'
                    : 'border-pet-ink/15 bg-pet-lilac/20 opacity-60',
                ].join(' ')}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className={`leading-none ${isCurrent ? 'text-3xl lg:text-4xl' : 'text-2xl'}`} aria-hidden>
                  {s.emoji}
                </span>
                <p className={`font-bold text-pet-ink ${isCurrent ? 'text-sm' : 'text-xs'}`}>
                  {s.label}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-pet-ink-soft font-mono">
                  {s.minXp.toLocaleString()} XP
                </p>
                {isCurrent ? (
                  <HVZTag variant="chunky" color="gold">You are here</HVZTag>
                ) : reached ? (
                  <span className="text-[10px] text-pet-slime-dark font-semibold">✓ Unlocked</span>
                ) : (
                  <span className="text-[10px] text-pet-ink-soft/70">Locked</span>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      {atMax ? (
        <div className="mt-4 rounded-hfz-md border-2 border-pet-gold-dark bg-pet-gold/15 p-3">
          <p className="text-xs text-pet-gold-dark font-bold">
            👑 Fully evolved — you’re a Legend.
          </p>
        </div>
      ) : (
        <div className="mt-4">
          {/* value/max are the real current/next XP (not a 0-100 percent) so
              HVZProgress's own "{value} / {max}" pair shows actual XP numbers
              instead of a redundant percent sitting next to hand-written
              XP text in the label. */}
          <HVZProgress
            value={current}
            max={next}
            gradient="xp"
            label={`Next: ${nextStage.label} ${nextStage.emoji}`}
            trackStyle={{ border: '2px solid #241C3D', background: '#FFF8EC' }}
          />
          <p className="text-[11px] text-pet-ink-soft mt-2">
            Earn XP from quests, course progress, and rift events. Your pet
            evolves automatically.
          </p>
        </div>
      )}
    </HVZCard>
  )
}
