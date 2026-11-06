import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const UI = 'packages/ui/src';

const THEME_LEGACY = [
  `${UI}/theme/Theme.ts`,
  `${UI}/theme/worldBridge.ts`,
  `${UI}/theme/nitroThemeTransition.ts`,
  `${UI}/theme/nitroThemeTransition.types.ts`,
  `${UI}/theme/nitroThemeTransition.web.ts`,
];

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

const isFlatComponent = (p) =>
  p.startsWith(`${UI}/components/`) &&
  !`${p}/`.startsWith(`${UI}/components/native/`) &&
  !`${p}/`.startsWith(`${UI}/components/web/`) &&
  !`${p}/`.startsWith(`${UI}/components/shared/`);

const zone = (path) => {
  if (THEME_LEGACY.includes(path)) return 'legacy';
  const p = `${path}/`;
  if (p.startsWith(`${UI}/components/native/`)) return 'native';
  if (p.startsWith(`${UI}/components/web/`)) return 'web';
  if (p.startsWith(`${UI}/components/shared/`)) return 'shared';
  if (p.startsWith(`${UI}/theme/native/`)) return 'theme-native';
  if (p.startsWith(`${UI}/theme/web/`)) return 'theme-web';
  if (p.startsWith(`${UI}/theme/`) || p.startsWith(`${UI}/tokens/`)) return 'theme';
  return null;
};

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
}

const IMPORT = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\(\s*)['"]([^'"]+)['"]/g;

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

const flatImports = {};

for (const file of files) {
  const from = zone(file);
  const inLegacy = isLegacy(file) || from === 'legacy';
  const src = stripComments(readFileSync(join(ROOT, file), 'utf8'));
  for (const m of src.matchAll(IMPORT)) {
    const spec = m[1];
    const target = resolveSpec(file, spec);
    if (!from && !inLegacy && isLegacy(target)) {
      if (isFlatComponent(target)) {
        const comp = target.replace(`${UI}/components/`, '');
        flatImports[comp] = (flatImports[comp] || 0) + 1;
      }
    }
  }
}

console.log('--- Top Flat Component Imports (Total: 425) ---');
console.log(Object.entries(flatImports).sort((a,b) => b[1] - a[1]));
