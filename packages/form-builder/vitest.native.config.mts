/**
 * Mounted React Native component tests (`*.native.test.tsx`), run on the same
 * setup as @repo/ui's world component tests, so no second test stack is added.
 * Run with `pnpm --filter @repo/form-builder test:native`.
 */
import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vitest/config';
import uiConfig from '../ui/vitest.config.mts';

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default mergeConfig(
  uiConfig,
  defineConfig({
    root: here('../ui'),
    test: {
      dir: here('./src'),
      include: [here('./src/**/*.native.test.tsx')],
    },
  }),
);
