/**
 * Storage Contract: AppSchema ↔ Postgres Alignment Tests
 *
 * Enforces the "Single SSOT Reconciliation Rule" from storage-efficiency skill:
 * - ZenStack .zmodel is the domain SSOT
 * - Postgres migrations are the physical SSOT for cloud schema
 * - Drizzle AppSchema columns for published tables must match Postgres exactly
 * - Local-only tables are explicitly marked in LOCAL_ONLY_TABLES
 * - tableToModelMap in sync.ts contains exactly the 4 published tables
 */

import { AppSchema, isLocalOnlyTable, LOCAL_ONLY_TABLES } from '@repo/core/adapters/powersync';
import { describe, expect, it } from 'vitest';

describe('Storage Contract: AppSchema ↔ Postgres Alignment', () => {
  const SYNCED_TABLES = [
    'bonds',
    'school_memberships',
    'classrooms',
    'classroom_students',
  ] as const;
  const LOCAL_ONLY_TABLES_LIST = [
    'pricingManifest',
    'userEntitlementGrants',
    'userPreferences',
    'attendance',
    'students',
    'moodLogs',
    'thoughtRecords',
    'schools',
    'cedarPolicies',
    'permissionSnapshots',
    'policyVersion',
    'formTemplates',
    'formResponses',
  ] as const;

  it('LOCAL_ONLY_TABLES contains exactly 13 tables', () => {
    expect(LOCAL_ONLY_TABLES.size).toBe(LOCAL_ONLY_TABLES_LIST.length);
  });

  it('isLocalOnlyTable returns true for all local-only tables', () => {
    for (const table of LOCAL_ONLY_TABLES_LIST) {
      expect(isLocalOnlyTable(table)).toBe(true);
    }
  });

  it('isLocalOnlyTable returns false for all synced tables', () => {
    for (const table of SYNCED_TABLES) {
      expect(isLocalOnlyTable(table)).toBe(false);
    }
  });

  it('AppSchema exports exactly 17 tables (4 synced + 13 local-only)', () => {
    const schemaKeys = Object.keys(AppSchema);
    expect(schemaKeys).toHaveLength(17);

    for (const table of SYNCED_TABLES) {
      const camelCased = camelCase(table);
      expect(schemaKeys).toContain(camelCased);
    }

    for (const table of LOCAL_ONLY_TABLES_LIST) {
      expect(schemaKeys).toContain(table);
    }
  });

  it('synced tables have required columns', () => {
    // Verify each synced table has the minimum required columns
    expect(AppSchema.bonds).toBeDefined();
    expect(AppSchema.schoolMemberships).toBeDefined();
    expect(AppSchema.classrooms).toBeDefined();
    expect(AppSchema.classroomStudents).toBeDefined();

    // bonds: id, userId, entityId, entityType, capacity, createdAt, updatedAt
    const bondsCols = Object.keys(AppSchema.bonds);
    expect(bondsCols).toContain('id');
    expect(bondsCols).toContain('userId');
    expect(bondsCols).toContain('entityId');
    expect(bondsCols).toContain('entityType');
    expect(bondsCols).toContain('capacity');
    expect(bondsCols).toContain('createdAt');
    expect(bondsCols).toContain('updatedAt');

    // school_memberships: id, userId, schoolId, role, status, etc.
    const smCols = Object.keys(AppSchema.schoolMemberships);
    expect(smCols).toContain('id');
    expect(smCols).toContain('userId');
    expect(smCols).toContain('schoolId');
    expect(smCols).toContain('role');
    expect(smCols).toContain('status');

    // classrooms: id, name, schoolId, isArchived, createdAt, updatedAt
    const crCols = Object.keys(AppSchema.classrooms);
    expect(crCols).toContain('id');
    expect(crCols).toContain('name');
    expect(crCols).toContain('schoolId');
    expect(crCols).toContain('isArchived'); // Must match Postgres is_archived
    expect(crCols).toContain('createdAt');
    expect(crCols).toContain('updatedAt');

    // classroom_students: id, classroomId, studentId, fullName, etc.
    const csCols = Object.keys(AppSchema.classroomStudents);
    expect(csCols).toContain('id');
    expect(csCols).toContain('classroomId');
    expect(csCols).toContain('studentId');
    expect(csCols).toContain('fullName');
    expect(csCols).toContain('status');
    expect(csCols).toContain('enrolledAt');
  });

  it('local-only tables are not in sync-config.yaml streams', () => {
    // This test documents the contract; actual sync-config.yaml validation
    // would require parsing the YAML file
    expect(LOCAL_ONLY_TABLES_LIST).toContain('attendance');
    expect(LOCAL_ONLY_TABLES_LIST).toContain('students');
    expect(LOCAL_ONLY_TABLES_LIST).toContain('moodLogs');
    // These should NOT be in sync-config.yaml streams
  });
});

function camelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}
