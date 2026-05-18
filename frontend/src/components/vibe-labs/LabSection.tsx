import type { ReactNode } from 'react'

type Kind = 'stop' | 'why' | 'how' | 'win' | 'next' | 'help' | 'note'

interface Props {
  kind: Kind
  /** Emoji wayfinding anchor — intentional ND navigation aid, not decoration */
  icon: string
  title: string
  children: ReactNode
}

const KIND_ACCENT: Record<Kind, string> = {
  stop: 'text-hfz-cyan',
  why: 'text-hfz-violet-light',
  how: 'text-hfz-violet-light',
  win: 'text-hfz-gold',
  next: 'text-hfz-cyan',
  help: 'text-hfz-text-secondary',
  note: 'text-hfz-text-secondary',
}

/**
 * One pedagogy block. Every lab page is a stack of these in the fixed
 * STOP → WHY → HOW → WIN → NEXT → HELP order (neurodivergent-pedagogy skill).
 * The emoji + label chip is the scannable anchor; the heading carries the
 * real hierarchy so we never depend on emoji alone.
 */
export function LabSection({ kind, icon, title, children }: Props) {
  return (
    <section className="border-t border-hfz-border-soft pt-hfz-6">
      <div className="mb-hfz-4 flex items-baseline gap-hfz-3">
        <span aria-hidden className="text-2xl leading-none">
          {icon}
        </span>
        <h2 className="font-display text-hfz-h3 text-hfz-text-primary">
          <span
            className={`mr-hfz-3 font-mono text-hfz-label uppercase tracking-hfz-label ${KIND_ACCENT[kind]}`}
          >
            {kind}
          </span>
          {title}
        </h2>
      </div>
      <div className="space-y-hfz-4 text-hfz-body-lg text-hfz-text-secondary [&_strong]:text-hfz-text-primary [&_strong]:font-semibold">
        {children}
      </div>
    </section>
  )
}
