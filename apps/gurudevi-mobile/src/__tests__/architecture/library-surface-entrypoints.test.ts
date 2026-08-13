import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_ROOT = path.resolve(__dirname, '../../..');
const WORKSPACE_ROOT = path.resolve(APP_ROOT, '..', '..');
const LIBRARY_PACKAGE_JSON = path.join(WORKSPACE_ROOT, 'packages', 'library', 'package.json');

const LIBRARY_ROUTES = [
  path.join(APP_ROOT, 'app', '(tabs)', 'library', 'index.tsx'),
  path.join(APP_ROOT, 'app', '(tabs)', 'library', 'map.tsx'),
  path.join(APP_ROOT, 'app', '(tabs)', 'library', 'review.tsx'),
  path.join(APP_ROOT, 'app', '(tabs)', 'library', 'document', '[resourceId].tsx'),
  path.join(APP_ROOT, 'app', '(tabs)', 'library', 'resource', '[resourceId].tsx'),
  path.join(APP_ROOT, 'app', '(tabs)', 'library', 'video', '[resourceId].tsx'),
  path.join(APP_ROOT, 'app', '(tabs)', 'library', 'collections', '[id].tsx'),
];

describe('Library surface entrypoints', () => {
  it('publishes capability entrypoints', () => {
    const pkg = JSON.parse(fs.readFileSync(LIBRARY_PACKAGE_JSON, 'utf8'));

    for (const entrypoint of ['./api', './browse', './readers', './collections', './curation', './map']) {
      expect(pkg.exports[entrypoint]).toBeDefined();
    }
  });

  it('active library routes avoid the package root barrel', () => {
    const sources = LIBRARY_ROUTES.map((route) => fs.readFileSync(route, 'utf8'));
    const combined = sources.join('\n');

    expect(combined).not.toContain("from '@repo/library';");
    expect(combined).toContain("from '@repo/library/browse'");
    expect(combined).toContain("from '@repo/library/readers'");
    expect(combined).toContain("from '@repo/library/collections'");
    expect(combined).toContain("from '@repo/library/curation'");
    expect(combined).toContain("from '@repo/library/map'");
  });
});

