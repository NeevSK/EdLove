#!/usr/bin/env node
/**
 * Pre-build Preflight — runs before any EAS build.
 *
 * Usage:
 *   node scripts/preflight-build.mjs
 *
 * Checks:
 * 1. expo-ci-doctor — native-module version mismatches, SDK compatibility
 * 2. Fingerprint — current native state
 *
 * Non-blocking: findings are warnings, not hard gates.
 */
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

function runCheck(label, cmd) {
  console.log(`\n🔍 ${label}`);
  try {
    const output = execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf-8',
      timeout: 120_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    console.log(output);
    return { ok: true, output };
  } catch (err) {
    const output = err.stdout || err.stderr || err.message;
    console.log(output);
    return { ok: false, output };
  }
}

// --- Main ---
console.log('🚀 Pre-build Preflight');
console.log('━'.repeat(50));

const doctor = runCheck('expo-ci-doctor', 'npx expo-ci-doctor check');
const fingerprint = runCheck('Fingerprint', 'pnpm exec fingerprint fingerprint:generate');

console.log('\n' + '━'.repeat(50));

if (doctor.ok && fingerprint.ok) {
  console.log('✅ Preflight passed. Safe to build.\n');
} else {
  console.log('⚠️  Preflight found warnings.');
  console.log('   Review above findings before building.');
  console.log('   These are non-blocking — full release gate requires expo-doctor clean.\n');
}
