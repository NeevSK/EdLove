import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    fsModuleCache: true,
    sharedViteServer: true,
    environment: 'node',
    passWithNoTests: true,
    tags: [
      { name: 'policies', description: 'Authorization policy engine and snapshot signing' },
      { name: 'security', description: 'Access control and sovereign security evaluations' },
      { name: 'fast', description: 'Fast execution suite' },
    ],
  },
});