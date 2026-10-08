#!/usr/bin/env node
/**
 * audit-version-drift.mjs
 *
 * Unified Sovereign Engine for detecting:
 * 1. Dependency Manifest Drift (latest.major - current.major >= N)
 * 2. Framework Dialect & Code Deprecations (React 19, RN 0.88, Expo 58, PowerSync v2)
 *
 * ZERO HARDCODED RULES:
 * - Sacred pins and dependency waivers are loaded dynamically from:
 *   docs/stack-map/landscape/dependency-annotations.yaml
 * - Framework dialect rules are loaded dynamically from:
 *   docs/stack-map/landscape/dialect-annotations.yaml
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawnSync } from 'node:child_process';

const ROOT_DIR = process.cwd();
const DOCS_DIR = path.join(ROOT_DIR, 'docs', 'stack-map', 'landscape');
const DEPS_ANNOTATIONS_FILE = path.join(DOCS_DIR, 'dependency-annotations.yaml');
const DIALECT_ANNOTATIONS_FILE = path.join(DOCS_DIR, 'dialect-annotations.yaml');
const REPORT_FILE = path.join(ROOT_DIR, 'reports', 'version-drift-report.md');

// Helper: parse simple YAML subset (matching stack-map.mjs parser)
function parseMiniYaml(source) {
  const root = {};
  const stack = [{ indent: -1, node: root }];
  for (const raw of source.replace(/\r\n/g, '\n').split('\n')) {
    const content = raw.replace(/^[ \t]*#.*$/, '').replace(/[ \t]#.*$/, '');
    if (!content.trim()) continue;
    const indent = content.match(/^ */)[0].length;
    const line = content.trim();
    if (!line.includes(':')) continue;
    const key = line.slice(0, line.indexOf(':')).trim().replace(/^"|"$/g, '');
    const value = line.slice(line.indexOf(':') + 1).trim();
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    if (value === '') {
      const parent = stack[stack.length - 1].node;
      const child = (typeof parent[key] === 'object' && parent[key] !== null) ? parent[key] : {};
      parent[key] = child;
      stack.push({ indent, node: child });
    } else {
      let v = value;
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      stack[stack.length - 1].node[key] = v;
    }
  }
  return root;
}

/** Dynamically load dependency annotations from Stack Map (single source of truth) */
function loadDependencyAnnotations() {
  if (!fs.existsSync(DEPS_ANNOTATIONS_FILE)) return {};
  try {
    const raw = fs.readFileSync(DEPS_ANNOTATIONS_FILE, 'utf8');
    const parsed = parseMiniYaml(raw);
    return parsed.dependency_entries || {};
  } catch (err) {
    console.error(`[Warning] Failed to parse ${DEPS_ANNOTATIONS_FILE}:`, err.message);
    return {};
  }
}

/** Dynamically load dialect deprecation rules from Stack Map (single source of truth) */
function loadDialectRules() {
  if (!fs.existsSync(DIALECT_ANNOTATIONS_FILE)) return [];
  try {
    const raw = fs.readFileSync(DIALECT_ANNOTATIONS_FILE, 'utf8');
    const parsed = parseMiniYaml(raw);
    return Object.values(parsed.dialect_rules || {});
  } catch (err) {
    console.error(`[Warning] Failed to parse ${DIALECT_ANNOTATIONS_FILE}:`, err.message);
    return [];
  }
}

function parseMajor(versionStr) {
  if (!versionStr) return null;
  const match = String(versionStr).match(/(\d+)\.\d+\.\d+/);
  return match ? parseInt(match[1], 10) : null;
}

// ---------------------------------------------------------
// Phase 1: Dependency Drift Audit (Fully Dynamic)
// ---------------------------------------------------------
function auditDependencies(majorLagThreshold) {
  const annotations = loadDependencyAnnotations();
  let outdatedRaw = '';
  try {
    outdatedRaw = execSync('pnpm outdated --json -r', {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch (err) {
    // pnpm outdated exits with 1 if outdated packages exist
    outdatedRaw = err.stdout || '';
  }

  let outdatedData = {};
  if (outdatedRaw.trim()) {
    try {
      outdatedData = JSON.parse(outdatedRaw);
    } catch {
      outdatedData = {};
    }
  }

  const results = [];

  for (const [pkgName, details] of Object.entries(outdatedData)) {
    const current = details.current;
    const latest = details.latest;
    const curMajor = parseMajor(current);
    const latMajor = parseMajor(latest);

    if (curMajor === null || latMajor === null) continue;
    const delta = latMajor - curMajor;

    if (delta >= majorLagThreshold) {
      const annotation = annotations[pkgName];
      const isSacred = Boolean(annotation?.sacred);
      const hasWaiver = Boolean(
        isSacred ||
        annotation?.notes ||
        annotation?.status?.includes('held')
      );

      let status = 'UNANNOTATED_LAG';
      let note = null;

      if (isSacred) {
        status = 'SACRED_PIN';
        note = `Sacred pin (${annotation.sacred}) in Stack Map`;
      } else if (hasWaiver) {
        status = 'WAIVED';
        note = annotation?.notes || annotation?.status || 'Documented waiver in Stack Map';
      }

      results.push({
        pkgName,
        current,
        latest,
        curMajor,
        latMajor,
        delta,
        status,
        annotation: note,
        dependentPackages: (details.dependentPackages || []).map((d) => d.name),
      });
    }
  }

  return results.sort((a, b) => b.delta - a.delta);
}

// ---------------------------------------------------------
// Phase 2: Framework Dialect Audit (Fully Dynamic)
// ---------------------------------------------------------
function auditCodeDialect() {
  const dialectRules = loadDialectRules();
  const matches = [];

  for (const rule of dialectRules) {
    if (!rule.pattern) continue;
    try {
      const rg = spawnSync('rg', [
        rule.pattern,
        'packages',
        'apps',
        '-g', '*.{ts,tsx,js,jsx}',
        '-g', 'app.json',
        '--line-number',
        '--json',
        '--glob', '!**/node_modules/**',
        '--glob', '!**/.expo/**',
        '--glob', '!**/.next/**',
        '--glob', '!**/dist/**',
        '--glob', '!**/build/**',
        '--glob', '!**/.turbo/**',
      ], {
        cwd: ROOT_DIR,
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
      });

      if (!rg.stdout) continue;
      for (const line of rg.stdout.split('\n')) {
        if (!line.trim()) continue;
        try {
          const item = JSON.parse(line);
          if (item.type === 'match') {
            matches.push({
              rule: rule.name || 'Unnamed Rule',
              category: rule.category || 'Framework',
              severity: rule.severity || 'MEDIUM',
              advice: rule.message || '',
              file: item.data.path.text,
              line: item.data.line_number,
              snippet: item.data.lines.text.trim(),
            });
          }
        } catch {
          // ignore non-json lines
        }
      }
    } catch {
      // rg execution failed
    }
  }

  return matches;
}

// ---------------------------------------------------------
// Reporting & CLI Execution
// ---------------------------------------------------------
function renderMarkdownReport(depResults, codeResults, majorLagThreshold) {
  let md = `# Sovereign Version Drift & Framework Dialect Report\n\n`;
  md += `Generated: ${new Date().toISOString()}\n`;
  md += `Threshold: \\Delta_{\\text{major}} \\ge ${majorLagThreshold}\n\n`;

  md += `## 1. Dependency Manifest Drift (Latest Major - Current Major >= ${majorLagThreshold})\n\n`;
  if (depResults.length === 0) {
    md += `✅ Zero packages lagging by $\\ge ${majorLagThreshold}$ major versions.\n\n`;
  } else {
    md += `| Status | Package | Current | Latest | Lag (Δ) | Notes / Waiver |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    for (const r of depResults) {
      const badge =
        r.status === 'SACRED_PIN'
          ? '🔒 `SACRED`'
          : r.status === 'WAIVED'
            ? '📝 `WAIVED`'
            : '⚠️ **`UNANNOTATED`**';
      const notes = r.annotation ? r.annotation.replace(/\|/g, '\\|') : '-';
      md += `| ${badge} | \`${r.pkgName}\` | \`${r.current}\` | \`${r.latest}\` | +${r.delta} maj | ${notes} |\n`;
    }
    md += `\n`;
  }

  md += `## 2. Framework Dialect & Code Deprecation Drift\n\n`;
  if (codeResults.length === 0) {
    md += `✅ Zero deprecated framework dialects detected across source code.\n\n`;
  } else {
    const grouped = {};
    for (const c of codeResults) {
      if (!grouped[c.rule]) grouped[c.rule] = [];
      grouped[c.rule].push(c);
    }

    for (const [ruleName, occurrences] of Object.entries(grouped)) {
      const first = occurrences[0];
      md += `### ${ruleName} (${occurrences.length} occurrences) — \`${first.category}\`\n`;
      md += `> **Advice:** ${first.advice}\n\n`;
      for (const o of occurrences.slice(0, 10)) {
        md += `- [${o.file}:${o.line}](file:///${ROOT_DIR.replace(/\\/g, '/')}/${o.file.replace(/\\/g, '/')}#L${o.line})\n`;
        md += `  \`\`\`typescript\n  ${o.snippet}\n  \`\`\`\n`;
      }
      if (occurrences.length > 10) {
        md += `- *(...and ${occurrences.length - 10} more occurrences)*\n`;
      }
      md += `\n`;
    }
  }

  return md;
}

function main() {
  const args = process.argv.slice(2);
  const nMajorArg = args.find((a) => a.startsWith('--n-major='));
  const majorLagThreshold = nMajorArg ? parseInt(nMajorArg.split('=')[1], 10) : 1;
  const isJson = args.includes('--json');
  const failOnUnannotated = args.includes('--fail-on-unannotated');
  const depsOnly = args.includes('--deps-only');
  const codeOnly = args.includes('--code-only');

  const depResults = codeOnly ? [] : auditDependencies(majorLagThreshold);
  const codeResults = depsOnly ? [] : auditCodeDialect();

  const unannotatedDeps = depResults.filter((d) => d.status === 'UNANNOTATED_LAG');

  if (isJson) {
    console.log(
      JSON.stringify(
        {
          threshold: majorLagThreshold,
          summary: {
            totalDependenciesLagging: depResults.length,
            unannotatedDependencies: unannotatedDeps.length,
            dialectDriftOccurrences: codeResults.length,
          },
          dependencies: depResults,
          dialects: codeResults,
        },
        null,
        2,
      ),
    );
  } else {
    const md = renderMarkdownReport(depResults, codeResults, majorLagThreshold);
    const reportsDir = path.dirname(REPORT_FILE);
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    fs.writeFileSync(REPORT_FILE, md, 'utf8');

    console.log(md);
    console.log(`\n📄 Dossier written to: ${REPORT_FILE}\n`);
  }

  if (failOnUnannotated && unannotatedDeps.length > 0) {
    console.error(
      `❌ Quality Gate Violation: ${unannotatedDeps.length} unannotated dependencies are lagging by >= ${majorLagThreshold} major versions.`,
    );
    console.error(`Add waivers to docs/stack-map/landscape/dependency-annotations.yaml or upgrade them.`);
    process.exit(1);
  }
}

main();
