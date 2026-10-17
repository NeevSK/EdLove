import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../../../..');

const read = (...parts: string[]) => fs.readFileSync(path.join(repoRoot, ...parts), 'utf8');

describe('workspace classroom domain slice contracts', () => {
  it('consumes selected classroom ids in role-specific routes', () => {
    const dispatcher = read('apps', 'gurudevi-mobile', 'app', '(tabs)', 'workspace', 'index.tsx');
    const studentList = read(
      'packages',
      'classroom',
      'src',
      'components',
      'student',
      'StudentClassroomList.tsx',
    );

    expect(dispatcher).toContain("pathname: '/workspace/classroom/[classroomId]'");
    expect(dispatcher).toContain("pathname: '/workspace/classroom/student/[classroomId]'");
    expect(dispatcher).not.toMatch(/classroomId\s*\|\|\s*['"]default['"]/);
    expect(studentList).toContain("pathname: '/workspace/classroom/student/[classroomId]'");
    expect(studentList).not.toContain("pathname: '/self'");
  });

  it('keeps attendance roster data authoritative and batch-only', () => {
    const attendanceSheet = read(
      'packages',
      'classroom',
      'src',
      'components',
      'AttendanceSheet.tsx',
    );
    const attendanceScreen = read(
      'packages',
      'classroom',
      'src',
      'screens',
      'AttendanceScreen.tsx',
    );

    const gradeClassRegister = read(
      'packages',
      'classroom',
      'src',
      'logic',
      'gradeClassRegister.ts',
    );

    expect(attendanceSheet).not.toContain('Anura Kumara');
    expect(attendanceSheet).not.toContain('api.attendance.record');
    // Model A: one batch write to daily_attendance per grade class. The server upsert is
    // keyed by (student_id, grade_class_id, attendance_date), so a retried save is idempotent.
    expect(attendanceScreen).toContain('saveGradeClassRegister');
    expect(gradeClassRegister).toContain('attendanceAPI.batchRecord');
    expect(gradeClassRegister).not.toContain('upsertAttendanceRecord');
    // No fake offline success: nothing synced the old local SQLite queue.
    expect(attendanceScreen).not.toContain('queuedOffline');
  });
});
