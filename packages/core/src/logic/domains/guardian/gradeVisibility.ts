const PUBLISHED_GRADE_STATUSES = new Set([
  'published',
  'released',
  'finalized',
  'guardian_visible',
]);

function rowHasPublicationMetadata(row: any): boolean {
  return (
    row?.published_at !== undefined ||
    row?.publishedAt !== undefined ||
    row?.is_published !== undefined ||
    row?.isPublished !== undefined ||
    row?.status !== undefined ||
    row?.publication_status !== undefined ||
    row?.publicationStatus !== undefined
  );
}

function isPublishedGradeRow(row: any): boolean {
  if (row?.published_at || row?.publishedAt) return true;
  if (row?.is_published === true || row?.isPublished === true) return true;

  const status = row?.publication_status ?? row?.publicationStatus ?? row?.status;
  return typeof status === 'string' && PUBLISHED_GRADE_STATUSES.has(status.toLowerCase());
}

export function selectGuardianVisibleGrades(rows: any[]): any[] {
  if (rows.length === 0) return rows;
  const hasPublicationMetadata = rows.some(rowHasPublicationMetadata);

  if (!hasPublicationMetadata) {
    return rows;
  }

  return rows.filter(isPublishedGradeRow);
}
