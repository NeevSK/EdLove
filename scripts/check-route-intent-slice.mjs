import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const paths = [
  'apps/gurudevi-mobile/src/providers/DeepLinkProvider.tsx',
  'apps/gurudevi-web/app/(sanctuary)/qr/page.tsx',
  'packages/core/src/logic/deeplink/deepLinkPolicyPipeline.ts',
  'packages/core/src/logic/utils/QRResolver.ts',
  'packages/scanner-kit/src/hooks/useQRDeepLink.ts',
];

const pnpm = 'pnpm';

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  });
}

function sourceDiff(path) {
  try {
    execFileSync('git', ['ls-files', '--error-unmatch', '--', path], { stdio: 'ignore' });
    return execFileSync('git', ['diff', '--unified=0', '--', path], { encoding: 'utf8' });
  } catch {
    if (!existsSync(path)) {
      throw new Error(`Route-intent slice path does not exist: ${path}`);
    }

    try {
      return execFileSync('git', ['diff', '--no-index', '--unified=0', '--', '/dev/null', path], {
        encoding: 'utf8',
      });
    } catch (error) {
      // git diff --no-index intentionally exits 1 when it finds the new file.
      if (typeof error.stdout === 'string' && error.stdout.includes('+++')) return error.stdout;
      throw error;
    }
  }
}

const diff = paths.map(sourceDiff).join('\n');

if (!diff.includes('+++ b/')) {
  throw new Error('Route-intent slice gate received no added source lines. Refuse to pass.');
}

const reports = [
  ['route-intent-core-contract', 'G0', 'pnpm --filter @repo/core exec vitest run src/logic/deeplink/__tests__/deepLinkPolicyPipeline.test.ts src/logic/utils/__tests__/QRResolver.test.ts'],
  ['route-intent-scanner-boundary', 'G1', 'pnpm --filter @repo/scanner-kit exec vitest run src/hooks/useQRDeepLink.test.ts'],
  ['route-intent-mobile-provider', 'G3', 'pnpm --filter gurudevi-mobile exec vitest run src/__tests__/providers/DeepLinkProvider.test.tsx'],
];

for (const [name, evidenceLevel, command] of reports) {
  run(process.execPath, ['scripts/run-and-report.mjs', '--cmd', command, '--name', name, '--evidence-level', evidenceLevel]);
}

run(pnpm, ['--filter', '@repo/core', 'exec', 'eslint', 'src/logic/deeplink/deepLinkPolicyPipeline.ts', 'src/logic/utils/QRResolver.ts']);
run(pnpm, ['--filter', '@repo/scanner-kit', 'exec', 'eslint', 'src/hooks/useQRDeepLink.ts']);
run(pnpm, ['--filter', 'gurudevi-mobile', 'exec', 'eslint', 'src/providers/DeepLinkProvider.tsx']);
run(pnpm, ['--filter', 'gurudevi-web', 'exec', 'eslint', 'app/(sanctuary)/qr/page.tsx']);
run(pnpm, ['exec', 'jscpd', ...paths, '--min-lines', '8', '--min-tokens', '50', '--reporters', 'console']);

console.log('Route-intent slice gate complete.');
