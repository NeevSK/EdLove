import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/logic/**/*.{test,spec}.ts', 'src/logic/**/*.ts'],
    includeSource: ['src/logic/**/*.ts'],
    passWithNoTests: true,
  },
});
