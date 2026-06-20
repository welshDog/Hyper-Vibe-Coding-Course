// PetMentorDock — mounts the floating PetMentorBubble across the course chrome
// (the <Layout> group: /courses, /pets, /dashboard, /shop, …). Lesson pages
// (/learn/*) are outside <Layout> and keep their own richer mount inside
// LessonPlayer (which also feeds lesson mood-events via triggerMood).
//
// Rendered only for signed-in users — the chat needs a JWT (the pet-mentor-chat
// Edge Function rejects anon). Sacred Rule #5: this lives INSIDE the course
// chrome, not a global shell above all three chrome systems — standalone routes
// (Landing, vibe-labs, learn, welcome) do not mount it.

import { useLocation } from 'react-router-dom'
import { useAuthStore } from '../../context/auth'
import { useMyPets } from '../../hooks/useMyPets'
import type { SpeciesId } from '../../lib/petPersonalities'
import PetMentorBubble from './PetMentorBubble'

// First path segment → a friendly "where you are" label for the bubble header.
const SECTION_LABEL: Record<string, string> = {
  courses:     'Courses',
  catalog:     'Course Catalog',
  pets:        'Your Pets',
  shop:        'The Shop',
  tokens:      'BROski$',
  leaderboard: 'Leaderboard',
  quests:      'Quests',
  dashboard:   'Dashboard',
  profile:     'Your Profile',
}

function sectionLabel(pathname: string): string {
  const seg = pathname.split('/').filter(Boolean)[0] ?? ''
  return SECTION_LABEL[seg] ?? 'the Z0ne'
}

export function PetMentorDock() {
  const user = useAuthStore((s) => s.user)
  const { pets } = useMyPets()
  const { pathname } = useLocation()

  // Hooks run unconditionally above; gate the render here.
  if (!user) return null

  const pet = pets?.[0]
  const speciesId: SpeciesId = (pet?.species_id as SpeciesId) ?? 'power_pup'

  return (
    <PetMentorBubble
      speciesId={speciesId}
      currentModule={sectionLabel(pathname)}
      petId={pet?.pet_id}
      cosmetics={pet?.cosmetics}
      initialMood={pet?.mood}
    />
  )
}
