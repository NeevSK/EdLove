/**
 * School Editorial Port
 *
 * Hexagonal contracts for student journalism, co-curricular media units,
 * Teacher-in-Charge (TIC) review workflow, and edge publication.
 */

export type EditorialContentKind =
  | 'original'
  | 'match_report'
  | 'society_journal'
  | 'circular'
  | 'honors';

export type EditorialReviewStatus =
  | 'submitted'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'published';

export type EditorialLanguage = 'en' | 'si' | 'ta';

export interface SchoolEditorialDraft {
  id: string;
  schoolId: string;
  schoolName: string;
  subEntityId: string;
  subEntityName: string;
  authorName: string;
  title: string;
  summary: string;
  body: string;
  language: EditorialLanguage;
  kind: EditorialContentKind;
  status: EditorialReviewStatus;
  safeguardingConsent: boolean;
  reviewerId?: string;
  reviewerNotes?: string;
  createdAt: string;
  updatedAt: string;
  slug?: string;
  publishedAt?: string;
}

export interface IWebEditorialPort {
  listDrafts(schoolId?: string): Promise<readonly SchoolEditorialDraft[]>;
  submitDraft(
    draft: Omit<SchoolEditorialDraft, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
  ): Promise<SchoolEditorialDraft>;
  reviewDraft(
    id: string,
    reviewerId: string,
    decision: 'in_review' | 'approved' | 'rejected',
    notes?: string,
  ): Promise<SchoolEditorialDraft>;
  publishApproved(id: string, slug: string): Promise<SchoolEditorialDraft>;
  getPublishedArticles(schoolId: string): Promise<readonly SchoolEditorialDraft[]>;
}
