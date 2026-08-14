#!/usr/bin/env node
/**
 * Run the font-scaling audit through the Expo/Jest transform.
 *
 * React Native contains Flow syntax and cannot be imported by plain Node. This
 * wrapper deliberately delegates to the repository's Jest preset so the audit
 * exercises the same React Native/Web transform used by screen tests.
 */

import { spawnSync } from 'node:child_process';

const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const result = spawnSync(
  command,
  [
    'exec',
    'jest',
    '--config',
    'jest.config.js',
    'src/__tests__/fontScalingAudit.test.tsx',
    '--runInBand',
  ],
  { stdio: 'inherit', shell: process.platform === 'win32' },
);

if (result.error) {
  console.error(`Unable to start the font-scaling audit: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
