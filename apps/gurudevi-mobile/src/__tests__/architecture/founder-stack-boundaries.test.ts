const fs = require('node:fs');
const path = require('node:path');

const APP_ROOT = path.resolve(__dirname, '../../..');
const WORKSPACE_ROOT = path.resolve(APP_ROOT, '..', '..');

const FOUNDER_NATIVE_STACK = path.join(APP_ROOT, 'src', 'navigation', 'FounderStackNavigator.tsx');
const FOUNDER_WEB_STACK = path.join(APP_ROOT, 'src', 'navigation', 'FounderStackNavigator.web.tsx');
const CLASSROOM_NATIVE_STACK = path.join(APP_ROOT, 'src', 'navigation', 'ClassroomStackNavigator.tsx');
const CLASSROOM_WEB_STACK = path.join(APP_ROOT, 'src', 'navigation', 'ClassroomStackNavigator.web.tsx');
const ADMIN_PACKAGE_JSON = path.join(WORKSPACE_ROOT, 'packages', 'admin', 'package.json');

describe('Founder stack boundaries', () => {
  it('publishes founder-focused admin entrypoints', () => {
    const pkg = JSON.parse(fs.readFileSync(ADMIN_PACKAGE_JSON, 'utf8'));

    expect(pkg.exports['./founder']).toBe('./src/entrypoints/founder.ts');
    expect(pkg.exports['./screens/FounderDashboard']).toBe('./src/screens/FounderDashboard.tsx');
    expect(pkg.exports['./screens/FounderSchoolDashboard']).toBe('./src/screens/FounderSchoolDashboard.tsx');
  });

  it('keeps founder routes out of classroom stacks', () => {
    const nativeSource = fs.readFileSync(CLASSROOM_NATIVE_STACK, 'utf8');
    const webSource = fs.readFileSync(CLASSROOM_WEB_STACK, 'utf8');

    expect(nativeSource.includes('FounderDashboard')).toBe(false);
    expect(nativeSource.includes('FounderSchoolDashboard')).toBe(false);
    expect(nativeSource.includes('SchoolCreation')).toBe(false);

    expect(webSource.includes('FounderDashboard')).toBe(false);
    expect(webSource.includes('FounderSchoolDashboard')).toBe(false);
    expect(webSource.includes('SchoolCreation')).toBe(false);
    expect(webSource.includes('SchoolForest')).toBe(false);
  });

  it('registers founder-owned routes inside dedicated founder stacks', () => {
    const nativeSource = fs.readFileSync(FOUNDER_NATIVE_STACK, 'utf8');
    const webSource = fs.readFileSync(FOUNDER_WEB_STACK, 'utf8');

    expect(nativeSource.includes("from '@repo/admin/founder';")).toBe(true);
    expect(nativeSource.includes('name="FounderDashboard"')).toBe(true);
    expect(nativeSource.includes('name="FounderSchoolDashboard"')).toBe(true);
    expect(nativeSource.includes('name="PrincipalDashboard"')).toBe(true);

    expect(webSource.includes("import('@repo/admin/screens/FounderDashboard')")).toBe(true);
    expect(webSource.includes("import('@repo/admin/screens/FounderSchoolDashboard')")).toBe(true);
    expect(webSource.includes("import('@repo/classroom/screens/PrincipalDashboard.web')")).toBe(true);
  });
});
