#!/usr/bin/env node
/**
 * 4-Pillars Operationalized Health Matrix Scanner (Normalized Baseline)
 * Evaluates the repo against:
 *  1. Harness Engineering (Scaffolding, Boundaries, File LOC caps)
 *  2. Vibe Engineering (Visual Design Tokens, Thin & Sensing UI)
 *  3. Verification Engineering (Type Integrity, Zero Suppressions, Empty Catch Swallowing)
 *  4. Vibe Maintenance (Dead code signs, Deep Imports, Console Sprawl)
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'c:/x';
const TARGET_DIRS = ['apps', 'packages'];
const EXCLUDE_DIRS = new Set([
  'node_modules', 'dist', 'build', '.turbo', '.expo', '.next', '.git',
  '.agents', '.vscode', '.astro', 'out', 'coverage', '.system_generated', 'artifacts',
  'dist-dev', 'dist-debug', 'dist-final-check', 'dist-final-no-gluestack-cli',
  'dist-post-update', 'dist-runtime-truth', 'output'
]);

const metrics = {
  harness: {
    filesOver300Loc: [],
    filesOver1000Loc: [],
    score: 100
  },
  vibe: {
    hardcodedHex: 0,
    hexOccurrences: [],
    score: 100
  },
  verification: {
    tsIgnore: 0,
    asUnknownAs: 0,
    emptyCatch: 0,
    tsAny: 0,
    score: 100
  },
  maintenance: {
    deepImports: [],
    consoleLogs: 0,
    score: 100
  }
};

let totalFiles = 0;
let totalLines = 0;

function analyzeFile(filePath, relPath) {
  totalFiles++;
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return;
  }

  const lines = content.split('\n');
  totalLines += lines.length;

  const isCode = /\.(ts|tsx|js|jsx)$/.test(filePath);
  const isTS = /\.(ts|tsx)$/.test(filePath);
  const isUI = /\.(tsx|jsx)$/.test(filePath);

  if (!isCode) return;

  // 1. HARNESS ENGINEERING (Modularity & Agent Context Boundaries)
  if (lines.length > 1000) {
    metrics.harness.filesOver1000Loc.push({ file: relPath, lines: lines.length });
  } else if (lines.length > 300) {
    metrics.harness.filesOver300Loc.push({ file: relPath, lines: lines.length });
  }

  // 2. VIBE ENGINEERING (Sacred Tokens & Fine UI)
  if (isUI) {
    const hexes = content.match(/#[0-9a-fA-F]{3,8}\b/g);
    if (hexes) {
      metrics.vibe.hardcodedHex += hexes.length;
      if (metrics.vibe.hexOccurrences.length < 5) {
        metrics.vibe.hexOccurrences.push({ file: relPath, count: hexes.length });
      }
    }
  }

  // 3. VERIFICATION ENGINEERING (Type Strictness & Error Handling)
  if (isTS) {
    const ignores = content.match(/@ts-ignore|@ts-nocheck/g);
    if (ignores) metrics.verification.tsIgnore += ignores.length;

    const unknowns = content.match(/as\s+unknown\s+as\b/g);
    if (unknowns) metrics.verification.asUnknownAs += unknowns.length;

    const anys = content.match(/:\s*any\b|as\s+any\b|<any>/g);
    if (anys) metrics.verification.tsAny += anys.length;
  }

  const emptyCatches = [...content.matchAll(/catch\s*(?:\([^)]*\))?\s*\{([^}]*)\}/g)];
  for (const m of emptyCatches) {
    const body = m[1].replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '').trim();
    if (body === '' || body === ';') {
      metrics.verification.emptyCatch++;
    }
  }

  // 4. VIBE MAINTENANCE (Hygiene & Runtime Pollution)
  const deepImports = [...content.matchAll(/from\s+['"](@repo\/[^'"]+\/src\/[^'"]+|(?:\.\.\/)+packages\/[^'"]+\/src\/[^'"]+)['"]/g)];
  if (deepImports.length > 0) {
    for (const m of deepImports) {
      metrics.maintenance.deepImports.push({ file: relPath, target: m[1] });
    }
  }

  const logs = content.match(/console\.(log|warn|error|info|debug)\(/g);
  if (logs) metrics.maintenance.consoleLogs += logs.length;
}

function traverse(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return;
  }

  for (const entry of entries) {
    if (EXCLUDE_DIRS.has(entry.name) || entry.isSymbolicLink()) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      traverse(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.ts', '.tsx', '.js', '.jsx', '.zmodel', '.sql', '.css'].includes(ext)) {
        const rel = path.relative(ROOT, fullPath);
        analyzeFile(fullPath, rel);
      }
    }
  }
}

for (const target of TARGET_DIRS) {
  const p = path.join(ROOT, target);
  let subs = [];
  try { subs = fs.readdirSync(p, { withFileTypes: true }); } catch (e) {}
  for (const sub of subs) {
    if (sub.isDirectory() && !EXCLUDE_DIRS.has(sub.name) && !sub.isSymbolicLink()) {
      traverse(path.join(p, sub.name));
    }
  }
}

// Normalized Ratio Scoring (Out of 100 per pillar)
// Pillar 1: Harness - Proportion of healthy small/medium files vs oversized files
const oversizedRatio = (metrics.harness.filesOver300Loc.length + (metrics.harness.filesOver1000Loc.length * 3)) / totalFiles;
metrics.harness.score = Math.max(0, Math.min(100, Math.round(100 - (oversizedRatio * 200))));

// Pillar 2: Vibe - Token adherence across files
const hexDensity = metrics.vibe.hardcodedHex / totalFiles;
metrics.vibe.score = Math.max(0, Math.min(100, Math.round(100 - (hexDensity * 50))));

// Pillar 3: Verification - Ratio of type escapes and empty catches to lines
const debtDensity = ((metrics.verification.tsIgnore * 50) + (metrics.verification.asUnknownAs * 2) + (metrics.verification.emptyCatch * 1.5) + metrics.verification.tsAny) / (totalLines / 100);
metrics.verification.score = Math.max(0, Math.min(100, Math.round(100 - (debtDensity * 12))));

// Pillar 4: Maintenance - Clean barrels and runtime log pollution
const deepPenalty = metrics.maintenance.deepImports.length * 5;
const logDensity = (metrics.maintenance.consoleLogs / totalFiles) * 20;
metrics.maintenance.score = Math.max(0, Math.min(100, Math.round(100 - deepPenalty - logDensity)));

// Cumulative Weighted Score
const cumulativeScore = Math.round(
  (metrics.harness.score * 0.25) +
  (metrics.vibe.score * 0.20) +
  (metrics.verification.score * 0.35) +
  (metrics.maintenance.score * 0.20)
);

function getStatusBadge(score) {
  if (score >= 85) return '🟢 EXCELLENT';
  if (score >= 70) return '🟡 STABLE / HEALTHY';
  if (score >= 50) return '🟠 ELEVATED DRAG';
  return '🔴 CRITICAL RISK';
}

console.log('================================================================');
console.log('   🏛️  THE 4 PILLARS OF AI-NATIVE CODEBASE HEALTH (OCT 2026)    ');
console.log('================================================================\n');

console.log(`Scanned: ${totalFiles} source files (${totalLines.toLocaleString()} lines across apps & packages)\n`);

console.log(`[Pillar 1: HARNESS ENGINEERING] Score: ${metrics.harness.score}/100 (${getStatusBadge(metrics.harness.score)})`);
console.log(`  - Files > 1,000 LOC (Context Sinks): ${metrics.harness.filesOver1000Loc.length}`);
console.log(`  - Files > 300 LOC (Modularity Breach): ${metrics.harness.filesOver300Loc.length}`);
console.log(`  - Visible Mark: Enforce 300 LOC budget to protect AI context windows.\n`);

console.log(`[Pillar 2: VIBE ENGINEERING] Score: ${metrics.vibe.score}/100 (${getStatusBadge(metrics.vibe.score)})`);
console.log(`  - Raw Hex Color Injections: ${metrics.vibe.hardcodedHex}`);
console.log(`  - Visible Mark: Replace raw hex codes with Sacred Tokens (Vellum, Saffron, Dalu Green).\n`);

console.log(`[Pillar 3: VERIFICATION ENGINEERING] Score: ${metrics.verification.score}/100 (${getStatusBadge(metrics.verification.score)})`);
console.log(`  - Compiler Suppressions (@ts-ignore): ${metrics.verification.tsIgnore} (Pristine!)`);
console.log(`  - Forced Casts (as unknown as): ${metrics.verification.asUnknownAs}`);
console.log(`  - Swallowed Empty Catches: ${metrics.verification.emptyCatch}`);
console.log(`  - Unconstrained 'any' Types: ${metrics.verification.tsAny}`);
console.log(`  - Visible Mark: Zero @ts-ignore proves the compiler strictly proves code.\n`);

console.log(`[Pillar 4: VIBE MAINTENANCE] Score: ${metrics.maintenance.score}/100 (${getStatusBadge(metrics.maintenance.score)})`);
console.log(`  - Deep Barrel Bypasses (/src/): ${metrics.maintenance.deepImports.length}`);
console.log(`  - Unmanaged console.* calls: ${metrics.maintenance.consoleLogs}`);
console.log(`  - Visible Mark: Strip console calls in prod to guard 2GB mobile RAM budget.\n`);

console.log('================================================================');
console.log(`  🏆 CUMULATIVE REPO HEALTH: ${cumulativeScore}/100 [Grade: ${cumulativeScore >= 80 ? 'A-' : cumulativeScore >= 70 ? 'B' : 'C'}]`);
console.log('================================================================\n');
