// ============================================================
// PetMentorBubble.tsx
// Floating pet mentor widget — lives on every lesson page
// bottom-right corner, shows pet portrait + speech bubble
// Phase 1: Static responses from petPersonalities exampleLines
// Phase 2: LLM wired via pet-mentor-chat Edge Function
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useHUD } from '../../context/HUDContext'
import { getPetPersonality } from '../../lib/petPersonalities'
import type { SpeciesId, MoodTrigger } from '../../lib/petPersonalities'

// ---- Types ------------------------------------------------

type BubbleProps = {
  /** The student's active pet species */
  speciesId: SpeciesId
  /** Current lesson context e.g. "Module 3 — Win Summary" */
  currentModule: string
  /** Triggered mood from parent page — e.g. quiz fail, xp milestone */
  triggerMood?: MoodTrigger
}

type BubbleState = 'collapsed' | 'open' | 'thinking'

// ---- Component --------------------------------------------

export default function PetMentorBubble({
  speciesId,
  currentModule,
  triggerMood,
}: BubbleProps) {
  const { xp } = useHUD()
  const personality = getPetPersonality(speciesId)

  const [state, setState] = useState<BubbleState>('collapsed')
  const [message, setMessage] = useState<string>('')
  const [isStuck, setIsStuck] = useState(false)

  // Show a message based on mood trigger from parent
  useEffect(() => {
    if (!triggerMood) return
    const line = personality.exampleLines[triggerMood]
    if (line) {
      setMessage(line)
      setState('open')
    }
  }, [triggerMood, personality])

  // Auto-open with greeting on first mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage(`${personality.emoji} Hey — I'm ${personality.displayName}. I'm with you on this one.`)
      setState('open')
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // "I'm stuck" button handler — Phase 1 uses scripted hint
  // Phase 2: replace this with Edge Function call
  const handleStuck = useCallback(() => {
    setState('thinking')
    setIsStuck(true)
    setTimeout(() => {
      const hint =
        personality.exampleLines['stuck_on_quiz'] ??
        `${personality.emoji} Hang tight — let's work through this together.`
      setMessage(hint)
      setState('open')
    }, 1200)
  }, [personality])

  const toggle = () => {
    setState((prev) => (prev === 'collapsed' ? 'open' : 'collapsed'))
  }

  // ---- Render -----------------------------------------------

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
      aria-label={`${personality.displayName} pet mentor`}
    >
      {/* Speech bubble */}
      {state !== 'collapsed' && (
        <div
          className="
            max-w-xs rounded-2xl rounded-br-none
            bg-gray-900 border border-purple-500/40
            px-4 py-3 shadow-xl
            text-sm text-white leading-relaxed
            animate-fade-in
          "
        >
          {state === 'thinking' ? (
            <span className="flex items-center gap-2 text-purple-300">
              <span className="animate-pulse">●</span>
              <span className="animate-pulse delay-75">●</span>
              <span className="animate-pulse delay-150">●</span>
            </span>
          ) : (
            <>
              <p className="mb-2">{message}</p>
              {!isStuck && (
                <button
                  onClick={handleStuck}
                  className="
                    mt-1 text-xs text-purple-400 hover:text-purple-200
                    underline underline-offset-2 transition-colors
                  "
                >
                  I'm stuck — help me
                </button>
              )}
              {isStuck && (
                <button
                  onClick={() => setIsStuck(false)}
                  className="
                    mt-1 text-xs text-gray-500 hover:text-gray-300
                    underline underline-offset-2 transition-colors
                  "
                >
                  Thanks {personality.emoji}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Pet avatar button */}
      <button
        onClick={toggle}
        title={`${personality.displayName} — your mentor`}
        className="
          w-14 h-14 rounded-full
          bg-gray-900 border-2 border-purple-500/60
          shadow-lg shadow-purple-900/40
          hover:border-purple-400 hover:scale-110
          transition-all duration-200
          flex items-center justify-center
          text-2xl
          focus:outline-none focus:ring-2 focus:ring-purple-500
        "
      >
        {personality.emoji}
      </button>

      {/* Species label — tiny, under avatar */}
      <span className="text-[10px] text-gray-500 text-center w-14">
        {personality.displayName}
      </span>
    </div>
  )
}
