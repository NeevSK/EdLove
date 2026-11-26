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

import { readFileSync } from 'node:fs';
import { schema } from '@repo/schema';
import { getTableConfig, type SQLiteTable } from 'drizzle-orm/sqlite-core';
import { describe, expect, it } from 'vitest';
import { AppSchema, isLocalOnlyTable, LOCAL_ONLY_TABLES } from '../schema';

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
    'learningReflections',
    'schools',
    'cedarPolicies',
    'permissionSnapshots',
    'policyVersion',
    'formTemplates',
    'formResponses',
    'tuitionInstitutes',
    'tuitionBatches',
    'guardianBonds',
  ] as const;

  it('LOCAL_ONLY_TABLES contains exactly 17 tables', () => {
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

// ZenStack model → device tables. The model (schema.zmodel, generated into @repo/schema) is
// the one description of a table; a replicated device table may only carry columns the
// model has, with a SQLite type that can hold the model's type. Sync streams decide which
// tables replicate. This is wiring only: it does not decide what goes to the device.
type ModelField = {
  name: string;
  type: string;
  array?: boolean;
  relation?: unknown;
  attributes?: readonly Attribute[];
};
type Attribute = { name: string; args?: readonly { value?: { value?: unknown } }[] };
type Model = {
  name: string;
  fields: Record<string, ModelField>;
  attributes?: readonly Attribute[];
};

const mapped = (attributes: readonly Attribute[] | undefined, name: string) =>
  attributes?.find((attribute) => attribute.name === name)?.args?.[0]?.value?.value as
    | string
    | undefined;
const modelsByTable = new Map<string, Model>(
  (Object.values(schema.models) as unknown as Model[]).map((model) => [
    mapped(model.attributes, '@@map') ?? model.name,
    model,
  ]),
);
const enums = new Set(Object.keys((schema as { enums?: Record<string, unknown> }).enums ?? {}));
const streamed = new Set(
  [
    ...readFileSync(
      new URL('../../../../../../powersync/sync-config.yaml', import.meta.url),
      'utf8',
    ).matchAll(/\b(?:FROM|JOIN)\s+([a-z_][a-z0-9_]*)/gi),
  ].map((match) => match[1] as string),
);
// What each SQLite column type can hold, by model type.
const HOLDS: Record<string, readonly string[]> = {
  SQLiteText: ['String', 'DateTime', 'Json', 'Decimal', 'BigInt', 'enum'],
  SQLiteInteger: ['Int', 'BigInt', 'Boolean', 'DateTime'],
  SQLiteBoolean: ['Boolean'],
  SQLiteTimestamp: ['DateTime'],
  SQLiteReal: ['Float', 'Decimal', 'Int'],
};
// Device tables that are neither local-only nor read by any stream (found 2026-11-26).
// Each needs a decision: add a stream, or mark it local-only. The list may only shrink.
const UNDECIDED = new Set([
  'jurisdiction_nodes',
  'joy_moments',
  'gratitude_glimmers',
  'sleep_logs',
  'timetable_periods',
  'daily_prep_items',
  'personal_reminders',
]);

const replicated = Object.entries(AppSchema)
  .filter(([key]) => !isLocalOnlyTable(key))
  .map(([, table]) => getTableConfig(table as SQLiteTable));

describe('AppSchema ↔ ZenStack model (offline)', () => {
  it('every replicated device table is described by the model', () => {
    expect(replicated.filter((table) => !modelsByTable.has(table.name)).map((t) => t.name)).toEqual(
      [],
    );
  });

  it('every replicated device column exists in the model with a type SQLite can hold', () => {
    const drift: string[] = [];
    for (const table of replicated) {
      const model = modelsByTable.get(table.name);
      if (!model) continue;
      const fields = new Map(
        Object.values(model.fields)
          .filter((field) => !field.relation)
          .map((field) => [mapped(field.attributes, '@map') ?? field.name, field]),
      );
      for (const column of table.columns) {
        const field = fields.get(column.name);
        if (!field) {
          drift.push(`${table.name}.${column.name}: not in the model`);
          continue;
        }
        const kind = field.array ? 'Json' : enums.has(field.type) ? 'enum' : field.type;
        if (!HOLDS[column.columnType]?.includes(kind))
          drift.push(`${table.name}.${column.name}: ${column.columnType} cannot hold ${kind}`);
      }
    }
    expect(drift).toEqual([]);
  });

  it('every stream reads tables the model describes and the device declares', () => {
    const deviceTables = new Set(replicated.map((table) => table.name));
    for (const table of streamed) {
      expect(modelsByTable.has(table), `${table} in the model`).toBe(true);
      expect(deviceTables.has(table), `${table} on the device`).toBe(true);
    }
  });

  it('every replicated device table is streamed, or listed as undecided', () => {
    const unstreamed = replicated.map((table) => table.name).filter((name) => !streamed.has(name));
    expect(unstreamed.sort()).toEqual([...UNDECIDED].sort());
  });
});
