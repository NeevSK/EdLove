import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from '@repo/platform-mcp/utils/constants.js';

export interface NormalizedTargetInfo {
  input: string;
  normalized: string;
  relativeToRoot: string;
  exists: boolean;
  kind: 'repo-root' | 'package' | 'app' | 'directory' | 'file' | 'unknown';
  withinRepo: boolean;
  notes: string[];
}

function stripWrappingQuotes(value: string) {
  return value.replace(/^['"]+|['"]+$/g, '').trim();
}

function detectAliasCandidate(clean: string): string | null {
  if (clean.startsWith('@repo/')) {
    return path.join(ROOT_DIR, 'packages', clean.slice('@repo/'.length));
  }

  if (clean.startsWith('@app/')) {
    return path.join(ROOT_DIR, 'apps', clean.slice('@app/'.length));
  }

  if (clean.startsWith('packages/') || clean.startsWith('packages\\')) {
    return path.join(ROOT_DIR, clean);
  }

  if (clean.startsWith('apps/') || clean.startsWith('apps\\')) {
    return path.join(ROOT_DIR, clean);
  }

  const packageCandidate = path.join(ROOT_DIR, 'packages', clean);
  if (fs.existsSync(packageCandidate)) {
    return packageCandidate;
  }

  const appCandidate = path.join(ROOT_DIR, 'apps', clean);
  if (fs.existsSync(appCandidate)) {
    return appCandidate;
  }

  return null;
}

function classifyPath(normalized: string): NormalizedTargetInfo['kind'] {
  if (normalized === ROOT_DIR) return 'repo-root';
  if (!fs.existsSync(normalized)) return 'unknown';

  const stats = fs.statSync(normalized);
  if (stats.isFile()) return 'file';

  const relative = path.relative(ROOT_DIR, normalized).replace(/\\/g, '/');
  if (relative.startsWith('packages/')) return 'package';
  if (relative.startsWith('apps/')) return 'app';
  return 'directory';
}

export function describeTarget(target?: string | null): NormalizedTargetInfo {
  const input = String(target ?? '').trim();
  const notes: string[] = [];

  if (
    !input ||
    input === '.' ||
    input === './' ||
    input === '.\\' ||
    input === 'undefined' ||
    input === 'null'
  ) {
    return {
      input,
      normalized: ROOT_DIR,
      relativeToRoot: '.',
      exists: true,
      kind: 'repo-root',
      withinRepo: true,
      notes: ['Empty or dot target resolved to repository root.'],
    };
  }

  const clean = stripWrappingQuotes(input);
  const aliasCandidate = detectAliasCandidate(clean);
  const normalized = path.resolve(
    aliasCandidate ?? (path.isAbsolute(clean) ? clean : path.join(ROOT_DIR, clean)),
  );
  const withinRepo = normalized === ROOT_DIR || normalized.startsWith(`${ROOT_DIR}${path.sep}`);
  const exists = fs.existsSync(normalized);

  if (aliasCandidate) {
    notes.push('Alias-like target resolved through workspace conventions.');
  }
  if (!withinRepo) {
    notes.push('Resolved path is outside the repository root.');
  }
  if (!exists) {
    notes.push('Resolved path does not currently exist.');
  }

  return {
    input,
    normalized,
    relativeToRoot: withinRepo ? path.relative(ROOT_DIR, normalized) || '.' : normalized,
    exists,
    kind: classifyPath(normalized),
    withinRepo,
    notes,
  };
}

/**
 * --- Alchemist's Transmutation: Path Sovereignty ---
 * Normalizes package aliases (@repo/*, @app/*) to absolute filesystem paths.
 */
export function normalizeTarget(target?: string | null): string {
  return describeTarget(target).normalized;
}

/**
 * The "Hunter" Logic: Scouts for the report in ordered and unordered locations.
 */
export function findSurgicalReport(filename: string, packageShortName: string): string {
  const candidates = [
    path.join(ROOT_DIR, 'reports', filename),
    path.join(ROOT_DIR, 'packages', packageShortName, filename),
    path.join(ROOT_DIR, filename),
    path.join(ROOT_DIR, 'packages', packageShortName, 'reports', filename),
    path.join(ROOT_DIR, 'apps', packageShortName, filename),
    path.join(ROOT_DIR, 'apps', packageShortName, 'reports', filename),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      console.error(`>>> Discovery: Found report at ${candidate}`);
      return fs.readFileSync(candidate, 'utf-8');
    }
  }

  return 'Discovery failed: Surgical report could not be found in any candidate location.';
}

export function readReport(filename: string): string {
  const reportPath = path.join(ROOT_DIR, 'reports', filename);
  if (fs.existsSync(reportPath)) return fs.readFileSync(reportPath, 'utf-8');

  const fallback = path.join(ROOT_DIR, filename);
  return fs.existsSync(fallback) ? fs.readFileSync(fallback, 'utf-8') : 'Report not found.';
}
