import { defineConfig } from 'vitest/config';
import path from 'path';

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
