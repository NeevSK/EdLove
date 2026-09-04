import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
    test: {
    fsModuleCache: true,
    sharedViteServer: true,
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    tags: [
      { name: 'analytics', description: 'Analytics and statistical prediction engine' },
      { name: 'pure', description: 'Pure deterministic calculations' },
      { name: 'fast', description: 'Fast sub-millisecond execution' },
    ],
    passWithNoTests: true,
  },
});
