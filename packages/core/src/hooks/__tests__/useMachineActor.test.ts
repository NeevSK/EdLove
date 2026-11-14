import { buildPartitionedKey } from '@repo/core/lib/storage.adapter';
import { describe, expect, it } from 'vitest';

describe('buildPartitionedKey Governance', () => {
  it('constructs a fully partitioned key when all segments are provided', () => {
    const key = buildPartitionedKey({
      tenantId: 'school-42',
      userId: 'usr-99',
      entityId: 'class-101',
      feature: 'attendance',
      version: 'v6',
    });
    expect(key).toBe('school-42:usr-99:class-101:attendance:v6');
  });

  it('falls back to safe defaults when optional segments are omitted', () => {
    const key = buildPartitionedKey({
      feature: 'bulk_students',
    });
    expect(key).toBe('global:guest:root:bulk_students:v6');
  });

  it('preserves custom version tags and entity isolation', () => {
    const key = buildPartitionedKey({
      tenantId: 'tenant-omega',
      userId: 'teacher-7',
      entityId: 'session-alpha',
      feature: 'reframe_wizard',
      version: 'draft_v2',
    });
    expect(key).toBe('tenant-omega:teacher-7:session-alpha:reframe_wizard:draft_v2');
  });
});
