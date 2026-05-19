import { useAuthStatus } from '../hooks/useAuthStatus'

const TONE: Record<
  'green' | 'gray' | 'amber' | 'red',
  { dot: string; text: string; ring: string; bg: string }
> = {
  green: { dot: 'bg-hfz-mint', text: 'text-hfz-mint', ring: 'border-hfz-mint/40', bg: 'bg-hfz-mint/10' },
  gray: {
    dot: 'bg-hfz-text-secondary',
    text: 'text-hfz-text-secondary',
    ring: 'border-hfz-border-soft',
    bg: 'bg-white/5',
  },
  amber: { dot: 'bg-hfz-amber', text: 'text-hfz-amber', ring: 'border-hfz-amber/40', bg: 'bg-hfz-amber/10' },
  red: { dot: 'bg-hfz-danger', text: 'text-hfz-danger', ring: 'border-hfz-danger/40', bg: 'bg-hfz-danger/10' },
}

/**
 * One compact, honest auth pill. Driven solely by useAuthStatus (Supabase
 * session truth). Lives in the authed app shell — NOT the public funnel.
 * Announced to screen readers so the UI doesn't lie to anyone.
 */
export function AuthStatusBadge({ className = '' }: { className?: string }) {
  const { status, label, tone } = useAuthStatus()
  const t = TONE[tone]

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={`Account status: ${label}`}
      data-auth-status={status}
      className={`inline-flex items-center gap-1.5 rounded-hfz-full border ${t.ring} ${t.bg} px-hfz-3 py-1 text-hfz-caption font-semibold ${t.text} ${className}`}
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-hfz-full ${t.dot} ${
          tone === 'amber' ? 'motion-safe:animate-pulse' : ''
        }`}
      />
      {label}
    </span>
  )
}
