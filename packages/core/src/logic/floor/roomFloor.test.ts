import { describe, expect, it } from 'vitest';
import { layoutRoomFloor } from './roomFloor';
import type { DomainEntry } from '../registry/domainEntry';
import { roomCatalogOf } from './rooms';
import type { FloorFit } from './types';

const fit: FloorFit = {
  level: 'piece',
  min: { w: 140, h: 72 },
  preferred: { h: 96 },
  interactive: true,
  cost: { views: 8, pictures: 0, moves: false },
};
const entry = (id: string, group: string, extra: Partial<DomainEntry> = {}): DomainEntry => ({
  id,
  label: id,
  ownerPackage: 'community',
  mobileSupport: true,
  webSupport: true,
  state: 'live',
  lifecycle: {
    owner: 'community',
    createdAt: '2026-07-26',
    reviewAt: '2026-09-30',
    permanentJustification: 'test',
  },
  citizenshipRequired: 3,
  capabilityRequirement: { action: 'read', subject: 'CommunityFeed' },
  tabDomain: 'community',
  surfaceId: id,
  defaultOrder: 10,
  analyticsKey: `community.${id}`,
  floor: { group, shape: 'card' },
  ...extra,
});
const catalog = roomCatalogOf(
  [
    entry('hearth', 'news', { floor: { group: 'news', shape: 'list', lit: true } }),
    entry('circles', 'groups'),
    entry('messages', 'talk'),
    entry('trust', 'news'),
  ],
  'community',
  'student',
  'mobile',
);
const base = {
  catalog,
  fitOf: () => fit,
  space: { width: 390, height: 800, fontScale: 1, chrome: [] },
  controls: { detail: 'rich' as const, motion: 'full' as const },
};
const T1 = '2026-11-13T10:00:00.000Z';
const T2 = '2026-11-13T11:00:00.000Z';

describe('layoutRoomFloor: one door for web and phone', () => {
  it('follows the world character when nobody chose anything', () => {
    expect(layoutRoomFloor(base).tree.tier).toBe('standard');
    const roomy = layoutRoomFloor({ ...base, world: { densityShift: -1 } });
    expect(roomy.tree.tier).toBe('calm');
    expect(roomy.settings.source).toBe('world');
  });

  it('every room wins over the world; this room wins until every room changes again', () => {
    const everyRoom = { density: 'dense' as const, scope: 'world' as const, changedAt: T1 };
    const all = layoutRoomFloor({ ...base, world: { densityShift: -1 }, everyRoom });
    expect(all.tree.tier).toBe('dense');
    expect(all.settings.source).toBe('every-room');

    const layout = {
      order: [],
      hidden: [],
      pinned: [],
      zoneBySurface: {},
      floor: { density: 'calm' as const, scope: 'room' as const, changedAt: T2 },
    };
    const own = layoutRoomFloor({ ...base, everyRoom, layout });
    expect(own.tree.tier).toBe('calm');
    expect(own.settings.source).toBe('room');

    const later = layoutRoomFloor({
      ...base,
      layout,
      everyRoom: { ...everyRoom, changedAt: '2026-11-13T12:00:00.000Z' },
    });
    expect(later.tree.tier).toBe('dense');
  });
});
