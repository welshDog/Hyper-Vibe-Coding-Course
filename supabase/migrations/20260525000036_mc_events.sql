DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'mc_events'
  ) THEN
    CREATE TABLE public.mc_events (
      id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      mission_id  uuid,
      event_type  text NOT NULL,
      actor       text,
      payload     jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at  timestamptz NOT NULL DEFAULT now()
    );
  END IF;
END $$;

