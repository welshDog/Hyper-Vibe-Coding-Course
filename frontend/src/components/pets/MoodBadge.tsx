import { HVZTag, type TagColor } from '../ui/hvz'
import { MOOD_EMOJI, MOOD_LABEL, type PetMood } from '../../lib/evolution'

const MOOD_COLOR: Record<PetMood, TagColor> = {
  idle:       'cyan',
  learning:   'mint',
  hyperfocus: 'violet',
  evolving:   'gold',
}

type Props = { mood: PetMood }

export function MoodBadge({ mood }: Props) {
  return (
    <HVZTag color={MOOD_COLOR[mood]}>
      <span aria-hidden>{MOOD_EMOJI[mood]}</span>
      <span>{MOOD_LABEL[mood]}</span>
    </HVZTag>
  )
}
