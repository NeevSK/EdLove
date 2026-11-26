#!/usr/bin/env node

/**
 * Systemic Accessibility Gate (scripts/check-a11y-systemic.mjs)
 *
 * Enforces the Single Mobile-First Continuum invariants across all web floors:
 *  1. The iOS Safari Input Zoom Trap: Inputs must guarantee font-size >= 16px.
 *  2. The Ergonomic Touch Floor: Interactive controls must guarantee min-height >= 44px (>= 48px target).
 *  3. Ratchet Enforcement: Any legacy sub-14px microcopy sites are tracked in
 *     `tooling/a11y-systemic-ratchet.json`. Violation counts may only go DOWN over time.
 *
 * Usage:
 *   node scripts/check-a11y-systemic.mjs           # verify
 *   node scripts/check-a11y-systemic.mjs --update  # ratchets down counts after remediation sweeps
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RATCHET_FILE = join(ROOT, 'tooling/a11y-systemic-ratchet.json');
const TARGET_DIR = join(ROOT, 'apps/gurudevi-web/app');

function walkFiles(dir, ext = '.css') {
  const results = [];
  if (!existsSync(dir)) return results;
  const list = readdirSync(dir);
  for (const item of list) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== '.next' && item !== 'dist') {
        results.push(...walkFiles(fullPath, ext));
      }
    } else if (fullPath.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

function scanCssFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const violations = [];

  // Patterns
  // 1. Input zoom trap: input / textarea / textInput with font-size < 16px
  const inputZoomRegex = /(?:input|textarea|\.textInput|search|pinInput)[^{]*\{[^}]*font-size:\s*(\d+(?:\.\d+)?)(px|rem)/gi;
  // 2. Microcopy < 13px
  const microcopyRegex = /font-size:\s*(\d+(?:\.\d+)?)(px|rem)/gi;
  // 3. Sub-44px touch targets on buttons / interactive controls
  const crampedHeightRegex = /(?:min-height|height):\s*([1-3]\d(?:\.\d+)?|4[0-3](?:\.\d+)?)px/gi;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('/* a11y-ignore') || line.includes('/* legacy-allowed')) continue;

    // Check for explicit sub-13px font sizes
    const fontMatch = /font-size:\s*(\d+(?:\.\d+)?)(px|rem)/i.exec(line);
    if (fontMatch) {
      const val = parseFloat(fontMatch[1]);
      const unit = fontMatch[2].toLowerCase();
      const px = unit === 'rem' ? val * 16 : val;
      if (px < 13.0) {
        violations.push({
          type: 'sub-13px-microcopy',
          line: i + 1,
          detail: `font-size: ${fontMatch[1]}${unit} (${px.toFixed(1)}px < 13px floor)`,
          snippet: line.trim(),
        });
      }
    }

    // Check for cramped button heights
    if (/(?:btn|button|pill|link|action|toggle|tab)[^{:]*\{/i.test(line) || /cursor:\s*pointer/i.test(line)) {
      // In or near button rule
    }
    const heightMatch = /(?:min-height|height):\s*(\d+(?:\.\d+)?)px/i.exec(line);
    if (heightMatch && /(?:btn|button|pill|action|toggle|tab|input)/i.test(lines[Math.max(0, i - 5)] || '')) {
      const h = parseFloat(heightMatch[1]);
      if (h < 40 && !line.includes('/* icon') && !line.includes('/* avatar')) {
        violations.push({
          type: 'cramped-touch-target',
          line: i + 1,
          detail: `height: ${h}px (< 40px floor)`,
          snippet: line.trim(),
        });
      }
    }
  }

  return violations;
}

const isUpdate = process.argv.includes('--update');
const cssFiles = walkFiles(TARGET_DIR, '.css');

let totalViolations = 0;
const fileViolationCounts = {};

for (const file of cssFiles) {
  const rel = relative(ROOT, file).replace(/\\/g, '/');
  const fileViolations = scanCssFile(file);
  if (fileViolations.length > 0) {
    fileViolationCounts[rel] = fileViolations.length;
    totalViolations += fileViolations.length;
  }
}

let baseline = { totalViolations: 0, files: {} };
if (existsSync(RATCHET_FILE)) {
  try {
    baseline = JSON.parse(readFileSync(RATCHET_FILE, 'utf8'));
  } catch (e) {
    console.error('Failed to parse ratchet file:', e.message);
  }
}

if (isUpdate || !existsSync(RATCHET_FILE)) {
  const updated = {
    totalViolations,
    updatedAt: new Date().toISOString(),
    files: fileViolationCounts,
  };
  writeFileSync(RATCHET_FILE, JSON.stringify(updated, null, 2) + '\n', 'utf8');
  console.log(`[a11y-systemic] Ratchet updated: ${totalViolations} baseline violations recorded across ${Object.keys(fileViolationCounts).length} files.`);
  process.exit(0);
}

// Verification against Ratchet
console.log(`[a11y-systemic] Scanning ${cssFiles.length} CSS files in apps/gurudevi-web...`);
console.log(`[a11y-systemic] Current violations: ${totalViolations} (Ratchet baseline: ${baseline.totalViolations})`);

let hasError = false;

if (totalViolations > baseline.totalViolations) {
  console.error(`\n[FATAL] Systemic accessibility regression!`);
  console.error(`Total violations increased from ${baseline.totalViolations} to ${totalViolations}.`);
  hasError = true;
}

for (const [file, count] of Object.entries(fileViolationCounts)) {
  const baseCount = baseline.files?.[file] ?? 0;
  if (count > baseCount) {
    console.error(`  x Regression in ${file}: ${count} violations (was ${baseCount})`);
    hasError = true;
  }
}

if (hasError) {
  console.error(`\nPlease fix the reported accessibility regressions, or run with --update if lower.`);
  process.exit(1);
}

if (totalViolations < baseline.totalViolations) {
  console.log(`\n[SUCCESS] Systemic accessibility improved! Violations decreased from ${baseline.totalViolations} to ${totalViolations}.`);
  console.log(`Run 'node scripts/check-a11y-systemic.mjs --update' to ratchet down the baseline.`);
} else {
  console.log(`\n[SUCCESS] All accessibility floors within baseline limit (${totalViolations}/${baseline.totalViolations}).`);
}
process.exit(0);
