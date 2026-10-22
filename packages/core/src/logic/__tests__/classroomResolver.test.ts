import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearClassroomResolutionCache,
  resolveGradeClassFromClassroom,
} from '../classroomResolver';

vi.mock('@repo/core/api/orpcClient', () => ({
  orpcClient: {
    attendance: {
      getMyGradeClasses: vi.fn(),
    },
  },
}));

vi.mock('@repo/core/api/classrooms', () => ({
  classroomsAPI: {
    getById: vi.fn(),
  },
}));

import { classroomsAPI } from '@repo/core/api/classrooms';
import { orpcClient } from '@repo/core/api/orpcClient';

describe('classroomResolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearClassroomResolutionCache();
  });

  it('returns empty string when given empty classroomId', async () => {
    const result = await resolveGradeClassFromClassroom('');
    expect(result).toBe('');
  });

  it('returns directly when classroomId is already a known grade_class id', async () => {
    vi.mocked(orpcClient.attendance.getMyGradeClasses).mockResolvedValue([
      { id: 'gc-101', name: '5A', academic_cycle_id: 'cycle-1', role: null },
    ]);

    const result = await resolveGradeClassFromClassroom('gc-101');
    expect(result).toBe('gc-101');
  });

  it('resolves by classroom name match', async () => {
    vi.mocked(orpcClient.attendance.getMyGradeClasses).mockResolvedValue([
      { id: 'gc-5a', name: 'Grade 5A', academic_cycle_id: 'cycle-1', role: null },
      { id: 'gc-5b', name: 'Grade 5B', academic_cycle_id: 'cycle-1', role: null },
    ]);
    vi.mocked(classroomsAPI.getById).mockResolvedValue({
      id: 'legacy-classroom-1',
      name: 'Grade 5A',
      school_id: 'school-1',
    } as any);

    const result = await resolveGradeClassFromClassroom('legacy-classroom-1');
    expect(result).toBe('gc-5a');

    // Cached on second call without fetching classroom again
    vi.mocked(classroomsAPI.getById).mockClear();
    const cachedResult = await resolveGradeClassFromClassroom('legacy-classroom-1');
    expect(cachedResult).toBe('gc-5a');
    expect(classroomsAPI.getById).not.toHaveBeenCalled();
  });

  it('does not guess the only assigned grade class when the name does not match', async () => {
    vi.mocked(orpcClient.attendance.getMyGradeClasses).mockResolvedValue([
      { id: 'gc-only', name: 'Primary 1', academic_cycle_id: 'cycle-1', role: null },
    ]);
    vi.mocked(classroomsAPI.getById).mockResolvedValue({
      id: 'legacy-classroom-2',
      name: 'Different Name',
      school_id: 'school-1',
    } as any);

    const result = await resolveGradeClassFromClassroom('legacy-classroom-2');
    expect(result).toBe('');
  });

  it('returns empty when two assigned grade classes share the classroom name', async () => {
    vi.mocked(orpcClient.attendance.getMyGradeClasses).mockResolvedValue([
      { id: 'gc-a', name: '5A', academic_cycle_id: 'cycle-1', role: null },
      { id: 'gc-b', name: '5a ', academic_cycle_id: 'cycle-2', role: null },
    ]);
    vi.mocked(classroomsAPI.getById).mockResolvedValue({
      id: 'legacy-classroom-3',
      name: '5A',
      school_id: 'school-1',
    } as any);
    expect(await resolveGradeClassFromClassroom('legacy-classroom-3')).toBe('');
  });

  it('returns empty (not the classroom id) when the RPC fails', async () => {
    vi.mocked(orpcClient.attendance.getMyGradeClasses).mockRejectedValue(
      new Error('Network error'),
    );

    const result = await resolveGradeClassFromClassroom('legacy-unresolved');
    expect(result).toBe('');
  });
});
