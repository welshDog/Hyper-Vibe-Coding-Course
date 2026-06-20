// ============================================================
// PetMentorBubble.tsx
// Floating pet mentor widget — lives on lesson pages (NOT global —
// Sacred Rule #5: no global shell). Bottom-right, pet avatar + chat.
//
// Phase 1: scripted lines from petPersonalities exampleLines (mood triggers).
// Phase 2 (this): real chat — message history + input + send, wired to the
//   `pet-mentor-chat` Supabase Edge Function (LLM). Equipped cosmetics
//   (aura / frame / badge / background) decorate the avatar + panel.
//
// Styling: CLAUDE_DESIGN_STYLE.md hfz-* tokens. Dark only, violet/cyan,
//   16px chat body, motion-safe animations, ARIA on icon-only controls.
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuthStore } from '../../context/auth'
import { useHUD } from '../../context/HUDContext'
import { supabase } from '../../lib/supabase'
import { getPetPersonality } from '../../lib/petPersonalities'
import type { SpeciesId, MoodTrigger } from '../../lib/petPersonalities'
import { useOwnedCosmetics, type PetSlot } from '../../hooks/useOwnedCosmetics'
import { HVZButton } from '../ui/hvz'
import { MoodBadge } from './MoodBadge'
import { MOOD_LABEL, type PetMood } from '../../lib/evolution'

// ---- Types ------------------------------------------------

type BubbleProps = {
  /** The student's active pet species. */
  speciesId: SpeciesId
  /** Current lesson context e.g. "Module 3 — Win Summary". */
  currentModule: string
  /** Triggered mood from parent page — e.g. quiz fail, xp milestone. */
  triggerMood?: MoodTrigger
  /** Active pet's contract id ("broski_42") — sent to the chat function. */
  petId?: string
  /** Equipped cosmetics by slot → shop_item id (from pets.cosmetics). */
  cosmetics?: Partial<Record<PetSlot, string>>
  /** The pet's current mood from pets.mood — seeds the avatar mood ring. */
  initialMood?: PetMood
}

type ChatMessage = { id: string; role: 'user' | 'pet'; text: string }

const MAX_MESSAGE_LEN = 500

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `m-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

// Pet mood (PetMood) → avatar ring + glow, matching MoodBadge's colour mapping
// (idle=cyan, learning=mint, hyperfocus=violet, evolving=gold).
const MOOD_RING: Record<PetMood, { border: string; glow: string }> = {
  idle:       { border: 'border-hfz-cyan',         glow: 'shadow-hfz-glow-cyan' },
  learning:   { border: 'border-hfz-mint',         glow: 'shadow-hfz-glow-mint' },
  hyperfocus: { border: 'border-hfz-violet-light', glow: 'shadow-hfz-glow-violet' },
  evolving:   { border: 'border-hfz-gold',         glow: 'shadow-hfz-glow-gold' },
}

// Lesson events (MoodTrigger from the page) → the pet's persistent mood, so the
// avatar reacts to quiz fails / module completes / milestones, not just chat.
const TRIGGER_TO_MOOD: Partial<Record<MoodTrigger, PetMood>> = {
  passed_module:    'evolving',
  module_complete:  'evolving',
  xp_milestone:     'evolving',
  stuck_on_quiz:    'hyperfocus',
  broken_code:      'hyperfocus',
  gave_up:          'hyperfocus',
  opened_hint:      'learning',
  first_login:      'learning',
  inactivity_10min: 'idle',
}

const PET_MOODS: PetMood[] = ['idle', 'learning', 'hyperfocus', 'evolving']
function isPetMood(v: unknown): v is PetMood {
  return typeof v === 'string' && (PET_MOODS as string[]).includes(v)
}

// ---- Component --------------------------------------------

export default function PetMentorBubble({
  speciesId,
  currentModule,
  triggerMood,
  petId,
  cosmetics,
  initialMood,
}: BubbleProps) {
  const { xp } = useHUD()
  const userId = useAuthStore((s) => s.user?.id)
  const personality = getPetPersonality(speciesId)
  const { byId } = useOwnedCosmetics()

  const [open, setOpen] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [mood, setMood] = useState<PetMood>(initialMood ?? 'idle')

  const greetedRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  // Resolve a slot's cosmetic art (image) from the equipped id.
  const art = useCallback(
    (slot: PetSlot) => {
      const id = cosmetics?.[slot]
      return id ? byId[id] ?? null : null
    },
    [cosmetics, byId],
  )

  // ── Auto-open greeting on first mount (deferred — keeps setState out of the
  //    synchronous effect body, per react-hooks/set-state-in-effect). ─────────
  useEffect(() => {
    const timer = setTimeout(() => {
      if (greetedRef.current) return
      greetedRef.current = true
      setMessages((prev) =>
        prev.length > 0
          ? prev
          : [
              {
                id: newId(),
                role: 'pet',
                text: `${personality.emoji} Hey — I'm ${personality.displayName}. I'm with you on this one. Stuck on anything?`,
              },
            ],
      )
      setOpen(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [personality])

  // ── Mood trigger from parent → scripted pet line (deferred). ────────────────
  useEffect(() => {
    if (!triggerMood) return
    const line = personality.exampleLines[triggerMood]
    const mapped = TRIGGER_TO_MOOD[triggerMood]
    if (!line && !mapped) return
    const timer = setTimeout(() => {
      if (mapped) setMood(mapped)
      if (line) {
        setMessages((prev) => [...prev, { id: newId(), role: 'pet', text: line }])
        setOpen(true)
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [triggerMood, personality])

  // ── Keep the latest message in view (ref only — no setState). ───────────────
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, thinking, open])

  // ── Send a message to the LLM mentor. ───────────────────────────────────────
  const sendMessage = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, MAX_MESSAGE_LEN)
      if (!text || thinking) return

      const history = [...messages, { id: newId(), role: 'user' as const, text }]
        .slice(-8)
        .map((m) => ({ role: m.role === 'pet' ? 'assistant' : 'user', content: m.text }))

      setMessages((prev) => [...prev, { id: newId(), role: 'user', text }])
      setInput('')
      setOpen(true)
      setThinking(true)

      try {
        const { data, error } = await supabase.functions.invoke<{
          response: string
          mood_update?: string
        }>('pet-mentor-chat', {
          body: {
            message: text,
            pet_id: petId ?? null,
            user_id: userId ?? null,
            species_id: speciesId,
            xp,
            module: currentModule,
            history: history.slice(0, -1), // exclude the just-sent turn
          },
        })
        if (error) throw error
        const reply =
          data?.response?.trim() ||
          personality.exampleLines.stuck_on_quiz ||
          `${personality.emoji} Let's take the next small step together.`
        setMessages((prev) => [...prev, { id: newId(), role: 'pet', text: reply }])
        if (data && isPetMood(data.mood_update)) setMood(data.mood_update)
      } catch (e) {
        console.error('[pet-mentor-chat] invoke failed:', e)
        const fallback =
          personality.exampleLines.stuck_on_quiz ||
          `${personality.emoji} I'm here with you — try your instinct first, then we fix it together.`
        setMessages((prev) => [...prev, { id: newId(), role: 'pet', text: fallback }])
      } finally {
        setThinking(false)
      }
    },
    [thinking, messages, petId, userId, speciesId, xp, currentModule, personality],
  )

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void sendMessage(input)
  }

  const auraArt = art('aura')
  const frameArt = art('frame')
  const badgeArt = art('badge')
  const bgArt = art('background')

  // ---- Render -----------------------------------------------

  return (
    <div
      className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
      aria-label={`${personality.displayName} pet mentor`}
    >
      {/* ── Chat panel ─────────────────────────────────────────────────── */}
      {open && (
        <div
          role="dialog"
          aria-label={`Chat with ${personality.displayName}`}
          className="pointer-events-auto relative flex w-[min(360px,calc(100vw-3rem))] flex-col overflow-hidden rounded-hfz-lg border border-hfz-border-violet bg-hfz-midnight shadow-hfz-card motion-safe:animate-fade-in-up"
        >
          {/* Equipped background cosmetic — faint wash behind the chat */}
          {bgArt?.image_url && (
            <img
              src={bgArt.image_url}
              alt=""
              aria-hidden
              loading="lazy"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.18]"
            />
          )}

          {/* Header */}
          <div className="relative flex items-center gap-2 border-b border-hfz-border-violet px-4 py-3">
            <span className="text-xl leading-none motion-safe:animate-idle-breath" aria-hidden>
              {personality.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-hfz-body font-semibold text-hfz-text-primary">
                {personality.displayName}
              </p>
              <p className="truncate text-xs text-hfz-text-secondary">your mentor · {currentModule}</p>
            </div>
            <MoodBadge mood={mood} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Minimise chat"
              className="rounded-hfz-sm px-2 py-1 text-hfz-text-secondary transition-colors duration-hfz-fast hover:bg-white/5 hover:text-hfz-text-primary focus:outline-none focus:ring-2 focus:ring-hfz-violet-light"
            >
              ✕
            </button>
          </div>

          {/* Message history */}
          <div
            ref={scrollRef}
            role="log"
            aria-live="polite"
            className="relative flex max-h-[44vh] min-h-[7rem] flex-col gap-2 overflow-y-auto px-4 py-3"
          >
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p
                  className={`max-w-[82%] whitespace-pre-wrap rounded-hfz-md px-3 py-2 text-hfz-body leading-relaxed ${
                    m.role === 'user'
                      ? 'rounded-br-sm bg-hfz-violet text-white'
                      : 'rounded-bl-sm border border-hfz-border-violet bg-hfz-midnight-soft text-hfz-text-primary'
                  }`}
                >
                  {m.text}
                </p>
              </div>
            ))}

            {thinking && (
              <div className="flex justify-start" aria-label={`${personality.displayName} is thinking`}>
                <span className="flex items-center gap-1 rounded-hfz-md rounded-bl-sm border border-hfz-border-violet bg-hfz-midnight-soft px-3 py-2.5 text-hfz-violet-light">
                  <span className="h-1.5 w-1.5 rounded-full bg-current motion-safe:animate-pulse" />
                  <span className="h-1.5 w-1.5 rounded-full bg-current motion-safe:animate-pulse [animation-delay:0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-current motion-safe:animate-pulse [animation-delay:0.3s]" />
                </span>
              </div>
            )}
          </div>

          {/* Quick action */}
          <div className="relative flex flex-wrap gap-2 px-4 pb-1">
            <button
              type="button"
              onClick={() => void sendMessage("I'm stuck — give me a nudge?")}
              disabled={thinking}
              className="rounded-hfz-full border border-hfz-border-violet px-3 py-1 text-xs font-semibold text-hfz-violet-light transition-colors duration-hfz-fast hover:border-hfz-violet-light hover:bg-white/5 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-hfz-violet-light"
            >
              I'm stuck — help me
            </button>
          </div>

          {/* Composer */}
          <form onSubmit={onSubmit} className="relative flex items-center gap-2 p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${personality.displayName}…`}
              maxLength={MAX_MESSAGE_LEN}
              disabled={thinking}
              aria-label={`Message ${personality.displayName}`}
              className="min-w-0 flex-1 rounded-hfz-sm border border-hfz-border-violet bg-white/5 px-3 py-2 text-hfz-body text-hfz-text-primary placeholder:text-hfz-text-disabled transition-colors duration-hfz-fast focus:border-hfz-violet-light focus:outline-none"
            />
            <HVZButton type="submit" variant="primary" size="sm" disabled={thinking || input.trim().length === 0}>
              Send
            </HVZButton>
          </form>
        </div>
      )}

      {/* ── Pet avatar button (collapsed behaviour kept) ───────────────── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={`${personality.displayName} — ${MOOD_LABEL[mood]}`}
        aria-label={open ? 'Minimise mentor chat' : `Open chat with ${personality.displayName} (${MOOD_LABEL[mood]})`}
        aria-expanded={open}
        className={`pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-hfz-full border-2 bg-hfz-midnight text-2xl transition-all duration-hfz-fast ease-hfz-smooth hover:scale-110 focus:outline-none focus:ring-2 focus:ring-hfz-violet-light ${MOOD_RING[mood].border} ${MOOD_RING[mood].glow} ${mood === 'evolving' ? 'motion-safe:animate-border-pulse' : ''}`}
      >
        {/* aura — soft glow ring behind the pet */}
        {auraArt?.image_url && (
          <img
            src={auraArt.image_url}
            alt=""
            aria-hidden
            loading="lazy"
            className="pointer-events-none absolute inset-0 h-full w-full scale-[1.3] rounded-hfz-full object-contain opacity-80 blur-[1px] mix-blend-screen"
          />
        )}

        <span className="relative motion-safe:animate-idle-breath" aria-hidden>
          {personality.emoji}
        </span>

        {/* frame — decorative border on top */}
        {frameArt?.image_url && (
          <img
            src={frameArt.image_url}
            alt=""
            aria-hidden
            loading="lazy"
            className="pointer-events-none absolute inset-0 h-full w-full scale-[1.14] object-contain"
          />
        )}

        {/* badge — corner chip */}
        {badgeArt?.image_url && (
          <img
            src={badgeArt.image_url}
            alt={badgeArt.name}
            title={badgeArt.name}
            loading="lazy"
            className="absolute -bottom-1 -right-1 h-6 w-6 object-contain drop-shadow"
          />
        )}
      </button>
    </div>
  )
}
