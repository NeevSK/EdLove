import type { GuardianPublishedAssessmentSummary } from '@repo/core/api/guardian-assessment.contract';

const VALID_RELATIONSHIP_TYPES = ['parent', 'legal_guardian', 'other'] as const;

export type GuardianAssessmentServiceErrorCategory =
  | 'relationship_denied'
  | 'permission_denied'
  | 'invalid_cursor'
  | 'database_unavailable'
  | 'audit_failed';

export class GuardianAssessmentServiceError extends Error {
  constructor(
    public readonly category: GuardianAssessmentServiceErrorCategory,
    message: string,
  ) {
    super(message);
    this.name = 'GuardianAssessmentServiceError';
  }
}

type GuardianAssessmentDb = {
  studentGuardianRelationship: {
    findFirst(args: unknown): Promise<{ id: string } | null>;
  };
  guardianAssessmentPermission: {
    findFirst(args: unknown): Promise<{ id: string } | null>;
  };
  gradeMark: {
    findMany(args: unknown): Promise<readonly Record<string, unknown>[]>;
  };
  guardianAssessmentReadAuditEvent: {
    create(args: unknown): Promise<unknown>;
  };
};

type ReadPublishedAssessmentInput = {
  guardianId: string;
  studentId: string;
  limit: number;
  cursor?: string;
  requestId: string;
};

type AssessmentCursor = {
  graded_at: string;
  id: string;
};

function encodeCursor(cursor: AssessmentCursor): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url');
}

function decodeCursor(cursor: string | undefined): AssessmentCursor | undefined {
  if (!cursor) return undefined;
  try {
    const decoded = JSON.parse(
      Buffer.from(cursor, 'base64url').toString('utf8'),
    ) as Partial<AssessmentCursor>;
    if (
      typeof decoded.id !== 'string' ||
      !/^[0-9a-f-]{36}$/i.test(decoded.id) ||
      typeof decoded.graded_at !== 'string' ||
      Number.isNaN(Date.parse(decoded.graded_at))
    ) {
      throw new Error('invalid cursor');
    }
    return { id: decoded.id, graded_at: new Date(decoded.graded_at).toISOString() };
  } catch {
    throw new GuardianAssessmentServiceError('invalid_cursor', 'Invalid assessment cursor');
  }
}

function mapSafeGradeMark(row: Record<string, unknown>) {
  return {
    grade_mark_id: String(row.id),
    percentage: Number(row.percentage),
    letter_grade: String(row.letter_grade),
    graded_at: new Date(String(row.graded_at)).toISOString(),
    published_at: new Date(String(row.published_at)).toISOString(),
  };
}

async function writeAudit(
  db: GuardianAssessmentDb,
  input: ReadPublishedAssessmentInput,
  outcome: 'allowed' | 'denied',
  reason: 'allowed' | 'no_relationship' | 'permission_missing' | 'no_published_results',
  resultCount: number,
) {
  try {
    await db.guardianAssessmentReadAuditEvent.create({
      data: {
        guardian_id: input.guardianId,
        student_id: input.studentId,
        outcome,
        reason,
        result_count: resultCount,
      },
    });
  } catch {
    throw new GuardianAssessmentServiceError(
      'audit_failed',
      `Assessment audit failed (${input.requestId})`,
    );
  }
}

export async function readGuardianPublishedAssessmentSummary(
  db: GuardianAssessmentDb,
  input: ReadPublishedAssessmentInput,
): Promise<GuardianPublishedAssessmentSummary> {
  const cursorId = decodeCursor(input.cursor);

  let relationship: { id: string } | null;
  try {
    relationship = await db.studentGuardianRelationship.findFirst({
      where: {
        guardian_id: input.guardianId,
        student_id: input.studentId,
        relationship_type: { in: [...VALID_RELATIONSHIP_TYPES] },
        // Open guardian policy: unrevoked guardians can read published assessments.
        verification_status: { not: 'revoked' },
      },
      select: { id: true },
    });
  } catch {
    throw new GuardianAssessmentServiceError('database_unavailable', 'Relationship lookup failed');
  }

  if (!relationship) {
    await writeAudit(db, input, 'denied', 'no_relationship', 0);
    throw new GuardianAssessmentServiceError('relationship_denied', 'Guardian relationship denied');
  }

  let permission: { id: string } | null;
  try {
    permission = await db.guardianAssessmentPermission.findFirst({
      where: {
        relationship_id: relationship.id,
        guardian_id: input.guardianId,
        student_id: input.studentId,
        permission_key: 'assessment_results',
        access_level: 'read',
        revoked_at: null,
      },
      select: { id: true },
    });
  } catch {
    throw new GuardianAssessmentServiceError('database_unavailable', 'Permission lookup failed');
  }

  if (!permission) {
    await writeAudit(db, input, 'denied', 'permission_missing', 0);
    throw new GuardianAssessmentServiceError(
      'permission_denied',
      'Guardian assessment permission denied',
    );
  }

  let rows: readonly Record<string, unknown>[];
  try {
    rows = await db.gradeMark.findMany({
      where: {
        student_id: input.studentId,
        publication_state: 'published',
        published_at: { not: null },
        ...(cursorId
          ? {
              OR: [
                { graded_at: { lt: cursorId.graded_at } },
                { graded_at: cursorId.graded_at, id: { lt: cursorId.id } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        percentage: true,
        letter_grade: true,
        graded_at: true,
        published_at: true,
      },
      orderBy: [{ graded_at: 'desc' }, { id: 'desc' }],
      take: input.limit + 1,
    });
  } catch {
    throw new GuardianAssessmentServiceError(
      'database_unavailable',
      'Published assessment lookup failed',
    );
  }

  const hasMore = rows.length > input.limit;
  const page = rows.slice(0, input.limit).map(mapSafeGradeMark);
  await writeAudit(
    db,
    input,
    page.length > 0 ? 'allowed' : 'denied',
    page.length > 0 ? 'allowed' : 'no_published_results',
    page.length,
  );

  return {
    items: page,
    next_cursor: hasMore
      ? encodeCursor({
          id: String(rows[input.limit - 1]?.id),
          graded_at: new Date(String(rows[input.limit - 1]?.graded_at)).toISOString(),
        })
      : null,
    request_id: input.requestId,
  };
}
