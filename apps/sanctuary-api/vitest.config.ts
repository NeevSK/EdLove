import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
export default defineConfig({
  resolve: {
    alias: {
      '@repo/core/api/v1': fileURLToPath(
        new URL('../../packages/core/src/api/v1', import.meta.url),
      ),
    },
  },
  test: { environment: 'node', include: ['src/**/*.test.ts'], testTimeout: 10000 },
});
