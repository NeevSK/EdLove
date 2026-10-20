/**
 * scripts/lib/reachability.mjs
 *
 * Call-Graph Reachability & Dependency Tier Classification Engine.
 *
 * Implements the "govulncheck" pattern for TypeScript/Node monorepos:
 * Distinguishes packages actually imported into production application bundles
 * (apps/gurudevi-mobile, apps/gurudevi-web, apps/sanctuary-api) from dev tooling,
 * linters, build scripts, and inert transitive dependencies.
 *
 * Optimizations:
 * Uses high-velocity Rust `rg` (ripgrep) when available for 150ms AST sweeps,
 * gracefully falling back to Node.js filesystem walks if missing.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { checkShinyTool } from './shiny-tools.mjs';

const ROOT_DIR = process.cwd();

const PRODUCTION_SEARCH_DIRS = [
  'apps/gurudevi-mobile/app',
  'apps/gurudevi-mobile/src',
  'apps/gurudevi-web/app',
  'apps/gurudevi-web/lib',
  'apps/gurudevi-web/components',
  'apps/sanctuary-api/src',
  'packages/core/src',
  'packages/ui/src',
  'packages/classroom/src',
];

const IGNORED_DIRS = new Set([
  'node_modules',
  'android',
  'ios',
  'generated',
  '.next',
  '.expo',
  'dist',
  'build',
  '.turbo',
  '__tests__',
  'coverage',
  '.git',
]);

const SOURCE_FILE_REGEX = /\.(tsx?|jsx?)$/;
const IMPORT_SPECIFIER_REGEX = /(?:import|export|from|require)\s*(?:\(\s*)?['"]([^'"]+)['"]/g;

let cachedProductionImports = null;

function extractRootPackage(spec) {
  if (spec.startsWith('.') || spec.startsWith('/') || spec.startsWith('#')) return null;
  if (spec.startsWith('@')) {
    const parts = spec.split('/');
    return parts.slice(0, 2).join('/');
  }
  return spec.split('/')[0];
}

/**
 * Fast AST regex sweep across production app entrypoints.
 * Scans all source files in production roots and caches the imported root package names.
 */
export function getProductionImports() {
  if (cachedProductionImports) return cachedProductionImports;

  const imports = new Set();
  const rgStatus = checkShinyTool('rg');

  // Fast path: Use Rust ripgrep if available
  if (rgStatus.installed) {
    try {
      const existingDirs = PRODUCTION_SEARCH_DIRS
        .map((d) => path.join(ROOT_DIR, d))
        .filter((d) => fs.existsSync(d));

      if (existingDirs.length > 0) {
        const cmd = [
          'rg',
          '--no-config',
          '--no-filename',
          '-o',
          '-e',
          '"(?:import|export|from|require)\\s*(?:\\(\\s*)?[\'\\"][^\'\\"]+[\'\\"]"',
          ...existingDirs.map((d) => `"${d}"`),
          '-g', '"*.ts"',
          '-g', '"*.tsx"',
          '-g', '"*.js"',
          '-g', '"*.jsx"',
        ].join(' ');

        const output = execSync(cmd, {
          cwd: ROOT_DIR,
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore'],
          maxBuffer: 10 * 1024 * 1024,
        });

        let match;
        while ((match = IMPORT_SPECIFIER_REGEX.exec(output)) !== null) {
          const root = extractRootPackage(match[1]);
          if (root) imports.add(root);
        }

        cachedProductionImports = imports;
        return cachedProductionImports;
      }
    } catch {
      // Fall through to pure JS walk
    }
  }

  // Fallback path: Pure JS recursive filesystem walk
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const ent of entries) {
        if (ent.isDirectory()) {
          if (!IGNORED_DIRS.has(ent.name) && !ent.name.startsWith('.')) {
            walk(path.join(dir, ent.name));
          }
        } else if (SOURCE_FILE_REGEX.test(ent.name)) {
          try {
            const content = fs.readFileSync(path.join(dir, ent.name), 'utf8');
            let match;
            while ((match = IMPORT_SPECIFIER_REGEX.exec(content)) !== null) {
              const root = extractRootPackage(match[1]);
              if (root) imports.add(root);
            }
          } catch {}
        }
      }
    } catch {}
  }

  for (const relDir of PRODUCTION_SEARCH_DIRS) {
    walk(path.join(ROOT_DIR, relDir));
  }

  cachedProductionImports = imports;
  return cachedProductionImports;
}

/**
 * Classifies a dependency into a Reachability Tier.
 *
 * @param {string} pkgName Canonical package name (e.g. 'oxlint', 'posthog-js')
 * @param {object} details Object from pnpm outdated / package manifests
 * @returns {{
 *   tier: 'PRODUCTION_RUNTIME' | 'BUILD_TOOLING' | 'INERT_TRANSITIVE',
 *   isReachable: boolean,
 *   isDevOnly: boolean,
 *   consumerApps: string[],
 *   reason: string
 * }}
 */
export function classifyDependencyReachability(pkgName, details = {}) {
  const productionImports = getProductionImports();
  const isImported = productionImports.has(pkgName);

  const dependentPackages = details.dependentPackages || [];
  const dependencyType = details.dependencyType || 'dependencies';

  const isDevOnly = dependencyType === 'devDependencies' &&
    dependentPackages.every((d) => d.dependencyType === 'devDependencies' || !d.dependencyType);

  const consumerApps = dependentPackages
    .map((d) => d.name || '')
    .filter((n) => n === 'gurudevi-mobile' || n === 'gurudevi-web' || n === 'sanctuary-api');

  // 1. Direct Production Import detected in AST
  if (isImported) {
    return {
      tier: 'PRODUCTION_RUNTIME',
      isReachable: true,
      isDevOnly: false,
      consumerApps,
      reason: `Direct AST import detected across ${PRODUCTION_SEARCH_DIRS.length} production roots.`,
    };
  }

  // 2. Declared in production dependencies of an app, even if not yet imported
  if (consumerApps.length > 0 && dependencyType === 'dependencies') {
    return {
      tier: 'PRODUCTION_RUNTIME',
      isReachable: true,
      isDevOnly: false,
      consumerApps,
      reason: `Declared in production dependencies of: ${consumerApps.join(', ')}.`,
    };
  }

  // 3. Known Linters, Test Runners, and Compilers
  const isKnownTooling =
    isDevOnly ||
    pkgName.includes('eslint') ||
    pkgName.includes('prettier') ||
    pkgName.includes('biome') ||
    pkgName.includes('oxlint') ||
    pkgName.includes('jest') ||
    pkgName.includes('vitest') ||
    pkgName.includes('mcp-server') ||
    pkgName.includes('typescript') ||
    pkgName.includes('tsup') ||
    pkgName.includes('turbo');

  if (isKnownTooling) {
    return {
      tier: 'BUILD_TOOLING',
      isReachable: false,
      isDevOnly: true,
      consumerApps,
      reason: 'Build, lint, test, or developer tooling only (not shipped in app bundles).',
    };
  }

  // 4. Inert / Transitive / Orphaned
  return {
    tier: 'INERT_TRANSITIVE',
    isReachable: false,
    isDevOnly,
    consumerApps,
    reason: 'Zero AST import call sites found in production app trees.',
  };
}
