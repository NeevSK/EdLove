import { describe, expect, it } from 'vitest';
import { roomScreenOf, screenFeatureOf } from '../../app/(sanctuary)/components/RoomRouteTabs';

describe('a room’s screens', () => {
  it('treats the room itself as its Overview and any path under it as one of its screens', () => {
    expect(roomScreenOf('/library')).toBeNull();
    expect(roomScreenOf('/library/map')).toBe('library');
    expect(roomScreenOf('/community/forest')).toBe('community');
    expect(roomScreenOf('/workspace/plan')).toBe('workspace');
    expect(roomScreenOf('/settings/privacy')).toBeNull();
  });

  it('finds the catalog feature a screen belongs to', () => {
    expect(screenFeatureOf('library', '/library/map')?.id).toBe('library-map');
    expect(screenFeatureOf('community', '/community/forest')?.id).toBe('community-forest');
    expect(screenFeatureOf('library', '/library/reader/abc')).toBeUndefined();
  });
});

describe('the school’s own screens', () => {
  it('are Workspace screens, not a second Workspace main screen', () => {
    expect(roomScreenOf('/admin/principal')).toBe('workspace');
    expect(roomScreenOf('/admin/analytics')).toBe('workspace');
  });
});
