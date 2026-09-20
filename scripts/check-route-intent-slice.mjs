import { execFileSync } from 'node:child_process';

const paths = [
  'apps/gurudevi-mobile/src/providers/DeepLinkProvider.tsx',
  'apps/gurudevi-web/app/(sanctuary)/qr/page.tsx',
  'packages/core/src/logic/deeplink/deepLinkPolicyPipeline.ts',
  'packages/core/src/logic/utils/QRResolver.ts',
  'packages/scanner-kit/src/hooks/useQRDeepLink.ts',
];

const diff = execFileSync('git', ['diff', '--unified=0', '--', ...paths], {
  encoding: 'utf8',
});

if (!diff.includes('+++ b/')) {
  throw new Error('Route-intent slice gate received no added source lines. Refuse to pass.');
}

execFileSync(
  'pnpm',
  ['exec', 'jscpd', ...paths, '--min-lines', '8', '--min-tokens', '50', '--reporters', 'console'],
  { stdio: 'inherit' },
);
