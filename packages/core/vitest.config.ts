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
