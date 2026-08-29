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
    const attendanceScreen = read('packages', 'classroom', 'src', 'screens', 'AttendanceScreen.tsx');

    expect(attendanceSheet).not.toContain('Anura Kumara');
    expect(attendanceSheet).not.toContain('api.attendance.record');
    expect(attendanceScreen).toContain('api.attendance.batchRecord');
    expect(attendanceScreen).toContain('generateIdempotencyKey');
    expect(attendanceScreen).toContain('idempotencyKey');
  });
});
