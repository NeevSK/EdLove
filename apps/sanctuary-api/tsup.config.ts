import { readFileSync } from 'node:fs';
import { defineConfig } from 'tsup';

const nodeMajor = readFileSync(new URL('../../.nvmrc', import.meta.url), 'utf8')
  .trim()
  .split('.')[0];

export default defineConfig({ target: `node${nodeMajor}`, platform: 'node' });
