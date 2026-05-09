import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/**
 * Tween a number toward a target value with requestAnimationFrame.
 *
 * Returns the in-flight display value. Respects `prefers-reduced-motion`
 * (snaps instantly when reduce is set).
 */
export function useCounterTween(target: number, durationMs: number = 600): number {
  const reduceMotion = usePrefersReducedMotion()
  const [display, setDisplay] = useState<number>(target)
  const fromRef = useRef<number>(target)

  useEffect(() => {
    // Reduce-motion: keep our anchor in sync but don't tween or call
    // setState. The component returns `target` directly below.
    if (reduceMotion) {
      fromRef.current = target
      return
    }
    const from = fromRef.current
    if (from === target) return

    const start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min((t - start) / durationMs, 1)
      const eased = 1 - Math.pow(1 - p, 3) // ease-out cubic
      setDisplay(Math.round(from + (target - from) * eased))
      if (p < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        fromRef.current = target
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs, reduceMotion])

  return reduceMotion ? target : display
}
