import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      'expo-constants': path.resolve(import.meta.dirname, '../core/src/test-shims/expo-constants.ts'),
      'react-native': path.resolve(import.meta.dirname, '../core/src/test-shims/react-native.ts'),
    },
  },
  define: {
    __DEV__: 'true',
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
