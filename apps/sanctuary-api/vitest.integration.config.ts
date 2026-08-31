import { defineConfig } from 'vitest/config';
import path from 'node:path';

const configDirectory = import.meta.dirname;

export default defineConfig({
  test: {
    name: 'integration',
    include: ['src/__tests__/integration/**/*.integration.test.ts'],
    environment: 'node',
    testTimeout: 60000,
    hookTimeout: 30000,
    setupFiles: ['src/__tests__/integration-setup.ts'],
    globals: true,
    pool: 'forks',
    singleFork: true,
    reporters: ['verbose'],
    coverage: {
      enabled: false,
    },
  },
  resolve: {
    alias: {
      '@repo/core': path.resolve(configDirectory, '../../packages/core/src'),
      '@repo/database': path.resolve(configDirectory, '../../packages/database/src'),
      '@repo/policies': path.resolve(configDirectory, '../../packages/policies/src'),
    },
  },
});
