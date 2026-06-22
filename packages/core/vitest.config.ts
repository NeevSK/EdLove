import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  define: {
    __DEV__: 'true',
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts', 'packages/core/src/**/*.{test,spec}.ts'],
    includeSource: ['src/logic/**/*.ts'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.config.ts',
        '**/*.config.js',
        '**/*.config.mjs',
        '**/*.config.cjs',
        '**/types/**',
        '**/shims/**',
      ],
    },
    server: {
      deps: {
        external: [
          'react-native',
          'react-native-mmkv',
          'expo',
          'expo-constants',
          'expo-device',
          'expo-haptics',
          'expo-location',
          'expo-notifications',
          'expo-secure-store',
        ],
      },
    },
  },
});
