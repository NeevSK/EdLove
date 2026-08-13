#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const [command, ...commandArgs] = process.argv.slice(2);
if (!command) {
  console.error('Usage: node scripts/with-dotenv-fallback.mjs <command> [args...]');
  process.exit(2);
}

const result = spawnSync(command, commandArgs, {
  env: { ...process.env, ALLOW_DOTENV_FALLBACK: 'true' },
  stdio: 'inherit',
  shell: false,
});

if (result.error) {
  console.error(`Unable to start ${command}: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
