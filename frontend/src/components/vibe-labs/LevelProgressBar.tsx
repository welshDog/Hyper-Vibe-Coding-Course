import { Link } from 'react-router-dom'
import { Check, Lock } from 'lucide-react'
import { VIBE_LEVELS } from '../../lib/vibeLabs'

interface Props {
  /** The level the learner is currently viewing */
  currentId: number
  completedLevels: number[]
  unlocked: (level: number) => boolean
}

type NodeState = 'done' | 'current' | 'open' | 'locked'

/**
 * The 5-step journey tracker. Always visible at the top of every lab page so
 * the learner never loses their place — a core ND wayfinding rule.
 */
export function LevelProgressBar({ currentId, completedLevels, unlocked }: Props) {
  const stateOf = (id: number): NodeState => {
    if (completedLevels.includes(id)) return 'done'
    if (id === currentId) return 'current'
    return unlocked(id) ? 'open' : 'locked'
  }

  return (
    <nav
      aria-label="Vibe Labs progress"
      className="flex items-center gap-1 overflow-x-auto pb-2 sm:justify-center"
    >
      {VIBE_LEVELS.map((lvl, i) => {
        const state = stateOf(lvl.id)
        const navigable = state !== 'locked'

        const dot = (
          <span
            className={[
              'grid h-9 w-9 shrink-0 place-items-center rounded-hfz-full border text-hfz-label',
              'transition-[transform,box-shadow,background-color] duration-200',
              'motion-safe:hover:-translate-y-0.5',
              state === 'done' &&
                'border-hfz-gold bg-hfz-gold/15 text-hfz-gold shadow-hfz-glow-gold',
              state === 'current' &&
                'border-hfz-violet bg-hfz-violet text-white shadow-hfz-glow-violet motion-safe:animate-[vl-pulse_2.4s_ease-in-out_infinite]',
              state === 'open' &&
                'border-hfz-violet/50 bg-hfz-midnight text-hfz-violet-light',
              state === 'locked' &&
                'border-hfz-border-soft bg-hfz-midnight/60 text-hfz-text-disabled',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {state === 'done' ? (
              <Check size={16} strokeWidth={3} aria-hidden />
            ) : state === 'locked' ? (
              <Lock size={14} aria-hidden />
            ) : (
              lvl.id
            )}
          </span>
        )

        return (
          <div key={lvl.id} className="flex items-center">
            {navigable ? (
              <Link
                to={lvl.path}
                aria-current={state === 'current' ? 'step' : undefined}
                aria-label={`Level ${lvl.id}: ${lvl.title}${
                  state === 'done' ? ' (complete)' : ''
                }`}
                className="rounded-hfz-full outline-none focus-visible:ring-2 focus-visible:ring-hfz-violet-light/70 focus-visible:ring-offset-2 focus-visible:ring-offset-hfz-space-black"
              >
                {dot}
              </Link>
            ) : (
              <span
                aria-label={`Level ${lvl.id}: ${lvl.title} (locked — finish Level ${
                  lvl.id - 1
                } to unlock)`}
              >
                {dot}
              </span>
            )}
            {i < VIBE_LEVELS.length - 1 && (
              <span
                aria-hidden
                className={[
                  'mx-1 h-px w-8 sm:w-12',
                  completedLevels.includes(lvl.id)
                    ? 'bg-hfz-gold/50'
                    : 'bg-hfz-border-soft',
                ].join(' ')}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
