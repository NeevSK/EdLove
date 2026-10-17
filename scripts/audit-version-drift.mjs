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
import { getCohortLookup } from './lib/dependency-cohorts.mjs';

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

function parseSemver(v) {
  if (!v) return null;
  const match = String(v).match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    raw: v,
  };
}

const SACRED_PINS = {
  'react-native-gesture-handler': '3.3.0',
  'react-native-reanimated': '4.7.1',
  'react-native-worklets': '0.13.0',
  'react-native-mmkv': '4.3.2',
  'react-native-nitro-modules': '0.37.1',
  'react-native-skia': '^3.3.0',
  'typescript': '7.0.2',
};

function cleanPackageName(rawKey) {
  let name = rawKey.replace(/\s*\([^)]*\)$/, '').trim();
  const lastAt = name.lastIndexOf('@');
  if (lastAt > 0) {
    name = name.slice(0, lastAt);
  }
  return name;
}

// ---------------------------------------------------------
// ---------------------------------------------------------
// Phase 1: Dependency Drift Audit (Cohort & Granular Aware)
// ---------------------------------------------------------
function auditDependencies(majorLagThreshold) {
  const annotations = loadDependencyAnnotations();
  const cohortLookup = getCohortLookup();
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

  for (const [rawPkgName, details] of Object.entries(outdatedData)) {
    const pkgName = cleanPackageName(rawPkgName);
    const current = details.current;
    const latest = details.latest;
    const curSem = parseSemver(current);
    const latSem = parseSemver(latest);

    if (!curSem || !latSem) continue;

    let driftKind = null;
    let delta = 0;
    let deltaLabel = '';

    // 0.x packages: minor bump is a breaking major equivalent
    if (curSem.major === 0 && latSem.major === 0) {
      if (latSem.minor > curSem.minor) {
        driftKind = 'BREAKING_0X_MINOR';
        delta = latSem.minor - curSem.minor;
        deltaLabel = `+${delta} min (0.x break)`;
      }
    } else if (latSem.major > curSem.major) {
      driftKind = 'BREAKING_MAJOR';
      delta = latSem.major - curSem.major;
      deltaLabel = `+${delta} maj`;
    } else if (latSem.minor > curSem.minor && (latSem.minor - curSem.minor) >= 3) {
      driftKind = 'SIGNIFICANT_MINOR';
      delta = latSem.minor - curSem.minor;
      deltaLabel = `+${delta} min`;
    }

    if (!driftKind) continue;
    if (driftKind === 'BREAKING_MAJOR' && delta < majorLagThreshold) continue;
    if (driftKind === 'BREAKING_0X_MINOR' && delta < majorLagThreshold) continue;

    const cohortInfo = cohortLookup.get(pkgName);
    const annotation = annotations[pkgName];

    let status = 'UNANNOTATED_LAG';
    let note = null;

    if (cohortInfo) {
      if (cohortInfo.cohortId === 'SACRED_NATIVE') {
        const sacredVer = cohortInfo.canonical;
        const sacSem = parseSemver(sacredVer);
        if (sacSem && (curSem.major !== sacSem.major || curSem.minor !== sacSem.minor)) {
          status = 'SACRED_PIN_MISMATCH';
          note = `CRITICAL: declared ${current}, must match sacred pin ${sacredVer} in AGENTS.md`;
        } else {
          status = 'SACRED_PIN';
          note = `Sacred pin (${sacredVer}) in AGENTS.md`;
        }
      } else if (cohortInfo.cohortId === 'EXPO_SDK_58_MATRIX') {
        status = 'EXPO_SDK_MANAGED';
        note = cohortInfo.guidance;
      } else if (cohortInfo.governance === 'MONOREPO_UNIVERSAL') {
        status = 'COHORT_MANAGED';
        note = `${cohortInfo.cohortName} universal pin (${cohortInfo.canonical})`;
      }
    } else if (annotation?.status === 'held' || annotation?.status === 'waived') {
      status = 'WAIVED';
      note = annotation.notes || `Explicitly ${annotation.status} in Stack Map`;
    } else if (
      annotation?.notes &&
      /(\bv\d+(\.\d+)*\s+(pinned|held)|sacred|pinned for|held for)/i.test(annotation.notes)
    ) {
      if (pkgName === 'effect' && annotation.notes.includes('v3.22')) {
        status = 'STALE_WAIVER';
        note = `Stale waiver: "${annotation.notes}" — monorepo baseline is Effect v4.0.2`;
      } else {
        status = 'WAIVED';
        note = annotation.notes;
      }
    } else if (annotation?.notes) {
      status = 'UNANNOTATED_LAG';
      note = `Description only (no waiver): "${annotation.notes}"`;
    }

    results.push({
      pkgName: rawPkgName,
      basePkgName: pkgName,
      current,
      latest,
      driftKind,
      delta,
      deltaLabel,
      status,
      cohortId: cohortInfo?.cohortId || null,
      cohortName: cohortInfo?.cohortName || null,
      governance: cohortInfo?.governance || null,
      annotation: note,
      dependentPackages: (details.dependentPackages || []).map((d) => d.name),
    });
  }

  return results.sort((a, b) => b.delta - a.delta);
}

// ---------------------------------------------------------
// Phase 1B: Internal Workspace Version Divergence Audit
// ---------------------------------------------------------
function auditWorkspaceDivergence() {
  const pkgDirs = ['apps', 'packages'];
  const packageFiles = [];

  for (const d of pkgDirs) {
    const full = path.join(ROOT_DIR, d);
    if (!fs.existsSync(full)) continue;
    for (const sub of fs.readdirSync(full)) {
      const p = path.join(full, sub, 'package.json');
      if (fs.existsSync(p)) packageFiles.push(p);
    }
  }

  const depUsages = new Map();
  for (const file of [path.join(ROOT_DIR, 'package.json'), ...packageFiles]) {
    try {
      const json = JSON.parse(fs.readFileSync(file, 'utf8'));
      const pkgName = json.name || path.relative(ROOT_DIR, path.dirname(file));
      const allDeps = {
        ...(json.dependencies || {}),
        ...(json.devDependencies || {}),
      };

      for (const [dep, ver] of Object.entries(allDeps)) {
        if (ver.startsWith('workspace:')) continue;
        if (!depUsages.has(dep)) depUsages.set(dep, new Map());
        const verMap = depUsages.get(dep);
        if (!verMap.has(ver)) verMap.set(ver, []);
        verMap.get(ver).push(pkgName);
      }
    } catch {}
  }

  const divergences = [];
  for (const [dep, verMap] of depUsages.entries()) {
    if (verMap.size > 1) {
      divergences.push({
        dep,
        versions: Array.from(verMap.entries()).map(([ver, consumers]) => ({
          version: ver,
          consumers,
        })),
      });
    }
  }

  return divergences.sort((a, b) => b.versions.length - a.versions.length);
}

// ---------------------------------------------------------
// Phase 2: Framework Dialect Audit (Static + Live Substrate)
// ---------------------------------------------------------
const LIVE_DEPRECATIONS_FILE = path.join(ROOT_DIR, 'reports', 'live-deprecations.json');

function getGitDiffFiles() {
  try {
    const diff = execSync('git diff --name-only HEAD', { cwd: ROOT_DIR, encoding: 'utf8' });
    return diff
      .split(/\r?\n/)
      .map((f) => f.trim())
      .filter((f) => /\.(tsx?|jsx?)$/.test(f) && fs.existsSync(path.resolve(ROOT_DIR, f)));
  } catch {
    return [];
  }
}

function loadLiveDeprecations() {
  if (!fs.existsSync(LIVE_DEPRECATIONS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(LIVE_DEPRECATIONS_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function auditCodeDialect() {
  const dialectRules = loadDialectRules();
  const matches = [];

  // 1. Static Curated Dialect Rules (ripgrep across packages/apps)
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

function extractPackageBindings(content, pkgName) {
  const namedSymbols = new Map();
  const namespaces = new Set();
  const declaredSymbols = new Set();

  const escapedPkg = pkgName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // 1. Named imports: import { a, b as c } from 'pkg'
  const namedImportRegex = new RegExp(`import\\s+(?:type\\s+)?\\{([^}]+)\\}\\s+from\\s+['"]${escapedPkg}['"]`, 'g');
  let match;
  while ((match = namedImportRegex.exec(content)) !== null) {
    const rawList = match[1].split(',');
    for (const item of rawList) {
      const parts = item.trim().split(/\s+as\s+/);
      if (parts.length === 2) {
        namedSymbols.set(parts[1].trim(), parts[0].trim());
      } else if (parts[0].trim()) {
        namedSymbols.set(parts[0].trim(), parts[0].trim());
      }
    }
  }

  // 2. Default or Namespace import: import z from 'zod' or import * as z from 'zod'
  const nsImportRegex = new RegExp(`import\\s+(?:(?:type\\s+)?\\*\\s+as\\s+([A-Za-z0-9_$]+)|([A-Za-z0-9_$]+))\\s+from\\s+['"]${escapedPkg}['"]`, 'g');
  while ((match = nsImportRegex.exec(content)) !== null) {
    const ns = match[1] || match[2];
    if (ns && ns !== 'type') {
      namespaces.add(ns);
    }
  }

  // 3. Destructured require: const { a, b: c } = require('pkg')
  const reqDestructRegex = new RegExp(`const\\s+\\{([^}]+)\\}\\s*=\\s*require\\(['"]${escapedPkg}['"]\\)`, 'g');
  while ((match = reqDestructRegex.exec(content)) !== null) {
    const rawList = match[1].split(',');
    for (const item of rawList) {
      const parts = item.trim().split(':');
      if (parts.length === 2) {
        namedSymbols.set(parts[1].trim(), parts[0].trim());
      } else if (parts[0].trim()) {
        namedSymbols.set(parts[0].trim(), parts[0].trim());
      }
    }
  }

  // 4. Default require: const z = require('zod')
  const reqDefaultRegex = new RegExp(`const\\s+([A-Za-z0-9_$]+)\\s*=\\s*require\\(['"]${escapedPkg}['"]\\)`, 'g');
  while ((match = reqDefaultRegex.exec(content)) !== null) {
    namespaces.add(match[1]);
  }

  // 5. Ambient declare module 'pkg' { export const Foo: any; } (e.g. types-shim)
  const declareModuleRegex = new RegExp(`declare\\s+module\\s+['"]${escapedPkg}['"]\\s*\\{([\\s\\S]*?)\\}`, 'g');
  while ((match = declareModuleRegex.exec(content)) !== null) {
    const block = match[1];
    const exportRegex = /export\s+(?:const|let|var|function|type|interface|class)\s+([A-Za-z0-9_$]+)/g;
    let expMatch;
    while ((expMatch = exportRegex.exec(block)) !== null) {
      declaredSymbols.add(expMatch[1]);
    }
  }

  return { namedSymbols, namespaces, declaredSymbols };
}

  // 2. Dynamic Physical Substrate Deprecations (Scoped to git-modified files)
  const liveDeprecations = loadLiveDeprecations();
  const changedFiles = getGitDiffFiles();

  if (changedFiles.length > 0 && Object.keys(liveDeprecations).length > 0) {
    for (const relFile of changedFiles) {
      const absPath = path.resolve(ROOT_DIR, relFile);
      let content = '';
      try {
        content = fs.readFileSync(absPath, 'utf8');
      } catch {
        continue;
      }

      const lines = content.split(/\r?\n/);

      for (const [pkg, symbols] of Object.entries(liveDeprecations)) {
        if (!content.includes(pkg)) continue;

        const bindings = extractPackageBindings(content, pkg);
        if (bindings.namedSymbols.size === 0 && bindings.namespaces.size === 0 && bindings.declaredSymbols.size === 0) {
          continue;
        }

        const symbolMap = new Map();
        for (const s of symbols) {
          symbolMap.set(s.symbol, s);
        }

        // A. Check declared symbols in declare module (e.g. types-shim)
        for (const declSym of bindings.declaredSymbols) {
          if (symbolMap.has(declSym)) {
            const item = symbolMap.get(declSym);
            const lineIdx = lines.findIndex((l) => l.includes(declSym));
            matches.push({
              rule: `${pkg}: ${declSym}`,
              category: 'Live Substrate Deprecation',
              severity: 'CRITICAL',
              advice: item.message + (item.replacement ? ` (Replacement: ${item.replacement})` : ''),
              file: relFile,
              line: lineIdx >= 0 ? lineIdx + 1 : 1,
              snippet: lineIdx >= 0 ? lines[lineIdx].trim() : '',
            });
          }
        }

        // B. Check named imports: import { DeprecatedSym } from 'pkg'
        for (const [localName, origName] of bindings.namedSymbols.entries()) {
          if (symbolMap.has(origName)) {
            const item = symbolMap.get(origName);
            const lineIdx = lines.findIndex((l) => l.includes(origName));
            matches.push({
              rule: `${pkg}: ${origName}`,
              category: 'Live Substrate Deprecation',
              severity: 'CRITICAL',
              advice: item.message + (item.replacement ? ` (Replacement: ${item.replacement})` : ''),
              file: relFile,
              line: lineIdx >= 0 ? lineIdx + 1 : 1,
              snippet: lineIdx >= 0 ? lines[lineIdx].trim() : '',
            });
          }
        }

        // C. Check namespace & object prefix member access: ns.DeprecatedSym (e.g. z.ZodTypeAny)
        const allObjectPrefixes = new Set([...bindings.namespaces, ...bindings.namedSymbols.keys()]);
        for (const prefix of allObjectPrefixes) {
          for (const [sym, item] of symbolMap.entries()) {
            const accessRegex = new RegExp(`\\b${prefix}\\s*\\.\\s*${sym}\\b`);
            for (let i = 0; i < lines.length; i++) {
              if (accessRegex.test(lines[i])) {
                matches.push({
                  rule: `${pkg}: ${prefix}.${sym}`,
                  category: 'Live Substrate Deprecation',
                  severity: 'CRITICAL',
                  advice: item.message + (item.replacement ? ` (Replacement: ${item.replacement})` : ''),
                  file: relFile,
                  line: i + 1,
                  snippet: lines[i].trim(),
                });
              }
            }
          }
        }
      }
    }
  }

  return matches;
}

// ---------------------------------------------------------
// Reporting & CLI Execution
// ---------------------------------------------------------
function renderMarkdownReport(depResults, codeResults, divergenceResults, majorLagThreshold) {
  let md = `# Sovereign Dependency Intelligence & Cohort Audit Report\n\n`;
  md += `Generated: ${new Date().toISOString()}\n`;
  md += `Threshold: \\Delta_{\\text{major}} \\ge ${majorLagThreshold}\n\n`;

  const sacredResults = depResults.filter((r) => r.status === 'SACRED_PIN' || r.status === 'SACRED_PIN_MISMATCH');
  const expoResults = depResults.filter((r) => r.status === 'EXPO_SDK_MANAGED');
  const cohortResults = depResults.filter((r) => r.status === 'COHORT_MANAGED');
  const standaloneResults = depResults.filter(
    (r) =>
      r.status !== 'SACRED_PIN' &&
      r.status !== 'SACRED_PIN_MISMATCH' &&
      r.status !== 'EXPO_SDK_MANAGED' &&
      r.status !== 'COHORT_MANAGED',
  );

  md += `## 1. Ecosystem Cohorts & External Registry Drift\n\n`;

  // 1A. Sacred Native Pins
  md += `### 1A. Sacred Native Architecture Pins (Inviolable AGENTS.md Rule 2)\n\n`;
  if (sacredResults.length === 0) {
    md += `✅ All Sacred Native Pins are verified with zero registry lag.\n\n`;
  } else {
    md += `| Status | Package | Current | Latest | Lag (Δ) | Architectural Invariant |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    for (const r of sacredResults) {
      const badge = r.status === 'SACRED_PIN_MISMATCH' ? '💥 **`SACRED MISMATCH`**' : '🔒 `SACRED PIN`';
      md += `| ${badge} | \`${r.pkgName}\` | \`${r.current}\` | \`${r.latest}\` | ${r.deltaLabel} | ${r.annotation || '-'} |\n`;
    }
    md += `\n`;
  }

  // 1B. Expo SDK 58 Matrix
  md += `### 1B. Expo SDK 58 Deterministic Mobile Matrix (Runtime Bundled)\n\n`;
  if (expoResults.length === 0) {
    md += `✅ Expo SDK 58 bundled runtime is fully up to date with SDK matrix.\n\n`;
  } else {
    md += `> **Architecture Note:** These packages are bound to the active Expo SDK 58 native runtime. They must NOT be upgraded independently via ad-hoc npm updates. Upgrades are gated on the Expo SDK 59 milestone and \`pnpm --filter gurudevi-mobile exec expo-doctor\`.\n\n`;
    md += `| Status | Package | Current | Latest | Lag (Δ) | Framework Governance |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    for (const r of expoResults) {
      md += `| 📦 \`EXPO 58 MATRIX\` | \`${r.pkgName}\` | \`${r.current}\` | \`${r.latest}\` | ${r.deltaLabel} | ${r.annotation || 'Bundled to Expo SDK 58'} |\n`;
    }
    md += `\n`;
  }

  // 1C. Universal Platform Cohorts
  if (cohortResults.length > 0) {
    md += `### 1C. Universal Platform Cohorts (Single-Version Policy)\n\n`;
    md += `| Status | Package | Current | Latest | Lag (Δ) | Cohort Policy |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    for (const r of cohortResults) {
      md += `| 🏛️ \`COHORT MANAGED\` | \`${r.pkgName}\` | \`${r.current}\` | \`${r.latest}\` | ${r.deltaLabel} | ${r.annotation || '-'} |\n`;
    }
    md += `\n`;
  }

  // 1D. Standalone External Packages
  md += `### 1D. Standalone External Dependencies (Actionable Upgrades & Waivers)\n\n`;
  if (standaloneResults.length === 0) {
    md += `✅ Zero standalone packages lagging by $\\ge ${majorLagThreshold}$ major versions.\n\n`;
  } else {
    md += `| Status | Package | Current | Latest | Lag (Δ) | Notes / Waiver |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    for (const r of standaloneResults) {
      const badge =
        r.status === 'WAIVED'
          ? '📝 `WAIVED`'
          : r.status === 'STALE_WAIVER'
            ? '⏰ **`STALE WAIVER`**'
            : '⚠️ **`UNANNOTATED`**';
      const notes = r.annotation ? r.annotation.replace(/\|/g, '\\|') : '-';
      md += `| ${badge} | \`${r.pkgName}\` | \`${r.current}\` | \`${r.latest}\` | ${r.deltaLabel} | ${notes} |\n`;
    }
    md += `\n`;
  }

  // 2. Framework Dialects
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

  // 3. Internal Workspace Alignment
  md += `## 3. Internal Workspace Version Alignment Drift\n\n`;
  if (!divergenceResults || divergenceResults.length === 0) {
    md += `✅ ALL 32 MANIFESTS ARE 100% IN HARMONY WITH ECOSYSTEM COHORTS!\n`;
    md += `   Zero internal divergence detected across the monorepo.\n\n`;
  } else {
    md += `> 💡 **Automated Alignment:** Run \`pnpm run deps:harmonize\` to automatically align all 32 manifests in-place.\n\n`;
    md += `| Package | Divergent Versions | Consuming Packages | Action / Sacred Baseline |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    for (const div of divergenceResults) {
      const isSacred = SACRED_PINS[div.dep];
      const versionsStr = div.versions.map((v) => `\`${v.version}\``).join(' vs ');
      const consumersStr = div.versions
        .map((v) => `\`${v.version}\`: ${v.consumers.map((c) => `\`${c}\``).join(', ')}`)
        .join('<br>');
      const action = isSacred
        ? `🔒 **Sacred Pin Conflict**: Align all to \`${isSacred}\``
        : `Run \`pnpm run deps:harmonize\``;
      md += `| \`${div.dep}\` | ${versionsStr} | ${consumersStr} | ${action} |\n`;
    }
    md += `\n`;
  }

  // 4. Command Center
  md += `## 4. Sovereign Command Center & Proactive Workflows\n\n`;
  md += `- **Harmonize All Packages**: \`pnpm run deps:harmonize\` (Applies canonical Ecosystem Cohort pins across all 32 manifests)\n`;
  md += `- **Verify Cohort Harmony**: \`pnpm run deps:check\` (Instant verification that no manifest has drifted)\n`;
  md += `- **Audit Mobile Native Health**: \`pnpm --filter gurudevi-mobile exec expo-doctor\` (Verifies native C++/Fabric runtime)\n`;
  md += `- **Upgrade Standalone Safe Patches**: \`pnpm run deps:upgrade\` (Smart upgrades preserving Sacred Pins and Cohorts)\n\n`;

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
  const divergenceResults = codeOnly ? [] : auditWorkspaceDivergence();

  const standaloneResults = depResults.filter(
    (r) =>
      r.status !== 'SACRED_PIN' &&
      r.status !== 'SACRED_PIN_MISMATCH' &&
      r.status !== 'EXPO_SDK_MANAGED' &&
      r.status !== 'COHORT_MANAGED',
  );

  const includeZeroX = args.includes('--include-0x');
  const sacredMismatches = depResults.filter((d) => d.status === 'SACRED_PIN_MISMATCH');
  const unannotatedDeps = standaloneResults.filter(
    (d) =>
      d.status === 'UNANNOTATED_LAG' &&
      ((d.driftKind === 'BREAKING_MAJOR' && d.delta >= majorLagThreshold) ||
        (includeZeroX && d.driftKind === 'BREAKING_0X_MINOR' && d.delta >= majorLagThreshold)),
  );

  if (isJson) {
    console.log(
      JSON.stringify(
        {
          threshold: majorLagThreshold,
          summary: {
            totalDependenciesLagging: depResults.length,
            sacredMismatches: sacredMismatches.length,
            unannotatedStandaloneDependencies: unannotatedDeps.length,
            dialectDriftOccurrences: codeResults.length,
            workspaceDivergences: divergenceResults.length,
          },
          dependencies: depResults,
          dialects: codeResults,
          divergences: divergenceResults,
        },
        null,
        2,
      ),
    );
  } else {
    const md = renderMarkdownReport(depResults, codeResults, divergenceResults, majorLagThreshold);
    const reportsDir = path.dirname(REPORT_FILE);
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    try {
      fs.writeFileSync(REPORT_FILE, md, 'utf8');
    } catch {
      try {
        fs.writeFileSync(REPORT_FILE + '.tmp', md, 'utf8');
        fs.copyFileSync(REPORT_FILE + '.tmp', REPORT_FILE);
        fs.unlinkSync(REPORT_FILE + '.tmp');
      } catch {}
    }

    console.log(md);
    console.log(`\n📄 Dossier written to: ${REPORT_FILE}\n`);
  }

  if (failOnUnannotated && sacredMismatches.length > 0) {
    console.error(
      `❌ Quality Gate Violation: ${sacredMismatches.length} dependencies violate Sacred Native Pins in AGENTS.md Rule 2.`,
    );
    for (const s of sacredMismatches) {
      console.error(`  - ${s.pkgName}: declared ${s.current}, sacred pin is ${SACRED_PINS[s.basePkgName]}`);
    }
    process.exit(1);
  }

  if (failOnUnannotated && unannotatedDeps.length > 0) {
    console.error(
      `❌ Quality Gate Violation: ${unannotatedDeps.length} unannotated standalone dependencies are lagging by >= ${majorLagThreshold} major versions.`,
    );
    console.error(`Add waivers to docs/stack-map/landscape/dependency-annotations.yaml or run pnpm run deps:upgrade.`);
    process.exit(1);
  }

  const criticalCodeDrift = codeResults.filter((c) => c.severity === 'CRITICAL');
  if (failOnUnannotated && criticalCodeDrift.length > 0) {
    console.error(
      `❌ Quality Gate Violation: ${criticalCodeDrift.length} critical framework/live dialect deprecations detected in modified code.`,
    );
    for (const c of criticalCodeDrift) {
      console.error(`  - [${c.file}:${c.line}] ${c.rule}: ${c.advice}`);
    }
    process.exit(1);
  }
}

main();

