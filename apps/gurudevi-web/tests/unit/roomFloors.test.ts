import {
  type ChromeBar,
  type FloorSpace,
  layoutFloor,
  lintFloor,
  printFloor,
  roomCatalogOf,
  roomFloorInput,
} from '@repo/core/logic/floor';
import type { TabDomain } from '@repo/core/logic/registry/domainEntry';
import { floorFitOf, KIT_FLOOR_FIT, type KitPiece } from '@repo/ui/theme';
import { describe, expect, it } from 'vitest';
import { APP_CATALOG } from '../../lib/appCatalog';

/**
 * The floor every role sees in each room, from the real AppCatalog, at the
 * screens we test on. A change to a catalog entry, a kit size or the engine
 * shows up here as a diff to read, so layout changes are reviewed like code.
 */

const CHROME: ChromeBar[] = [
  { id: 'status', height: 24, giveWayRank: 0, essential: true },
  { id: 'header', height: 56, giveWayRank: 2 },
  { id: 'stripe', height: 32, giveWayRank: 4 },
  { id: 'rooms', height: 64, giveWayRank: 3 },
];

const SCREENS: Record<string, FloorSpace> = {
  'a24-phone': { width: 360, height: 780, fontScale: 1, chrome: CHROME },
  'small-large-text': { width: 320, height: 640, fontScale: 1.3, chrome: CHROME },
  'tablet-landscape': { width: 1280, height: 800, fontScale: 1, chrome: CHROME },
};

const fitOf = (shape: string) => {
  if (!(shape in KIT_FLOOR_FIT)) throw new Error(`No floor fit for kit shape "${shape}"`);
  return floorFitOf(shape as KitPiece, 'web');
};

const ROOMS: [TabDomain, string][] = [
  ['self', 'student'],
  ['self', 'teacher'],
  ['self', 'principal'],
  ['workspace', 'teacher'],
  ['workspace', 'student'],
  ['workspace', 'principal'],
  ['workspace', 'guardian'],
  ['community', 'student'],
  ['library', 'student'],
];

describe('room floors from the catalog', () => {
  it('every furniture shape in the catalog has a kit size', () => {
    for (const entry of Object.values(APP_CATALOG)) {
      if (entry.floor) expect(entry.floor.shape in KIT_FLOOR_FIT, entry.id).toBe(true);
    }
  });

  it('every furniture group exists on its room floor', async () => {
    const { ROOM_FLOORS } = await import('@repo/core/logic/floor');
    for (const entry of Object.values(APP_CATALOG)) {
      if (!entry.floor) continue;
      const groups = ROOM_FLOORS[entry.tabDomain].groups.map((g) => g.id);
      expect(groups, entry.id).toContain(entry.floor.group);
    }
  });

  for (const [room, role] of ROOMS) {
    for (const [screen, space] of Object.entries(SCREENS)) {
      it(`${room} as ${role} on ${screen}`, async () => {
        const catalog = roomCatalogOf(APP_CATALOG, room, role, 'web');
        expect(catalog.features.length).toBeGreaterThan(0);
        const tree = layoutFloor(
          roomFloorInput({ catalog, fitOf, space, controls: { detail: 'rich', motion: 'full' } }),
        );
        expect(lintFloor(tree, space).filter((f) => f.severity === 'error')).toEqual([]);
        await expect(printFloor(tree)).toMatchFileSnapshot(
          `./__floors__/${room}-${role}.${screen}.floor`,
        );
      });
    }
  }

  it('a hidden feature leaves the floor and a resting one never holds the lamp', () => {
    const catalog = roomCatalogOf(APP_CATALOG, 'workspace', 'teacher', 'web');
    const tree = layoutFloor(
      roomFloorInput({
        catalog,
        fitOf,
        space: SCREENS['a24-phone']!,
        controls: { detail: 'rich', motion: 'full' },
        presentationOf: (id) =>
          id === 'timetable' ? 'hidden' : id === 'attendance' ? 'locked' : 'available',
      }),
    );
    expect(tree.readingOrder).not.toContain('timetable');
    expect(printFloor(tree)).toContain('Daily Attendance');
    expect(lintFloor(tree).some((f) => f.rule === 'one-lit')).toBe(false);
  });
});

describe('the web registers the same AppCatalog', () => {
  it('registers once and every entry passes the catalog rules', async () => {
    const { registerWebAppCatalog } = await import('../../lib/appCatalog');
    const { getAllDomains } = await import('@repo/core/logic/registry/appCatalog');
    registerWebAppCatalog();
    registerWebAppCatalog();
    expect(
      getAllDomains()
        .map((d) => d.id)
        .sort(),
    ).toEqual(Object.keys(APP_CATALOG).sort());
  });
});
