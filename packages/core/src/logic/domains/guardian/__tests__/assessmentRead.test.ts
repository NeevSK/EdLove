import { describe, expect, it, vi } from 'vitest';
import {
  createGuardianAssessmentReadService,
  type GuardianAssessmentReadAuditEvent,
} from '../assessmentRead';

const NOW = '2026-08-13T10:00:00.000Z';

function createDependencies(overrides: Record<string, unknown> = {}) {
  const auditEvents: GuardianAssessmentReadAuditEvent[] = [];
  const dependencies = {
    loadRelationships: vi.fn().mockResolvedValue([
      {
        student_id: 'student-1',
        guardian_id: 'guardian-1',
        relationship_type: 'parent',
        permissions: [{ category: 'grades', level: 'read', scope: 'assigned_students' }],
      },
    ]),
    loadGrades: vi.fn().mockResolvedValue([
      {
        student_id: 'student-1',
        publication_state: 'published',
        published_at: NOW,
        subject: 'Mathematics',
        grade: 'A',
        percentage: 93,
        graded_at: NOW,
        assessment_type: 'exam',
        feedback: 'private teacher feedback',
        graded_by: 'teacher-1',
        classroom_id: 'classroom-1',
      },
      {
        student_id: 'student-1',
        publication_state: 'draft',
        published_at: null,
        subject: 'Science',
        grade: 'B',
      },
    ]),
    writeAudit: vi.fn(async (event: GuardianAssessmentReadAuditEvent) => {
      auditEvents.push(event);
    }),
    now: () => NOW,
    ...overrides,
  };

  return { dependencies, auditEvents };
}

describe('guardian assessment read contract', { tags: ['guardian', 'security', 'fast'] }, () => {
  it('allows a permitted guardian to read published results only', async () => {
    const { dependencies } = createDependencies();
    const read = createGuardianAssessmentReadService(dependencies);

    await expect(read('guardian-1', 'student-1')).resolves.toEqual([
      {
        subject: 'Mathematics',
        grade: 'A',
        percentage: 93,
        date: NOW,
        type: 'exam',
      },
    ]);
  });

  it('denies draft-only results without returning them', async () => {
    const { dependencies, auditEvents } = createDependencies({
      loadGrades: vi.fn().mockResolvedValue([
        {
          student_id: 'student-1',
          publication_state: 'draft',
          published_at: null,
          grade: 'A',
        },
      ]),
    });
    const read = createGuardianAssessmentReadService(dependencies);

    await expect(read('guardian-1', 'student-1')).resolves.toEqual([]);
    expect(auditEvents[0]).toMatchObject({
      outcome: 'denied',
      reason: 'no_published_results',
      result_count: 0,
    });
  });

  it('denies an unrelated student before loading grades', async () => {
    const { dependencies, auditEvents } = createDependencies({
      loadRelationships: vi.fn().mockResolvedValue([]),
    });
    const read = createGuardianAssessmentReadService(dependencies);

    await expect(read('guardian-1', 'student-2')).resolves.toEqual([]);
    expect(dependencies.loadGrades).not.toHaveBeenCalled();
    expect(auditEvents[0]).toMatchObject({ outcome: 'denied', reason: 'no_relationship' });
  });

  it('denies a relationship type outside the current database contract', async () => {
    const { dependencies, auditEvents } = createDependencies({
      loadRelationships: vi.fn().mockResolvedValue([
        {
          student_id: 'student-1',
          guardian_id: 'guardian-1',
          relationship_type: 'caregiver',
          permissions: [{ category: 'grades', level: 'read', scope: 'assigned_students' }],
        },
      ]),
    });
    const read = createGuardianAssessmentReadService(dependencies);

    await expect(read('guardian-1', 'student-1')).resolves.toEqual([]);
    expect(dependencies.loadGrades).not.toHaveBeenCalled();
    expect(auditEvents[0]).toMatchObject({ outcome: 'denied', reason: 'invalid_relationship' });
  });

  it('denies relationships whose permission data is absent', async () => {
    const { dependencies, auditEvents } = createDependencies({
      loadRelationships: vi.fn().mockResolvedValue([
        {
          student_id: 'student-1',
          guardian_id: 'guardian-1',
          relationship_type: 'parent',
        },
      ]),
    });
    const read = createGuardianAssessmentReadService(dependencies);

    await expect(read('guardian-1', 'student-1')).resolves.toEqual([]);
    expect(dependencies.loadGrades).not.toHaveBeenCalled();
    expect(auditEvents[0]).toMatchObject({ outcome: 'denied', reason: 'permission_missing' });
  });

  it('returns only the minimized assessment fields and emits an auditable payload', async () => {
    const { dependencies, auditEvents } = createDependencies();
    const read = createGuardianAssessmentReadService(dependencies);

    const result = await read('guardian-1', 'student-1');

    expect(result[0]).not.toHaveProperty('student_id');
    expect(result[0]).not.toHaveProperty('feedback');
    expect(result[0]).not.toHaveProperty('graded_by');
    expect(result[0]).not.toHaveProperty('classroom_id');
    expect(auditEvents).toEqual([
      {
        event: 'guardian_assessment_read',
        actor_id: 'guardian-1',
        student_id: 'student-1',
        outcome: 'allowed',
        reason: 'allowed',
        result_count: 1,
        occurred_at: NOW,
      },
    ]);
  });
});
