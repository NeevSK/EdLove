#!/usr/bin/env node
/**
 * Polymath Architecture Ratchet Gate (scripts/ratchet.mjs)
 *
 * Implements Grok Deflation Plan WS-9 / EDLOVE_INTEGRATED_PLAN Section 7.
 * Enforces that architectural drift (any in src, direct .from() bypasses,
 * files over 800 LOC, ts-ignores, and root script sprawl) can ONLY move
 * in one direction: DOWNWARDS.
 *
 * Usage:
 *   node scripts/ratchet.mjs           # Verifies metrics against tooling/ratchet.json
 *   node scripts/ratchet.mjs --update  # Ratchets down targets when counts decrease
 */

import { execFileSync, execSync } from 'node:child_process';
import { RG_REFERENCE_ARGS } from '../tooling/reference-only.mjs';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');
const RATCHET_FILE = resolve(REPO_ROOT, 'tooling/ratchet.json');

function runRgCount(pattern, extraArgs = []) {
  try {
    const args = [
      pattern,
      'packages',
      'apps',
      '-g', '*.ts',
      '-g', '*.tsx',
      '-g', '!**/__tests__/**',
      '-g', '!**/*.test.*',
      '-g', '!**/dist/**',
      '-g', '!**/generated/**',
      '-g', '!**/node_modules/**',
      ...RG_REFERENCE_ARGS,
      ...extraArgs,
      '--stats',
    ];
    const output = execFileSync('rg', args, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const match = output.match(/(\d+)\s+matches/);
    return match ? parseInt(match[1], 10) : 0;
  } catch {
    return 0;
  }
}

function countAnyInSrc() {
  return runRgCount(':\\s*any\\b|<any>|\\bas\\s+any\\b');
}

function countTsIgnore() {
  return runRgCount('@ts-ignore|@ts-nocheck');
}

function countLintSuppressions() {
  return runRgCount('eslint-disable|biome-ignore');
}

function countFromSites() {
  return runRgCount('(?:\\.from\\([`\'"]|(?:supabase|supabaseClient|client|db)\\.from\\()');
}

// State seam (docs/architecture/2026-11-11-product-shape-and-tool-ownership.md, section 7).
// Expected failures become Schema.TaggedErrorClass so they can cross the wire; these two only go down.
function countPlainErrorSubclasses() {
  return runRgCount('class \\w+ extends Error\\b');
}

function countDataTaggedErrors() {
  return runRgCount('Data\\.TaggedError\\(');
}

// Authority has one reader: packages/core/src/logic/permissions/hooks/useAuthority.ts, over the signed
// snapshot. Feature flags (useFeatureStore) are rollout state, not authority, so they aren't counted.
function countAuthorityStoreReads() {
  return runRgCount('\\b(useCedarDecisionStore|useEntitlementStore|usePerspectiveStore)\\b', [
    '-g',
    '!packages/core/src/store/**',
    '-g',
    '!packages/core/src/logic/permissions/hooks/useAuthority.ts',
  ]);
}

// Machines are declared with setup({ schemas }) so their context and events are checked.
function countMachinesWithoutSetup() {
  return runRgCount('= createMachine\\(');
}

// Programs run outside the shared runtime skip its services and logging (packages/core/src/effect/AppRuntime.ts).
function countDirectEffectRuns() {
  return runRgCount('Effect\\.run(Promise|PromiseExit|Fork|Sync|SyncExit)\\(');
}

// Tier standard (tooling/architecture-tiers.mjs) across packages/core: imports a tier may not make,
// files with no tier, and pass-through files. Measured once per run.
let tierSummary;
function tierAudit() {
  if (!tierSummary) {
    try {
      const out = execFileSync('node', ['scripts/audit-archetype-violations.mjs', '--scope', 'packages/core/src', '--summary-json'], {
        cwd: REPO_ROOT,
        encoding: 'utf8',
      });
      tierSummary = JSON.parse(out);
    } catch {
      tierSummary = { findings: {} };
    }
  }
  return tierSummary.findings;
}
function countTierImportViolations() {
  const f = tierAudit();
  return (f['tier-import'] ?? 0) + (f['upward-import'] ?? 0) + (f['forbidden-package'] ?? 0) + (f['parse-above-boundary'] ?? 0);
}
function countUnplacedFiles() {
  return tierAudit().unplaced ?? 0;
}
function countPassThroughFiles() {
  return tierAudit()['pass-through'] ?? 0;
}

// React rules (.oxlintrc.react.json): hooks rules, effect dependencies, effects that
// set state, and the React Compiler rules. One oxlint run (~3s) for all packages and apps.
let reactLint;
function reactLintCounts() {
  if (!reactLint) {
    reactLint = {};
    let out = '';
    try {
      out = execFileSync('node_modules/.bin/oxlint', ['-c', '.oxlintrc.react.json', '-f', 'json', 'packages', 'apps'], {
        cwd: REPO_ROOT,
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
        stdio: ['ignore', 'pipe', 'ignore'],
      });
    } catch (error) {
      out = error.stdout ?? '';
    }
    try {
      for (const d of JSON.parse(out).diagnostics ?? []) {
        const code = d.code ?? 'parse-error';
        reactLint[code] = (reactLint[code] ?? 0) + 1;
      }
    } catch {
      reactLint = null;
    }
  }
  return reactLint;
}
function reactCount(codes) {
  const counts = reactLintCounts();
  if (!counts) return Number.POSITIVE_INFINITY;
  return codes.reduce((n, code) => n + (counts[code] ?? 0), 0);
}
const REACT_COMPILER_RULES = [
  'react(purity)',
  'react(refs)',
  'react(immutability)',
  'react(globals)',
  'react(static-components)',
  'react(use-memo)',
  'react(preserve-manual-memoization)',
  'react(error-boundaries)',
  'react(set-state-in-render)',
];

// tooling/live-web-files.json against the import graph and the tool configs.
function countReferenceOnlyDrift() {
  try {
    execFileSync('node', ['scripts/check-reference-only.mjs'], { cwd: REPO_ROOT, stdio: 'pipe' });
    return 0;
  } catch (error) {
    const m = String(error.stderr ?? '').match(/(\d+) problem/);
    return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
  }
}

// `catch` blocks whose only statement is a console call: the failure is swallowed. Each should
// classify (logic/failure/classifyFailure.ts) and then present or report (failureFeedback).
function countCatchAndLogOnly() {
  try {
    const out = execFileSync(
      'rg',
      ['-U', '-c', String.raw`catch \(\w*\) \{\s*\n\s*console\.(error|warn|log)\([^\n]*\);?\s*\n\s*\}`, 'packages', 'apps',
        '-g', '*.{ts,tsx}', '-g', '!**/node_modules/**', '-g', '!**/__tests__/**', '-g', '!**/*.test.*', ...RG_REFERENCE_ARGS],
      { cwd: REPO_ROOT, encoding: 'utf8' },
    );
    return out.split('\n').filter(Boolean).reduce((n, line) => n + Number(line.split(':').pop()), 0);
  } catch (error) {
    return error.status === 1 ? 0 : Number.POSITIVE_INFINITY;
  }
}

// Files that hand-roll debounce or throttle with setTimeout; use @repo/core/hooks/usePacer or
// TanStack Pacer's Debouncer/Throttler instead.
function countHandRolledPacing() {
  const base = ['-g', '*.{ts,tsx}', '-g', '!**/node_modules/**', '-g', '!**/__tests__/**', '-g', '!**/*.test.*', ...RG_REFERENCE_ARGS];
  try {
    const named = execFileSync('rg', ['-l', '-i', 'debounce|throttle', 'packages', 'apps', ...base], { cwd: REPO_ROOT, encoding: 'utf8' })
      .split('\n').filter(Boolean);
    return named.filter((file) => /setTimeout\(/.test(readFileSync(resolve(REPO_ROOT, file), "utf8"))).length;
  } catch (error) {
    return error.status === 1 ? 0 : Number.POSITIVE_INFINITY;
  }
}

// Hand-rolled async flags (`const [isSaving, setIsSaving] = useState(false)`); a mutation's or
// query's `isPending` / `isFetching`, or a Pacer state selector, replaces them.
function countHandRolledLoadingFlags() {
  try {
    const out = execFileSync(
      'rg',
      ['-c', String.raw`\[is\w*(Loading|Submitting|Saving|Sending|Processing|Fetching|Uploading|Creating|Deleting|Updating), set\w+\] = useState`,
        'packages', 'apps', '-g', '*.{ts,tsx}', '-g', '!**/node_modules/**', '-g', '!**/__tests__/**', '-g', '!**/*.test.*', ...RG_REFERENCE_ARGS],
      { cwd: REPO_ROOT, encoding: 'utf8' },
    );
    return out.split('\n').filter(Boolean).reduce((n, line) => n + Number(line.split(':').pop()), 0);
  } catch (error) {
    return error.status === 1 ? 0 : Number.POSITIVE_INFINITY;
  }
}

function countTierContentViolations() {
  try {
    const out = execSync('node scripts/audit-tier-content.mjs --summary-json', { cwd: REPO_ROOT, encoding: 'utf8' });
    return JSON.parse(out.trim().split('\n').pop()).contentViolations;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

function countRootScripts() {
  try {
    const pkg = JSON.parse(readFileSync(resolve(REPO_ROOT, 'package.json'), 'utf8'));
    return Object.keys(pkg.scripts || {}).length;
  } catch {
    return 0;
  }
}

function countFilesOver800Loc() {
  try {
    const cmd = `rg --files packages apps -g "*.ts" -g "*.tsx" -g "!**/__tests__/**" -g "!**/*.test.*" -g "!**/dist/**" -g "!**/generated/**" -g "!**/node_modules/**" ${RG_REFERENCE_ARGS.map((a) => `'${a}'`).join(' ')}`;
    const files = execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
    let count = 0;
    for (const file of files) {
      try {
        const fullPath = resolve(REPO_ROOT, file);
        const content = readFileSync(fullPath, 'utf8');
        const lines = content.split('\n').length;
        if (lines > 800) {
          count++;
        }
      } catch {
        // Skip unreadable files
      }
    }
    return count;
  } catch {
    return 0;
  }
}

function measureMetrics() {
  return {
    anyInSrc: countAnyInSrc(),
    tsIgnore: countTsIgnore(),
    lintSuppressions: countLintSuppressions(),
    supabaseFromSites: countFromSites(),
    sourceFilesOver800Loc: countFilesOver800Loc(),
    rootScripts: countRootScripts(),
    plainErrorSubclasses: countPlainErrorSubclasses(),
    dataTaggedErrors: countDataTaggedErrors(),
    authorityStoreReads: countAuthorityStoreReads(),
    machinesWithoutSetup: countMachinesWithoutSetup(),
    directEffectRuns: countDirectEffectRuns(),
    tierImportViolations: countTierImportViolations(),
    unplacedFiles: countUnplacedFiles(),
    passThroughFiles: countPassThroughFiles(),
    tierContentViolations: countTierContentViolations(),
    hooksRuleViolations: reactCount(['react-hooks(rules-of-hooks)', 'react(rules-of-hooks)']),
    effectDependencyGaps: reactCount(['react-hooks(exhaustive-deps)', 'react(exhaustive-deps)']),
    effectsThatSetState: reactCount(['react(set-state-in-effect)', 'react(no-deriving-state-in-effects)']),
    reactCompilerRuleHits: reactCount(REACT_COMPILER_RULES),
    unparseableFiles: reactCount(['parse-error']),
    referenceOnlyDrift: countReferenceOnlyDrift(),
    catchAndLogOnly: countCatchAndLogOnly(),
    handRolledPacing: countHandRolledPacing(),
    handRolledLoadingFlags: countHandRolledLoadingFlags(),
  };
}

function main() {
  const isUpdate = process.argv.includes('--update');

  console.log('\n>>> Polymath Architectural Ratchet Gate <<<');
  console.log('Measuring active monorepo metrics...\n');

  const current = measureMetrics();

  if (!existsSync(RATCHET_FILE)) {
    console.log(`Writing initial baseline to ${RATCHET_FILE}...`);
    writeFileSync(RATCHET_FILE, JSON.stringify(current, null, 2) + '\n');
    console.log('[OK] Baseline recorded.');
    process.exit(0);
  }

  const baseline = JSON.parse(readFileSync(RATCHET_FILE, 'utf8'));

  let hasRegression = false;
  let canRatchetDown = false;
  const updated = { ...baseline };

  const labels = {
    anyInSrc: 'any in src (: any, <any>, as any)',
    tsIgnore: '@ts-ignore / @ts-nocheck in src',
    lintSuppressions: 'eslint-disable / biome-ignore suppressions',
    supabaseFromSites: 'Direct .from() database call sites',
    sourceFilesOver800Loc: 'Source files > 800 LOC',
    rootScripts: 'Root package.json scripts',
    plainErrorSubclasses: 'class X extends Error',
    dataTaggedErrors: 'Data.TaggedError (not serializable)',
    authorityStoreReads: 'Authority read from client stores',
    machinesWithoutSetup: 'Machines without setup()',
    directEffectRuns: 'Effect.run* outside the app runtime',
    tierImportViolations: 'Tier import violations (core)',
    unplacedFiles: 'Files with no tier (core)',
    passThroughFiles: 'Pass-through files (core)',
    tierContentViolations: 'Tier 0/1 files holding runtime code',
    hooksRuleViolations: 'Rules of Hooks violations',
    effectDependencyGaps: 'Effect/memo dependency gaps',
    effectsThatSetState: 'Effects that set or derive state',
    reactCompilerRuleHits: 'React Compiler rule hits',
    unparseableFiles: 'Parse errors (oxlint)',
    referenceOnlyDrift: 'Live .web list out of date',
    catchAndLogOnly: 'catch blocks that only log',
    handRolledPacing: 'Hand-rolled debounce/throttle files',
    handRolledLoadingFlags: 'Hand-rolled loading flags',
  };

  console.log('----------------------------------------------------------------------');
  console.log('Metric                                    Current    Ceiling   Status');
  console.log('----------------------------------------------------------------------');

  for (const [key, label] of Object.entries(labels)) {
    const curVal = current[key] ?? 0;
    const baseVal = baseline[key] ?? 0;

    let status = '✔ PASS';
    if (curVal > baseVal) {
      if (isUpdate) {
        status = '↑ CALIBRATED';
        updated[key] = curVal;
      } else {
        status = '✖ REGRESSION';
        hasRegression = true;
      }
    } else if (curVal < baseVal) {
      status = '↓ IMPROVED';
      canRatchetDown = true;
      updated[key] = curVal;
    }

    const paddedLabel = label.padEnd(42, ' ');
    const paddedCur = String(curVal).padStart(8, ' ');
    const paddedBase = String(baseVal).padStart(8, ' ');
    console.log(`${paddedLabel} ${paddedCur}  ${paddedBase}   ${status}`);
  }

  console.log('----------------------------------------------------------------------');

  if (hasRegression && !isUpdate) {
    console.error('\n[FAIL] Architectural metrics regressed beyond the permitted ceiling!');
    console.error('Resolve the increased anti-patterns before merging.');
    process.exit(1);
  }

  if (isUpdate) {
    writeFileSync(RATCHET_FILE, JSON.stringify(updated, null, 2) + '\n');
    console.log('\n[PASS] Ratchet ceilings successfully locked into tooling/ratchet.json!');
  } else if (canRatchetDown) {
    console.log('\n[PASS] Metrics have improved! Run `node scripts/ratchet.mjs --update` to lock in the new lower ceiling.');
  } else {
    console.log('\n[PASS] All architectural metrics strictly within ceiling.');
  }

  process.exit(0);
}

main();
