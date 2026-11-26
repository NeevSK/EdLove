import { mkdtempSync, rmdirSync, unlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { findUnregisteredFeatureModules, loadCatalogFile } from './catalogLoader.adapter';

describe('modular catalog loader', () => {
  it('loads modules in order and rejects duplicate or escaping module names', () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), 'pjc-modules-'));
    const manifest = path.join(directory, 'manifest.json');
    const first = path.join(directory, 'first.json');
    const second = path.join(directory, 'second.json');
    try {
      writeFileSync(first, JSON.stringify({ id: 'feature:first' }));
      writeFileSync(second, JSON.stringify({ id: 'feature:second' }));
      writeFileSync(
        manifest,
        JSON.stringify({ schemaVersion: 2, modules: ['first.json', 'second.json'] }),
      );
      expect(loadCatalogFile(manifest)).toEqual({
        schemaVersion: 2,
        features: [{ id: 'feature:first' }, { id: 'feature:second' }],
      });
      writeFileSync(manifest, JSON.stringify({ schemaVersion: 2, modules: ['first.json'] }));
      expect(findUnregisteredFeatureModules(manifest)).toEqual(['second.json']);
      writeFileSync(
        manifest,
        JSON.stringify({ schemaVersion: 2, modules: ['first.json', 'second.json'] }),
      );
      expect(findUnregisteredFeatureModules(manifest)).toEqual([]);
      writeFileSync(
        manifest,
        JSON.stringify({ schemaVersion: 2, modules: ['first.json', 'first.json'] }),
      );
      expect(() => loadCatalogFile(manifest)).toThrow('Duplicate catalog module');
      writeFileSync(manifest, JSON.stringify({ schemaVersion: 2, modules: ['../other.json'] }));
      expect(() => loadCatalogFile(manifest)).toThrow();
      writeFileSync(manifest, JSON.stringify({ schemaVersion: 2, modules: ['missing.json'] }));
      expect(() => loadCatalogFile(manifest)).toThrow();
    } finally {
      unlinkSync(first);
      unlinkSync(second);
      unlinkSync(manifest);
      rmdirSync(directory);
    }
  });
});
