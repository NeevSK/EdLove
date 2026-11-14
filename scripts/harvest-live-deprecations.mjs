#!/usr/bin/env node
/**
 * harvest-live-deprecations.mjs
 *
 * Physical Substrate Deprecation Harvester
 * Scans installed package declarations (`node_modules/** /*.d.ts` and `*.d.mts`)
 * for `/** @deprecated ... * /` JSDoc annotations and regenerates/updates
 * `reports/live-deprecations.json`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { checkShinyTool } from './lib/shiny-tools.mjs';

const ROOT_DIR = process.cwd();
const REPORT_FILE = path.join(ROOT_DIR, 'reports', 'live-deprecations.json');

// Packages of primary architectural interest
const TARGET_PACKAGES = [
  'hono',
  '@hono/node-server',
  '@supabase/server',
  'react',
  'react-dom',
  '@types/react',
  '@types/react-dom',
  'react-native',
  'react-native-reanimated',
  'react-native-gesture-handler',
  'react-native-worklets',
  'react-native-mmkv',
  'expo',
  'expo-router',
  '@tanstack/ai',
  '@tanstack/react-query',
  '@orpc/client',
  '@orpc/server',
  'kysely',
  'zod',
  'drizzle-orm',
  'effect',
  'nativewind',
  'lucide-react',
  'lucide-react-native',
];

function getPackageVersion(packageDir) {
  try {
    const pkgJsonPath = path.join(packageDir, 'package.json');
    if (fs.existsSync(pkgJsonPath)) {
      const data = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      return data.version || 'unknown';
    }
  } catch {}
  return 'unknown';
}

let pnpmEntriesCache = null;
function getPnpmEntries() {
  if (pnpmEntriesCache) return pnpmEntriesCache;
  const pnpmDir = path.join(ROOT_DIR, 'node_modules', '.pnpm');
  if (fs.existsSync(pnpmDir)) {
    try {
      pnpmEntriesCache = fs.readdirSync(pnpmDir);
    } catch {
      pnpmEntriesCache = [];
    }
  } else {
    pnpmEntriesCache = [];
  }
  return pnpmEntriesCache;
}

function findPackageRoots(targetPkg) {
  const roots = [];
  const candidates = [
    path.join(ROOT_DIR, 'node_modules', targetPkg),
    path.join(ROOT_DIR, 'apps', 'sanctuary-api', 'node_modules', targetPkg),
    path.join(ROOT_DIR, 'apps', 'gurudevi-web', 'node_modules', targetPkg),
    path.join(ROOT_DIR, 'apps', 'gurudevi-mobile', 'node_modules', targetPkg),
  ];

  for (const cand of candidates) {
    if (fs.existsSync(cand) && !roots.includes(cand)) {
      roots.push(cand);
    }
  }

  // If already found in direct node_modules, we don't need to scan .pnpm duplicates
  if (roots.length > 0) return roots;

  // Otherwise resolve canonical instance from node_modules/.pnpm
  const pnpmDir = path.join(ROOT_DIR, 'node_modules', '.pnpm');
  const escaped = targetPkg.replace(/\//g, '+');
  const entries = getPnpmEntries();

  // Prefer exact match (e.g. zod@4.6.5/node_modules/zod) over nested peer combinations
  const exactEntry = entries.find((e) => e.startsWith(`${escaped}@`) && !e.includes('_'));
  if (exactEntry) {
    const innerPkg = path.join(pnpmDir, exactEntry, 'node_modules', targetPkg);
    if (fs.existsSync(innerPkg)) {
      roots.push(innerPkg);
      return roots;
    }
  }

  // Fallback to first matching entry
  for (const entry of entries) {
    if (entry === escaped || entry.startsWith(`${escaped}@`)) {
      const innerPkg = path.join(pnpmDir, entry, 'node_modules', targetPkg);
      if (fs.existsSync(innerPkg)) {
        roots.push(innerPkg);
        break; // Only need one canonical instance
      }
    }
  }

  return roots;
}


function findDtsFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  // Fast path: use Rust fd if available
  const fdStatus = checkShinyTool('fd');
  if (fdStatus.installed) {
    try {
      const output = execSync(
        `fd -u -e d.ts -e d.mts -E tests -E __tests__ . "${dir}"`,
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], timeout: 5000 },
      );
      const found = output
        .split(/\r?\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0 && fs.existsSync(p));
      if (found.length > 0) return found;
    } catch {
      // Fall through to JS walk
    }
  }

  // Fallback path: Pure JS walk
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip hidden and non-source dirs
        if (entry.name.startsWith('.') || entry.name === 'tests' || entry.name === '__tests__') {
          continue;
        }
        findDtsFiles(fullPath, files);
      } else if (entry.isFile() && (entry.name.endsWith('.d.ts') || entry.name.endsWith('.d.mts'))) {
        files.push(fullPath);
      }
    }
  } catch {
    // Ignore permissions or broken links
  }
  return files;
}

function extractDeprecationsFromFile(filePath, pkgVersion) {
  const content = fs.readFileSync(filePath, 'utf8');
  const results = [];
  const relFile = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');

  // Match JSDoc blocks containing @deprecated
  const jsdocBlockRegex = /\/\*\*([\s\S]*?@deprecated[\s\S]*?)\*\/\s*(?:export\s+)?(?:declare\s+)?(?:default\s+)?(?:(function|const|let|var|type|interface|class|enum)\s+([A-Za-z0-9_$]+)|([A-Za-z0-9_$]+)\s*[:?(<])/g;

  let match;
  while ((match = jsdocBlockRegex.exec(content)) !== null) {
    const jsdoc = match[1];
    const symbol = match[3] || match[4];
    if (!symbol || symbol === 'function' || symbol === 'default') continue;

    // Calculate line number where match occurred
    const linesUpToMatch = content.slice(0, match.index).split('\n');
    const line = linesUpToMatch.length;

    // Extract @deprecated text
    const depMatch = /@deprecated\s+([^\n\r*]+(?:\n\s*\*\s*[^@\n\r*]+)*)/i.exec(jsdoc);
    let message = depMatch ? depMatch[1].replace(/\n\s*\*\s*/g, ' ').trim() : 'Deprecated API';

    // Heuristic for replacement
    let replacement = 'Consult package documentation for modern alternative';
    const useMatch = /(?:use|prefer|replaced by|migration guide:?)\s+[`'"]?([A-Za-z0-9_$.]+)[`'"]?/i.exec(message);
    if (useMatch && useMatch[1] && useMatch[1] !== symbol) {
      replacement = useMatch[1];
    }

    results.push({
      symbol,
      replacement,
      message,
      file: relFile,
      line,
      packageVersion: pkgVersion || 'unknown',
    });
  }

  return results;
}

function harvest() {
  console.log('>>> [Live Substrate Harvester] Scanning physical substrate declarations...');

  let existing = {};
  if (fs.existsSync(REPORT_FILE)) {
    try {
      existing = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf8'));
    } catch {
      existing = {};
    }
  }

  const allTargetPackages = Array.from(
    new Set([
      ...TARGET_PACKAGES,
      ...Object.keys(existing),
    ])
  );

  let totalHarvested = 0;
  const packagesUpdated = [];

  for (const pkgName of allTargetPackages) {
    const roots = findPackageRoots(pkgName);
    if (roots.length === 0) continue;

    const seenSymbols = new Set();
    const pkgDeprecations = [];

    for (const root of roots) {
      const pkgVersion = getPackageVersion(root);
      const dtsFiles = findDtsFiles(root);
      for (const file of dtsFiles) {
        const found = extractDeprecationsFromFile(file, pkgVersion);
        for (const item of found) {
          if (!seenSymbols.has(item.symbol)) {
            seenSymbols.add(item.symbol);
            pkgDeprecations.push(item);
          }
        }
      }
    }

    // Keep existing items if present and not re-discovered (preserving baseline signals)
    if (Array.isArray(existing[pkgName])) {
      for (const item of existing[pkgName]) {
        if (!seenSymbols.has(item.symbol)) {
          seenSymbols.add(item.symbol);
          pkgDeprecations.push(item);
        }
      }
    }

    if (pkgDeprecations.length > 0) {
      existing[pkgName] = pkgDeprecations;
      totalHarvested += pkgDeprecations.length;
      packagesUpdated.push(`${pkgName} (${pkgDeprecations.length})`);
    }
  }

  // Count grand total
  let grandTotal = 0;
  for (const list of Object.values(existing)) {
    if (Array.isArray(list)) grandTotal += list.length;
  }

  fs.writeFileSync(REPORT_FILE, JSON.stringify(existing, null, 2), 'utf8');

  console.log(`>>> [Live Substrate Harvester] Completed.`);
  console.log(`>>> Total tracked deprecations: ${grandTotal}`);
  console.log(`>>> Updated packages: ${packagesUpdated.join(', ')}`);
}

harvest();

