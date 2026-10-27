import { defineConfig } from 'vitest/config';
import { presets, reactNative } from 'vitest-native';
import path from 'node:path';

export default defineConfig({
  plugins: [
    reactNative({
      engine: 'mock',
      platform: 'ios',
      presets: [
        presets.reanimated(),
        presets.gestureHandler(),
        presets.asyncStorage(),
      ],
    }),
  ],
  resolve: {
    tsconfigPaths: true,
    alias: [
      {
        find: /^react-native-css(?:-interop)?(?:\/.*)?$/,
        replacement: path.resolve(import.meta.dirname, 'test-shims/nativewind.tsx'),
      },
      {
        find: 'nativewind',
        replacement: path.resolve(import.meta.dirname, 'test-shims/nativewind.tsx'),
      },
      {
        find: 'react-native-reanimated',
        replacement: path.resolve(import.meta.dirname, 'test-shims/reanimated.ts'),
      },
      {
        find: 'react-native-worklets',
        replacement: path.resolve(import.meta.dirname, 'test-shims/worklets.ts'),
      },
      {
        find: 'expo-linear-gradient',
        replacement: path.resolve(import.meta.dirname, 'test-shims/expo-ui.tsx'),
      },
      {
        find: 'expo-image',
        replacement: path.resolve(import.meta.dirname, 'test-shims/expo-ui.tsx'),
      },
      {
        find: 'react-native-svg',
        replacement: path.resolve(import.meta.dirname, 'test-shims/expo-ui.tsx'),
      },
      {
        find: '@react-native-community/slider',
        replacement: path.resolve(import.meta.dirname, 'test-shims/expo-ui.tsx'),
      },
      {
        find: /^@repo\/ui\/(.*)$/,
        replacement: `${path.resolve(import.meta.dirname, '../ui/src')}/$1`,
      },
      {
        find: '@repo/ui',
        replacement: path.resolve(import.meta.dirname, '../ui/src/index.ts'),
      },
      {
        find: /^@repo\/core\/(.*)$/,
        replacement: `${path.resolve(import.meta.dirname, '../core/src')}/$1`,
      },
      {
        find: '@repo/core',
        replacement: path.resolve(import.meta.dirname, '../core/src/index.ts'),
      },
      {
        find: '@cedar-policy/cedar-wasm/web',
        replacement: path.resolve(import.meta.dirname, 'test-shims/cedar-wasm.ts'),
      },
      {
        find: 'expo-constants',
        replacement: path.resolve(import.meta.dirname, 'test-shims/expo-constants.ts'),
      },
      {
        find: 'expo-modules-core',
        replacement: path.resolve(import.meta.dirname, 'test-shims/expo-modules-core.ts'),
      },
      {
        find: 'expo-asset',
        replacement: path.resolve(import.meta.dirname, 'test-shims/expo-asset.ts'),
      },
    ],
  },
    test: {
    fsModuleCache: true,
    sharedViteServer: true,
    globals: true,
    environment: 'jsdom',
    setupFiles: [path.resolve(import.meta.dirname, 'test-shims/setup.ts')],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    passWithNoTests: true,
  },
});
