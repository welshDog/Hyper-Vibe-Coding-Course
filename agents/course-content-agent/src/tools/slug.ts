export function slugifyTitle(input: string): string {
  if (input.trim().length === 0) return ''

  const withoutEmojiPrefix = input
    .replace(/^\s*[^\p{L}\p{N}]+/u, '')
    .trim()

  const normalized = withoutEmojiPrefix
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  const slug = normalized
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')

  return slug.length > 0 ? slug : 'untitled'
}
