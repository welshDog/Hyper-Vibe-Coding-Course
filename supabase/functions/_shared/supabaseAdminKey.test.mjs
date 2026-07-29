import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveSupabaseAdminKey } from './supabaseAdminKey.mjs';

const configError = (keyName) =>
  `Missing Supabase admin key configuration: expected SUPABASE_SECRET_KEYS["${keyName}"] or local SUPABASE_SECRET_KEY.`;

test('named hosted key wins for the requested function', () => {
  const key = resolveSupabaseAdminKey(
    {
      SUPABASE_SECRET_KEYS: JSON.stringify({
        stripe_webhook: 'sb_secret_webhook',
        shop_purchase: 'sb_secret_shop',
      }),
      SUPABASE_SECRET_KEY: 'sb_secret_local',
      SUPABASE_SERVICE_ROLE_KEY: 'legacy_service_role',
    },
    'shop_purchase',
  );

  assert.equal(key, 'sb_secret_shop');
});

test('named collection present but missing this function throws, does not fall back to local key', () => {
  assert.throws(
    () =>
      resolveSupabaseAdminKey(
        {
          SUPABASE_SECRET_KEYS: JSON.stringify({ stripe_webhook: 'sb_secret_webhook' }),
          SUPABASE_SECRET_KEY: 'sb_secret_local',
        },
        'shop_purchase',
      ),
    new Error(configError('shop_purchase')),
  );
});

test('local fallback works only when named collection is absent', () => {
  const key = resolveSupabaseAdminKey({ SUPABASE_SECRET_KEY: 'sb_secret_local' }, 'shop_purchase');

  assert.equal(key, 'sb_secret_local');
});

test('legacy service role alone throws the expected configuration error', () => {
  assert.throws(
    () =>
      resolveSupabaseAdminKey({ SUPABASE_SERVICE_ROLE_KEY: 'legacy_service_role' }, 'shop_purchase'),
    new Error(configError('shop_purchase')),
  );
});

test('missing all valid sources throws the expected configuration error', () => {
  assert.throws(() => resolveSupabaseAdminKey({}, 'shop_purchase'), new Error(configError('shop_purchase')));
});
