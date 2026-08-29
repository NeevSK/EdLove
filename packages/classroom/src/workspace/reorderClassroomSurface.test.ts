import { describe, expect, it } from 'vitest';
import { reorderClassroomSurface } from './reorderClassroomSurface';

describe('reorderClassroomSurface', () => {
  it('moves a surface after its target when moving down within a zone', () => {
    expect(reorderClassroomSurface(['attendance', 'assignments', 'insights'], 'attendance', 'assignments')).toEqual([
      'assignments',
      'attendance',
      'insights',
    ]);
  });

  it('moves a surface before its target when moving up within a zone', () => {
    expect(reorderClassroomSurface(['attendance', 'assignments', 'insights'], 'insights', 'assignments')).toEqual([
      'attendance',
      'insights',
      'assignments',
    ]);
  });
});
