#!/usr/bin/env node
/**
 * OTA Safety Check — compares current fingerprint vs last-known-good production fingerprint.
 *
 * Usage:
 *   node scripts/ota-safety-check.mjs [--init]
 *
 * Reads: reports/last-production-fingerprint.txt (written on each binary release)
 * Emits: MATCH (safe to OTA) or DRIFT (require binary build)
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const FINGERPRINT_FILE = resolve(ROOT, 'reports', 'last-production-fingerprint.txt');
const REPORTS_DIR = resolve(ROOT, 'reports');

function run(cmd) {
  try {
    return execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf-8',
      timeout: 120_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return null;
  }
}

function getCurrentFingerprint() {
  // Try pnpm exec fingerprint (preferred)
  let out = run('pnpm exec fingerprint fingerprint:generate');
  if (out) {
    try {
      const parsed = JSON.parse(out);
      return parsed.hash || parsed.fingerprint || null;
    } catch {
      // Not JSON — extract hash from text
      const match = out.match(/(?:hash|fingerprint)[:\s]+([a-f0-9]{40,})/i);
      if (match) return match[1];
    }
  }

  // Fallback: npx @expo/fingerprint
  out = run('npx @expo/fingerprint fingerprint:generate');
  if (out) {
    try {
      const parsed = JSON.parse(out);
      return parsed.hash || parsed.fingerprint || null;
    } catch {
      const match = out.match(/(?:hash|fingerprint)[:\s]+([a-f0-9]{40,})/i);
      if (match) return match[1];
    }
  }

  return null;
}

function getLastProductionFingerprint() {
  if (!existsSync(FINGERPRINT_FILE)) return null;
  return readFileSync(FINGERPRINT_FILE, 'utf-8').trim();
}

function saveCurrentAsProduction(fingerprint) {
  if (!existsSync(REPORTS_DIR)) mkdirSync(REPORTS_DIR, { recursive: true });
  writeFileSync(FINGERPRINT_FILE, fingerprint, 'utf-8');
}

// --- Main ---
const args = process.argv.slice(2);
const isInit = args.includes('--init');

const current = getCurrentFingerprint();
const last = getLastProductionFingerprint();

if (!current) {
  console.error('❌ Could not compute fingerprint.');
  console.error('   Ensure @expo/fingerprint is installed: pnpm exec fingerprint --help');
  process.exit(1);
}

console.log(`\n📱 Current fingerprint:  ${current}`);

if (isInit) {
  saveCurrentAsProduction(current);
  console.log(`💾 Saved as production baseline.\n`);
  process.exit(0);
}

if (!last) {
  console.log('⚠️  No last-production-fingerprint.txt found.');
  console.log('   Run: pnpm run ota-safety:init');
  console.log('   This is expected on first run.\n');
  saveCurrentAsProduction(current);
  console.log(`💾 Saved current as baseline.\n`);
  process.exit(0);
}

console.log(`📦 Last production:      ${last}`);

if (current === last) {
  console.log('\n✅ MATCH — Safe to publish OTA to this channel.\n');
  process.exit(0);
} else {
  console.log('\n🛑 DRIFT — Native fingerprint changed.');
  console.log('   You must ship a binary release first, then OTA on top of it.\n');
  process.exit(1);
}
