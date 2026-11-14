import { describe, expect, it } from 'vitest';
import { CANONICAL_EDITORIAL_DRAFTS, editorialAdapter } from '@/lib/domain';

describe('Editorial Hexagonal Service Integration', () => {
  it('loads canonical editorial drafts by default', async () => {
    const drafts = await editorialAdapter.listDrafts();
    expect(drafts.length).toBeGreaterThanOrEqual(CANONICAL_EDITORIAL_DRAFTS.length);
    expect(drafts.some((d) => d.id === 'draft-maroons-2026')).toBe(true);
  });

  it('allows student reporters to submit article drafts with safeguarding consent', async () => {
    const created = await editorialAdapter.submitDraft({
      schoolId: 'school-ananda-colombo',
      schoolName: 'Ananda College',
      subEntityId: 'society-ict',
      subEntityName: 'ICT Society',
      authorName: 'Nipuna De Silva (Grade 11)',
      title: 'Annual Inter-School Hackathon 2026 Announced',
      summary: '24-hour coding challenge focusing on rural education software.',
      body: '# CodeFest 2026\nThe ICT Society of Ananda College is thrilled to announce...',
      language: 'en',
      kind: 'society_journal',
      safeguardingConsent: true,
    });

    expect(created.id).toMatch(/^draft-/);
    expect(created.status).toBe('submitted');
    expect(created.schoolId).toBe('school-ananda-colombo');
    expect(created.safeguardingConsent).toBe(true);

    const list = await editorialAdapter.listDrafts('school-ananda-colombo');
    expect(list.some((d) => d.id === created.id)).toBe(true);
  });

  it('enforces two-stage teacher review before publication', async () => {
    const draft = await editorialAdapter.submitDraft({
      schoolId: 'school-ananda-colombo',
      schoolName: 'Ananda College',
      subEntityId: 'society-media-unit',
      subEntityName: 'Media Unit',
      authorName: 'Sahan Perera',
      title: 'Cricket Derby Highlights 2026',
      summary: 'Photo story and ball-by-ball analysis.',
      body: '# Match Highlights\nPhotos and key moments...',
      language: 'en',
      kind: 'match_report',
      safeguardingConsent: true,
    });

    // Cannot publish directly from submitted status
    await expect(
      editorialAdapter.publishApproved(draft.id, 'cricket-highlights-2026'),
    ).rejects.toThrow(/Must be 'approved'/);

    // Pick up for review
    const inReview = await editorialAdapter.reviewDraft(
      draft.id,
      'tic-perera',
      'in_review',
      'Checking player photos with sports department.',
    );
    expect(inReview.status).toBe('in_review');

    // Approve
    const approved = await editorialAdapter.reviewDraft(
      draft.id,
      'tic-perera',
      'approved',
      'Safeguarding verified. Ready for public edge commons.',
    );
    expect(approved.status).toBe('approved');
    expect(approved.reviewerNotes).toContain('Ready for public');

    // Edge publish
    const published = await editorialAdapter.publishApproved(
      draft.id,
      'cricket-highlights-2026',
    );
    expect(published.status).toBe('published');
    expect(published.slug).toBe('cricket-highlights-2026');
    expect(published.publishedAt).toBeDefined();

    // Verify retrieval under published articles
    const publishedList =
      await editorialAdapter.getPublishedArticles('school-ananda-colombo');
    expect(publishedList.some((d) => d.id === draft.id)).toBe(true);
  });
});
