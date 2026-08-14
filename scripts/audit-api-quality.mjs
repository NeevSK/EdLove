#!/usr/bin/env node

/**
 * Production API quality gate.
 *
 * This intentionally combines independent evidence sources. A passing unit
 * suite alone cannot prove that every route is composed, authorized, typed,
 * and safe to expose.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checks = [
  ['composition', process.execPath, ['scripts/audit-api-composition.mjs']],
  ['error taxonomy', process.execPath, ['scripts/audit-api-errors.mjs']],
  ['authorization parity', process.execPath, ['scripts/check-authorization-parity.mjs']],
  ['data boundaries', process.execPath, ['scripts/audit-data-boundaries.mjs']],
  [
    'typed contracts',
    // pnpm.exe is available in the managed toolchain on Windows; using the
    // executable avoids spawnSync treating the PowerShell shim as a shell.
    'pnpm',
    [
      '--filter',
      '@repo/sanctuary-api',
      'exec',
      'tsx',
      '--tsconfig',
      '../../tsconfig.json',
      '../../scripts/audit-api-contracts.ts',
    ],
  ],
];

const failures = [];
for (const [name, command, args] of checks) {
  console.log(`\n[api-quality] ${name}`);
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', env: process.env });
  if (result.error || result.status !== 0) {
    failures.push(name);
  }
}

if (failures.length) {
  console.error(`\nAPI quality gate failed: ${failures.join(', ')}.`);
  process.exit(1);
}

console.log(
  '\nAPI quality gate passed: composition, errors, authorization, boundaries, and contracts.',
);
