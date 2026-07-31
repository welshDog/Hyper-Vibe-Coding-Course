import { HVZTag, type TagColor } from '../ui/hvz'
import { MOOD_EMOJI, MOOD_LABEL, type PetMood } from '../../lib/evolution'

const MOOD_COLOR: Record<PetMood, TagColor> = {
  idle:       'cyan',
  learning:   'mint',
  hyperfocus: 'violet',
  evolving:   'gold',
}

// "Idle" reads flat/negative on the pets page — this pet-page-local label
// swap keeps the shared lib/evolution.ts MOOD_LABEL untouched (PetMentorBubble
// uses that same constant for its chat-bubble tooltip, a different context
// where "Idle" is fine as a state description).
const MOOD_LABEL_LOCAL: Record<PetMood, string> = {
  ...MOOD_LABEL,
  idle: 'Ready to train',
}

type Props = { mood: PetMood }

export function MoodBadge({ mood }: Props) {
  return (
    <HVZTag variant="chunky" color={MOOD_COLOR[mood]}>
      <span aria-hidden>{MOOD_EMOJI[mood]}</span>
      <span>{MOOD_LABEL_LOCAL[mood]}</span>
    </HVZTag>
  )
}
