#!/usr/bin/env node

/**
 * UI boundaries (scripts/check-ui-boundaries.mjs)
 *
 * The UI kit has four homes in @repo/ui (docs/architecture/2026-10-29-ui-component-system-rebuild-plan.md):
 *   theme/                 the world engine, platform-neutral (theme/native and theme/web bind it)
 *   tokens/                fixed scales
 *   components/native/     React Native components
 *   components/web/        DOM components
 *
 * Rules:
 *  1. Platform-neutral theme code and everything web never imports React Native,
 *     Expo, NativeWind or Skia, and never imports the native side.
 *  2. Native never imports the web side.
 *  3. The theme never imports components.
 *  4. The kit never imports legacy UI (except the exceptions below, which only shrink).
 *  5. Everywhere else, imports of legacy UI and `*.web.tsx` files may only go down.
 *     The baseline lives in tooling/ui-legacy-ratchet.json; lower it with `--update`.
 *
 * Usage:
 *   node scripts/check-ui-boundaries.mjs           # verify
 *   node scripts/check-ui-boundaries.mjs --update  # record lower counts after a migration
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RATCHET = join(ROOT, 'tooling/ui-legacy-ratchet.json');
const UI = 'packages/ui/src';

/** Legacy files that still live inside theme/ until Phase 4 removes them. */
const THEME_LEGACY = [
  `${UI}/theme/Theme.ts`,
  `${UI}/theme/worldBridge.ts`,
  `${UI}/theme/nitroThemeTransition.ts`,
  `${UI}/theme/nitroThemeTransition.types.ts`,
  `${UI}/theme/nitroThemeTransition.web.ts`,
];

/** Legacy UI, by resolved path under packages/ui/src. */
const LEGACY_PATHS = [
  `${UI}/primitives`,
  `${UI}/components/ui/`,
  `${UI}/gluestack/`,
  `${UI}/components-native/`,
  `${UI}/theme/Theme`,
  `${UI}/theme/worldBridge`,
  `${UI}/button`,
  `${UI}/card`,
  `${UI}/code`,
];
/** Every flat file in components/ is legacy; the kit lives in components/native and components/web. */
const isFlatComponent = (p) =>
  p.startsWith(`${UI}/components/`) &&
  !`${p}/`.startsWith(`${UI}/components/native/`) &&
  !`${p}/`.startsWith(`${UI}/components/web/`);

/** Kit -> legacy links that exist today. Each names the phase that removes it; never add to this. */
const KIT_EXCEPTIONS = new Set([
  // Phase 1: base durations move into tokens.
  `${UI}/theme/motion.ts -> ${UI}/components/motion`,
  // Phase 1: the loading pulse becomes part of the kit.
  `${UI}/components/native/Button/Button.tsx -> ${UI}/components/BrandPulse`,
]);

const NATIVE_ONLY =
  /^(react-native(?:-[\w-]+)?|expo(?:-[\w-]+)?|nativewind|@shopify\/react-native-skia|@expo\/[\w-]+)(\/|$)/;

const zone = (path) => {
  if (THEME_LEGACY.includes(path)) return 'legacy';
  // a folder import ('..', './Scene') names the folder itself
  const p = `${path}/`;
  if (p.startsWith(`${UI}/components/native/`)) return 'native';
  if (p.startsWith(`${UI}/components/web/`)) return 'web';
  if (p.startsWith(`${UI}/theme/native/`)) return 'theme-native';
  if (p.startsWith(`${UI}/theme/web/`)) return 'theme-web';
  if (p.startsWith(`${UI}/theme/`) || p.startsWith(`${UI}/tokens/`)) return 'theme';
  return null;
};

/** Ignore comments so documentation can show example imports. */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
}

const IMPORT = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\(\s*)['"]([^'"]+)['"]/g;

/** Resolve a specifier to a repo-relative path under packages/ui/src, or null. */
function resolveSpec(file, spec) {
  if (spec.startsWith('.')) return posix.normalize(posix.join(posix.dirname(file), spec));
  if (spec === '@repo/ui' || spec.startsWith('@repo/ui/')) return `${UI}/${spec.slice('@repo/ui/'.length)}`;
  return null;
}

const isLegacy = (p) => p !== null && (LEGACY_PATHS.some((l) => p === l || p.startsWith(l)) || isFlatComponent(p));

const files = execFileSync(
  'git',
  ['ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', 'apps', 'packages'],
  { cwd: ROOT, encoding: 'utf8' },
)
  .split('\0')
  .filter(
    (f) =>
      f &&
      !/(^|\/)(node_modules|dist|build|\.next|\.expo|android|ios|archive)\//.test(f) &&
      /\.(tsx?|jsx?|mts|mjs)$/.test(f) &&
      !f.endsWith('.d.ts') &&
      existsSync(join(ROOT, f)),
  );

const violations = [];
let legacyImports = 0;
const webTsxFiles = files.filter((f) => /\.web\.tsx$/.test(f)).length;

for (const file of files) {
  const from = zone(file);
  const inLegacy = isLegacy(file) || from === 'legacy';
  const src = stripComments(readFileSync(join(ROOT, file), 'utf8'));
  for (const m of src.matchAll(IMPORT)) {
    const spec = m[1];
    const target = resolveSpec(file, spec);
    const to = target ? zone(target) : null;
    const where = `${file}  '${spec}'`;

    if (from === 'theme' || from === 'web' || from === 'theme-web') {
      if (NATIVE_ONLY.test(spec)) violations.push(`${where}: native module in platform-neutral or web code`);
      if (to === 'native' || to === 'theme-native') violations.push(`${where}: imports the native side`);
    }
    if ((from === 'native' || from === 'theme-native') && (to === 'web' || to === 'theme-web')) {
      violations.push(`${where}: native imports the web side`);
    }
    if ((from === 'theme' || from === 'theme-native' || from === 'theme-web') && (to === 'native' || to === 'web')) {
      violations.push(`${where}: theme imports components`);
    }
    if (from && from !== 'legacy' && isLegacy(target)) {
      const key = `${file} -> ${target.replace(/\.(tsx?|jsx?)$/, '')}`;
      if (!KIT_EXCEPTIONS.has(key)) violations.push(`${where}: kit imports legacy UI`);
    }
    if (!from && !inLegacy && isLegacy(target)) legacyImports++;
  }
}

const update = process.argv.includes('--update');
const baseline = existsSync(RATCHET) ? JSON.parse(readFileSync(RATCHET, 'utf8')) : null;
let failed = false;

if (violations.length) {
  failed = true;
  console.error(`UI boundary violations (${violations.length}):`);
  for (const v of violations) console.error(`  ${v}`);
}

const counts = { legacyImports, webTsxFiles };
if (!baseline || update) {
  const raised = baseline && Object.entries(counts).filter(([k, v]) => v > baseline[k]);
  if (raised?.length) {
    console.error(`Refusing to raise the baseline: ${raised.map(([k, v]) => `${k} ${v} > ${baseline[k]}`).join(', ')}.`);
    process.exit(1);
  }
  writeFileSync(
    RATCHET,
    `${JSON.stringify({ ...counts, note: 'Imports of legacy UI from outside it, and *.web.tsx files. May only go down. node scripts/check-ui-boundaries.mjs --update' }, null, 2)}\n`,
  );
  console.log(`Recorded UI legacy baseline: ${legacyImports} legacy imports, ${webTsxFiles} *.web.tsx files.`);
} else {
  const up = Object.entries(counts).filter(([k, v]) => v > baseline[k]);
  if (up.length) {
    failed = true;
    for (const [k, v] of up) console.error(`${k} went up: ${v} (baseline ${baseline[k]}). Use the kit instead.`);
  } else {
    console.log(
      `UI boundaries: kit clean; legacy imports ${legacyImports} (baseline ${baseline.legacyImports}), *.web.tsx ${webTsxFiles} (baseline ${baseline.webTsxFiles}).`,
    );
  }
}

process.exit(failed ? 1 : 0);
