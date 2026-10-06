import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(scriptsDir, '..', '..');

/**
 * Resolve the Linux-ext4 working copy inside WSL2.
 *
 * Contributors differ in username, distro and layout, so nothing may be
 * hardcoded to a single machine. Override with `POLYMATH_WSL_DIR` when your
 * workspace lives elsewhere, e.g.
 *   POLYMATH_WSL_DIR=~/src/polymath pnpm run build:android
 *
 * The default deliberately mirrors this repo's documented convention
 * (`~/projects/<repo>`) rather than any individual's home directory.
 */
export function resolveWslWorkspace() {
  return process.env.POLYMATH_WSL_DIR || '$HOME/projects/polymath-platform';
}

/**
 * Convert a Windows absolute path into its WSL `/mnt/<drive>/...` form so the
 * Windows checkout can be read directly by `rsync` inside the distro. Falls
 * back to the repo root when the script is itself already running on Linux.
 */
export function toWslPath(absolutePath) {
  const normalized = path.resolve(absolutePath);

  if (path.sep !== '\\') return normalized;

  const driveLetter = normalized[0];
  if (!/[a-zA-Z]/.test(driveLetter)) {
    throw new Error(`toWslPath expects a Windows drive path, received: ${normalized}`);
  }

  const rest = normalized.slice(2).split(path.sep).filter(Boolean).join('/');
  return `/mnt/${driveLetter.toLowerCase()}/${rest}`;
}