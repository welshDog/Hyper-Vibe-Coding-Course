export type ParsedModuleScript = {
  h1Raw?: string
  title?: string
  emoji?: string
  summary?: string
}

function cleanH1(h1Line: string): { title?: string; emoji?: string } {
  const raw = h1Line.replace(/^#\s+/, '').trim()
  if (raw.length === 0) return {}

  const match = raw.match(/^([^\p{L}\p{N}]{1,4})\s+(.*)$/u)
  if (match && match[2] && match[2].trim().length > 0) {
    const emoji = match[1]?.trim()
    const title = match[2].trim()
    return emoji ? { emoji, title } : { title }
  }

  return { title: raw }
}

function extractSummaryFromWhatYoullLearn(lines: string[]): string | undefined {
  const headingRe = /^##\s+what you[’']ll learn\b/i
  const startIndex = lines.findIndex((line) => headingRe.test(line.trim()))
  if (startIndex === -1) return undefined

  const collected: string[] = []
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const line = lines[i] ?? ''
    if (/^#{1,6}\s+/.test(line.trim())) break
    const trimmed = line.trim()
    if (trimmed.length === 0) continue
    collected.push(trimmed.replace(/^[-*]\s+/, '').trim())
    if (collected.length >= 6) break
  }

  if (collected.length === 0) return undefined
  return collected.join(' ')
}

function extractFirstParagraph(lines: string[], h1Index: number): string | undefined {
  const collected: string[] = []
  for (let i = h1Index + 1; i < lines.length; i += 1) {
    const line = lines[i] ?? ''
    const trimmed = line.trim()
    if (trimmed.length === 0) {
      if (collected.length > 0) break
      continue
    }
    if (/^#{1,6}\s+/.test(trimmed)) break
    collected.push(trimmed)
    if (collected.join(' ').length > 240) break
  }
  const paragraph = collected.join(' ').trim()
  return paragraph.length > 0 ? paragraph : undefined
}

export function parseModuleScript(markdown: string): ParsedModuleScript {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const h1Index = lines.findIndex((line) => line.trim().startsWith('# '))

  const parsed: ParsedModuleScript = {}

  if (h1Index !== -1) {
    const h1Line = lines[h1Index]?.trim() ?? ''
    parsed.h1Raw = h1Line
    const { emoji, title } = cleanH1(h1Line)
    if (emoji) parsed.emoji = emoji
    if (title) parsed.title = title
  }

  const summary =
    extractSummaryFromWhatYoullLearn(lines) ??
    (h1Index !== -1 ? extractFirstParagraph(lines, h1Index) : undefined)

  if (summary) parsed.summary = summary

  return parsed
}
