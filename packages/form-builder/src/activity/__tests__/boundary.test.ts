import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// The activity core stays pure: the form engine's types and the quiz marking beside it, and
// nothing else. No React, storage, network, workspace package or app.
const dir = join(import.meta.dirname, '..');
const allowed = (s: string) =>
  s.startsWith('./') ||
  s.startsWith('../quiz') ||
  s === 'zod' ||
  s.startsWith('@intuitui-labs/form-builder-engine/');

describe('activity boundary', () => {
  const sources = readdirSync(dir).filter((f) => f.endsWith('.ts'));

  it.each(sources)('%s imports only the engine, the quiz marking and its own files', (file) => {
    const text = readFileSync(join(dir, file), 'utf8');
    const specifiers = [...text.matchAll(/(?:from|import)\s*\(?\s*'([^']+)'/g)].map(
      (m) => m[1] ?? '',
    );
    expect(specifiers.filter((s) => !allowed(s))).toEqual([]);
  });
});
