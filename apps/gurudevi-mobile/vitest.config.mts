import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    __DEV__: 'true',
  },
  resolve: {
    // Vite 8 resolves the aliases declared in tsconfig.json natively.
    // Keeping this here avoids a separate vite-tsconfig-paths plugin and its
    // config-loader warning while preserving the mobile test import contract.
    tsconfigPaths: true,
    alias: {
      'react-native': resolve(import.meta.dirname, './vitest-react-native-mock.ts'),
      'expo-sqlite': resolve(import.meta.dirname, './vitest-sqlite-mock.ts'),
      'expo-modules-core': resolve(import.meta.dirname, './vitest-expo-modules-core-mock.ts'),
      'expo-constants': resolve(import.meta.dirname, './vitest-expo-constants-mock.ts'),
      '@cedar-policy/cedar-wasm/web': resolve(import.meta.dirname, './vitest-cedar-web-mock.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/__tests__/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      'src/__tests__/components/**',
      'src/__tests__/architecture/AppPerformance.test.tsx',
      'src/__tests__/architecture/classroom-surface-entrypoints.test.ts',
      'src/__tests__/architecture/founder-stack-boundaries.test.ts',
    ],
    passWithNoTests: true,
    server: {
      deps: {
        inline: [/packages/, /@repo\//, /expo-modules-core/],
        external: [
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
