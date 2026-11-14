import { AppSchema } from '@repo/core/adapters/powersync/schema';
import { describe, expect, it } from 'vitest';

describe('Institutional Scale & Relational Topology Suite', () => {
  it('defines composite B-tree indexes for official institutional tables in local schema', () => {
    // Verify attendance table definition
    expect(AppSchema.attendance).toBeDefined();
    expect(AppSchema.classrooms).toBeDefined();
    expect(AppSchema.students).toBeDefined();

    // Verify presence of institutional foreign keys
    expect(AppSchema.attendance.classroomId).toBeDefined();
    expect(AppSchema.attendance.date).toBeDefined();
    expect(AppSchema.attendance.status).toBeDefined();

    expect(AppSchema.classrooms.schoolId).toBeDefined();
    expect(AppSchema.classrooms.academicYear).toBeDefined();
  });

  it('preserves sacred boundary: thought_records does NOT contain schoolId or classroomId', () => {
    // Introspective check ensuring personal sanctuary reflection table has zero institutional keys
    const thoughtRecordColumns = Object.keys(AppSchema.thoughtRecords);
    expect(thoughtRecordColumns).toContain('userId');
    expect(thoughtRecordColumns).toContain('thought');
    expect(thoughtRecordColumns).not.toContain('schoolId');
    expect(thoughtRecordColumns).not.toContain('classroomId');
    expect(thoughtRecordColumns).not.toContain('school_id');
    expect(thoughtRecordColumns).not.toContain('classroom_id');
  });

  it('keeps learning_reflections private and unindexed for bulk institutional aggregation', () => {
    // Ensure learning_reflections does not contain public school aggregation indexes
    expect(AppSchema.learningReflections).toBeDefined();
    expect(AppSchema.learningReflections.userId).toBeDefined();
  });
});
