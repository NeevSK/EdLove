import { readFileSync } from 'node:fs';
import { posix } from 'node:path';

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

const isLegacy = (p) => p !== null && (LEGACY_PATHS.some((l) => p === l || p.startsWith(l)) || isFlatComponent(p));

function resolveSpec(file, spec) {
  if (spec.startsWith('.')) return posix.normalize(posix.join(posix.dirname(file), spec));
  if (spec === '@repo/ui' || spec.startsWith('@repo/ui/')) return `${UI}/${spec.slice('@repo/ui/'.length)}`;
  return null;
}

const IMPORT = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\(\s*)['"]([^'"]+)['"]/g;

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
}

const file = 'packages/ui/src/components/LogoutModal.tsx';
const from = zone(file);
const inLegacy = isLegacy(file) || from === 'legacy';
const src = stripComments(readFileSync(file, 'utf8'));

console.log('file:', file, 'from:', from, 'inLegacy:', inLegacy);
for (const m of src.matchAll(IMPORT)) {
  const spec = m[1];
  const target = resolveSpec(file, spec);
  console.log('spec:', spec, 'target:', target, 'isLegacyTarget:', isLegacy(target));
}
