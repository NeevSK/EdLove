import { defineConfig } from 'vitest/config';
import base from './vitest.config.ts';

export default defineConfig({
  ...base,
  test: {
    ...base.test,
    setupFiles: [],
    include: ['src/__tests__/integration/canonical-account.pg.test.ts'],
    exclude: ['**/node_modules/**'],
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
