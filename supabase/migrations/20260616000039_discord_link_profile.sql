-- Add discord_username column for profile display
ALTER TABLE discord_links ADD COLUMN IF NOT EXISTS discord_username text;

-- One Supabase account can only link one Discord account
CREATE UNIQUE INDEX IF NOT EXISTS discord_links_user_id_key ON discord_links (user_id);

-- Allow authenticated users to delete their own link (unlink button on profile page)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'discord_links'
          AND policyname = 'users can delete own discord link'
    ) THEN
        CREATE POLICY "users can delete own discord link"
            ON discord_links FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;
