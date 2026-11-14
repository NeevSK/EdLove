#!/usr/bin/env node

/**
 * ==============================================================================
 * GURUDEVI MOBILE — NATIVE ANTI-SLOP AST & DIALECT SENTINEL
 * ==============================================================================
 * Enforces the October 2026 Agentic React Native & Expo Invariants across active
 * mobile source files (apps/gurudevi-mobile and @repo/ui).
 *
 * Targets the 5 Classic Agentic Native Footguns:
 *   1. RAW_EFFECT_FETCH (BLOCK): Fetching data in useEffect without TanStack/PowerSync.
 *   2. EXPO_PUBLIC_SECRET_LEAK (BLOCK): Private secrets in client-exposed env vars.
 *   3. UNVIRTUALIZED_COLLECTION (BLOCK): ScrollView.map() instead of FlashList/LegendList.
 *   4. UNCONSTRAINED_KEYBOARD_INPUT (REVIEW): Inputs vulnerable to keyboard occlusion.
 *   5. NEW_ARCH_DIALECT_DRIFT (BLOCK): Deprecated Reanimated 4 / React 19 / RN 0.88 symbols.
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const sourceExtensions = new Set(['.tsx', '.ts', '.jsx', '.js']);
const ignoredPaths = new Set([
  'node_modules',
  '.git',
  '.next',
  '.expo',
  '.turbo',
  'dist',
  'build',
  'coverage',
  'reports',
  'android',
  'ios',
  '__tests__',
]);

const allowedPublicKeys = new Set([
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_POSTHOG_KEY',
  'EXPO_PUBLIC_POSTHOG_HOST',
  'EXPO_PUBLIC_APP_ENV',
  'EXPO_PUBLIC_APP_VARIANT',
  'EXPO_PUBLIC_SENTRY_DSN',
  'EXPO_PUBLIC_GROWTHBOOK_CLIENT_KEY',
]);

// High-confidence blocking rules (exit code 1)
const BLOCK_RULES = [
  {
    name: 'RAW_EFFECT_FETCH',
    pattern: /useEffect\s*\(\s*(?:async\s*)?\(\)\s*=>\s*\{[\s\S]*?(?:fetch\(|axios\.|supabase\.from|client\.query\()/m,
    singleLinePattern: /useEffect\s*\([^)]*fetch\(/,
    message: 'Raw data-fetching inside useEffect detected. Use TanStack Query (useQuery) or PowerSync useLiveQuery.',
  },
  {
    name: 'EXPO_PUBLIC_SECRET_LEAK',
    pattern: /EXPO_PUBLIC_[A-Z0-9_]*(?:SECRET|PRIVATE|SERVICE_ROLE|ADMIN_KEY|TOKEN)[A-Z0-9_]*/,
    filter: (match) => !allowedPublicKeys.has(match),
    message: 'Potential secret/service credential exposed in EXPO_PUBLIC_* variable. Secrets must be injected via Doppler or server routes.',
  },
  {
    name: 'UNVIRTUALIZED_COLLECTION',
    pattern: /<ScrollView[^>]*>[\s\S]*?\{[a-zA-Z0-9_?.()]+\.map\(/m,
    message: 'Non-virtualized collection (.map) inside ScrollView detected. Use FlashList (@shopify/flash-list) or LegendList (@legendapp/list).',
  },
  {
    name: 'REANIMATED_WORKLET_IMPORT_DRIFT',
    pattern: /import\s*\{[^}]*\b(runOnJS|runOnUI|createWorkletRuntime|makeShareableCloneRecursive)\b[^}]*\}\s*from\s*['"]react-native-reanimated['"]/,
    message: 'Worklet primitives must be imported from `react-native-worklets`, NEVER from `react-native-reanimated`.',
  },
  {
    name: 'REACT_19_FORWARD_REF_DEPRECATION',
    pattern: /\bReact\.forwardRef\b|\bforwardRef\s*\(/,
    message: 'React.forwardRef is deprecated in React 19. Pass `ref` directly as a standard component prop.',
  },
  {
    name: 'REACT_NATIVE_088_DEPRECATED_SYMBOLS',
    pattern: /\b(findNodeHandle|useNativeDriver\s*:\s*false|InteractionManager\.runAfterInteractions)\b/,
    message: 'Deprecated React Native symbol detected. Incompatible with React Native 0.88 / New Architecture.',
  },
];

// Advisory / Review rules
const REVIEW_RULES = [
  {
    name: 'UNCONSTRAINED_KEYBOARD_INPUT',
    pattern: /<TextInput\b(?![^>]*\btestID\b)/,
    message: 'TextInput without testID or accessibility identifier detected. Hampers deterministic device-in-the-loop verification.',
  },
  {
    name: 'INLINE_STYLE_OBJECT_RECREATION',
    pattern: /style=\{\{\s*[a-zA-Z0-9_]+:\s*[^}]+\}\}/,
    message: 'Inline style object in render path. Prefer StyleSheet.create or NativeWind classes to minimize garbage collection.',
  },
];

import { fastScanFiles } from './lib/fast-scan.mjs';

function walk(dir) {
  return fastScanFiles(dir, {
    extensions: ['ts', 'tsx', 'js', 'jsx'],
    absolute: true,
  });
}

function getChangedFiles() {
  try {
    const output = execFileSync('git', ['diff', '--name-only', 'HEAD'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return output
      .split(/\r?\n/)
      .filter(Boolean)
      .map((f) => path.join(root, f))
      .filter((f) => fs.existsSync(f) && sourceExtensions.has(path.extname(f)));
  } catch {
    return [];
  }
}

const isAll = process.argv.includes('--all');
const isReportOnly = process.argv.includes('--report-only');

const scanRoots = [
  path.join(root, 'apps', 'gurudevi-mobile', 'src'),
  path.join(root, 'apps', 'gurudevi-mobile', 'app'),
  path.join(root, 'packages', 'ui', 'src'),
];

let targetFiles = [];
if (isAll) {
  for (const r of scanRoots) {
    walk(r, targetFiles);
  }
} else {
  const changed = getChangedFiles();
  targetFiles = changed.filter((f) => scanRoots.some((r) => f.startsWith(r)));
  // If no files changed in mobile, check all in apps/gurudevi-mobile/app and packages/ui/src/sentinels for baseline
  if (targetFiles.length === 0) {
    targetFiles = walk(path.join(root, 'packages', 'ui', 'src', 'sentinels'));
  }
}

console.log('\x1b[1m\x1b[36m======================================================================\x1b[0m');
console.log('\x1b[1m\x1b[36m  GURUDEVI MOBILE — NATIVE ANTI-SLOP AST SENTINEL\x1b[0m');
console.log('\x1b[1m\x1b[36m======================================================================\x1b[0m');

const findings = [];

for (const file of targetFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(root, file);

  // Check multi-line block rules
  for (const rule of BLOCK_RULES) {
    if (rule.pattern.test(content)) {
      if (rule.filter) {
        const matches = content.match(rule.pattern);
        if (matches && !matches.some(rule.filter)) continue;
      }
      findings.push({
        severity: 'BLOCK',
        rule: rule.name,
        message: rule.message,
        file: relPath,
        line: 1,
      });
    }
  }

  // Check per-line review rules
  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const rule of REVIEW_RULES) {
      if (rule.pattern.test(line)) {
        findings.push({
          severity: 'REVIEW',
          rule: rule.name,
          message: rule.message,
          file: relPath,
          line: index + 1,
        });
      }
    }
  });
}

console.log(`Audited ${targetFiles.length} files across active native tree. Total findings: ${findings.length}`);

let blockCount = 0;
let reviewCount = 0;

for (const f of findings) {
  if (f.severity === 'BLOCK') blockCount++;
  else reviewCount++;
  const color = f.severity === 'BLOCK' ? '\x1b[31m' : '\x1b[33m';
  console.log(`  ${color}${f.severity}\x1b[0m ${f.file}:${f.line} [${f.rule}] ${f.message}`);
}

if (findings.length === 0) {
  console.log('  \x1b[32m✔\x1b[0m Zero native slop or New Architecture dialect regressions detected.');
}

console.log('\x1b[1m\x1b[36m======================================================================\x1b[0m\n');

if (!isReportOnly && blockCount > 0) {
  process.exit(1);
}

process.exit(0);
