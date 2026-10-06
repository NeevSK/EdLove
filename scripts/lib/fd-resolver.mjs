import { execSync } from 'node:child_process';
import fs from 'node:fs';

/**
 * Resolve a usable `fd` command, or null when `fd` is unavailable.
 *
 * Resolution order is intentionally platform-neutral:
 *   1. `FD_BIN` environment variable (explicit override, verified to exist)
 *   2. `fd` on PATH
 *
 * Callers must supply their own pure-Node fallback when this returns null, so
 * auditing scripts keep working on Windows, Linux and macOS without `fd`
 * installed. Never hardcode a per-user absolute binary path here: it works for
 * exactly one developer and silently degrades for every other contributor.
 */
export function resolveFdCommand() {
  const override = process.env.FD_BIN;
  if (override) {
    if (!fs.existsSync(override)) {
      throw new Error(`FD_BIN is set but does not exist: ${override}`);
    }
    return `"${override}"`;
  }

  try {
    execSync('fd --version', { stdio: 'ignore' });
    return 'fd';
  } catch {
    return null;
  }
}