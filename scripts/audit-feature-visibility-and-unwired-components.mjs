#!/usr/bin/env node
/**
 * Feature Visibility, Authority Bypasses & Unwired Components Scanner
 * Grounded in:
 * - docs/architecture/places-roles-and-features.md
 * - packages/core/src/logic/places/workspaceCatalog.ts
 * - packages/core/src/logic/permissions/sanctuaryFeature.ts
 *
 * Enforces the user's architectural mental model:
 * 1. Unwired Components: Scans for UI components that are never rendered by any screen or floor.
 * 2. Hardcoded Feature Visibility: Flags screens using ad-hoc role arrays, manual capacity strings,
 *    or dev-mode flag bypasses instead of the centralized sanctuaryFeature / WORKSPACE_FLOORS authority.
 */

import { readdirSync, readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join, relative, basename, dirname } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const REPORT_JSON = join(ROOT, 'reports/feature-visibility-and-unwired-components.json');
const REPORT_HTML = join(ROOT, 'reports/feature-visibility-and-unwired-components.html');

function walkDir(dir, filter = () => true) {
  if (!existsSync(dir)) return [];
  const files = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', 'dist', '.next', 'dist-explore'].includes(entry.name)) continue;
      files.push(...walkDir(full, filter));
    } else if (entry.isFile() && filter(full, entry.name)) {
      files.push(full);
    }
  }
  return files;
}

// 1. INGEST ALL SCREENS AND FLOORS (The Consumer Surfaces)
function getScreenFiles() {
  const screens = [];
  const dirs = [
    join(ROOT, 'apps/gurudevi-web/app'),
    join(ROOT, 'apps/gurudevi-web/spa/routes'),
    join(ROOT, 'apps/gurudevi-mobile/app'),
  ];
  for (const d of dirs) {
    const files = walkDir(d, (f, name) => {
      return (
        /\.(tsx|jsx)$/.test(name) &&
        !name.includes('.test.') &&
        !name.includes('.spec.')
      );
    });
    screens.push(...files);
  }
  return screens;
}

// 2. INGEST ALL UI COMPONENTS (The Candidate Elements)
function getComponentFiles() {
  const components = [];
  const dirs = [
    join(ROOT, 'packages/ui/src/components'),
    join(ROOT, 'packages/classroom/src/components'),
    join(ROOT, 'packages/admin/src/components'),
    join(ROOT, 'packages/admin/src/screens'),
    join(ROOT, 'packages/self/src/components'),
    join(ROOT, 'apps/gurudevi-web/app/(sanctuary)/components'),
    join(ROOT, 'apps/gurudevi-web/app/(sanctuary)/self/components'),
    join(ROOT, 'apps/gurudevi-web/app/(sanctuary)/kit/components'),
  ];

  for (const d of dirs) {
    const files = walkDir(d, (_f, name) => {
      return (
        /\.(tsx|jsx)$/.test(name) &&
        !name.includes('.test.') &&
        !name.includes('.spec.') &&
        !name.startsWith('index.')
      );
    });
    components.push(...files);
  }
  return components;
}

// 3. AUDIT UNWIRED / ORPHAN COMPONENTS
function auditUnwiredComponents(components, screens) {
  const screenContents = screens.map((s) => ({
    path: relative(ROOT, s).replace(/\\/g, '/'),
    content: readFileSync(s, 'utf-8'),
  }));

  const unwired = [];
  const wired = [];

  for (const compPath of components) {
    const relPath = relative(ROOT, compPath).replace(/\\/g, '/');
    const compName = basename(compPath).replace(/\.(tsx|jsx)$/, '');

    // Check if component name appears in any screen
    const consumers = [];
    for (const { path, content } of screenContents) {
      if (content.includes(compName)) {
        consumers.push(path);
      }
    }

    if (consumers.length === 0) {
      unwired.push({
        name: compName,
        path: relPath,
        category: relPath.split('/')[1] || 'apps',
      });
    } else {
      wired.push({
        name: compName,
        path: relPath,
        consumerCount: consumers.length,
        consumers: consumers.slice(0, 3),
      });
    }
  }

  return { unwired, wired };
}

// 4. AUDIT HARDCODED FEATURE VISIBILITY & AUTHORITY BYPASSES
function auditFeatureVisibilityBypasses(screens) {
  const violations = [];

  const BYPASS_PATTERNS = [
    {
      id: 'hardcoded_role_array',
      name: 'Ad-Hoc Role/Capacity String Array',
      regex: /(?:const|let|var)\s+[A-Z_]*ROLES?\s*=\s*\[[^\]]+\]/g,
      severity: 'HIGH',
      explanation: 'Screens must not define private role lists; capacity access is governed by WORKSPACE_FLOORS in workspaceCatalog.ts.',
    },
    {
      id: 'dev_mode_permission_bypass',
      name: 'Dev-Mode Authority Bypass',
      regex: /isLeader\s*=\s*.*import\.meta\.env\.DEV|isAdmin\s*=\s*.*__DEV__/g,
      severity: 'HIGH',
      explanation: 'Bypassing authority with dev-mode overrides masks permission bugs and violates production parity.',
    },
    {
      id: 'manual_role_includes',
      name: 'Manual Role String Matching',
      regex: /\[['"][a-zA-Z_-]+['"](?:\s*,\s*['"][a-zA-Z_-]+['"])+\]\.includes\(\s*(?:capacity|role|userRole)/g,
      severity: 'MEDIUM',
      explanation: 'Feature visibility must be derived from sanctuaryFeature or WORKSPACE_FLOORS, never hardcoded .includes(role) tuples.',
    },
    {
      id: 'hardcoded_user_is_admin',
      name: 'Direct User Admin Property Check',
      regex: /(?:user|session|account)\.(?:isAdmin|is_admin|role\s*===)/g,
      severity: 'HIGH',
      explanation: 'Checking user.is_admin bypasses signed Cedar authority capabilities and the multi-capacity bond architecture.',
    },
  ];

  for (const screenPath of screens) {
    const rel = relative(ROOT, screenPath).replace(/\\/g, '/');
    const content = readFileSync(screenPath, 'utf-8');
    const lines = content.split('\n');

    for (const pattern of BYPASS_PATTERNS) {
      pattern.regex.lastIndex = 0;
      let match;
      while ((match = pattern.regex.exec(content)) !== null) {
        // Find line number
        const preMatch = content.slice(0, match.index);
        const lineNo = preMatch.split('\n').length;
        const lineText = lines[lineNo - 1]?.trim() || '';

        violations.push({
          file: rel,
          line: lineNo,
          ruleId: pattern.id,
          ruleName: pattern.name,
          severity: pattern.severity,
          matchedSnippet: match[0],
          lineText,
          explanation: pattern.explanation,
        });
      }
    }
  }

  return violations;
}

function generateHtml(report) {
  const { summary, unwiredComponents, visibilityViolations } = report;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Feature Visibility & Unwired Components Audit</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0b1120; color: #f8fafc; margin: 0; padding: 2rem; }
    h1 { color: #38bdf8; font-size: 1.8rem; margin-bottom: 0.25rem; }
    h2 { color: #94a3b8; font-size: 1.25rem; margin-top: 2rem; border-bottom: 1px solid #1e293b; padding-bottom: 0.5rem; }
    .badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; }
    .badge.red { background: #991b1b; color: #f87171; }
    .badge.amber { background: #854d0e; color: #fde047; }
    .badge.green { background: #065f46; color: #34d399; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
    .card { background: #1e293b; padding: 1.25rem; border-radius: 0.5rem; border: 1px solid #334155; }
    .card-val { font-size: 2rem; font-weight: 700; color: #f1f5f9; }
    .card-lbl { font-size: 0.85rem; color: #94a3b8; margin-top: 0.25rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; background: #1e293b; border-radius: 0.5rem; overflow: hidden; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #334155; font-size: 0.85rem; }
    th { background: #0f172a; color: #94a3b8; font-weight: 600; }
    .code-tag { font-family: monospace; background: #0f172a; padding: 0.2rem 0.4rem; border-radius: 0.25rem; color: #e2e8f0; }
  </style>
</head>
<body>
  <h1>Feature Visibility & Unwired Components Audit</h1>
  <p style="color: #94a3b8;">Enforcing Centralized Authority & Detecting Island UI Elements</p>

  <h2>1. Executive Summary</h2>
  <div class="grid">
    <div class="card">
      <div class="card-val">${summary.totalComponentsScanned}</div>
      <div class="card-lbl">Total Candidate UI Components</div>
    </div>
    <div class="card">
      <div class="card-val" style="color: #f87171;">${summary.unwiredComponentsCount}</div>
      <div class="card-lbl">Unwired Orphan Components (Never Rendered)</div>
      <span class="badge red">Dead UI Islands</span>
    </div>
    <div class="card">
      <div class="card-val" style="color: #fde047;">${summary.visibilityViolationsCount}</div>
      <div class="card-lbl">Hardcoded Role / Visibility Bypasses</div>
      <span class="badge amber">Authority Deficit</span>
    </div>
  </div>

  <h2>2. Hardcoded Authority Bypasses on Screens (${summary.visibilityViolationsCount})</h2>
  <table>
    <thead>
      <tr><th>File & Line</th><th>Violation Rule</th><th>Severity</th><th>Code Snippet</th><th>Architectural Fix</th></tr>
    </thead>
    <tbody>
      ${visibilityViolations
        .map(
          (v) => `
        <tr>
          <td><span class="code-tag">${v.file}:${v.line}</span></td>
          <td><strong>${v.ruleName}</strong></td>
          <td><span class="badge ${v.severity === 'HIGH' ? 'red' : 'amber'}">${v.severity}</span></td>
          <td><code style="color: #f43f5e;">${escapeHtml(v.lineText)}</code></td>
          <td style="color: #94a3b8;">${v.explanation}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <h2>3. Unwired / Orphan Components Built but Never Rendered (${summary.unwiredComponentsCount})</h2>
  <table>
    <thead>
      <tr><th>Component Name</th><th>Source Path</th><th>Category</th><th>Status</th></tr>
    </thead>
    <tbody>
      ${unwiredComponents
        .map(
          (c) => `
        <tr>
          <td><strong>${c.name}</strong></td>
          <td><span class="code-tag">${c.path}</span></td>
          <td>${c.category}</td>
          <td><span class="badge red">Never Mounted on Any Screen</span></td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>`;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function main() {
  console.log(`\n===============================================================`);
  console.log(`  FEATURE VISIBILITY & UNWIRED COMPONENTS SCANNER`);
  console.log(`===============================================================\n`);

  const screens = getScreenFiles();
  const components = getComponentFiles();

  const { unwired, wired } = auditUnwiredComponents(components, screens);
  const violations = auditFeatureVisibilityBypasses(screens);

  const report = {
    summary: {
      totalScreensScanned: screens.length,
      totalComponentsScanned: components.length,
      wiredComponentsCount: wired.length,
      unwiredComponentsCount: unwired.length,
      visibilityViolationsCount: violations.length,
    },
    visibilityViolations: violations,
    unwiredComponents: unwired,
    wiredComponents: wired,
  };

  console.log(`▶ 1. UI COMPONENT MOUNT STATUS:`);
  console.log(`  • Candidate Components: ${report.summary.totalComponentsScanned}`);
  console.log(`  • Wired & Rendered on Screens: ${report.summary.wiredComponentsCount}`);
  console.log(`  • 🔴 Unwired Orphan Components (Never Rendered): ${report.summary.unwiredComponentsCount}`);

  console.log(`\n▶ 2. FEATURE VISIBILITY & AUTHORITY BYPASSES:`);
  console.log(`  • Screens Scanned: ${report.summary.totalScreensScanned}`);
  console.log(`  • ⚠ Authority / Role Bypasses Detected: ${report.summary.visibilityViolationsCount}`);

  if (violations.length > 0) {
    console.log(`\n===============================================================`);
    console.log(`  HARDCODED AUTHORITY / ROLE BYPASS DEFECTS FOUND:`);
    console.log(`===============================================================`);
    violations.forEach((v) => {
      console.log(`  ❌ [${v.severity}] ${v.file}:${v.line} -> ${v.ruleName}`);
      console.log(`     Code: ${v.lineText}`);
      console.log(`     Fix:  ${v.explanation}\n`);
    });
  }

  if (unwired.length > 0) {
    console.log(`===============================================================`);
    console.log(`  TOP UNWIRED ORPHAN COMPONENTS (Built with Zero Consumer Screens):`);
    console.log(`===============================================================`);
    unwired.slice(0, 10).forEach((c) => {
      console.log(`  🔴 ${c.name} (${c.path})`);
    });
    if (unwired.length > 10) {
      console.log(`  ...and ${unwired.length - 10} more unmounted components.`);
    }
  }

  // Write reports
  mkdirSync(dirname(REPORT_JSON), { recursive: true });
  writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n✔ JSON Report saved to: ${REPORT_JSON}`);

  const html = generateHtml(report);
  writeFileSync(REPORT_HTML, html, 'utf-8');
  console.log(`✔ Interactive HTML Report saved to: ${REPORT_HTML}`);
  console.log(`\n===============================================================\n`);
}

main();
