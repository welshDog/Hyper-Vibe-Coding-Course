import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveSupabaseAdminKey } from './supabaseAdminKey.mjs';

const CONFIG_ERROR =
  'Missing Supabase admin key configuration: expected SUPABASE_SECRET_KEYS["stripe_webhook"] or local SUPABASE_SECRET_KEY.';

test('named hosted key wins for stripe_webhook', () => {
  const key = resolveSupabaseAdminKey({
    SUPABASE_SECRET_KEYS: JSON.stringify({
      stripe_webhook: 'sb_secret_webhook',
      default: 'sb_secret_default',
    }),
    SUPABASE_SECRET_KEY: 'sb_secret_local',
    SUPABASE_SERVICE_ROLE_KEY: 'legacy_service_role',
  });

  assert.equal(key, 'sb_secret_webhook');
});

test('local fallback works only when named collection is absent', () => {
  const key = resolveSupabaseAdminKey({
    SUPABASE_SECRET_KEY: 'sb_secret_local',
  });

  assert.equal(key, 'sb_secret_local');
});

test('legacy service role alone throws the expected configuration error', () => {
  assert.throws(
    () =>
      resolveSupabaseAdminKey({
        SUPABASE_SERVICE_ROLE_KEY: 'legacy_service_role',
      }),
    new Error(CONFIG_ERROR),
  );
});

test('missing all valid sources throws the expected configuration error', () => {
  assert.throws(() => resolveSupabaseAdminKey({}), new Error(CONFIG_ERROR));
});
