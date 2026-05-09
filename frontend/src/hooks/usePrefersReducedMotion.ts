import { useEffect, useState } from 'react'

/**
 * Live-tracks the user's `prefers-reduced-motion` setting.
 *
 * Use this when a transform/animation lives in `style` (inline) or in JS state
 * — Tailwind's `motion-reduce:` variant can't override inline styles, so JS
 * has to gate the value itself.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState<boolean>(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent) => setPrefers(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return prefers
}
