import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Every Zustand store that persists to the device declares its storage key and the version of the
 * shape it writes. Without a version, a change to that shape silently loads old data into the new
 * shape on every phone that has it; with one, the change bumps it and supplies a `migrate`.
 */
const SRC = path.resolve(import.meta.dirname, '../..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory())
      return ['__tests__', '__mocks__', 'generated', 'node_modules'].includes(name)
        ? []
        : sourceFiles(full);
    return /\.tsx?$/.test(name) && !/\.(test|spec)\.tsx?$/.test(name) ? [full] : [];
  });
}

const persistedStores = sourceFiles(SRC)
  .map((file) => ({ file: path.relative(SRC, file), source: readFileSync(file, 'utf8') }))
  .filter(({ source }) =>
    /import\s*\{[^}]*\bpersist\b[^}]*\}\s*from\s*'zustand\/middleware'/.test(source),
  );

describe('persisted store contract', () => {
  it('finds the persisted stores', () => {
    expect(persistedStores.length).toBeGreaterThan(10);
  });

  it.each(persistedStores.map(({ file, source }) => [file, source] as const))(
    '%s names its storage key and declares a version',
    (_file, source) => {
      // `persist(` or the explicitly typed `persist<State>(`.
      const start = source.search(/\bpersist\s*(<[^>]*>)?\s*\(/);
      expect(start).toBeGreaterThanOrEqual(0);
      const options = source.slice(start);
      // The storage key (a string or a CONSTANT) and the version are sibling properties of the
      // same options object: same indentation, version after the key.
      expect(options).toMatch(
        /\n([ \t]*)name:\s*(['"][^'"]+['"]|[A-Z_][A-Z0-9_]*),\n(?:\1[^\n]*\n)*?\1version:\s*\d/,
      );
    },
  );
});
