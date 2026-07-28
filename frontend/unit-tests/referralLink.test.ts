/// <reference types="node" />

import assert from 'node:assert/strict';
import test from 'node:test';

import { buildReferralLink, fetchReferralCode } from '../src/lib/referralLink.ts';

test('fetchReferralCode calls the referral RPC with zero arguments', async () => {
  const calls: unknown[][] = [];

  const referralCode = await fetchReferralCode({
    async rpc(...args: unknown[]) {
      calls.push(args);
      return { data: 'BROREF123', error: null };
    },
  });

  assert.equal(referralCode, 'BROREF123');
  assert.deepStrictEqual(calls, [['get_or_create_referral_code']]);
});

test('buildReferralLink constructs the register URL from the current app origin', () => {
  assert.equal(
    buildReferralLink('BROREF123', 'https://hypervibe.online'),
    'https://hypervibe.online/register?ref=BROREF123',
  );
});
