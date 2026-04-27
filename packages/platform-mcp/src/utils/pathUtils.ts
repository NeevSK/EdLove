import fs from 'fs';
import path from 'path';
import { ROOT_DIR } from './constants.js';

/**
 * --- Alchemist's Transmutation: Path Sovereignty ---
 * Normalizes package aliases (@repo/*, @app/*) to absolute filesystem paths.
 */
export function normalizeTarget(target: string): string {
  const clean = target.replace(/^['"]|['"]$/g, ''); // Remove accidental quotes

  if (clean.startsWith('@repo/')) {
    const pkgPath = clean.replace('@repo/', '');
    const parts = pkgPath.split(/[/\\]/).filter((p) => p);
    const pkgName = parts[0];
    const rest = parts.slice(1);
    const base = path.join(ROOT_DIR, 'packages', pkgName);

    if (rest.length > 0) {
      return path.join(base, ...rest);
    }
    return base;
  }

  if (clean.startsWith('@app/')) {
    const appPath = clean.replace('@app/', '');
    const parts = appPath.split(/[/\\]/).filter((p) => p);
    const appName = parts[0];
    const rest = parts.slice(1);
    const base = path.join(ROOT_DIR, 'apps', appName);

    if (rest.length > 0) {
      return path.join(base, ...rest);
    }
    return base;
  }

  if (path.isAbsolute(clean)) return clean;

  // Fallback: Check if it's a naked package or app name
  const pkgPath = path.join(ROOT_DIR, 'packages', clean);
  if (fs.existsSync(pkgPath)) return pkgPath;

  const appPath = path.join(ROOT_DIR, 'apps', clean);
  if (fs.existsSync(appPath)) return appPath;

  return path.join(ROOT_DIR, clean);
}

/**
 * The "Hunter" Logic: Scouts for the report in ordered and unordered locations.
 */
export function findSurgicalReport(filename: string, packageShortName: string): string {
  const candidates = [
    path.join(ROOT_DIR, 'reports', filename), // 1. Global reports (ORDERED - PRIMARY)
    path.join(ROOT_DIR, 'packages', packageShortName, filename), // 2. Package root
    path.join(ROOT_DIR, filename), // 3. Root (LURKING/STALE - FALLBACK)
    path.join(ROOT_DIR, 'packages', packageShortName, 'reports', filename), // Package reports
    path.join(ROOT_DIR, 'apps', packageShortName, filename), // App root
    path.join(ROOT_DIR, 'apps', packageShortName, 'reports', filename), // App reports
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      console.error(`>>> Discovery: Found report at ${p}`);
      return fs.readFileSync(p, 'utf-8');
    }
  }

  return 'Discovery failed: Surgical report could not be found in any candidate location.';
}

export function readReport(filename: string): string {
  const p = path.join(ROOT_DIR, 'reports', filename);
  if (fs.existsSync(p)) return fs.readFileSync(p, 'utf-8');

  // Fallback search for general reports
  const fallback = path.join(ROOT_DIR, filename);
  return fs.existsSync(fallback) ? fs.readFileSync(fallback, 'utf-8') : 'Report not found.';
}
