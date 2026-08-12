import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  define: {
    __DEV__: 'true',
  },
  resolve: {
    alias: {
      'react-native': resolve(__dirname, './vitest-react-native-mock.ts'),
      'expo-sqlite': resolve(__dirname, './vitest-sqlite-mock.ts'),
      'expo-modules-core': resolve(__dirname, './vitest-expo-modules-core-mock.ts'),
      'expo-constants': resolve(__dirname, './vitest-expo-constants-mock.ts'),
      '@cedar-policy/cedar-wasm/web': resolve(__dirname, './vitest-cedar-web-mock.ts'),
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
      'src/__tests__/architecture/profile-route-capabilities.test.ts',
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
