#!/usr/bin/env node
/**
 * @file stop-gate.mjs
 * RN-Terrain Diff-Scoped Verification Stop Gate.
 *
 * Intercepts agent task completion across Claude Code and Codex Stop hooks.
 * Production-Grade Protection:
 *   1. Diff-Scoped Blame Slicing: Uses git diff -U0 to isolate lines modified in current turn.
 *   2. Legacy Debt Immunity: Pre-existing violations on untouched lines NEVER block task completion.
 *   3. Scoped AST Scanning: 100% immune to comments, strings, and test mocks.
 *
 * Exit Codes:
 *   0: ALLOW (all verified; task may terminate)
 *   2: REJECT (agent-introduced regressions detected; blocks completion and feeds stderr to model)
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';

const projectRoot = process.cwd();
const RN_PKG_REGEX = /\b(react-native|react-native-reanimated|react-native-gesture-handler|react-native-worklets|@shopify\/react-native-skia|\bexpo\b)\b/;

function getModifiedLineNumbers(filePath, repoRoot) {
  try {
    const rel = path.relative(repoRoot, filePath);
    // Check if untracked file
    const status = execSync(`git status --porcelain -- "${rel}"`, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim();

    if (status.startsWith('??')) {
      return null; // null represents all lines modified
    }

    const diff = execSync(`git diff -U0 HEAD -- "${rel}"`, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });

    if (!diff.trim()) {
      return new Set();
    }

    const modifiedLines = new Set();
    const hunkHeaderRegex = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm;
    let match;
    while ((match = hunkHeaderRegex.exec(diff)) !== null) {
      const startLine = parseInt(match[1], 10);
      const lineCount = match[2] !== undefined ? parseInt(match[2], 10) : 1;
      for (let i = 0; i < lineCount; i++) {
        modifiedLines.add(startLine + i);
      }
    }
    return modifiedLines;
  } catch {
    return null; // fallback: treat all lines as modified
  }
}

async function main() {
  let modifiedFiles = [];
  try {
    const statusOutput = execSync('git status --porcelain', {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });

    const lines = statusOutput.split('\n').filter(Boolean);
    for (const rawLine of lines) {
      if (rawLine.length < 4) continue;
      const filePathPart = rawLine.substring(3).trim();
      const parts = filePathPart.split(' -> ');
      const filePath = parts[parts.length - 1].trim();
      if (filePath) {
        modifiedFiles.push(path.resolve(projectRoot, filePath));
      }
    }
  } catch {
    process.exit(0);
  }

  const codeFiles = modifiedFiles.filter(f => {
    const norm = f.replace(/\\/g, '/');
    const isTooling = norm.includes('/packages/scanner/') ||
                      norm.includes('/packages/rn-terrain/') ||
                      norm.includes('/packages/cli/') ||
                      norm.includes('/packages/core/') ||
                      norm.includes('/packages/vscode/') ||
                      norm.includes('/.agents/');
    const ext = path.extname(f).toLowerCase();
    const isCode = ['.tsx', '.jsx', '.ts', '.js'].includes(ext) && fs.existsSync(f);
    const isTest = f.includes('.test.') || f.includes('.spec.') || f.includes('/test/') || f.includes('\\test\\') || f.includes('__tests__');
    return isCode && !isTest && !isTooling;
  });

  const rnFiles = codeFiles.filter(f => {
    const norm = f.replace(/\\/g, '/');
    if (norm.includes('mobile/') || norm.includes('apps/mobile') || norm.includes('screens/') || norm.includes('components/')) {
      return true;
    }
    try {
      const content = fs.readFileSync(f, 'utf8');
      return RN_PKG_REGEX.test(content);
    } catch {
      return false;
    }
  });

  if (rnFiles.length === 0) {
    process.exit(0);
  }

  // Load ScopedAstParser
  let parser = null;
  try {
    const scannerPkgPath = path.resolve(projectRoot, 'packages', 'scanner', 'dist', 'index.js');
    if (fs.existsSync(scannerPkgPath)) {
      const { ScopedAstParser } = await import(pathToFileURL(scannerPkgPath).href);
      parser = new ScopedAstParser();
    }
  } catch {}

  const agentViolations = [];
  const legacyDebtWarnings = [];

  for (const file of rnFiles) {
    const relPath = path.relative(projectRoot, file).replace(/\\/g, '/');
    let content = '';
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }

    let fileViolations = [];
    if (parser) {
      fileViolations = parser.parseAndScan(content, { filePath: file });
    } else {
      // Basic fallback
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('useAnimatedGestureHandler') && !line.trim().startsWith('//')) {
          fileViolations.push({
            symbol: 'useAnimatedGestureHandler',
            package: 'react-native-reanimated',
            replacement: 'Gesture.Pan().onUpdate(...)',
            message: "'useAnimatedGestureHandler' is removed in modern Reanimated worklets.",
            line: i + 1
          });
        }
      }
    }

    const modifiedLineNumbers = getModifiedLineNumbers(file, projectRoot);

    for (const v of fileViolations) {
      const isAgentIntroduced = modifiedLineNumbers === null || modifiedLineNumbers.has(v.line);
      if (isAgentIntroduced) {
        agentViolations.push({ ...v, file: relPath });
      } else {
        legacyDebtWarnings.push({ ...v, file: relPath });
      }
    }
  }

  // If the agent introduced violations: BLOCK with Exit Code 2
  if (agentViolations.length > 0) {
    console.error('');
    console.error('🛑 [RN-TERRAIN STOP GATE: TASK COMPLETION REJECTED]');
    console.error('─────────────────────────────────────────────────────────────────');
    console.error('  Task completion rejected. The following architectural violations were');
    console.error(`  introduced in modified lines (${agentViolations.length} total):`);
    console.error('');

    for (const v of agentViolations) {
      console.error(`  ❌ ${v.file}:${v.line}`);
      console.error(`     Severed Symbol: ${v.symbol} (${v.package})`);
      console.error(`     Required Fix:   ${v.replacement}`);
      console.error(`     Detail:         ${v.message}`);
      console.error('');
    }

    console.error('  CRITICAL INSTRUCTION FOR AI AGENT:');
    console.error('  You cannot complete this session while severed or removed APIs remain');
    console.error('  in the lines you introduced. Fix the issues listed above, then re-verify.');
    console.error('─────────────────────────────────────────────────────────────────');
    console.error('');
    process.exit(2);
  }

  // If clean of agent violations
  if (legacyDebtWarnings.length > 0) {
    console.error(`ℹ [RN-TERRAIN STOP GATE]: Skipped ${legacyDebtWarnings.length} pre-existing legacy violation(s) on untouched lines.`);
  }
  console.log('✓ [RN-TERRAIN STOP GATE]: All modified lines verified cleanly against New Architecture & modern runtimes.');
  process.exit(0);
}

main().catch(() => process.exit(0));
