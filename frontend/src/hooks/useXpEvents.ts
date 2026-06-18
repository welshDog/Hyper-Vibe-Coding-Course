// useXpEvents — the signed-in user's most recent XP events.
//
// Powers the "Recent activity" feed on /pets. RLS handles the user filter
// (policy: "Users can read their own xp events" → auth.uid() = user_id);
// the .eq() is belt-and-braces so the planner still narrows by user_id.
//
// Mirrors useMyPets: a deferred 0-tick fetch (keeps the setState calls off
// the synchronous effect path — see HUDContext), plus an exposed refetch so
// the feed can refresh after a quest/mint awards XP.

import { useCallback, useEffect, useState } from 'react'

import { useAuthStore } from '../context/auth'
import { supabase } from '../lib/supabase'

export type XpEvent = {
  id:              string
  event_type:      string
  amount:          number
  rift_multiplier: number | null
  course_id:       string | null
  quest_id:        string | null
  created_at:      string
}

type UseXpEventsResult = {
  events:  XpEvent[]
  loading: boolean
  error:   Error | null
  refetch: () => Promise<void>
}

const FEED_LIMIT = 5

export function useXpEvents(limit: number = FEED_LIMIT): UseXpEventsResult {
  const userId = useAuthStore((s) => s.user?.id)

  const [events,  setEvents]  = useState<XpEvent[]>([])
  const [loading, setLoading] = useState<boolean>(Boolean(userId))
  const [error,   setError]   = useState<Error | null>(null)

  const fetchEvents = useCallback(async () => {
    if (!userId) {
      setEvents([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: queryErr } = await supabase
        .from('xp_events')
        .select('id, event_type, amount, rift_multiplier, course_id, quest_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (queryErr) throw queryErr
      setEvents((data ?? []) as XpEvent[])
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load XP events'))
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [userId, limit])

  useEffect(() => {
    const id = setTimeout(() => { void fetchEvents() }, 0)
    return () => clearTimeout(id)
  }, [fetchEvents])

  return { events, loading, error, refetch: fetchEvents }
}
