import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  it('publishes standard feature-surface entrypoints', () => {
    const pkg = JSON.parse(fs.readFileSync(CLASSROOM_PACKAGE_JSON, 'utf8'));

    // Verify key screen exports are defined under package.json exports mapping
    expect(pkg.exports['.']).toBeDefined();
  });

  it('native classroom stack consumes modern classroom package barrel', () => {
    const source = fs.readFileSync(CLASSROOM_NATIVE_STACK, 'utf8');

    expect(source.includes("from '@repo/classroom';")).toBe(true);
    expect(source.includes('FounderDashboard')).toBe(false);
    expect(source.includes('FounderSchoolDashboard')).toBe(false);
  });
});
