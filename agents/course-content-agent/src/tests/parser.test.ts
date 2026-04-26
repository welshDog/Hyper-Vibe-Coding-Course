import { describe, expect, it } from '@jest/globals'
import { parseModuleScript } from '../tools/parser'

describe('parseModuleScript', () => {
  it('extracts title + emoji from h1', () => {
    const parsed = parseModuleScript('# 🌱 Your First Vibe\n\nHello world.\n', 'scripts/M2-your-first-vibe.md')
    expect(parsed.emoji).toBe('🌱')
    expect(parsed.title).toBe('Your First Vibe')
  })

  it("prefers 'What you'll learn' section for summary", () => {
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

    const parsed = parseModuleScript(md, 'scripts/M7-agent-architecture-manifests.md')
    expect(parsed.summary).toBe('Intro paragraph that should not be used.')
  })
})
