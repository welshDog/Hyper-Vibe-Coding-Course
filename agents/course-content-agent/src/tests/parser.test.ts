import assert from 'node:assert/strict'
import test from 'node:test'
import { parseModuleScript } from '../tools/parser.js'

test('parseModuleScript extracts title + emoji from h1', () => {
  const parsed = parseModuleScript('# 🌱 Your First Vibe\n\nHello world.\n')
  assert.equal(parsed.emoji, '🌱')
  assert.equal(parsed.title, 'Your First Vibe')
})

test("parseModuleScript prefers 'What you'll learn' section for summary", () => {
  const md = [
    '# 🛠 Agent Architecture & Manifests',
    '',
    'Intro paragraph that should not be used.',
    '',
    "## What you'll learn",
    '',
    '- Manifests are passports',
    '- Port mapping basics',
    '',
    '## Next section',
    '',
    'More content'
  ].join('\n')

  const parsed = parseModuleScript(md)
  assert.equal(parsed.summary, 'Manifests are passports Port mapping basics')
})
