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
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/__tests__/architecture/**/*.{test,spec}.{ts,tsx}'],
    passWithNoTests: true,
    server: {
      deps: {
        inline: [/packages/, /expo-modules-core/],
        external: [
          'react-native-mmkv',
          'expo',
          'expo-modules-core',
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
