import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_ROOT = path.resolve(__dirname, '../../..');
const PACKAGES_ROOT = path.resolve(APP_ROOT, '..', '..');

describe('Principal governance boundary guardrails', () => {
  // Test 1: Principal web views should not import supabase directly
  it('prevents direct supabase imports in principal web views', () => {
    const principalFiles = [
      path.join(PACKAGES_ROOT, 'admin/src/screens/PrincipalDashboard.web.tsx'),
    ];

    principalFiles.forEach((file) => {
      if (fs.existsSync(file)) {
        const source = fs.readFileSync(file, 'utf8');
        // Should not contain direct supabase imports
        expect(source).not.toMatch(/import.*supabase.*from.*['"]@repo\/core['"]/);
        expect(source).not.toMatch(/import.*supabase.*from.*['"].*supabase['"]/);
      }
    });
  });

  // Test 2: Principal-only actions should have capability checks
  it('ensures principal-only actions have school.manage capability checks', () => {
    const adminFiles = [
      path.join(PACKAGES_ROOT, 'admin/src/screens/PrincipalDashboard.web.tsx'),
      path.join(PACKAGES_ROOT, 'admin/src/screens/PrincipalNativeWorkspace.tsx'),
    ];

    adminFiles.forEach((file) => {
      if (fs.existsSync(file)) {
        const source = fs.readFileSync(file, 'utf8');
        // Should use capabilities for principal actions
        if (
          source.includes('createSchool') ||
          source.includes('deleteSchool') ||
          source.includes('manageUsers')
        ) {
          expect(source).toMatch(/policy\.can\(|useCapabilities\(\)/);
        }
      }
    });
  });
});
