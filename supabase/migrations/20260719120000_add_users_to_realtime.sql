-- Re-add public.users to the supabase_realtime publication.
--
-- WHY: frontend/src/pages/admin/signups.tsx subscribes to postgres_changes
--   INSERT on public.users to power the admin "LIVE" signups feed. The
--   yhtmui->tlav rebuild dropped users from the supabase_realtime publication
--   (only mc_* were members), so the live feed silently never fired.
--   Realtime respects RLS: subscribers only receive rows they can already SELECT,
--   so this exposes nothing beyond existing read access.
-- Applied to tlav via MCP 2026-07-19. Idempotent (guarded add).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='users'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  END IF;
END $$;
