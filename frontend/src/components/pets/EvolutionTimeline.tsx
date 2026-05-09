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
  const { stage: currentKey, current, next, percent } = progressInStage(xp)
  const currentIdx = EVOLUTION_STAGES.findIndex((s) => s.key === currentKey)
  const nextStage = EVOLUTION_STAGES[currentIdx + 1]
  const atMax = !nextStage

  return (
    <HVZCard>
      <header className="flex items-baseline justify-between gap-3 mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-hfz-violet-light">
          Evolution path
        </h3>
        <p className="text-[11px] text-hfz-text-secondary">
          Total XP:{' '}
          <span className="font-mono text-hfz-text-primary">
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
          className="hidden lg:block absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-hfz-border-violet/40 z-0"
        />
        {/* Lit XP-gradient trajectory — up to current stage center */}
        <div
          aria-hidden
          className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-hfz-bg-xp shadow-hfz-glow-violet z-0 motion-safe:transition-[width] motion-safe:duration-700 motion-safe:ease-out"
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
                  'flex flex-col items-center text-center gap-1.5 rounded-hfz-md border p-3 h-full transition-colors duration-300 motion-safe:animate-fade-in-up',
                  isCurrent
                    ? 'border-hfz-violet-light bg-hfz-violet-light/10 shadow-hfz-glow-violet motion-safe:animate-border-pulse'
                    : isLegend
                    ? 'border-hfz-gold/40 bg-hfz-gold/5'
                    : reached
                    ? 'border-hfz-border-violet bg-hfz-space-black/40'
                    : 'border-hfz-border-violet/40 bg-hfz-space-black/20 opacity-50',
                ].join(' ')}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className={`leading-none ${isCurrent ? 'text-3xl lg:text-4xl' : 'text-2xl'}`} aria-hidden>
                  {s.emoji}
                </span>
                <p className={`font-bold text-hfz-text-primary ${isCurrent ? 'text-sm' : 'text-xs'}`}>
                  {s.label}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-hfz-text-secondary font-mono">
                  {s.minXp.toLocaleString()} XP
                </p>
                {isCurrent ? (
                  <HVZTag color="violet">You are here</HVZTag>
                ) : reached ? (
                  <span className="text-[10px] text-hfz-mint">✓ Unlocked</span>
                ) : (
                  <span className="text-[10px] text-hfz-text-disabled">Locked</span>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      {atMax ? (
        <div className="mt-4 rounded-hfz-md border border-hfz-gold/40 bg-hfz-gold/5 p-3">
          <p className="text-xs text-hfz-gold-light font-bold">
            👑 Fully evolved — you’re a Legend.
          </p>
        </div>
      ) : (
        <div className="mt-4">
          <HVZProgress
            value={Math.round(percent)}
            max={100}
            gradient="xp"
            label={`Next: ${nextStage.label} ${nextStage.emoji} · ${current.toLocaleString()} / ${next.toLocaleString()} XP`}
          />
          <p className="text-[11px] text-hfz-text-secondary mt-2">
            Earn XP from quests, course progress, and rift events. Your pet
            evolves automatically.
          </p>
        </div>
      )}
    </HVZCard>
  )
}
