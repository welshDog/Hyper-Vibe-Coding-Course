import { describe, expect, it } from '@jest/globals'
import { slugifyTitle } from '../tools/slug'

describe('slugifyTitle', () => {
  it('strips emoji and normalizes', () => {
    expect(slugifyTitle('🌱 Your First Vibe')).toBe('your-first-vibe')
    expect(slugifyTitle('  🛡️  Security & SRE Observability  ')).toBe('security-sre-observability')
    expect(slugifyTitle('')).toBe('')
  })
})
