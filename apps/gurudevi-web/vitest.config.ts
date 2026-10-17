import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['**/*.test.{ts,tsx}'],
    alias: {
      '@': path.resolve(import.meta.dirname, '.'),
    },
    setupFiles: ['./tests/setup.ts'],
  },
});
