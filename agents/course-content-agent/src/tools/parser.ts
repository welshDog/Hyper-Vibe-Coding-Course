/**
 * parser.ts — Markdown module script parser
 * Extracts: code, title, emoji, level, xp_reward, coin_reward, slug, summary
 * Handles both frontmatter YAML and H1-based parsing
 */

export interface ModuleMeta {
  code: string;         // 'M2'
  title: string;        // 'Your First Vibe'
  emoji: string;        // '🌱'
  level: string;        // 'Beginner'
  xp_reward: number;
  coin_reward: number;
  slug: string;         // 'your-first-vibe'
  summary: string | null;
  script_path: string;
}

const LEVEL_MAP: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  'hyper-pro': 'Hyper-Pro',
  elite: 'Elite',
};

const XP_MAP: Record<string, number> = {
  M1: 30, M2: 50, M3: 30, M4: 40, M5: 50,
  M6: 75, M7: 70, M8: 70, M9: 80, M10: 80,
  M11: 150, M12: 100,
};

const COIN_MAP: Record<string, number> = {
  M1: 10, M2: 20, M3: 10, M4: 15, M5: 20,
  M6: 30, M7: 25, M8: 25, M9: 35, M10: 35,
  M11: 100, M12: 50,
};

/** Extract emoji from start of a string if present */
function extractEmoji(str: string): { emoji: string; text: string } {
  const emojiMatch = str.match(/^([\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}][\s]?)/u);
  if (emojiMatch) {
    return { emoji: emojiMatch[1].trim(), text: str.replace(emojiMatch[1], '').trim() };
  }
  return { emoji: '📦', text: str.trim() };
}

/** Convert title text to slug */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Parse module code from file path or frontmatter */
function parseCode(filePath: string, frontmatter: Record<string, string>): string {
  if (frontmatter.code) return frontmatter.code.toUpperCase();
  const match = filePath.match(/[/\\](M\d{1,2})[\-_.]/i);
  if (match) return match[1].toUpperCase();
  const baseMatch = filePath.match(/^(M\d{1,2})[\-_.]/i);
  if (baseMatch) return baseMatch[1].toUpperCase();
  throw new Error(`Cannot determine module code from path: ${filePath}`);
}

/** Parse optional YAML-lite frontmatter (--- block at top of file) */
function parseFrontmatter(content: string): { meta: Record<string, string>; body: string } {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/m);
  if (!fmMatch) return { meta: {}, body: content };

  const meta: Record<string, string> = {};
  fmMatch[1].split('\n').forEach(line => {
    const [k, ...v] = line.split(':');
    if (k && v.length) meta[k.trim()] = v.join(':').trim();
  });
  return { meta, body: fmMatch[2] };
}

/** Extract the first H1 line */
function parseH1(body: string): string | null {
  const match = body.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

/** Extract summary: first paragraph after the H1 that isn't a badge/header */
function parseSummary(body: string): string | null {
  const lines = body.split('\n');
  let pastH1 = false;
  const paragraphLines: string[] = [];

  for (const line of lines) {
    if (!pastH1 && line.startsWith('# ')) { pastH1 = true; continue; }
    if (!pastH1) continue;
    if (line.startsWith('#') || line.startsWith('**Level') || line.startsWith('**Earn')) continue;
    if (line.trim() === '') { if (paragraphLines.length > 0) break; continue; }
    paragraphLines.push(line.trim());
    if (paragraphLines.length >= 3) break;
  }

  return paragraphLines.length > 0 ? paragraphLines.join(' ') : null;
}

/** Parse level from frontmatter or body text */
function parseLevel(meta: Record<string, string>, body: string, code: string): string {
  if (meta.level) {
    const found = LEVEL_MAP[meta.level.toLowerCase()];
    if (found) return found;
  }
  const levelMatch = body.match(/\*\*Level:\*\*\s*([\w\-]+)/i);
  if (levelMatch) {
    const found = LEVEL_MAP[levelMatch[1].toLowerCase()];
    if (found) return found;
  }
  // Fallback by module number
  const num = parseInt(code.replace('M', ''));
  if (num <= 3) return 'Beginner';
  if (num <= 5) return 'Intermediate';
  if (num <= 8) return 'Advanced';
  if (num <= 10) return 'Hyper-Pro';
  return 'Elite';
}

/**
 * Main parser entry point.
 * @param content Raw markdown file content
 * @param filePath Relative path e.g. 'scripts/M2-your-first-vibe.md'
 */
export function parseModuleScript(content: string, filePath: string): ModuleMeta {
  const { meta, body } = parseFrontmatter(content);

  const code = parseCode(filePath, meta);
  const h1 = parseH1(body) ?? meta.title ?? code;
  const { emoji, text: titleText } = extractEmoji(h1);
  const title = meta.title ?? titleText;
  const slug = meta.slug ?? toSlug(titleText);
  const level = parseLevel(meta, body, code);
  const xp_reward = meta.xp_reward ? parseInt(meta.xp_reward) : (XP_MAP[code] ?? 30);
  const coin_reward = meta.coin_reward ? parseInt(meta.coin_reward) : (COIN_MAP[code] ?? 10);
  const summary = meta.summary ?? parseSummary(body);

  return { code, title, emoji, level, xp_reward, coin_reward, slug, summary, script_path: filePath };
}
