/**
 * scripts/lib/fast-scan.mjs
 *
 * Universal High-Velocity Multi-Surface Code File Scanner.
 * Bridges native Rust `fd` (fd-find) with deterministic fallback to recursive fs walks.
 * Eliminates serial Windows file-metadata bottlenecks across all monorepo sentinels.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { checkShinyTool } from './shiny-tools.mjs';

const ROOT_DIR = process.cwd();

export const DEFAULT_EXCLUDES = [
  'node_modules',
  'dist',
  'build',
  '.turbo',
  '.expo',
  '.next',
  '.git',
  '.agents',
  '.vscode',
  'out',
  'coverage',
  '.system_generated',
  'artifacts',
];

export const CODE_EXTENSIONS = ['ts', 'tsx', 'js', 'jsx', 'zmodel', 'sql', 'css'];

/**
 * Rapidly discover code files across one or more target directory roots.
 *
 * @param {string|string[]} targets - Target directory or array of directories (relative to monorepo root)
 * @param {object} options
 * @param {string[]} [options.extensions] - Array of extension strings (without leading dot)
 * @param {string[]} [options.excludes] - Folder names to skip
 * @param {boolean} [options.absolute=false] - Return absolute paths instead of paths relative to ROOT_DIR
 * @returns {string[]} Discovered file paths
 */
export function fastScanFiles(targets, {
  extensions = CODE_EXTENSIONS,
  excludes = DEFAULT_EXCLUDES,
  absolute = false,
} = {}) {
  const targetList = Array.isArray(targets) ? targets : [targets];
  const validTargets = targetList
    .map((t) => (path.isAbsolute(t) ? t : path.join(ROOT_DIR, t)))
    .filter((p) => fs.existsSync(p));

  if (validTargets.length === 0) return [];

  const fdStatus = checkShinyTool('fd');

  // 1. Rust Fast Path via `fd`
  if (fdStatus.installed) {
    try {
      const extArgs = [];
      for (const ext of extensions) {
        extArgs.push('-e', ext.replace(/^\./, ''));
      }

      const excArgs = [];
      for (const exc of excludes) {
        excArgs.push('-E', exc);
      }

      const args = ['.', ...extArgs, ...excArgs, '--type', 'f', ...validTargets];
      const output = execFileSync(fdStatus.binary || 'fd', args, {
        encoding: 'utf8',
        maxBuffer: 50 * 1024 * 1024,
        stdio: ['pipe', 'pipe', 'ignore'],
      });

      const results = [];
      for (const line of output.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        results.push(absolute ? path.resolve(trimmed) : path.relative(ROOT_DIR, trimmed));
      }

      if (results.length > 0) {
        return results;
      }
    } catch {
      // Fall through to JS recursive walker
    }
  }

  // 2. Pure Node.js Fallback
  const excludeSet = new Set(excludes);
  const extSet = new Set(extensions.map((e) => `.${e.replace(/^\./, '').toLowerCase()}`));
  const results = [];

  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (excludeSet.has(entry.name) || entry.isSymbolicLink()) continue;

      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (extSet.has(ext)) {
          results.push(absolute ? fullPath : path.relative(ROOT_DIR, fullPath));
        }
      }
    }
  }

  for (const t of validTargets) {
    walk(t);
  }

  return results;
}
