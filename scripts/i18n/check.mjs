#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const checks = ['scripts/i18n/audit-keys.mjs', 'scripts/i18n/check-inline-fallbacks.js'];

for (const check of checks) {
  const result = spawnSync(process.execPath, [check], { stdio: 'inherit' });
  if (result.error) {
    console.error(`Unable to run ${check}: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log('\n✅ i18n checks passed.');
