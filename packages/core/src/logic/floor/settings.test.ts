import { describe, expect, it } from 'vitest';
import {
  createDefaultWorkspaceLayout,
  normalizeWorkspaceLayout,
  setWorkspaceFloorSettings,
} from '../workspace/canvas';
import { toWorkspaceLayoutRecord, toWorkspaceLayoutUpsert } from '../workspace/layoutSync';
import { DEFAULT_FLOOR_CONFIG } from './config';
import {
  configWithFloorSettings,
  followWorldFloor,
  resolveFloorSettings,
  roomHasOwnFloor,
  shiftDensity,
  writeFloorSettings,
} from './settings';

const config = DEFAULT_FLOOR_CONFIG;
const T1 = '2026-11-13T10:00:00.000Z';
const T2 = '2026-11-13T11:00:00.000Z';
const T3 = '2026-11-13T12:00:00.000Z';

describe('floor settings: world, every room, this room', () => {
  it('follows the room kind nudged by the world when nobody changed anything', () => {
    const work = resolveFloorSettings({ room: 'workspace', config });
    expect(work).toEqual({ density: 'dense', reorder: 'smart-areas', source: 'world' });
    const calmWorld = resolveFloorSettings({
      room: 'workspace',
      config,
      world: { densityShift: -1 },
    });
    expect(calmWorld.density).toBe('standard');
    expect(shiftDensity('calm', -1)).toBe('calm');
    expect(shiftDensity('calm', 1)).toBe('standard');
  });

  it('every room wins over the world, this room wins over every room', () => {
    const everyRoom = writeFloorSettings({ density: 'calm' }, 'every-room', {}, T1).everyRoom;
    expect(resolveFloorSettings({ room: 'workspace', config, everyRoom })).toMatchObject({
      density: 'calm',
      source: 'every-room',
    });
    const room = writeFloorSettings(
      { density: 'dense', reorder: 'never' },
      'this-room',
      { everyRoom },
      T2,
    ).room;
    expect(roomHasOwnFloor(room, everyRoom)).toBe(true);
    expect(
      resolveFloorSettings({ room: 'workspace', config, everyRoom, roomSettings: room }),
    ).toEqual({
      density: 'dense',
      reorder: 'never',
      source: 'room',
    });
  });

  it('a later every-room change brings rooms back without visiting them', () => {
    const room = writeFloorSettings({ density: 'dense' }, 'this-room', {}, T2).room;
    const everyRoom = writeFloorSettings({ density: 'calm' }, 'every-room', {}, T3).everyRoom;
    expect(roomHasOwnFloor(room, everyRoom)).toBe(false);
    expect(
      resolveFloorSettings({ room: 'self', config, everyRoom, roomSettings: room }).density,
    ).toBe('calm');
    expect(roomHasOwnFloor(followWorldFloor(T3), null)).toBe(false);
  });

  it('feeds the engine config for that room only', () => {
    const resolved = resolveFloorSettings({
      room: 'library',
      config,
      roomSettings: { density: 'calm', reorder: 'never', scope: 'room', changedAt: T1 },
    });
    const next = configWithFloorSettings(config, 'library', resolved);
    expect(next.tierByRoom.library).toBe('calm');
    expect(next.tierByRoom.workspace).toBe('dense');
    expect(next.reorder).toBe('never');
  });

  it('is saved on the layout and survives normalising and syncing', () => {
    const base = createDefaultWorkspaceLayout({
      workspaceId: 'library',
      userId: '00000000-0000-4000-8000-000000000001',
      surfaces: [],
    });
    const floor = { density: 'calm' as const, scope: 'room' as const, changedAt: T1 };
    const saved = setWorkspaceFloorSettings(base, floor, T1);
    expect(saved.isDefault).toBe(false);
    expect(normalizeWorkspaceLayout(saved, [], T1).floor).toEqual(floor);
    const upsert = toWorkspaceLayoutUpsert(saved, {
      userId: saved.userId,
      workspaceId: 'library',
      layoutTarget: 'shared',
    });
    const record = toWorkspaceLayoutRecord({
      id: '00000000-0000-4000-8000-000000000002',
      user_id: saved.userId,
      workspace_id: 'library',
      layout_target: 'shared',
      order: [],
      hidden: [],
      pinned: [],
      zone_by_surface: {},
      is_default: false,
      surface_metadata: upsert.surfaceMetadata,
      layout_version: 2,
      revision: 0,
      last_operation_id: null,
      created_at: T1,
      updated_at: T1,
    });
    expect(record.floor).toEqual(floor);
  });
});
