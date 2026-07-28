import { describe, expect, it } from 'vitest';
import { resolveBondScope } from '../bondScope';

describe('resolveBondScope', () => {
  it('treats the legacy personal classroom bond as personal sanctuary scope', () => {
    expect(
      resolveBondScope({
        id: 'bond-personal',
        entity_id: 'workspace-1',
        entity_type: 'PERSONAL_CLASSROOM',
        capacity: 'teacher',
      }),
    ).toMatchObject({
      activeBondId: 'bond-personal',
      activeEntityId: 'workspace-1',
      activeEntityType: 'PERSONAL_CLASSROOM',
      schoolId: null,
      isPersonal: true,
    });
  });

  it('derives school context only for school bonds', () => {
    expect(
      resolveBondScope({
        id: 'bond-school',
        entity_id: 'school-1',
        entity_type: 'SCHOOL',
        capacity: 'teacher',
      }).schoolId,
    ).toBe('school-1');
  });
});
