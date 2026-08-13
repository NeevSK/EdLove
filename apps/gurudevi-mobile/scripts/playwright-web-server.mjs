import { spawnSync } from 'node:child_process';

const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const result = spawnSync(
  command,
  [
    'exec',
    'cross-env',
    'NODE_OPTIONS=--max-old-space-size=8192',
    'expo',
    'export',
    '-p',
    'web',
    '--output-dir',
    'dist',
  ],
  { stdio: 'inherit', shell: process.platform === 'win32' },
);

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

await import('./serve-dist.mjs');
