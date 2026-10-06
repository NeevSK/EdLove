import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    __DEV__: 'true',
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      'react-native': 'react-native-web',
      'expo-constants': path.resolve(__dirname, '../core/src/test-shims/expo-constants.ts'),
    },
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
