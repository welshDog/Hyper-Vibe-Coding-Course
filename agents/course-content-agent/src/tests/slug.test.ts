import assert from 'node:assert/strict'
import test from 'node:test'
import { slugifyTitle } from '../tools/slug.js'

test('slugifyTitle strips emoji and normalizes', () => {
  assert.equal(slugifyTitle('🌱 Your First Vibe'), 'your-first-vibe')
  assert.equal(slugifyTitle('  🛡️  Security & SRE Observability  '), 'security-sre-observability')
})
