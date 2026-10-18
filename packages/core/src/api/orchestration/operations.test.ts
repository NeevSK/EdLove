import { classroomsAPI } from '@repo/core/api/classrooms';
import { identityAPI } from '@repo/core/api/identity';
import { resourcesAPI } from '@repo/core/api/resources';
import { describe, expect, it } from 'vitest';
import { attendanceAPI } from './operations';

describe('operations API contract coverage', () => {
  it('keeps the grade-class attendance snapshot behind the attendance oRPC contract', () => {
    expect(attendanceAPI.getGradeClassAttendanceSnapshot).toBeTypeOf('function');
  });

  it('exposes healed attendance facade methods with contract coverage', () => {
    expect(attendanceAPI.upsertDailyRecord).toBeTypeOf('function');
    expect(attendanceAPI.record).toBeTypeOf('function');
    expect(attendanceAPI.getForStudent).toBeTypeOf('function');
    expect(attendanceAPI.getStudentAttendanceTimeline).toBeTypeOf('function');
    expect(attendanceAPI.batchRecord).toBeTypeOf('function');
  });

  it('exposes healed classrooms API methods', () => {
    expect(classroomsAPI.getBySchool).toBeTypeOf('function');
    expect(classroomsAPI.getAvailableByGrade).toBeTypeOf('function');
    expect(classroomsAPI.getClassroomCapacitySummary).toBeTypeOf('function');
    expect(classroomsAPI.getByTeacher).toBeTypeOf('function');
  });

  it('exposes healed identity API classroom capacity alias', () => {
    expect(identityAPI.getClassroomCapacitySummary).toBeTypeOf('function');
    expect(identityAPI.resolveWorkspaceContext).toBeTypeOf('function');
  });

  it('exposes healed resources API local-first cache and mutation methods', () => {
    expect(resourcesAPI.getAll).toBeTypeOf('function');
    expect(resourcesAPI.create).toBeTypeOf('function');
    expect(resourcesAPI.togglePin).toBeTypeOf('function');
    expect(resourcesAPI.delete).toBeTypeOf('function');
  });
});
