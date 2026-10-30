import * as web from '@repo/ui/components/web';
import { describe, expect, it } from 'vitest';

/** Pieces both sets must have; the native suite checks the same list. */
const SHARED = ['Button', 'Card', 'Carousel', 'Grid', 'Group', 'Icon', 'Inline', 'Rail', 'Stack'];

const components = Object.entries(web).filter(
  (entry): entry is [string, (...args: never[]) => unknown] =>
    /^[A-Z]/.test(entry[0]) && typeof entry[1] === 'function',
);

describe('web kit pieces are named in the component tree', () => {
  it('every component shows under its own name in React DevTools', () => {
    expect(components.length).toBeGreaterThan(30);
    for (const [name, fn] of components) expect(fn.name, name).toBe(name);
  });

  it('has the pieces the native set has, under the same names', () => {
    const names = new Set(components.map(([name]) => name));
    for (const name of SHARED) expect(names.has(name), name).toBe(true);
  });
});
