import { describe, expect, it, vi } from 'vitest';
import {
  GuardianAssessmentServiceError,
  readGuardianPublishedAssessmentSummary,
} from '../core/services/guardianAssessment';

const ids = {
  guardianId: '11111111-1111-4111-8111-111111111111',
  studentId: '22222222-2222-4222-8222-222222222222',
};

const relationshipId = '33333333-3333-4333-8333-333333333333';

function dbFixture(overrides: Record<string, unknown> = {}) {
  const db: any = {
    studentGuardianRelationship: { findFirst: vi.fn().mockResolvedValue({ id: relationshipId }) },
    guardianAssessmentPermission: {
      findFirst: vi.fn().mockResolvedValue({ id: '44444444-4444-4444-8444-444444444444' }),
    },
    gradeMark: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: '55555555-5555-4555-8555-555555555555',
          percentage: 93,
          letter_grade: 'A',
          graded_at: '2026-08-13T10:00:00.000Z',
          published_at: '2026-08-13T10:00:00.000Z',
        },
      ]),
    },
    guardianAssessmentReadAuditEvent: { create: vi.fn().mockResolvedValue({}) },
    ...overrides,
  };
  return db;
}

describe('guardian assessment API service boundary', () => {
  it('returns only published safe fields and records an allowed audit event', async () => {
    const db = dbFixture();
    const result = await readGuardianPublishedAssessmentSummary(db, {
      ...ids,
      limit: 25,
      requestId: 'request-1',
    });

    expect(result.items).toEqual([
      expect.objectContaining({
        grade_mark_id: expect.any(String),
        percentage: 93,
        letter_grade: 'A',
      }),
    ]);
    expect(result.items[0]).not.toHaveProperty('feedback');
    expect(result.items[0]).not.toHaveProperty('graded_by');
    expect(db.guardianAssessmentReadAuditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ outcome: 'allowed', result_count: 1 }),
    });
  });

  it('denies unrelated students before reading grade marks and audits the denial', async () => {
    const db = dbFixture({
      studentGuardianRelationship: { findFirst: vi.fn().mockResolvedValue(null) },
    });

    await expect(
      readGuardianPublishedAssessmentSummary(db, { ...ids, limit: 25, requestId: 'request-2' }),
    ).rejects.toMatchObject({ category: 'relationship_denied' });
    expect(db.gradeMark.findMany).not.toHaveBeenCalled();
    expect(db.guardianAssessmentReadAuditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ outcome: 'denied', reason: 'no_relationship' }),
    });
  });

  it('denies missing explicit permission and rejects malformed cursors deterministically', async () => {
    const db = dbFixture({
      guardianAssessmentPermission: { findFirst: vi.fn().mockResolvedValue(null) },
    });
    await expect(
      readGuardianPublishedAssessmentSummary(db, { ...ids, limit: 25, requestId: 'request-3' }),
    ).rejects.toMatchObject({ category: 'permission_denied' });
    await expect(
      readGuardianPublishedAssessmentSummary(dbFixture(), {
        ...ids,
        limit: 25,
        cursor: 'bad',
        requestId: 'request-4',
      }),
    ).rejects.toMatchObject({ category: 'invalid_cursor' });
  });

  it('fails closed when the audit write fails', async () => {
    const db = dbFixture({
      guardianAssessmentReadAuditEvent: {
        create: vi.fn().mockRejectedValue(new Error('audit down')),
      },
    });
    await expect(
      readGuardianPublishedAssessmentSummary(db, { ...ids, limit: 25, requestId: 'request-5' }),
    ).rejects.toBeInstanceOf(GuardianAssessmentServiceError);
  });

  it('uses a stable composite cursor for tied assessment timestamps', async () => {
    const db = dbFixture({
      gradeMark: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: '55555555-5555-4555-8555-555555555555',
            percentage: 93,
            letter_grade: 'A',
            graded_at: '2026-08-13T10:00:00.000Z',
            published_at: '2026-08-13T10:00:00.000Z',
          },
          {
            id: '66666666-6666-4666-8666-666666666666',
            percentage: 92,
            letter_grade: 'A-',
            graded_at: '2026-08-13T10:00:00.000Z',
            published_at: '2026-08-13T10:00:00.000Z',
          },
        ]),
      },
    });

    const result = await readGuardianPublishedAssessmentSummary(db, {
      ...ids,
      limit: 1,
      requestId: 'request-6',
    });
    const cursor = result.next_cursor;
    expect(cursor).toEqual(expect.any(String));

    const secondDb = dbFixture();
    await readGuardianPublishedAssessmentSummary(secondDb, {
      ...ids,
      limit: 1,
      cursor: cursor ?? undefined,
      requestId: 'request-7',
    });
    expect(secondDb.gradeMark.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { graded_at: { lt: '2026-08-13T10:00:00.000Z' } },
            {
              graded_at: '2026-08-13T10:00:00.000Z',
              id: { lt: '55555555-5555-4555-8555-555555555555' },
            },
          ],
        }),
      }),
    );
  });
});
