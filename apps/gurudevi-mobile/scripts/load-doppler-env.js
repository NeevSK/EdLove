#!/usr/bin/env node
/**
 * Verify the mobile Doppler contract without writing secrets to disk.
 * Runtime scripts use `doppler run`, so this command is intentionally a
 * names-only check rather than a `.env` generator.
 */

import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const result = spawnSync(
  process.execPath,
  [resolve(root, 'scripts/verify-doppler-config.mjs'), '--scope', 'mobile'],
  { cwd: root, stdio: 'inherit', shell: false },
);

process.exit(result.status ?? 1);
