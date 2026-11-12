import {
  type ChromeBar,
  type FloorSpace,
  layoutFloor,
  lintFloor,
  printFloor,
  ROOM_PLANS,
  roomFloorInput,
  roomPlanOf,
  roomSurfaceDefinitions,
  workRoomPlanOf,
} from '@repo/core/logic/floor';
import { describe, expect, it } from 'vitest';
import { floorFitOf, KIT_FLOOR_FIT, type KitPiece } from '../floorFit';

/**
 * The floor every role sees in the work room, at the screens we test on.
 * A change to a plan, a kit size or the engine shows up here as a diff to
 * read, so layout changes are reviewed like code.
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
  'phone-landscape': { width: 780, height: 360, fontScale: 1, chrome: CHROME },
  'tablet-portrait': { width: 800, height: 1280, fontScale: 1, chrome: CHROME },
  'tablet-landscape': { width: 1280, height: 800, fontScale: 1, chrome: CHROME },
};

const fitOf = (kit: string) => {
  if (!(kit in KIT_FLOOR_FIT)) throw new Error(`No floor fit for kit piece "${kit}"`);
  return floorFitOf(kit as KitPiece, 'android');
};

describe('work room floors', { tags: ['unit', 'a11y'] }, () => {
  for (const plan of Object.values(ROOM_PLANS)) {
    for (const [screen, space] of Object.entries(SCREENS)) {
      for (const detail of ['rich', 'essential'] as const) {
        if (detail === 'essential' && screen !== 'a24-phone') continue;
        it(`${plan.id} on ${screen} (${detail})`, async () => {
          const input = roomFloorInput({
            plan,
            fitOf,
            space,
            controls: { detail, motion: 'full' },
          });
          const tree = layoutFloor(input);
          const errors = lintFloor(tree, space).filter((f) => f.severity === 'error');
          expect(errors).toEqual([]);
          expect(tree.readingOrder.length).toBeGreaterThan(0);
          await expect(printFloor(tree)).toMatchFileSnapshot(
            `./__floors__/${plan.id.replace(':', '-')}.${screen}.${detail}.floor`,
          );
        });
      }
    }
  }

  it('a hidden feature leaves the floor and a resting one never holds the lamp', () => {
    const plan = ROOM_PLANS['workspace:teacher']!;
    const tree = layoutFloor(
      roomFloorInput({
        plan,
        fitOf,
        space: SCREENS['a24-phone']!,
        controls: { detail: 'rich', motion: 'full' },
        presentationOf: (id) =>
          id === 'messages' ? 'hidden' : id === 'attendance' ? 'locked' : 'available',
      }),
    );
    expect(tree.readingOrder).not.toContain('messages');
    const text = printFloor(tree);
    expect(text).toContain('Attendance');
    expect(lintFloor(tree).some((f) => f.rule === 'one-lit')).toBe(false);
  });

  it("the person's saved order and group order win inside a group", () => {
    const plan = ROOM_PLANS['workspace:teacher']!;
    const base = {
      plan,
      fitOf,
      space: SCREENS['tablet-portrait']!,
      controls: { detail: 'rich' as const, motion: 'full' as const },
    };
    const saved = layoutFloor(
      roomFloorInput({
        ...base,
        layout: {
          order: ['timetable', 'notes', 'question-bank', 'messages'],
          hidden: [],
          pinned: [],
          zoneBySurface: {},
          groupOrder: ['tools', 'teach'],
        },
      }),
    );
    const tools = saved.readingOrder.filter((id) =>
      ['timetable', 'notes', 'question-bank', 'messages'].includes(id),
    );
    expect(tools[0]).toBe('timetable');
  });

  it('tutors and markers get the Classroom plan; unknown capacities get none', () => {
    expect(workRoomPlanOf('tutor')?.id).toBe('workspace:teacher');
    expect(workRoomPlanOf('marker')?.id).toBe('workspace:teacher');
    expect(workRoomPlanOf('platform_staff')).toBeUndefined();
    expect(workRoomPlanOf(undefined)).toBeUndefined();
  });

  it('every planned feature becomes a saved-layout surface in its default area', () => {
    const plan = ROOM_PLANS['workspace:guardian']!;
    const defs = roomSurfaceDefinitions(plan, 'workspace@bond-1');
    expect(defs.map((d) => d.surfaceId)).toEqual(plan.surfaces.map((x) => x.id));
    expect(defs.every((d) => d.workspaceId === 'workspace@bond-1')).toBe(true);
    for (const kit of new Set(
      Object.values(ROOM_PLANS).flatMap((p) => p.surfaces.map((x) => x.kit)),
    )) {
      expect(kit in KIT_FLOOR_FIT, kit).toBe(true);
    }
  });

  it('every room has a plan for every capacity: Self per capacity, Community shared', () => {
    expect(roomPlanOf('self', 'tutor')?.id).toBe('self:teacher');
    expect(roomPlanOf('self', 'platform_staff')?.id).toBe('self:student');
    expect(roomPlanOf('community', 'guardian')?.id).toBe('community:everyone');
    expect(roomPlanOf('library', 'teacher')?.id).toBe('library:maker');
    expect(roomPlanOf('library', 'student')?.id).toBe('library:reader');
    expect(roomPlanOf('profile', 'guardian')?.id).toBe('profile:everyone');
  });
});
