#!/usr/bin/env node
/**
 * scripts/run-rn-terrain.mjs
 *
 * Resilient bridge to the autonomous rn-terrain engine (TCDI & Native Proofs).
 *
 * Supports commands such as:
 * - doctor:all [projectDir]
 * - verify:hermes [targetPath]
 * - verify:yoga [targetPath]
 * - context <pkg>
 * - gravity <pkg>
 *
 * Guarantees zero CI / Docker coupling: if rn-terrain is not found locally,
 * it fails soft with an informative notice and exits 0 (unless --strict is specified).
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT_DIR = process.cwd();

const CANDIDATE_PATHS = [
  'c:/projects/rn-terrain/packages/rn-terrain/bin/rn-terrain.js',
  path.join(ROOT_DIR, '..', 'rn-terrain', 'packages', 'rn-terrain', 'bin', 'rn-terrain.js'),
];

function findRnTerrainBinary() {
  for (const cand of CANDIDATE_PATHS) {
    if (fs.existsSync(cand)) {
      return path.resolve(cand);
    }
  }
  return null;
}

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const filteredArgs = args.filter((a) => a !== '--strict');

const binaryPath = findRnTerrainBinary();

if (!binaryPath) {
  console.log(
    '\x1b[33mℹ️  [rn-terrain Bridge] Autonomous rn-terrain engine not detected on disk. Standalone mode active.\x1b[0m',
  );
  if (strict) {
    console.error('\x1b[31m❌ Strict mode enabled: rn-terrain is required.\x1b[0m');
    process.exit(1);
  }
  process.exit(0);
}

const result = spawnSync(process.execPath, [binaryPath, ...filteredArgs], {
  stdio: 'inherit',
  cwd: ROOT_DIR,
  shell: false,
  windowsHide: true,
});

if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
