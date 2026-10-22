import './setup';
import { describe, expect, it } from 'vitest';
import {
  resolveGradeClassForLegacyClassroom,
  resolveGradeClassRecord,
} from '../core/handlers/attendance';
import { createFakeDb } from './fakeAttendanceDb';

const schoolId = 'school-1';
const gc5A = {
  id: 'gc-5a',
  school_id: schoolId,
  academic_cycle_id: 'cy-26',
  name: '5A',
  status: 'active',
};
const gc6B = {
  id: 'gc-6b',
  school_id: schoolId,
  academic_cycle_id: 'cy-26',
  name: '6B',
  status: 'active',
};
const pick = ({ id, school_id, academic_cycle_id }: any) => ({ id, school_id, academic_cycle_id });

describe('resolveGradeClassRecord (attendance writes and reads)', () => {
  it('returns a real grade class by id', async () => {
    const db = createFakeDb({ gradeClass: [gc5A, gc6B] });
    await expect(resolveGradeClassRecord(db, 'gc-6b', schoolId)).resolves.toMatchObject(pick(gc6B));
  });

  it('never falls back to the first class in the school for a legacy classroom id', async () => {
    const db = createFakeDb({
      gradeClass: [gc5A, gc6B],
      classroom: [{ id: 'cls-science', school_id: schoolId, name: 'Science 7' }],
    });
    await expect(resolveGradeClassRecord(db, 'cls-science', schoolId)).resolves.toBeNull();
  });

  it('does not redirect a legacy classroom to a same-named grade class', async () => {
    // Cedar authorized the id the caller sent, so attendance must not land elsewhere.
    const db = createFakeDb({
      gradeClass: [gc5A],
      classroom: [{ id: 'cls-5a', school_id: schoolId, name: '5A' }],
    });
    await expect(resolveGradeClassRecord(db, 'cls-5a', schoolId)).resolves.toBeNull();
  });

  it('rejects a grade class from another school', async () => {
    const db = createFakeDb({ gradeClass: [{ ...gc5A, school_id: 'school-2' }] });
    await expect(resolveGradeClassRecord(db, 'gc-5a', schoolId)).resolves.toBeNull();
  });

  it('lets database errors surface instead of swallowing them', async () => {
    const db = {
      gradeClass: {
        findUnique: async () => {
          throw new Error('db down');
        },
      },
    };
    await expect(resolveGradeClassRecord(db, 'gc-5a', schoolId)).rejects.toThrow('db down');
  });
});

describe('resolveGradeClassForLegacyClassroom (shadow enrollment bridge)', () => {
  it('maps a classroom to the single active grade class with the same name', async () => {
    const db = createFakeDb({
      gradeClass: [gc5A, gc6B],
      classroom: [{ id: 'cls-5a', school_id: schoolId, name: '5A' }],
    });
    await expect(
      resolveGradeClassForLegacyClassroom(db, 'cls-5a', schoolId),
    ).resolves.toMatchObject(pick(gc5A));
  });

  it('returns null when no grade class has that name (no first-class fallback)', async () => {
    const db = createFakeDb({
      gradeClass: [gc5A, gc6B],
      classroom: [{ id: 'cls-science', school_id: schoolId, name: 'Science 7' }],
    });
    await expect(
      resolveGradeClassForLegacyClassroom(db, 'cls-science', schoolId),
    ).resolves.toBeNull();
  });

  it('returns null when the name is ambiguous (e.g. two cycles both active)', async () => {
    const db = createFakeDb({
      gradeClass: [gc5A, { ...gc5A, id: 'gc-5a-old', academic_cycle_id: 'cy-25' }],
      classroom: [{ id: 'cls-5a', school_id: schoolId, name: '5A' }],
    });
    await expect(resolveGradeClassForLegacyClassroom(db, 'cls-5a', schoolId)).resolves.toBeNull();
  });
});
