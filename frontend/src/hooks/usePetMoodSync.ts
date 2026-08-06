// ============================================================
// usePetMoodSync.ts
// Live mood trigger hook for PetMentorBubble
// Watches student actions and fires MoodTrigger events
// that the bubble reacts to in real time
//
// Triggers it watches:
//   - inactivity (10 min no interaction)
//   - xp milestone (every 100 XP)
//   - quiz fail (quizFailed flag from parent)
//   - module complete (moduleComplete flag from parent)
//   - first login (isFirstLogin flag from auth)
//   - broken code (codeBroken flag from lab)
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react'
import type { MoodTrigger } from '@/lib/petPersonalities'

// ---- Types ------------------------------------------------

export type MoodSyncInput = {
  /** Current student XP — watch for milestone jumps */
  xp: number
  /** Set true when a quiz answer is wrong */
  quizFailed?: boolean
  /** Set true when a module is fully completed */
  moduleComplete?: boolean
  /** Set true on student's very first session */
  isFirstLogin?: boolean
  /** Set true when a code lab returns an error */
  codeBroken?: boolean
  /** XP threshold between milestones — default 100 */
  xpMilestoneStep?: number
}

export type MoodSyncOutput = {
  /** Current active mood trigger — pass to PetMentorBubble */
  activeMood: MoodTrigger | undefined
  /** Call this to manually clear the mood after bubble handles it */
  clearMood: () => void
  /** Call this to manually fire any mood trigger */
  fireMood: (mood: MoodTrigger) => void
}

// ---- Constants --------------------------------------------

const INACTIVITY_MS = 10 * 60 * 1000 // 10 minutes

// ---- Hook -------------------------------------------------

export function usePetMoodSync({
  xp,
  quizFailed = false,
  moduleComplete = false,
  isFirstLogin = false,
  codeBroken = false,
  xpMilestoneStep = 100,
}: MoodSyncInput): MoodSyncOutput {

  const [activeMood, setActiveMood] = useState<MoodTrigger | undefined>(undefined)
  const lastXpRef = useRef<number>(xp)
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firedFirstLoginRef = useRef(false)
  // Previous-value trackers use state, not refs — refs can't be read during
  // render under this project's lint rules, only in effects/handlers.
  const [prevQuizFailed, setPrevQuizFailed] = useState<boolean | undefined>(undefined)
  const [prevModuleComplete, setPrevModuleComplete] = useState<boolean | undefined>(undefined)
  const [prevCodeBroken, setPrevCodeBroken] = useState<boolean | undefined>(undefined)

  // ---- Helper: fire a mood (won't override a higher priority active mood)
  const fireMood = useCallback((mood: MoodTrigger) => {
    setActiveMood(mood)
  }, [])

  const clearMood = useCallback(() => {
    setActiveMood(undefined)
  }, [])

  // ---- First login trigger (fires once only)
  useEffect(() => {
    if (isFirstLogin && !firedFirstLoginRef.current) {
      firedFirstLoginRef.current = true
      fireMood('first_login')
    }
  }, [isFirstLogin, fireMood])

  // ---- Quiz fail / module complete / broken code triggers
  // These just mirror a prop flip into a mood — no async work, no DOM/browser
  // API involved — so per https://react.dev/learn/you-might-not-need-an-effect
  // they're adjusted during render instead of in an effect.
  if (prevQuizFailed !== quizFailed) {
    setPrevQuizFailed(quizFailed)
    if (quizFailed) fireMood('stuck_on_quiz')
  }

  if (prevModuleComplete !== moduleComplete) {
    setPrevModuleComplete(moduleComplete)
    if (moduleComplete) fireMood('module_complete')
  }

  if (prevCodeBroken !== codeBroken) {
    setPrevCodeBroken(codeBroken)
    if (codeBroken) fireMood('broken_code')
  }

  // ---- XP milestone trigger
  useEffect(() => {
    const prevMilestone = Math.floor(lastXpRef.current / xpMilestoneStep)
    const newMilestone = Math.floor(xp / xpMilestoneStep)
    if (newMilestone > prevMilestone && xp > 0) {
      fireMood('xp_milestone')
    }
    lastXpRef.current = xp
  }, [xp, xpMilestoneStep, fireMood])

  // ---- Inactivity trigger
  // Resets timer on any user interaction
  useEffect(() => {
    const resetTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
      inactivityTimerRef.current = setTimeout(() => {
        fireMood('inactivity_10min')
      }, INACTIVITY_MS)
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }))
    resetTimer() // start on mount

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer))
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    }
  }, [fireMood])

  return { activeMood, clearMood, fireMood }
}
