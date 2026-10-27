#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const steps = [];
for (const name of [
  'verger-core',
  'verger-react',
  'verger-react-native',
  'verger-android',
  'verger-web',
]) {
  steps.push([`tsc ${name}`, `packages/${name}`, ['tsc', '--noEmit', '-p', '.']]);
}
for (const name of ['verger-core', 'verger-android', 'verger-web']) {
  steps.push([`test ${name}`, `packages/${name}`, ['vitest', 'run']]);
}
steps.push(
  ['test Gurudevi host', 'packages/core', ['vitest', 'run', 'src/verger']],
  [
    'test UI context',
    'packages/ui',
    [
      'vitest',
      'run',
      '--config',
      'vitest.config.mts',
      'src/context/__tests__',
      'src/components/__tests__/Skeleton.verger.test.tsx',
      'src/components/__tests__/SovereignVirtualList.verger.test.tsx',
    ],
  ],
  [
    'test mobile runtime',
    'apps/gurudevi-mobile',
    [
      'vitest',
      'run',
      'src/__tests__/runtime',
      'src/__tests__/architecture/efficiency-policy-boundaries.test.ts',
    ],
  ],
  [
    'test web Verger',
    'apps/gurudevi-web',
    [
      'vitest',
      'run',
      'tests/integration/gurudeviWebVerger.test.tsx',
      'tests/integration/workspaceWallpaperLayer.test.tsx',
      'tests/integration/vergerLab.test.tsx',
    ],
  ],
);

let failed = false;
for (const [name, directory, args] of steps) {
  // Simulator suites compete for CPU when each test file starts a worker.
  const commandArgs = args[0] === 'vitest' ? [...args, '--maxWorkers=2'] : args;
  const result = spawnSync(
    process.env.npm_execpath ?? 'pnpm',
    ['--dir', directory, 'exec', ...commandArgs],
    {
      cwd: root,
      stdio: 'inherit',
    },
  );
  const passed = result.status === 0;
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${name}`);
  if (result.error) console.error(result.error);
  if (!passed) failed = true;
}
console.log(`ALL_PASS=${failed ? 0 : 1}`);
process.exitCode = failed ? 1 : 0;
