import type { Grade } from '../logic/schemas/grading.schema';

export const GRADE_PUBLISHED_ACTIONS = [
  'grade_published',
  'grade_revised',
  'grade_overridden',
] as const;
export const GRADE_LIFECYCLE_ACTIONS = [...GRADE_PUBLISHED_ACTIONS, 'grade_draft_saved'] as const;

export type GradePublicationState = 'draft' | 'published';

export type GradeLifecycleAuditRow = {
  action?: string | null;
  entity_id?: string | null;
  entityId?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
  metadata?: Record<string, any> | null;
};

export type GradePublicationSnapshot = Grade & {
  publication_state: GradePublicationState;
  published_at?: Date | null;
  published_by?: string | null;
  publication_action?: string | null;
};

function rowEntityId(row: GradeLifecycleAuditRow): string | null {
  return row.entity_id ?? row.entityId ?? null;
}

function rowTimestamp(row: GradeLifecycleAuditRow): string {
  return row.created_at ?? row.createdAt ?? '';
}

function normalizeSnapshot(snapshot: any): GradePublicationSnapshot | null {
  if (!snapshot?.id || !snapshot.student_id || !snapshot.classroom_id) {
    return null;
  }

  return {
    ...snapshot,
    publication_state: snapshot.publication_state === 'published' ? 'published' : 'draft',
    published_at: snapshot.published_at ?? snapshot.publishedAt ?? null,
    published_by: snapshot.published_by ?? snapshot.publishedBy ?? null,
    publication_action: snapshot.publication_action ?? null,
  } as GradePublicationSnapshot;
}

export function annotateGradesWithPublicationState(
  grades: Grade[],
  rows: GradeLifecycleAuditRow[],
): GradePublicationSnapshot[] {
  const latestByGradeId = new Map<string, GradeLifecycleAuditRow>();

  rows.forEach((row) => {
    const gradeId = rowEntityId(row);
    if (!gradeId) return;

    const current = latestByGradeId.get(gradeId);
    if (!current || rowTimestamp(row) > rowTimestamp(current)) {
      latestByGradeId.set(gradeId, row);
    }
  });

  return grades.map((grade) => {
    const latest = latestByGradeId.get(grade.id);
    const metadata = latest?.metadata ?? {};
    const publicationState =
      metadata['publicationState'] === 'published' ||
      (latest?.action ? GRADE_PUBLISHED_ACTIONS.includes(latest.action as any) : false)
        ? 'published'
        : 'draft';

    return {
      ...grade,
      publication_state: publicationState,
      published_at: metadata['publishedAt'] ?? null,
      published_by: metadata['publishedBy'] ?? null,
      publication_action: latest?.action ?? null,
    };
  });
}

export function selectLatestPublishedSnapshots(
  rows: GradeLifecycleAuditRow[],
): GradePublicationSnapshot[] {
  const latestByGradeId = new Map<string, GradeLifecycleAuditRow>();

  rows.forEach((row) => {
    if (!row.action || !GRADE_PUBLISHED_ACTIONS.includes(row.action as any)) return;
    const gradeId = rowEntityId(row);
    if (!gradeId) return;

    const current = latestByGradeId.get(gradeId);
    if (!current || rowTimestamp(row) > rowTimestamp(current)) {
      latestByGradeId.set(gradeId, row);
    }
  });

  return Array.from(latestByGradeId.values())
    .map((row) => normalizeSnapshot(row.metadata?.['snapshot']))
    .filter((snapshot): snapshot is GradePublicationSnapshot => snapshot !== null)
    .sort((a, b) => (b.published_at?.getTime() ?? b.updated_at.getTime()) - (a.published_at?.getTime() ?? a.updated_at.getTime()));
}
