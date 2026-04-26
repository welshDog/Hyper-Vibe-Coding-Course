-- XP + Rifts gamification tables (HUD + Rift Banner support)

-- ── user_xp (1 row per user) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_xp (
  user_id     uuid        PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  total_xp    integer     NOT NULL DEFAULT 0,
  level       integer     NOT NULL DEFAULT 1,
  streak_days integer     NOT NULL DEFAULT 0,
  last_active timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_xp_total_xp_non_negative'
      AND conrelid = 'public.user_xp'::regclass
  ) THEN
    ALTER TABLE public.user_xp
      ADD CONSTRAINT user_xp_total_xp_non_negative CHECK (total_xp >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_xp_level_positive'
      AND conrelid = 'public.user_xp'::regclass
  ) THEN
    ALTER TABLE public.user_xp
      ADD CONSTRAINT user_xp_level_positive CHECK (level >= 1);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_xp_streak_non_negative'
      AND conrelid = 'public.user_xp'::regclass
  ) THEN
    ALTER TABLE public.user_xp
      ADD CONSTRAINT user_xp_streak_non_negative CHECK (streak_days >= 0);
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_user_xp_total_xp
  ON public.user_xp(total_xp DESC);

ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own xp" ON public.user_xp;
CREATE POLICY "Users can read their own xp"
  ON public.user_xp FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own xp row" ON public.user_xp;
CREATE POLICY "Users can insert their own xp row"
  ON public.user_xp FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own xp row" ON public.user_xp;
CREATE POLICY "Users can update their own xp row"
  ON public.user_xp FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);


-- ── xp_events (append-only ledger) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.xp_events (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type      text        NOT NULL,
  amount          integer     NOT NULL,
  rift_multiplier double precision NOT NULL DEFAULT 1.0,
  course_id       uuid,
  quest_id        uuid,
  created_at      timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'xp_events_amount_non_negative'
      AND conrelid = 'public.xp_events'::regclass
  ) THEN
    ALTER TABLE public.xp_events
      ADD CONSTRAINT xp_events_amount_non_negative CHECK (amount >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'xp_events_rift_multiplier_positive'
      AND conrelid = 'public.xp_events'::regclass
  ) THEN
    ALTER TABLE public.xp_events
      ADD CONSTRAINT xp_events_rift_multiplier_positive CHECK (rift_multiplier >= 1.0);
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_xp_events_user_created
  ON public.xp_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_xp_events_created
  ON public.xp_events(created_at DESC);

ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own xp events" ON public.xp_events;
CREATE POLICY "Users can read their own xp events"
  ON public.xp_events FOR SELECT
  USING ((SELECT auth.uid()) = user_id);


-- ── rifts (one active at a time) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rifts (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  topic       text        NOT NULL,
  multiplier  double precision NOT NULL,
  expires_at  timestamptz NOT NULL,
  description text        NOT NULL DEFAULT '',
  created_by  uuid        REFERENCES public.users(id),
  is_closed   boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rifts_single_open
  ON public.rifts((1))
  WHERE is_closed = false;

CREATE INDEX IF NOT EXISTS idx_rifts_expires_at
  ON public.rifts(expires_at);

ALTER TABLE public.rifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Rifts are viewable by everyone" ON public.rifts;
CREATE POLICY "Rifts are viewable by everyone"
  ON public.rifts FOR SELECT
  USING (true);
