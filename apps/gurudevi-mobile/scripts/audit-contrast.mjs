#!/usr/bin/env node
/** Run the contrast audit through the Expo/Jest transform. */

import { spawnSync } from 'node:child_process';

const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const result = spawnSync(
  command,
  [
    'exec',
    'jest',
    '--config',
    'jest.config.js',
    'src/__tests__/contrastAudit.test.ts',
    '--runInBand',
  ],
  { stdio: 'inherit', shell: process.platform === 'win32' },
);

if (result.error) {
  console.error(`Unable to start the contrast audit: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
