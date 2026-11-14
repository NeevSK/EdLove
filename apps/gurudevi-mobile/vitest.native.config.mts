import { defineConfig } from 'vitest/config';
import { reactNative } from 'vitest-native';

// Tests that need a real React Native component tree. Everything else runs in vitest.config.mts.
export default defineConfig({
  plugins: [reactNative({ engine: 'native', platform: 'android' })],
  resolve: { tsconfigPaths: true },
  test: {
    include: ['src/__tests__/**/*.rn.test.{ts,tsx}'],
    setupFiles: ['./vitest-rn-setup.ts'],
    globals: true,
  },
});
