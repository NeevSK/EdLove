import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: [
      { find: 'react-native', replacement: 'react-native-web' },
      { find: 'react-native-reanimated', replacement: 'react-native-reanimated/src/mock.ts' },
      {
        find: /^@repo\/ui\/(.*)$/,
        replacement: fileURLToPath(new URL('../ui/src/', import.meta.url)) + '',
      },
      {
        find: '@repo/ui',
        replacement: fileURLToPath(new URL('../ui/src/index.ts', import.meta.url)),
      },
      {
        find: /^@\/(.*)$/,
        replacement: fileURLToPath(new URL('../ui/src/', import.meta.url)) + '',
      },
    ],
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
