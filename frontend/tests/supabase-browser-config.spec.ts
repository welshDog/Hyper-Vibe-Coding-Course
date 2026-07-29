import { expect, test } from '@playwright/test';
import { resolveBrowserSupabaseConfig } from '../src/lib/supabase/config';

test('initializes browser Supabase config from publishable key without anon key', () => {
  const config = resolveBrowserSupabaseConfig({
    VITE_SUPABASE_URL: 'https://tlavrxiaegbtyfmjfdcz.supabase.co',
    VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test_key',
  });

  expect(config.url).toBe('https://tlavrxiaegbtyfmjfdcz.supabase.co');
  expect(config.key).toBe('sb_publishable_test_key');
});
