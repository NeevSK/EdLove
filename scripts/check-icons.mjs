import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

/**
 * Icon Bridge Contract Verifier
 *
 * Enforces that `@repo/ui/icons` is the ONLY public lucide icon surface in the
 * repository, and that the bridge itself only uses tree-shakable per-icon
 * subpath imports (`lucide-react-native/icons/<kebab>`).
 *
 * Fails when:
 *  1. Any app/package file imports lucide directly (root `lucide-react-native`,
 *     barrel `lucide-react-native/icons`, internal `lucide-react-native/dist/*`,
 *     or the web package `lucide-react`) instead of `@repo/ui/icons`.
 *  2. The bridge exports an icon that does not resolve to a real lucide icon
 *     (catches renamed/removed icons, e.g. `Edit2` -> `Pen`, immediately).
 *
 * Usage: `node scripts/check-icons.mjs` (wired as `pnpm check:icons`).
 */

const root = process.cwd();
const uiPackageRoot = path.join(root, 'packages', 'ui');
const bridgeFile = path.join(uiPackageRoot, 'src', 'icons.native.ts');
const webShimFile = path.join(root, 'apps', 'gurudevi-mobile', 'src', 'shims', 'lucide-react-native-web.js');

// Files that are legitimately allowed to touch lucide directly.
const allowlist = new Set([bridgeFile, webShimFile].map((p) => path.normalize(p)));

const filePattern = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
const skipDirs = new Set(['node_modules', '.git', 'dist', '.expo', '.tmp', 'archives']);

const DIRECT_ROOT_RE = /from\s*['"]lucide-react-native['"]/;
const DIRECT_BARREL_RE = /from\s*['"]lucide-react-native\/icons['"]/;
const DIRECT_SUBPATH_RE = /from\s*['"]lucide-react-native\/icons\//;
const DIRECT_DEEP_RE = /from\s*['"]lucide-react-native\/dist\//;
const DIRECT_WEB_RE = /from\s*['"]lucide-react['"]/;

const violations = [];

// ─────────────────────────────────────────────────────────────────────────────
// 1. Validate the bridge: every subpath must resolve to a real lucide icon.
// ─────────────────────────────────────────────────────────────────────────────
let requireFromUi;
let iconFiles;
try {
  requireFromUi = createRequire(path.join(uiPackageRoot, 'package.json'));
  const arrowLeftEntry = requireFromUi.resolve('lucide-react-native/icons/arrow-left');
  const lucidePackageRoot = path.resolve(arrowLeftEntry, '..', '..', '..', '..');
  const iconsDir = path.join(lucidePackageRoot, 'dist', 'esm', 'icons');
  iconFiles = new Set(
    fs
      .readdirSync(iconsDir)
      .filter((f) => f.endsWith('.mjs'))
      .map((f) => f.slice(0, -'.mjs'.length)),
  );
} catch (e) {
  console.error(`check-icons: unable to resolve lucide-react-native from @repo/ui: ${e.message}`);
  process.exit(1);
}

const bridgeText = fs.readFileSync(bridgeFile, 'utf8');
const bridgeExports = [];
for (const line of bridgeText.split(/\r?\n/)) {
  const m = line.match(/^export \{\s*default as ([A-Za-z0-9]+)\s*\}\s+from 'lucide-react-native\/icons\/([^']+)';$/);
  if (m) {
    bridgeExports.push({ name: m[1], subpath: m[2], line });
    if (!iconFiles.has(m[2])) {
      violations.push(`bridge ${bridgeFile}: icon '${m[1]}' -> 'lucide-react-native/icons/${m[2]}' does not resolve to a real lucide icon (renamed/removed?)`);
    }
  } else if (DIRECT_BARREL_RE.test(line) || DIRECT_DEEP_RE.test(line)) {
    violations.push(`bridge ${bridgeFile}: only public per-icon subpaths are allowed, found: ${line.trim()}`);
  } else if (/from\s*['"]lucide-react-native['"]/.test(line) && !/^export\s+type\b/.test(line.trim())) {
    violations.push(`bridge ${bridgeFile}: runtime root import is not allowed, found: ${line.trim()}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Scan apps/ + packages/ for direct lucide imports.
// ─────────────────────────────────────────────────────────────────────────────
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!filePattern.test(entry.name)) continue;
    const normalized = path.normalize(full);
    if (normalized.includes(`${path.sep}docs${path.sep}`)) continue;
    if (allowlist.has(normalized)) continue;
    const text = fs.readFileSync(full, 'utf8');
    if (
      DIRECT_ROOT_RE.test(text) ||
      DIRECT_BARREL_RE.test(text) ||
      DIRECT_SUBPATH_RE.test(text) ||
      DIRECT_DEEP_RE.test(text) ||
      DIRECT_WEB_RE.test(text)
    ) {
      violations.push(path.relative(root, full));
    }
  }
}

for (const candidate of ['apps', 'packages']) {
  const dir = path.join(root, candidate);
  if (fs.existsSync(dir)) walk(dir);
}

if (violations.length > 0) {
  console.error('Icon bridge contract violation:');
  for (const v of violations) console.error(`- ${v}`);
  console.error('\nImport icons from @repo/ui/icons only. The bridge (packages/ui/src/icons.native.ts)');
  console.error('is the single public surface. To add an icon, add one export line there.');
  process.exit(1);
}

console.log(`Icon bridge contract verified. ${bridgeExports.length} bridge exports, all resolve to real lucide icons.`);
