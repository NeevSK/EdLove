import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      // Workspace source, not the declaration build that tsconfig paths point at.
      '@repo/verger-core': path.resolve(import.meta.dirname, '../verger-core/src/index.ts'),
      'expo-constants': path.resolve(import.meta.dirname, 'src/test-shims/expo-constants.ts'),
      'react-native': path.resolve(import.meta.dirname, 'src/test-shims/react-native.ts'),
    },
  },
  define: {
    __DEV__: 'true',
  },
  test: {
    globals: true,
    environment: 'node',
    fsModuleCache: true,
    sharedViteServer: true,
    tags: [
      { name: 'pure', description: 'Pure deterministic calculations without IO' },
      { name: 'fast', description: 'Sub-millisecond execution' },
      { name: 'wasm', description: 'Cedar WASM Policy Engine evaluation' },
      { name: 'storage', description: 'Local storage, SQLite, and persistence mocks' },
      { name: 'security', description: 'Device security, trust, and authorization' },
      { name: 'guardian', description: 'Guardian domain services and assessment reads' },
      { name: 'network', description: 'Network, synchronization, and external adapter calls' },
    ],
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
      warmup: {
        ssr: ['./src/index.ts', './src/logic/index.ts'],
      },
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
