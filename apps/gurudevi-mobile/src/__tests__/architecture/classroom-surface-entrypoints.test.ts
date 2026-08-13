import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_ROOT = path.resolve(__dirname, '../../..');
const WORKSPACE_ROOT = path.resolve(APP_ROOT, '..', '..');

const CLASSROOM_PACKAGE_JSON = path.join(WORKSPACE_ROOT, 'packages', 'classroom', 'package.json');
const CLASSROOM_ROUTES = [
  path.join(APP_ROOT, 'app', '(tabs)', 'workspace', 'classroom', 'index.tsx'),
  path.join(APP_ROOT, 'app', '(tabs)', 'workspace', 'classroom', '[classroomId]', 'index.tsx'),
  path.join(APP_ROOT, 'app', '(tabs)', 'workspace', 'classroom', '[classroomId]', 'attendance.tsx'),
  path.join(APP_ROOT, 'app', '(tabs)', 'workspace', 'classroom', '[classroomId]', 'gradebook.tsx'),
  path.join(APP_ROOT, 'app', '(tabs)', 'workspace', 'classroom', 'student', '[classroomId].tsx'),
];

describe('Classroom surface entrypoints', () => {
  it('publishes standard feature-surface entrypoints', () => {
    const pkg = JSON.parse(fs.readFileSync(CLASSROOM_PACKAGE_JSON, 'utf8'));

    expect(pkg.exports['.']).toBeDefined();
    for (const entrypoint of [
      './overview',
      './teacher',
      './student',
      './attendance',
      './gradebook',
      './content',
      './api',
    ]) {
      expect(pkg.exports[entrypoint]).toBeDefined();
    }
  });

  it('active classroom routes consume capability entrypoints', () => {
    const sources = CLASSROOM_ROUTES.map((route) => fs.readFileSync(route, 'utf8'));
    const combined = sources.join('\n');

    expect(combined).not.toContain("from '@repo/classroom';");
    expect(combined).toContain("from '@repo/classroom/overview'");
    expect(combined).toContain("from '@repo/classroom/teacher'");
    expect(combined).toContain("from '@repo/classroom/student'");
    expect(combined).toContain("from '@repo/classroom/attendance'");
    expect(combined).toContain("from '@repo/classroom/gradebook'");
  });
});
