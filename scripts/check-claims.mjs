import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Detect potential evidence gaps; a nearby URL is not proof the claim is true. */
const claimPatterns = [
  { kind: 'percentage', regex: /\b\d+(?:[.,]\d+)?\s*%/gu },
  { kind: 'quantity', regex: /\b\d+(?:[.,]\d+)?\s*(?:millió|milliárd|ezer|million|billion)\b/giu },
  { kind: 'comparative', regex: /\b(?:kétszer|háromszor|négyszer|twice|three times|\d+(?:[.,]\d+)?\s*x)\s+(?:annyi|nagyobb|gyorsabb|hatékonyabb|több|jobb|faster|better|more)\b/giu },
  { kind: 'attributed', regex: /\b(?:a kutatás szerint|a tanulmány szerint|felmérés szerint|according to (?:a|the) study)\b/giu },
];
const citations = [
  /\[[^\]]{1,120}\]\(https?:\/\/[^)\s]+\)/gu,
  /<a\s[^>]*href\s*=\s*["']https?:\/\/[^"']+["'][^>]*>/giu,
  /\[\^?\d+\]/gu,
  /https?:\/\/[^\s<>"')]+/gu,
];

/**
 * Conservatively flags candidate claims lacking citation syntax nearby.
 * No source credibility or factual accuracy is established by this tool.
 */
export function checkClaims(text, { window = 220 } = {}) {
  if (typeof text !== 'string') throw new Error('Text must be a string');
  if (!Number.isInteger(window) || window < 0 || window > 1000) throw new Error('window must be an integer between 0 and 1000');
  const matches = [];
  for (const { kind, regex } of claimPatterns) {
    for (const result of text.matchAll(regex)) {
      matches.push({ kind, start: result.index, end: result.index + result[0].length, snippet: result[0] });
    }
  }
  matches.sort((a,b) => a.start - b.start || b.end - a.end);
  const unique = matches.filter((item, index) => !matches.slice(0,index).some(other => item.start < other.end && item.end > other.start));
  const statements = unique.map(item => {
    const before = Math.max(0, item.start - window);
    const after = Math.min(text.length, item.end + window);
    const nearby = text.slice(before, after);
    const hasCitationSyntax = citations.some(regex => { regex.lastIndex = 0; return regex.test(nearby); });
    return {
      kind: item.kind, snippet: item.snippet.slice(0, 130), position: item.start,
      hasNearbyCitationSyntax: hasCitationSyntax,
      status: hasCitationSyntax ? 'needs-review' : 'recommendation',
    };
  });
  return {
    method: 'Hungarian/English phrase heuristic; not a fact-check, plagiarism check or citation-quality verification',
    languageSupport: 'partial Hungarian and English only',
    candidateCount: statements.length,
    withoutNearbyCitationSyntax: statements.filter(s => !s.hasNearbyCitationSyntax).length,
    claims: statements,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (!process.argv[2] || process.argv.length !== 3) throw new Error('Usage: node scripts/check-claims.mjs TEXT_FILE');
    const result = checkClaims(readFileSync(resolve(process.argv[2]), 'utf8'));
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 2;
  }
}
