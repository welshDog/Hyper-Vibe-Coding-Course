import { HVZTag, type TagColor } from '../ui/hvz'
import { MOOD_EMOJI, MOOD_LABEL, type PetMood } from '../../lib/evolution'

const MOOD_COLOR: Record<PetMood, TagColor> = {
  idle:       'cyan',
  learning:   'mint',
  hyperfocus: 'violet',
  evolving:   'gold',
}

// "Idle" reads flat/negative on the pets page, and its chunky/pastel pill
// look belongs to the Moy reskin — but MoodBadge is also rendered inside
// PetMentorBubble, which mounts globally via PetMentorDock across the whole
// course chrome (Shop, Courses, Dashboard...), not just /pets. Confirmed via
// frontend/tests/pets-mentor-bubble.spec.ts asserting the literal "Idle"
// text and default HVZTag look. Default stays the original shared look
// everywhere; PetCard opts in to the pets-reskin variant explicitly.
const MOOD_LABEL_FRIENDLY: Record<PetMood, string> = {
  ...MOOD_LABEL,
  idle: 'Ready to train',
}

type Props = {
  mood: PetMood
  /** 'pets-reskin' = warmer copy ("Ready to train") + chunky HVZTag look,
   *  used only by PetCard on /pets. Every other consumer (PetMentorBubble
   *  included) must get 'default' — the real MOOD_LABEL text, default tag
   *  styling. */
  variant?: 'default' | 'pets-reskin'
}

export function MoodBadge({ mood, variant = 'default' }: Props) {
  const isReskin = variant === 'pets-reskin'
  const label = isReskin ? MOOD_LABEL_FRIENDLY[mood] : MOOD_LABEL[mood]
  return (
    <HVZTag variant={isReskin ? 'chunky' : 'default'} color={MOOD_COLOR[mood]}>
      <span aria-hidden>{MOOD_EMOJI[mood]}</span>
      <span>{label}</span>
    </HVZTag>
  )
}
