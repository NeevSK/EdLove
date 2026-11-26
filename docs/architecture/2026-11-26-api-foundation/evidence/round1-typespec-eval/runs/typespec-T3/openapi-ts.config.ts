import { defineConfig } from '@hey-api/openapi-ts';
export default defineConfig({
  input: './out/openapi.json',
  output: { path: 'gen', postProcess: [] },
  logs: { level: 'silent' },
  plugins: [{ name: 'zod' }, { name: 'orpc', compatibilityVersion: '2', validator: { input: 'zod', output: 'zod' } }],
});
