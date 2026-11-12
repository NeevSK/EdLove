import { readdirSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

const ManifestSchema = z.strictObject({
  schemaVersion: z.literal(2),
  modules: z.array(z.string().regex(/^[a-z0-9]+(?:[._-][a-z0-9]+)*\.json$/)).min(1),
});

/** Load either an explicitly supplied complete catalog or the canonical module manifest. */
export function loadCatalogFile(file: string): unknown {
  const input: unknown = JSON.parse(readFileSync(file, 'utf8'));
  if (!input || typeof input !== 'object' || !('modules' in input)) return input;
  const manifest = ManifestSchema.parse(input);
  if (new Set(manifest.modules).size !== manifest.modules.length)
    throw new Error('Duplicate catalog module');
  const directory = realpathSync(path.dirname(file));
  const features = manifest.modules.map((name) => {
    const resolved = realpathSync(path.join(directory, name));
    if (path.dirname(resolved) !== directory)
      throw new Error(`Catalog module escapes its directory: ${name}`);
    return JSON.parse(readFileSync(resolved, 'utf8'));
  });
  return { schemaVersion: 2, features };
}

/** Identify feature modules beside a manifest that it does not load. */
export function findUnregisteredFeatureModules(file: string): string[] {
  const input: unknown = JSON.parse(readFileSync(file, 'utf8'));
  if (!input || typeof input !== 'object' || !('modules' in input)) return [];
  const manifest = ManifestSchema.parse(input);
  const directory = realpathSync(path.dirname(file));
  return readdirSync(directory, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() && entry.name.endsWith('.json') && !manifest.modules.includes(entry.name),
    )
    .flatMap((entry) => {
      const contents = readFileSync(path.join(directory, entry.name), 'utf8');
      try {
        const candidate: unknown = JSON.parse(contents);
        return candidate &&
          typeof candidate === 'object' &&
          'id' in candidate &&
          typeof candidate.id === 'string' &&
          candidate.id.startsWith('feature:')
          ? [entry.name]
          : [];
      } catch {
        return [];
      }
    })
    .sort();
}
