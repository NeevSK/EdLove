import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/*/vitest.config.ts',
  'apps/sanctuary-api/vitest.config.ts',
  'apps/gurudevi-mobile/vitest.config.mts',
  'apps/edlove-web/vitest.config.ts',
  'apps/gurudevi-marketingWeb/vitest.config.ts',
]);
