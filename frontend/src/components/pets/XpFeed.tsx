// XpFeed — the last few XP events that fed your pet.
//
// This is the cause→effect dopamine loop the /pets page was missing: a commit
// you made an hour ago shows up as "+10 BROski$ · 1h ago". Reads the signed-in
// user's xp_events (RLS-scoped) via useXpEvents. Self-contained like
// PetSquadRow — render it only when there's a signed-in user.
//
// Tokens only (hfz-* + HVZ primitives). No orange (sacred rule 4). CSS-only
// motion (no framer-motion in this repo) and reduced-motion safe via the
// motion-safe: variant already used across the page.

import { HVZCard, HVZTag } from '../ui/hvz'
import { useXpEvents, type XpEvent } from '../../hooks/useXpEvents'

// Known event types → icon + human label. Anything unmapped falls back to a
// title-cased version of the raw type so a new event kind never renders blank.
const EVENT_META: Record<string, { emoji: string; label: string }> = {
  quest_complete:  { emoji: '🎯', label: 'Quest complete' },
  quest_reward:    { emoji: '🎯', label: 'Quest reward' },
  module_complete: { emoji: '📚', label: 'Module complete' },
  lesson_complete: { emoji: '✅', label: 'Lesson complete' },
  level_reward:    { emoji: '🏆', label: 'Level reward' },
  level_up:        { emoji: '🏆', label: 'Level up' },
  daily_login:     { emoji: '🔥', label: 'Daily streak' },
  daily_streak:    { emoji: '🔥', label: 'Daily streak' },
  streak_bonus:    { emoji: '🔥', label: 'Streak bonus' },
  git_commit:      { emoji: '⚡', label: 'Git commit' },
  commit:          { emoji: '⚡', label: 'Commit' },
  quiz_pass:       { emoji: '🧠', label: 'Quiz passed' },
  pet_mint:        { emoji: '🐾', label: 'Pet minted' },
  rift:            { emoji: '🌀', label: 'Rift bonus' },
  rift_bonus:      { emoji: '🌀', label: 'Rift bonus' },
}

function humanize(raw: string): string {
  return raw
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

function metaFor(type: string): { emoji: string; label: string } {
  return EVENT_META[type] ?? { emoji: '✨', label: humanize(type) || 'XP earned' }
}

function timeAgo(iso: string): string {
  const secs = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 45) return 'just now'
  const mins = Math.round(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 7) return `${days}d ago`
  return `${Math.round(days / 7)}w ago`
}

function EventRow({ event, index }: { event: XpEvent; index: number }) {
  const { emoji, label } = metaFor(event.event_type)
  const boosted = (event.rift_multiplier ?? 1) > 1

  return (
    <li
      className="flex items-center gap-3 py-2 motion-safe:animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index, 5) * 50}ms` }}
    >
      <span className="text-lg leading-none shrink-0" aria-hidden>{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-hfz-text-primary truncate">{label}</p>
        <p className="text-[11px] text-hfz-text-secondary">{timeAgo(event.created_at)}</p>
      </div>
      {boosted && (
        <HVZTag color="violet" style={{ fontSize: 10 }}>
          🌀 {event.rift_multiplier}×
        </HVZTag>
      )}
      <span className="font-mono text-sm font-bold text-hfz-gold whitespace-nowrap shrink-0">
        +{event.amount.toLocaleString()}
        <span className="text-[10px] font-semibold text-hfz-gold/70"> BROski$</span>
      </span>
    </li>
  )
}

function SkeletonRow({ index }: { index: number }) {
  return (
    <li
      className="flex items-center gap-3 py-2 motion-safe:animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <span className="h-7 w-7 shrink-0 rounded-full bg-white/5" aria-hidden />
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <span className="h-3 w-1/3 rounded bg-white/5" aria-hidden />
        <span className="h-2 w-16 rounded bg-white/5" aria-hidden />
      </div>
      <span className="h-4 w-14 rounded bg-white/5" aria-hidden />
    </li>
  )
}

export function XpFeed() {
  const { events, loading, error } = useXpEvents()

  return (
    <HVZCard>
      {error ? (
        <p className="text-sm text-red-300">Couldn't load recent activity: {error.message}</p>
      ) : loading && events.length === 0 ? (
        <ul aria-label="Loading recent XP" className="divide-y divide-white/5">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonRow key={i} index={i} />
          ))}
        </ul>
      ) : events.length === 0 ? (
        <div className="flex items-center gap-4 py-1">
          <span className="text-3xl shrink-0" aria-hidden>🔥</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-hfz-text-primary">
              Your first XP lands here.
            </p>
            <p className="text-xs text-hfz-text-secondary mt-1">
              Finish a quest or a course module and watch the BROski$ roll in — your pet
              eats every drop. Go build something! ⚡
            </p>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-white/5">
          {events.map((event, i) => (
            <EventRow key={event.id} event={event} index={i} />
          ))}
        </ul>
      )}
    </HVZCard>
  )
}
