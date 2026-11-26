import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// The player core stays publishable on its own: no app, no workspace package, no platform.
const ALLOWED = new Set(['zod', 'fflate']);
const dir = import.meta.dirname;

describe('h5p boundary', () => {
  const sources = readdirSync(dir).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'));

  it.each(sources)('%s imports only zod, fflate and its own files', (file) => {
    const text = readFileSync(join(dir, file), 'utf8');
    const specifiers = [...text.matchAll(/(?:from|import)\s*\(?\s*'([^']+)'/g)].map(
      (m) => m[1] ?? '',
    );
    const outside = specifiers.filter((s) => !s.startsWith('./') && !ALLOWED.has(s));
    expect(outside).toEqual([]);
  });

  it('names no app', () => {
    for (const file of sources) {
      expect(readFileSync(join(dir, file), 'utf8')).not.toMatch(/gurudevi-(mobile|web)|@repo\//);
    }
  });
});
