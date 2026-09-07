import { reactNative, presets } from 'vitest-native';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  cacheDir: new URL('../../node_modules/.vitest-ui-native-cache', import.meta.url).pathname,
  plugins: [
    reactNative({
      engine: 'native',
      platform: 'ios',
      presets: [presets.reanimated(), presets.gestureHandler(), presets.asyncStorage()],
    }),
  ],
  resolve: {
    tsconfigPaths: true,
    alias: [
      {
        find: '@cedar-policy/cedar-wasm/web',
        replacement: new URL('./vitest-cedar-web-mock.ts', import.meta.url).pathname,
      },
      {
        find: 'expo-image',
        replacement: new URL('./vitest-expo-ui-mock.ts', import.meta.url).pathname,
      },
      {
        find: 'expo-constants',
        replacement: new URL('./vitest-expo-constants-mock.ts', import.meta.url).pathname,
      },
      {
        find: 'expo-linear-gradient',
        replacement: new URL('./vitest-expo-ui-mock.ts', import.meta.url).pathname,
      },
      {
        find: 'react-native-svg',
        replacement: new URL('./vitest-expo-ui-mock.ts', import.meta.url).pathname,
      },
      {
        find: '@react-native-community/slider',
        replacement: new URL('./vitest-native-module-mock.ts', import.meta.url).pathname,
      },
      {
        find: /^lucide-react-native\/icons(?:\/.*)?$/,
        replacement: new URL('./__mocks__/lucide-icons.js', import.meta.url).pathname,
      },
      {
        find: 'lucide-react-native',
        replacement: new URL('./__mocks__/lucide-icons.js', import.meta.url).pathname,
      },
      {
        find: /^@repo\/ui\/(.*)$/,
        replacement: `${new URL('./src/', import.meta.url).pathname}$1`,
      },
      {
        find: '@repo/ui',
        replacement: new URL('./src/index.ts', import.meta.url).pathname,
      },
      {
        find: /^@repo\/core\/(.*)$/,
        replacement: `${new URL('../core/src/', import.meta.url).pathname}$1`,
      },
      {
        find: '@repo/core',
        replacement: new URL('../core/src/index.ts', import.meta.url).pathname,
      },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    pool: 'forks',
    maxWorkers: 2,
    minWorkers: 1,
    setupFiles: ['./vitest-setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['src/archive/**', 'dist/**'],
    fsModuleCache: true,
    sequence: { concurrent: false, shuffle: false },
    passWithNoTests: false,
  },
});
