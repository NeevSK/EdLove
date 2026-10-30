import { describe, expect, it, vi } from 'vitest';
import * as native from '../index';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn(), haptic: vi.fn() }));
// The scene pieces need a router and Skia, neither of which load in this
// engine; only names are read here, so stand-ins for those two suffice.
vi.mock('expo-router', () => ({ useIsFocused: () => true, usePathname: () => '/' }));
vi.mock('react-native-skia', () => ({ Skia: {}, vec: () => ({}) }));

/**
 * The component tree is the inspector: React DevTools and React Native
 * DevTools (built into RN 0.88) show each kit piece by its function name,
 * and on the web every kit element carries a `gd-<name>` class. So every
 * component export must be a named function whose name is its export name,
 * never an anonymous wrapper or a memo with no name.
 */
function components(barrel: Record<string, unknown>) {
  return Object.entries(barrel).filter(
    (entry): entry is [string, (...args: never[]) => unknown] =>
      /^[A-Z]/.test(entry[0]) && typeof entry[1] === 'function',
  );
}

/** Pieces both sets must have; the web suite checks the same list. */
const SHARED = ['Button', 'Card', 'Carousel', 'Grid', 'Group', 'Icon', 'Inline', 'Rail', 'Stack'];

describe('kit pieces are named in the component tree', { tags: ['unit'] }, () => {
  it('native: every component shows under its own name', () => {
    const named = components(native);
    expect(named.length).toBeGreaterThan(30);
    for (const [name, fn] of named) expect(fn.name, name).toBe(name);
  });

  it('has the pieces the web set has, under the same names', () => {
    const names = new Set(components(native).map(([name]) => name));
    for (const name of SHARED) expect(names.has(name), name).toBe(true);
  });
});
