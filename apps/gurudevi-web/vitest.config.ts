import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['**/*.test.{ts,tsx}'],
    alias: {
      '@': path.resolve(import.meta.dirname, '.'),
      '@cedar-policy/cedar-wasm/web': path.resolve(import.meta.dirname, 'tests/shims/cedar-wasm-mock.ts'),
    },
    setupFiles: ['./tests/setup.ts'],
  },
});
