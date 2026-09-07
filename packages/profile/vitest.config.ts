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
    passWithNoTests: true,
  },
});

