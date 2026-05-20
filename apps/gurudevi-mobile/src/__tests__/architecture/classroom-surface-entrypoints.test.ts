const fs = require('node:fs');
const path = require('node:path');

const APP_ROOT = path.resolve(__dirname, '../../..');
const WORKSPACE_ROOT = path.resolve(APP_ROOT, '..', '..');

const CLASSROOM_PACKAGE_JSON = path.join(WORKSPACE_ROOT, 'packages', 'classroom', 'package.json');
const CLASSROOM_NATIVE_STACK = path.join(
  APP_ROOT,
  'src',
  'navigation',
  'ClassroomStackNavigator.tsx',
);

describe('Classroom surface entrypoints', () => {
  it('publishes additive feature-surface entrypoints', () => {
    const pkg = JSON.parse(fs.readFileSync(CLASSROOM_PACKAGE_JSON, 'utf8'));

    expect(pkg.exports['./core']).toBe('./src/entrypoints/core.ts');
    expect(pkg.exports['./teacher']).toBe('./src/entrypoints/teacher.ts');
    expect(pkg.exports['./student']).toBe('./src/entrypoints/student.ts');
  });

  it('native classroom stack consumes surface entrypoints instead of the root barrel', () => {
    const source = fs.readFileSync(CLASSROOM_NATIVE_STACK, 'utf8');

    expect(source.includes("from '@repo/classroom';")).toBe(false);
    expect(source.includes("from '@repo/classroom/core';")).toBe(true);
    expect(source.includes("from '@repo/classroom/teacher';")).toBe(true);
    expect(source.includes("from '@repo/classroom/student';")).toBe(true);
    expect(source.includes('FounderDashboard')).toBe(false);
    expect(source.includes('FounderSchoolDashboard')).toBe(false);
    expect(source.includes('SchoolCreation')).toBe(false);
  });
});
