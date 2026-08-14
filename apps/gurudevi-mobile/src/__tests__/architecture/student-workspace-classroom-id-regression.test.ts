import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_ROUTE = path.resolve(__dirname, '../../../app/(tabs)/workspace/index.tsx');
const STUDENT_DASHBOARD = path.resolve(
  __dirname,
  '../../../../../packages/classroom/src/screens/StudentDashboard.tsx',
);
const TEACHER_DASHBOARD = path.resolve(
  __dirname,
  '../../../../../packages/classroom/src/screens/TeacherDashboard.tsx',
);
const STUDENT_DESTINATION = path.resolve(
  __dirname,
  '../../../app/(tabs)/workspace/classroom/student/[classroomId].tsx',
);
const TEACHER_DESTINATION = path.resolve(
  __dirname,
  '../../../app/(tabs)/workspace/classroom/[classroomId]/index.tsx',
);

describe('student workspace classroomId routing', () => {
  it('does not substitute a synthetic default classroom id', () => {
    const source = fs.readFileSync(WORKSPACE_ROUTE, 'utf8');

    expect(source).not.toMatch(/context\.classroomId\s*\|\|\s*['"]default['"]/);
  });

  it('preserves distinct selected classroom ids for student and teacher routes', () => {
    const dispatcher = fs.readFileSync(WORKSPACE_ROUTE, 'utf8');
    const studentDashboard = fs.readFileSync(STUDENT_DASHBOARD, 'utf8');
    const teacherDashboard = fs.readFileSync(TEACHER_DASHBOARD, 'utf8');

    expect(studentDashboard).toContain("pathname: '/workspace/classroom/student/[classroomId]'");
    expect(teacherDashboard).toContain("pathname: '/workspace'");
    expect(studentDashboard).toMatch(/params:\s*{[\s\S]*classroomId:\s*classroom\.id/);
    expect(teacherDashboard).toMatch(/params:\s*{[\s\S]*classroomId:\s*classroom\.id/);

    expect(dispatcher).toContain('requestedClassroomId');
    expect(dispatcher).toContain('selectedClassroomId');
    expect(dispatcher).toContain("pathname: '/workspace/classroom/student/[classroomId]'");
    expect(dispatcher).toContain("pathname: '/workspace/classroom/[classroomId]'");
    expect(dispatcher).toMatch(
      /pathname:\s*'\/workspace\/classroom\/student\/\[classroomId\]'[\s\S]*?classroomId:\s*selectedClassroomId/,
    );
    expect(dispatcher).toMatch(
      /pathname:\s*'\/workspace\/classroom\/\[classroomId\]'[\s\S]*?classroomId:\s*selectedClassroomId/,
    );

    const studentRouteFor = (classroomId: string) =>
      `/workspace/classroom/student/${encodeURIComponent(classroomId)}`;
    const teacherRouteFor = (classroomId: string) =>
      `/workspace?classroomId=${encodeURIComponent(classroomId)}`;

    expect(studentRouteFor('classroom-a')).not.toBe(studentRouteFor('classroom-b'));
    expect(teacherRouteFor('classroom-a')).not.toBe(teacherRouteFor('classroom-b'));
  });

  it('keeps role destinations bound to the dynamic classroom route', () => {
    const studentDestination = fs.readFileSync(STUDENT_DESTINATION, 'utf8');
    const teacherDestination = fs.readFileSync(TEACHER_DESTINATION, 'utf8');

    expect(studentDestination).toContain("from '@repo/classroom/student'");
    expect(teacherDestination).toContain("from '@repo/classroom/teacher'");
    expect(path.basename(STUDENT_DESTINATION)).toBe('[classroomId].tsx');
    expect(path.basename(path.dirname(TEACHER_DESTINATION))).toBe('[classroomId]');
  });
});
