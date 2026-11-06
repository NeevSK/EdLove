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
  test: {
    environment: 'node',
    include: ['src/**/*.integration.ts'],
    // The acknowledged isolated fixture runs through the managed PostgreSQL
    // pooler; its sequential authority checks need more than the loopback budget.
    // Server-side statement and lock deadlines remain independently bounded.
    testTimeout: 60000,
    hookTimeout: 60000,
    fileParallelism: false,
    passWithNoTests: false,
  },
});
