import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    fsModuleCache: true,
    sharedViteServer: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    tags: [
      { name: 'editorial', description: 'Editorial distribution, publication, and workflow rules' },
      { name: 'pure', description: 'Pure deterministic calculations' },
      { name: 'fast', description: 'Fast sub-millisecond execution' },
    ],
  },
});