import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const fields = ['canonical', 'noindex', 'title', 'metaDescription', 'h1', 'h2', 'schemaTypes', 'ogTags', 'contentHash', 'responseStatus'];
const severity = {
  canonical: 'high', noindex: 'high', title: 'medium', responseStatus: 'high',
  schemaTypes: 'medium', metaDescription: 'low', h1: 'medium', h2: 'low',
  ogTags: 'low', contentHash: 'info',
};
function isObject(x) { return x !== null && typeof x === 'object' && !Array.isArray(x); }
function validate(s, side) {
  if (!isObject(s) || typeof s.url !== 'string' || typeof s.capturedAt !== 'string' || typeof s.surface !== 'string') {
    throw new Error(side + ': snapshot requires url, capturedAt and surface');
  }
  let url;
  try { url = new URL(s.url); } catch { throw new Error(side + ': invalid URL'); }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error(side + ': unsafe or noncanonical URL');
  if (!Number.isFinite(Date.parse(s.capturedAt))) throw new Error(side + ': invalid capture date');
  return url.href;
}
function stable(value) {
  if (Array.isArray(value)) return JSON.stringify(value);
  if (isObject(value)) return JSON.stringify(Object.entries(value).sort(([a],[b]) => a.localeCompare(b)));
  return JSON.stringify(value);
}

export function compareSnapshots(before, after) {
  const a = validate(before, 'before');
  const b = validate(after, 'after');
  if (a !== b) throw new Error('Snapshots must refer to the same URL (no implicit redirects/locales)');
  if (before.surface !== after.surface) throw new Error('Cannot compare different evidence surfaces without normalization');
  const changes = [];
  const notComparable = [];
  for (const field of fields) {
    // Missing is NOT equivalent to null, false or "removed".
    if (!Object.hasOwn(before, field) || !Object.hasOwn(after, field)) {
      notComparable.push(field);
      continue;
    }
    if (stable(before[field]) === stable(after[field])) continue;
    const highRisk = (field === 'noindex' && before[field] !== true && after[field] === true)
      || (field === 'responseStatus' && typeof after[field] === 'number' && after[field] >= 400)
      || (field === 'canonical' && !after[field] && !!before[field]);
    changes.push({
      field, before: before[field], after: after[field],
      priority: highRisk ? 'investigate-first' : 'review',
      severity: highRisk ? 'high' : severity[field],
      status: 'needs-review',
    });
  }
  return {
    method: 'comparison of supplied structured snapshots; no network, baseline capture or causal inference',
    url: a, surface: before.surface,
    beforeCapturedAt: before.capturedAt, afterCapturedAt: after.capturedAt,
    comparedFields: fields.length - notComparable.length,
    notComparable,
    changes,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (!process.argv[2] || !process.argv[3] || process.argv.length !== 4) {
      throw new Error('Usage: node scripts/compare-snapshots.mjs BASELINE.json CURRENT.json');
    }
    console.log(JSON.stringify(compareSnapshots(
      JSON.parse(readFileSync(resolve(process.argv[2]), 'utf8')),
      JSON.parse(readFileSync(resolve(process.argv[3]), 'utf8')),
    ), null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 2;
  }
}
