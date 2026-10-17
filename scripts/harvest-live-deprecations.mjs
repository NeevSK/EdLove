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

const ROOT_DIR = process.cwd();
const REPORT_FILE = path.join(ROOT_DIR, 'reports', 'live-deprecations.json');

// Packages of primary architectural interest
const TARGET_PACKAGES = [
  'hono',
  '@hono/node-server',
  '@supabase/server',
  'react',
  'react-dom',
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
];

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
  return roots;
}

function findDtsFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
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

function extractDeprecationsFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const results = [];

  // Match JSDoc blocks containing @deprecated
  const jsdocBlockRegex = /\/\*\*([\s\S]*?@deprecated[\s\S]*?)\*\/\s*(?:export\s+)?(?:declare\s+)?(?:default\s+)?(?:(function|const|let|var|type|interface|class|enum)\s+([A-Za-z0-9_$]+)|([A-Za-z0-9_$]+)\s*[:?(<])/g;

  let match;
  while ((match = jsdocBlockRegex.exec(content)) !== null) {
    const jsdoc = match[1];
    const symbol = match[3] || match[4];
    if (!symbol || symbol === 'function' || symbol === 'default') continue;

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

  let totalHarvested = 0;
  const packagesUpdated = [];

  for (const pkgName of TARGET_PACKAGES) {
    const roots = findPackageRoots(pkgName);
    if (roots.length === 0) continue;

    const seenSymbols = new Set();
    const pkgDeprecations = [];

    // Keep existing items if present
    if (Array.isArray(existing[pkgName])) {
      for (const item of existing[pkgName]) {
        if (!seenSymbols.has(item.symbol)) {
          seenSymbols.add(item.symbol);
          pkgDeprecations.push(item);
        }
      }
    }

    for (const root of roots) {
      const dtsFiles = findDtsFiles(root);
      for (const file of dtsFiles) {
        const found = extractDeprecationsFromFile(file);
        for (const item of found) {
          if (!seenSymbols.has(item.symbol)) {
            seenSymbols.add(item.symbol);
            pkgDeprecations.push(item);
          }
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
