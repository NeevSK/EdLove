/**
 * scripts/lib/deps-engine.mjs
 *
 * Unified Dependency & Ecosystem Intelligence Engine.
 * Powers both CLI (`scripts/deps-cli.mjs`) and the Sovereign Portal (`/api/deps/*`).
 */

import { execSync, spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import semver from 'semver';
import { DEPENDENCY_COHORTS, DEPENDENCY_WAIVERS, getCohortLookup } from './dependency-cohorts.mjs';
import { fastScanFiles } from './fast-scan.mjs';

const DEFAULT_ROOT = process.cwd();

/** Parse minimumReleaseAge and minimumReleaseAgeExclude from pnpm-workspace.yaml. */
export function parseMinimumReleaseAgeConfig(wsYamlText) {
  let minimumReleaseAgeMinutes = 1440;
  const ageMatch = wsYamlText.match(/^minimumReleaseAge:\s*(\d+)/m);
  if (ageMatch) minimumReleaseAgeMinutes = Number(ageMatch[1]);

  const excludePatterns = [];
  const lines = wsYamlText.split(/\r?\n/);
  let inExclude = false;
  for (const line of lines) {
    if (/^minimumReleaseAgeExclude:\s*$/.test(line.trimEnd())) {
      inExclude = true;
      continue;
    }
    if (inExclude && /^[a-zA-Z]/.test(line)) {
      inExclude = false;
      continue;
    }
    if (!inExclude) continue;
    const m = line.match(/^\s*-\s*(['"]?)([^'"#\s]+)\1/);
    if (m) excludePatterns.push(m[2]);
  }
  return { minimumReleaseAgeMinutes, excludePatterns };
}

/** Check if a package name matches any pattern in minimumReleaseAgeExclude. */
export function isExcludedFromReleaseAge(pkgName, excludePatterns = []) {
  for (const pat of excludePatterns) {
    const base = pat.includes('@') && !pat.startsWith('@') ? pat.split('@')[0] : pat;
    if (base === pkgName) return true;
    if (base.endsWith('*') && pkgName.startsWith(base.slice(0, -1))) return true;
  }
  return false;
}

/**
 * Update matching package entries (and npm:<name>@ aliases) strictly inside
 * the `overrides:` block of pnpm-workspace.yaml, leaving `allowBuilds:` untouched.
 */
export function updateWorkspaceOverrides(wsYamlText, pkgName, target) {
  const lines = wsYamlText.split(/\r?\n/);
  const eol = wsYamlText.includes('\r\n') ? '\r\n' : '\n';
  let inOverrides = false;
  const escaped = pkgName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const directRe = new RegExp(`^(\\s*['"]?${escaped}['"]?\\s*:\\s*['"]?(?:npm:[^@]+@)?)([^'"\\s#]+)(['"]?.*)$`);
  const aliasRe = new RegExp(`^(\\s*['"]?[^'":\\s]+['"]?\\s*:\\s*['"]?npm:${escaped}@)([^'"\\s#]+)(['"]?.*)$`);

  const out = lines.map((line) => {
    if (/^overrides:\s*$/.test(line.trimEnd())) {
      inOverrides = true;
      return line;
    }
    if (inOverrides && /^[a-zA-Z]/.test(line)) {
      inOverrides = false;
      return line;
    }
    if (!inOverrides) return line;
    if (directRe.test(line)) return line.replace(directRe, `$1${target}$3`);
    if (aliasRe.test(line)) return line.replace(aliasRe, `$1${target}$3`);
    return line;
  });

  return out.join(eol);
}

/** Extract JSON array from taze stdout (ignoring preamble/warnings). */
export function parseTazeJson(rawOutput) {
  if (!rawOutput) return [];
  const start = rawOutput.indexOf('[');
  const end = rawOutput.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) return [];
  try {
    return JSON.parse(rawOutput.slice(start, end + 1));
  } catch {
    return [];
  }
}

/**
 * Classify a single upgrade candidate into a deterministic actionability bucket.
 */
export function classifyCandidate({
  name,
  current,
  target,
  diff,
  publishedAt,
  provenanceDowngraded = false,
  cohortInfo = null,
  waiver = null,
  is24hExcluded = false,
  minimumReleaseAgeMinutes = 1440,
  nowMs = Date.now(),
}) {
  if (provenanceDowngraded) {
    return { bucket: 'UNTRUSTED_PROVENANCE', safeToAutoApply: false, reason: 'npm provenance downgraded' };
  }
  if (waiver) {
    return { bucket: 'HELD_OR_SACRED', safeToAutoApply: false, reason: waiver.reason || 'Waived in dependency-cohorts.mjs' };
  }
  if (cohortInfo?.governance === 'SACRED_INVIOLABLE') {
    return { bucket: 'HELD_OR_SACRED', safeToAutoApply: false, reason: 'Sacred Tier 1 pin (requires explicit approval)' };
  }
  if (publishedAt && !is24hExcluded) {
    const ageMin = (nowMs - new Date(publishedAt).getTime()) / 60000;
    if (Number.isFinite(ageMin) && ageMin < minimumReleaseAgeMinutes) {
      return {
        bucket: 'BLOCKED_24H',
        safeToAutoApply: false,
        reason: `Published ${Math.max(0, Math.round(ageMin / 60))}h ago (< ${Math.round(minimumReleaseAgeMinutes / 60)}h policy)`,
      };
    }
  }
  if (diff === 'major') {
    return { bucket: 'MAJOR_REVIEW', safeToAutoApply: false, reason: 'Major version bump' };
  }
  if (cohortInfo) {
    return { bucket: 'COHORT_SYNC', safeToAutoApply: true, reason: `Cohort: ${cohortInfo.cohortName}` };
  }
  return { bucket: 'SAFE_PATCH_MINOR', safeToAutoApply: true, reason: `Safe ${diff || 'minor/patch'} update` };
}

function runTazeScan(rootDir, mode = 'default') {
  const args = [
    'pnpm',
    'dlx',
    'taze',
    ...(mode === 'major' ? ['major'] : []),
    '-r',
    '-l',
    '--json',
    '--no-node-version',
    '--ignore-paths',
    '"**/.tmp-worktrees/**,**/native-capabilities/**"',
  ];
  try {
    const out = execSync(args.join(' '), {
      cwd: rootDir,
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
      shell: process.platform === 'win32',
      timeout: 120000,
    });
    return parseTazeJson(out);
  } catch (err) {
    return parseTazeJson(err.stdout || '');
  }
}

async function fetchNpmDistTags(pkgName) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`https://registry.npmjs.org/${pkgName}`, {
      headers: { Accept: 'application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8' },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    return { distTags: data['dist-tags'] || {}, modified: data.time || {} };
  } catch {
    return null;
  }
}

/** Collect all workspace package.json declarations for radar scanning. */
function collectWorkspacePackages(rootDir) {
  const files = fastScanFiles(['apps', 'packages', 'tooling'], {
    extensions: ['json'],
    excludes: ['node_modules', 'dist', 'build', '.turbo', '.next', '.expo'],
    absolute: true,
  }).filter((f) => path.basename(f) === 'package.json');
  const rootPkg = path.join(rootDir, 'package.json');
  if (existsSync(rootPkg) && !files.includes(rootPkg)) files.unshift(rootPkg);

  const pkgMap = new Map();
  for (const file of files) {
    try {
      const json = JSON.parse(readFileSync(file, 'utf8'));
      const rel = path.relative(rootDir, file).replace(/\\/g, '/');
      for (const section of ['dependencies', 'devDependencies']) {
        for (const [name, ver] of Object.entries(json[section] || {})) {
          if (ver.startsWith('workspace:') || ver.startsWith('link:')) continue;
          if (!pkgMap.has(name)) pkgMap.set(name, []);
          pkgMap.get(name).push({ file: rel, pkgName: json.name || rel, section, version: ver });
        }
      }
    } catch {}
  }
  return pkgMap;
}

/**
 * Full consolidated scan: taze (minor/patch + major), cohorts, 24h guard, toolchain, and prerelease radar.
 */
export async function scanDependencies({ rootDir = DEFAULT_ROOT, includePrerelease = true } = {}) {
  const startedAt = Date.now();
  const cohortLookup = getCohortLookup();
  const wsYamlPath = path.join(rootDir, 'pnpm-workspace.yaml');
  const wsYamlText = existsSync(wsYamlPath) ? readFileSync(wsYamlPath, 'utf8') : '';
  const { minimumReleaseAgeMinutes, excludePatterns } = parseMinimumReleaseAgeConfig(wsYamlText);

  const [minorPatchScan, majorScan] = [runTazeScan(rootDir, 'default'), runTazeScan(rootDir, 'major')];
  const mergedMap = new Map();

  const ingest = (scanList) => {
    for (const pkg of scanList) {
      const rel = (pkg.relative || '').replace(/\\/g, '/');
      if (rel.startsWith('.tmp-worktrees/') || rel.startsWith('native-capabilities/')) continue;
      for (const dep of pkg.resolved || []) {
        if (!dep.targetVersion || dep.currentVersion === dep.targetVersion) continue;
        const existing = mergedMap.get(dep.name) || {
          name: dep.name,
          current: dep.currentVersion,
          target: dep.targetVersion,
          diff: dep.diff,
          publishedAt: dep.publishedAt || null,
          provenanceDowngraded: Boolean(dep.provenance && String(dep.provenance).includes('untrusted')),
          sources: [],
        };
        // Prefer higher target if major scan found a newer version
        if (semver.valid(semver.coerce(dep.targetVersion)) && semver.valid(semver.coerce(existing.target))) {
          if (semver.gt(semver.coerce(dep.targetVersion), semver.coerce(existing.target))) {
            existing.target = dep.targetVersion;
            existing.diff = dep.diff;
            existing.publishedAt = dep.publishedAt || existing.publishedAt;
          }
        }
        existing.sources.push({ file: rel, pkgName: pkg.name || rel, current: dep.currentVersion });
        mergedMap.set(dep.name, existing);
      }
    }
  };

  ingest(minorPatchScan);
  ingest(majorScan);

  const candidates = [];
  for (const item of mergedMap.values()) {
    const cohortInfo = cohortLookup.get(item.name) || null;
    const waiver = DEPENDENCY_WAIVERS[item.name] || null;
    const is24hExcluded = isExcludedFromReleaseAge(item.name, excludePatterns);
    const classification = classifyCandidate({
      name: item.name,
      current: item.current,
      target: item.target,
      diff: item.diff,
      publishedAt: item.publishedAt,
      provenanceDowngraded: item.provenanceDowngraded,
      cohortInfo,
      waiver,
      is24hExcluded,
      minimumReleaseAgeMinutes,
    });
    candidates.push({
      ...item,
      cohortId: cohortInfo?.cohortId || null,
      cohortName: cohortInfo?.cohortName || null,
      is24hExcluded,
      ...classification,
    });
  }

  // Prerelease radar for key workspace & cohort packages (catches next/beta/canary like @swmansion/argent)
  const prereleases = [];
  if (includePrerelease) {
    const workspacePkgs = collectWorkspacePackages(rootDir);
    const probeSet = new Set([
      ...Object.keys(DEPENDENCY_COHORTS.SACRED_NATIVE.packages),
      ...Object.keys(DEPENDENCY_COHORTS.ORPC_FOUNDATION.packages),
      '@swmansion/argent',
      'xstate',
      'drizzle-orm',
      'expo',
      'react-native',
      'react-native-screens',
    ]);
    const probes = Array.from(probeSet).filter((n) => workspacePkgs.has(n));
    await Promise.all(
      probes.map(async (name) => {
        const info = await fetchNpmDistTags(name);
        if (!info) return;
        const { distTags } = info;
        const latest = distTags.latest;
        const current = workspacePkgs.get(name)?.[0]?.version || '';
        const coercedCur = semver.coerce(current);
        for (const tag of ['next', 'beta', 'rc', 'canary']) {
          const cand = distTags[tag];
          if (!cand || !semver.valid(cand)) continue;
          if ((latest && semver.valid(latest) && semver.gt(cand, latest)) || (coercedCur && semver.gt(cand, coercedCur))) {
            prereleases.push({
              name,
              current,
              latest: latest || 'n/a',
              preview: cand,
              previewTag: tag,
              sources: workspacePkgs.get(name),
            });
            break;
          }
        }
      })
    );
  }

  // Toolchain summary
  const nvmrcPath = path.join(rootDir, '.nvmrc');
  const rootPkg = JSON.parse(readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  const toolchain = {
    node: existsSync(nvmrcPath) ? readFileSync(nvmrcPath, 'utf8').trim() : null,
    pnpm: rootPkg.packageManager || null,
  };

  return {
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    minimumReleaseAgeMinutes,
    toolchain,
    summary: {
      totalUpdates: candidates.length,
      safeCount: candidates.filter((c) => c.safeToAutoApply).length,
      heldOrSacredCount: candidates.filter((c) => c.bucket === 'HELD_OR_SACRED').length,
      blocked24hCount: candidates.filter((c) => c.bucket === 'BLOCKED_24H').length,
      majorCount: candidates.filter((c) => c.bucket === 'MAJOR_REVIEW').length,
      untrustedCount: candidates.filter((c) => c.bucket === 'UNTRUSTED_PROVENANCE').length,
      prereleaseCount: prereleases.length,
    },
    candidates,
    prereleases,
  };
}

function runCommandAsync(cmd, args, cwd, onLog) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, shell: process.platform === 'win32' });
    child.stdout.on('data', (d) => onLog?.(d.toString()));
    child.stderr.on('data', (d) => onLog?.(d.toString()));
    child.on('close', (code) => resolve(code === 0));
  });
}

/**
 * Apply approved package selections, update cohorts & 24h exclusions, then run harmonize + install + checks.
 */
export async function applyUpgrades({
  rootDir = DEFAULT_ROOT,
  selections = [],
  exclude24h = [],
  onProgress = () => {},
} = {}) {
  const cohortLookup = getCohortLookup();
  const cohortsPath = path.join(rootDir, 'scripts', 'lib', 'dependency-cohorts.mjs');
  let cohortsText = readFileSync(cohortsPath, 'utf8');
  let cohortsChanged = false;

  const wsYamlPath = path.join(rootDir, 'pnpm-workspace.yaml');
  let wsYamlText = readFileSync(wsYamlPath, 'utf8');
  let wsChanged = false;

  // 1. Add requested 24h exclusions to pnpm-workspace.yaml
  for (const pkgName of exclude24h) {
    if (!wsYamlText.includes(`'${pkgName}'`) && !wsYamlText.includes(`"${pkgName}"`)) {
      wsYamlText = wsYamlText.replace(
        /^minimumReleaseAgeExclude:\s*\r?\n/m,
        `minimumReleaseAgeExclude:\n  - '${pkgName}'\n`
      );
      wsChanged = true;
    }
  }

  // 2. Apply package version updates
  for (const sel of selections) {
    const { name, target, sources = [] } = sel;
    if (!name || !target) continue;

    // Handle toolchain SSoT updates dynamically (.nvmrc / packageManager)
    if (name === 'node') {
      writeFileSync(path.join(rootDir, '.nvmrc'), `${target.replace(/^v/, '')}\n`, 'utf8');
      continue;
    }
    if (name === 'pnpm') {
      const rootPkgPath = path.join(rootDir, 'package.json');
      const rootPkg = JSON.parse(readFileSync(rootPkgPath, 'utf8'));
      rootPkg.packageManager = `pnpm@${target.replace(/^[\^~]/, '')}`;
      writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2) + '\n', 'utf8');
      continue;
    }

    if (cohortLookup.has(name)) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(['"]${escaped}['"]\\s*:\\s*['"])([^'"]+)(['"])`, 'g');
      const nextText = cohortsText.replace(re, `$1${target}$3`);
      if (nextText !== cohortsText) {
        cohortsText = nextText;
        cohortsChanged = true;
      }
    }

    // Also update matching pnpm-workspace.yaml overrides (scoped strictly to overrides: block)
    const nextWsText = updateWorkspaceOverrides(wsYamlText, name, target);
    if (nextWsText !== wsYamlText) {
      wsYamlText = nextWsText;
      wsChanged = true;
    }

    for (const src of sources) {
      if (!src.file || src.file === 'pnpm-workspace.yaml') continue;
      const manifestPath = path.join(rootDir, src.file);
      if (!existsSync(manifestPath)) continue;
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
      let touched = false;
      for (const sec of ['dependencies', 'devDependencies']) {
        if (manifest[sec]?.[name]) {
          manifest[sec][name] = target;
          touched = true;
        }
      }
      if (touched) writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    }
  }

  if (cohortsChanged) writeFileSync(cohortsPath, cohortsText, 'utf8');
  if (wsChanged) writeFileSync(wsYamlPath, wsYamlText, 'utf8');

  const steps = [
    { label: 'Sync toolchain SSoT', cmd: 'node', args: ['scripts/sync-toolchain.mjs'] },
    { label: 'Harmonize ecosystem cohorts', cmd: 'node', args: ['scripts/harmonize-dependencies.mjs', '--write'] },
    { label: 'Install lockfile', cmd: 'pnpm', args: ['install', '--no-frozen-lockfile'] },
    { label: 'Verify cohort harmony', cmd: 'node', args: ['scripts/harmonize-dependencies.mjs', '--check'] },
    { label: 'Verify toolchain drift', cmd: 'node', args: ['scripts/sync-toolchain.mjs', '--check'] },
  ];

  for (const step of steps) {
    onProgress({ step: step.label, status: 'running' });
    const ok = await runCommandAsync(step.cmd, step.args, rootDir, (line) => onProgress({ log: line }));
    if (!ok) {
      onProgress({ step: step.label, status: 'failed' });
      return { ok: false, failedStep: step.label };
    }
    onProgress({ step: step.label, status: 'done' });
  }

  return { ok: true };
}
