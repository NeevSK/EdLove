#!/usr/bin/env node
// Keeps tooling/live-web-files.json honest. A `.web` file outside apps/gurudevi-web is
// reference only unless shared code imports it by name (a barrel, a direct import, a
// package export) or a live .web file imports it. This recomputes that set from the
// import graph, compares it with the list, and checks every tool config carries it.
// Exit 1 on any difference. `--json` prints the computed set.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { LIVE_WEB_FILES } from '../tooling/reference-only.mjs';

const files = execFileSync('git', ['ls-files', 'packages', 'apps'], { encoding: 'utf8' })
  .split('\n')
  .filter((f) => /\.(ts|tsx)$/.test(f) && !f.includes('/node_modules/') && fs.existsSync(f));
const known = new Set(files);
const isWeb = (f) => /\.web\.tsx?$/.test(f);
const isTest = (f) => /__tests__|\.test\.|\.spec\./.test(f);

const pkgDir = {};
for (const d of fs.readdirSync('packages')) {
  try {
    pkgDir[JSON.parse(fs.readFileSync(`packages/${d}/package.json`, 'utf8')).name] = `packages/${d}`;
  } catch {}
}
const EXT = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];
const exportsCache = {};
function packageExports(dir) {
  if (!(dir in exportsCache)) {
    try {
      exportsCache[dir] = JSON.parse(fs.readFileSync(`${dir}/package.json`, 'utf8')).exports ?? {};
    } catch {
      exportsCache[dir] = {};
    }
  }
  return exportsCache[dir];
}
/** The file an export entry resolves to under a bundle's conditions, in order. */
function pick(entry, conditions) {
  if (typeof entry === 'string') return entry;
  if (!entry || typeof entry !== 'object') return null;
  for (const c of conditions) if (c in entry) return pick(entry[c], conditions);
  return null;
}
// gurudevi-web is the only browser bundle (Next honours `browser`); Metro honours `react-native`.
const WEB = ['browser', 'import', 'default'];
const NATIVE = ['react-native', 'import', 'default'];

function resolve(spec, from, conditions) {
  const first = (base) => EXT.map((e) => base + e).find((f) => known.has(f)) ?? null;
  if (spec.startsWith('.')) return first(path.posix.join(path.posix.dirname(from), spec));
  const m = spec.match(/^(@repo\/[^/]+)(\/.*)?$/);
  if (!m || !pkgDir[m[1]]) return null;
  const dir = pkgDir[m[1]];
  const exports = packageExports(dir);
  const key = '.' + (m[2] ?? '');
  if (key in exports) {
    const t = pick(exports[key], conditions);
    return t && known.has(path.posix.join(dir, t)) ? path.posix.join(dir, t) : null;
  }
  return first(path.posix.join(dir, 'src', m[2] ?? ''));
}
const IMPORT = /(?:from|import\(|require\()\s*['"]([^'"]+)['"]/g;
const importsOf = (f, conditions) =>
  [...fs.readFileSync(f, 'utf8').matchAll(IMPORT)].map((m) => resolve(m[1], f, conditions)).filter(Boolean);

const live = new Set();
// Browser bundle: everything gurudevi-web reaches, with browser resolution.
const seen = new Set();
const webQueue = files.filter((f) => f.startsWith('apps/gurudevi-web/') && !isTest(f));
while (webQueue.length) {
  const f = webQueue.pop();
  if (seen.has(f)) continue;
  seen.add(f);
  if (isWeb(f)) live.add(f);
  webQueue.push(...importsOf(f, WEB));
}
// Native and shared code: .web files imported by name, then whatever those import.
const queue = [];
const visit = (f) => {
  if (isWeb(f) && !live.has(f)) {
    live.add(f);
    queue.push(f);
  }
};
for (const f of files) if (!f.startsWith('apps/gurudevi-web/') && !isWeb(f) && !isTest(f)) importsOf(f, NATIVE).forEach(visit);
while (queue.length) importsOf(queue.pop(), NATIVE).forEach(visit);
const computed = [...live].filter((f) => !f.startsWith('apps/gurudevi-web/')).sort();

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(computed, null, 2));
  process.exit(0);
}

const problems = [];
const listed = [...LIVE_WEB_FILES].sort();
for (const f of computed) if (!listed.includes(f)) problems.push(`live but not listed: ${f}`);
for (const f of listed) if (!computed.includes(f)) problems.push(`listed but no longer imported: ${f}`);

// Configs that cannot read the JSON must carry each live file themselves.
const rel = (f) => f.replace(/^(packages|apps)\/[^/]+\//, '');
const CONFIGS = [
  ['.oxlintrc.json', (f) => `"!${f}"`],
  ['.oxlintrc.react.json', (f) => `"!${f}"`],
  ['biome.json', (f) => `"${f}"`],
  ['tooling/reference-only.ignore', (f) => `!${f}`],
  ['packages/eslint-config/base.js', (f) => `'!${rel(f)}'`],
];
for (const [config, form] of CONFIGS) {
  const text = fs.readFileSync(config, 'utf8');
  for (const f of listed) if (!text.includes(form(f))) problems.push(`${config} does not keep ${f}`);
}
// Packages whose tsconfig excludes .web files must list their live ones under "files".
for (const f of listed) {
  const dir = f.split('/').slice(0, 2).join('/');
  const tsconfig = `${dir}/tsconfig.json`;
  if (!fs.existsSync(tsconfig)) continue;
  const text = fs.readFileSync(tsconfig, 'utf8');
  if (/\*\*\/\*\.web\.tsx?/.test(text) && !text.includes(`"${rel(f)}"`))
    problems.push(`${tsconfig} excludes .web files but does not list ${rel(f)} in "files"`);
}

const total = files.filter((f) => isWeb(f) && !isTest(f) && !f.startsWith('apps/gurudevi-web/')).length;
if (problems.length) {
  console.error(`reference-only: ${problems.length} problem(s)\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`reference-only: ${total - listed.length} reference-only .web files skipped, ${listed.length} live .web files checked.`);
