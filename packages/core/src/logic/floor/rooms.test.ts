import { describe, expect, it } from 'vitest';
import type { DomainEntry } from '../registry/domainEntry';
import { entryForRole, roomCatalogOf, roomFeatures, roomSurfaceDefinitions } from './rooms';

const entry = (id: string, extra: Partial<DomainEntry> = {}): DomainEntry => ({
  id,
  label: id,
  ownerPackage: 'classroom',
  mobileSupport: true,
  webSupport: true,
  state: 'live',
  lifecycle: {
    owner: 'classroom',
    createdAt: '2026-07-26',
    reviewAt: '2026-09-30',
    permanentJustification: 'test',
  },
  citizenshipRequired: 3,
  capabilityRequirement: { action: 'read', subject: 'Attendance' },
  tabDomain: 'workspace',
  surfaceId: id,
  defaultOrder: 10,
  analyticsKey: `workspace.${id}`,
  floor: { group: 'academics', shape: 'card' },
  ...extra,
});

const CATALOG = {
  attendance: entry('attendance', {
    roles: ['teacher'],
    common: true,
    defaultOrder: 1,
    floor: { group: 'today', shape: 'row' },
  }),
  gradebook: entry('gradebook', { roles: ['teacher', 'guardian'], defaultOrder: 2 }),
  kiosk: entry('kiosk', {
    roles: ['principal'],
    defaultOrder: 3,
    floor: { group: 'institutional', shape: 'card' },
  }),
  phoneless: entry('phoneless', { mobileSupport: false }),
  draft: entry('draft', { state: 'development' }),
  shell: entry('shell', { floor: undefined }),
  self: entry('self', { tabDomain: 'self' }),
};

describe('room catalogs: the floor reads features from the AppCatalog', () => {
  it('offers only this room, this role, this platform, and furniture (entries with a floor place)', () => {
    expect(roomFeatures(CATALOG, 'workspace', 'teacher', 'mobile').map((e) => e.id)).toEqual([
      'attendance',
      'gradebook',
    ]);
    expect(roomFeatures(CATALOG, 'workspace', 'teacher', 'web').map((e) => e.id)).toEqual([
      'attendance',
      'gradebook',
      'phoneless',
    ]);
  });

  it('common features reach every role; tutors and markers count as teachers', () => {
    expect(roomFeatures(CATALOG, 'workspace', 'principal', 'mobile').map((e) => e.id)).toEqual([
      'attendance',
      'kiosk',
    ]);
    expect(entryForRole(CATALOG.gradebook, 'lead_tutor')).toBe(true);
    expect(entryForRole(CATALOG.gradebook, 'parent')).toBe(true);
    expect(entryForRole(CATALOG.kiosk, 'student')).toBe(false);
  });

  it('keeps only the zones and groups that hold something', () => {
    const room = roomCatalogOf(CATALOG, 'workspace', 'teacher', 'mobile');
    expect(room.groups.map((g) => g.id)).toEqual(['today', 'academics']);
    expect(room.zones.map((z) => z.id)).toEqual(['today', 'work']);
  });

  it('every feature becomes a saved-layout surface in its zone', () => {
    const room = roomCatalogOf(CATALOG, 'workspace', 'teacher', 'mobile');
    const defs = roomSurfaceDefinitions(room, 'workspace@bond-1');
    expect(defs.map((d) => [d.surfaceId, d.defaultZone, d.groupId])).toEqual([
      ['attendance', 'today', 'today'],
      ['gradebook', 'work', 'academics'],
    ]);
  });
});
