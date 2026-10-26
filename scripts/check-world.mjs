#!/usr/bin/env node
/**
 * World guardrail (scripts/check-world.mjs)
 *
 * Colour belongs to the world, not to screens. A raw colour in a screen is a
 * place a world can never reach, which is how the app ended up unthemable.
 *
 * Two rules:
 *  1. Dressed files: no raw colours at all (hex, rgb/rgba, hsl) and no legacy
 *     static colour tokens (`tokens.semantic.*`, `tokens.colors.*`). Read colours
 *     from `useWorld().tokens` or use the world components.
 *  2. Everywhere else: the count of raw hex colours may only go down. The
 *     baseline lives in tooling/world-ratchet.json; lower it with `--update`.
 *
 * Usage:
 *   node scripts/check-world.mjs           # verify
 *   node scripts/check-world.mjs --update  # record a lower count after a migration
 *
 * To dress a new file, migrate it and add it to DRESSED below.
 */

import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RATCHET = join(ROOT, 'tooling/world-ratchet.json');

/** Files and folders that must take every colour from the world. */
const DRESSED = [
  'packages/ui/src/world/native',
  'packages/ui/src/world/dom',
  'packages/ui/src/screens/AppSettingsScreen.shared.tsx',
  'packages/ui/src/components/GlobalHeader.tsx',
  'packages/ui/src/components/DomainSubHeader.tsx',
  'packages/ui/src/components/ActiveSubTabStrip.tsx',
  'apps/gurudevi-mobile/app/(tabs)/_layout.tsx',
  'apps/gurudevi-mobile/src/boot/WorldFonts.tsx',
];

/** Where palettes are defined; raw colours are the point here. */
const PALETTE_FILES = new Set([
  'packages/ui/src/world/worlds.ts',
  'packages/core/src/scene/sky.ts',
  'packages/core/src/scene/landscape.ts',
  'packages/ui/src/world/build.ts',
  'packages/ui/src/world/color.ts',
  'packages/ui/src/world/resolve.ts',
  'packages/ui/src/world/css.ts',
  'packages/ui/src/tokens.ts',
  'packages/ui/src/theme/Theme.ts',
]);

const SCAN_ROOTS = ['apps', 'packages'];
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  '.next',
  '.expo',
  'generated',
  '__tests__',
  'android',
  'ios',
  'archive',
]);

const HEX = /#[0-9A-Fa-f]{3}(?:[0-9A-Fa-f]{3}(?:[0-9A-Fa-f]{2})?)?\b(?![-\w])/g;
const FUNC = /\b(?:rgba?|hsla?)\(/g;
const LEGACY = /\btokens\.(?:semantic|colors)\.[\w.]+/g;

function walk(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (
      /\.(tsx?|jsx?)$/.test(name) &&
      !/\.(test|spec|stories)\./.test(name) &&
      !name.endsWith('.d.ts')
    )
      out.push(p);
  }
  return out;
}

/** Ignore comments so documentation can mention colours. */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
}

function isDressed(rel) {
  return DRESSED.some((d) => rel === d || rel.startsWith(`${d}/`));
}

const files = SCAN_ROOTS.flatMap((r) => walk(join(ROOT, r), []));
const violations = [];
let hexCount = 0;

for (const file of files) {
  const rel = relative(ROOT, file).split('\\').join('/');
  if (PALETTE_FILES.has(rel)) continue;
  const src = stripComments(readFileSync(file, 'utf8'));
  if (isDressed(rel)) {
    const lines = src.split('\n');
    lines.forEach((line, i) => {
      for (const re of [HEX, FUNC, LEGACY]) {
        re.lastIndex = 0;
        const m = line.match(re);
        if (m) violations.push(`${rel}:${i + 1}  ${m.join(', ')}`);
      }
    });
  } else {
    hexCount += (src.match(HEX) ?? []).length;
  }
}

const update = process.argv.includes('--update');
const baseline = existsSync(RATCHET) ? JSON.parse(readFileSync(RATCHET, 'utf8')) : null;
let failed = false;

if (violations.length) {
  failed = true;
  console.error(
    `Raw colours in dressed files (${violations.length}). Use useWorld().tokens or a world component:`,
  );
  for (const v of violations) console.error(`  ${v}`);
}

if (!baseline || update) {
  if (baseline && hexCount > baseline.rawHex) {
    console.error(`Refusing to raise the baseline: ${hexCount} > ${baseline.rawHex}.`);
    process.exit(1);
  }
  writeFileSync(
    RATCHET,
    `${JSON.stringify({ rawHex: hexCount, note: 'Raw hex colours outside dressed files. May only go down. node scripts/check-world.mjs --update' }, null, 2)}\n`,
  );
  console.log(`Recorded raw hex baseline: ${hexCount}.`);
} else if (hexCount > baseline.rawHex) {
  failed = true;
  console.error(
    `Raw hex colours went up: ${hexCount} (baseline ${baseline.rawHex}). Take the colour from the world instead.`,
  );
} else {
  const down = baseline.rawHex - hexCount;
  console.log(
    `World guardrail: dressed files clean; raw hex ${hexCount} (baseline ${baseline.rawHex}${down ? `, ${down} fewer, run --update to lock it in` : ''}).`,
  );
}

process.exit(failed ? 1 : 0);
