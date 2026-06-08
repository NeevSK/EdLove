import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_ROOT = path.resolve(__dirname, '../../..');
const WORKSPACE_ROOT = path.resolve(APP_ROOT, '..', '..');

const FOUNDER_NATIVE_STACK = path.join(APP_ROOT, 'src', 'navigation', 'FounderStackNavigator.tsx');
const FOUNDER_WEB_STACK = path.join(APP_ROOT, 'src', 'navigation', 'FounderStackNavigator.web.tsx');
const CLASSROOM_NATIVE_STACK = path.join(
  APP_ROOT,
  'src',
  'navigation',
  'ClassroomStackNavigator.tsx',
);
const CLASSROOM_WEB_STACK = path.join(
  APP_ROOT,
  'src',
  'navigation',
  'ClassroomStackNavigator.web.tsx',
);
const ADMIN_PACKAGE_JSON = path.join(WORKSPACE_ROOT, 'packages', 'admin', 'package.json');

describe('Founder stack boundaries', () => {
  it('publishes founder-focused admin entrypoints', () => {
    const pkg = JSON.parse(fs.readFileSync(ADMIN_PACKAGE_JSON, 'utf8'));

    // Verify mapping exports exist inside admin package.json
    expect(pkg.exports['./screens/FounderDashboard']).toBeDefined();
    expect(pkg.exports['./screens/FounderSchoolDashboard']).toBeDefined();
  });

  it('keeps founder routes out of classroom stacks', () => {
    const nativeSource = fs.readFileSync(CLASSROOM_NATIVE_STACK, 'utf8');
    const webSource = fs.readFileSync(CLASSROOM_WEB_STACK, 'utf8');

    expect(nativeSource.includes('FounderDashboard')).toBe(false);
    expect(nativeSource.includes('FounderSchoolDashboard')).toBe(false);

    expect(webSource.includes('FounderDashboard')).toBe(false);
    expect(webSource.includes('FounderSchoolDashboard')).toBe(false);
  });

  it('registers founder-owned routes inside dedicated founder stacks', () => {
    const nativeSource = fs.readFileSync(FOUNDER_NATIVE_STACK, 'utf8');
    const webSource = fs.readFileSync(FOUNDER_WEB_STACK, 'utf8');

    expect(nativeSource.includes('@repo/admin')).toBe(true);
    expect(nativeSource.includes('name="FounderDashboard"')).toBe(true);
    expect(nativeSource.includes('name="FounderSchoolDashboard"')).toBe(true);
    expect(nativeSource.includes('name="PrincipalDashboard"')).toBe(true);

    expect(webSource.includes('FounderDashboard')).toBe(true);
    expect(webSource.includes('FounderSchoolDashboard')).toBe(true);
    expect(webSource.includes('PrincipalDashboard')).toBe(true);
  });
});
