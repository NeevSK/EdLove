#!/usr/bin/env node

/**
 * ==============================================================================
 * POLYMATH PLATFORM — ANTI-HOLLOW CAPABILITY & TEST-SATISFACTION SENTINEL
 * ==============================================================================
 * Enforces true functional integration across all domain packages and apps.
 *
 * Catches the 3 "Test-Satisfaction" Diseases:
 *   1. DUMMY_SUCCESS_STUB: Methods returning literal `{ success: true }` with no mutations.
 *   2. HARDCODED_MOCK_IN_PRODUCTION: Static mock student/attendance arrays in production floors.
 *   3. HARDCODED_PERMISSION_BYPASS: Hardcoded `isGuest = false` or `canCreate* = true`.
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
const ignoredDirs = new Set([
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
  'tests',
  'testing',
  'fixtures',
  'mocks',
]);

const BLOCK_RULES = [
  {
    name: 'DUMMY_SUCCESS_STUB',
    pattern: /(?:async\s+)?(?!if|while|for|catch|switch)\b[a-zA-Z0-9_]+\s*\([^)]*\)(?:\s*:\s*[^{]+)?\s*\{\s*return\s*\{\s*success:\s*true[^};]*\}\s*;\s*\}/m,
    message: 'Hollow mutation stub detected. The function body merely returns { success: true } without cache mutation, local persistence, or RPC dispatch.',
  },
  {
    name: 'HARDCODED_PERMISSION_BYPASS',
    pattern: /(?:const|let|var)\s+(?:isGuest\s*=\s*(?:false|true)|can(?:Create|Edit|Delete)[A-Za-z0-9_]*\s*=\s*true)\s*;\s*(?:\/\/[^\n]*)?(?:placeholder|mock|bypass)/i,
    message: 'Hardcoded permission or guest bypass placeholder detected. Bind to usePermissions() or useIsGuest().',
  },
];

const REVIEW_RULES = [
  {
    name: 'HARDCODED_MOCK_COLLECTION_IN_PROD',
    pattern: /(?:const|let)\s+(?:initialStudents|mockStudents|mockAttendance)\s*[:=]\s*\[/i,
    message: 'Hardcoded mock collection inside production UI floor detected. Wire to live domain query/hook.',
  },
];

function isIgnored(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  const parts = normalized.split('/');
  return parts.some((p) => ignoredDirs.has(p) || p.endsWith('.test.ts') || p.endsWith('.test.tsx') || p.endsWith('.spec.ts'));
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const findings = [];

  for (const rule of BLOCK_RULES) {
    if (rule.pattern.test(content)) {
      findings.push({
        type: 'BLOCK',
        rule: rule.name,
        message: rule.message,
        file: path.relative(root, filePath),
      });
    }
  }

  for (const rule of REVIEW_RULES) {
    if (rule.pattern.test(content)) {
      findings.push({
        type: 'REVIEW',
        rule: rule.name,
        message: rule.message,
        file: path.relative(root, filePath),
      });
    }
  }

  return findings;
}

function getCandidateFiles() {
  const isFullScan = process.argv.includes('--all');
  if (isFullScan) {
    const files = [];
    function walk(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!ignoredDirs.has(entry.name)) walk(full);
        } else if (sourceExtensions.has(path.extname(entry.name))) {
          if (!isIgnored(full)) files.push(full);
        }
      }
    }
    const targets = ['packages/core/src', 'packages/classroom/src', 'apps/gurudevi-mobile/src', 'apps/gurudevi-web/app'];
    for (const t of targets) {
      const fullT = path.join(root, t);
      if (fs.existsSync(fullT)) walk(fullT);
    }
    return files;
  }

  try {
    const diff = execFileSync('git', ['diff', '--name-only', 'HEAD'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return diff
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f && sourceExtensions.has(path.extname(f)) && !isIgnored(f))
      .map((f) => path.join(root, f))
      .filter((f) => fs.existsSync(f));
  } catch {
    return [];
  }
}

const files = getCandidateFiles();
let blockCount = 0;
let reviewCount = 0;

for (const f of files) {
  const findings = scanFile(f);
  for (const finding of findings) {
    if (finding.type === 'BLOCK') {
      blockCount++;
      console.error(`❌ [BLOCK] ${finding.rule} in ${finding.file}\n   ${finding.message}\n`);
    } else {
      reviewCount++;
      console.warn(`⚠️ [REVIEW] ${finding.rule} in ${finding.file}\n   ${finding.message}\n`);
    }
  }
}

if (blockCount > 0) {
  console.error(`\n🚨 Hollow Stub Sentinel failed with ${blockCount} blocking violation(s).`);
  process.exit(1);
} else {
  console.log(`\n✅ Anti-Hollow Sentinel passed across ${files.length} candidate file(s) (Review warnings: ${reviewCount}).`);
  process.exit(0);
}
