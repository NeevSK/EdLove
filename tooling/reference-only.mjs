// `*.web.ts(x)` files outside apps/gurudevi-web are reference only: the web app is
// apps/gurudevi-web, and nothing resolves `.web` extensions implicitly. Tools skip them.
// The exceptions are in live-web-files.json: .web files that shared code imports by name
// (a barrel export, a direct import, a package export) and everything those import.
// `node scripts/check-reference-only.mjs` recomputes that set from the import graph and
// fails when the list or any tool config is out of date.
import { readFileSync } from 'node:fs';

export const LIVE_WEB_FILES = JSON.parse(readFileSync(new URL('./live-web-files.json', import.meta.url), 'utf8'));

/** Glob patterns (gitignore style) for tools with an ignore list. */
export const REFERENCE_ONLY_GLOBS = ['**/*.web.ts', '**/*.web.tsx'];

const WEB_FILE = /\.web\.tsx?$/;

/** @param {string} file repo-relative or absolute path */
export function isReferenceOnly(file) {
  const rel = file.replace(/\\/g, '/').replace(/^.*?(?=(?:apps|packages)\/)/, '');
  if (!WEB_FILE.test(rel)) return false;
  if (rel.startsWith('apps/gurudevi-web/')) return false;
  return !LIVE_WEB_FILES.includes(rel);
}

/** rg arguments with the same effect. `-g` beats ignore files, and later globs win. */
export const RG_REFERENCE_ARGS = [
  '-g', '!*.web.ts',
  '-g', '!*.web.tsx',
  '-g', 'apps/gurudevi-web/**/*.web.{ts,tsx}',
  ...LIVE_WEB_FILES.flatMap((f) => ['-g', f]),
];
