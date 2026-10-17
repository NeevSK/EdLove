import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/entry-node.ts'],
  format: 'esm',
  clean: true,
});
