import { readFileSync } from 'node:fs';
import { defineConfig } from 'tsup';

const nodeMajor = readFileSync(new URL('../../.nvmrc', import.meta.url), 'utf8')
  .trim()
  .split('.')[0];

export default defineConfig({
  target: `node${nodeMajor}`,
  platform: 'node',
  noExternal: [/^@repo\//],
  banner: {
    js: "import { createRequire as __apiCreateRequire } from 'node:module'; const require = __apiCreateRequire(import.meta.url);",
  },
});
