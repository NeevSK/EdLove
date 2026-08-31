import { describe, expect, it } from 'vitest';
import { editorialSubmissionSchema, requiresRightsReview } from './editorial.contract';

const baseSubmission = {
  publication: 'gurudevi' as const,
  contentKind: 'original' as const,
  title: 'A thoughtful submission',
  summary: 'A useful summary with enough detail for editorial review.',
  body: 'This is a sufficiently long Markdown body that can be reviewed by an editor before publication.',
  language: 'en' as const,
};

describe('editorial submission contract', () => {
  it('accepts an original Markdown submission without external rights metadata', () => {
    expect(editorialSubmissionSchema.parse(baseSubmission)).toEqual(baseSubmission);
  });

  it('requires source evidence for curated and translated work', () => {
    expect(() =>
      editorialSubmissionSchema.parse({ ...baseSubmission, contentKind: 'curated' }),
    ).toThrow();
    expect(() =>
      editorialSubmissionSchema.parse({ ...baseSubmission, contentKind: 'translation' }),
    ).toThrow();
  });

  it('requires a rights agreement for licensed work', () => {
    expect(() =>
      editorialSubmissionSchema.parse({
        ...baseSubmission,
        contentKind: 'licensed',
        sourceUrl: 'https://example.com/source',
      }),
    ).toThrow();
  });

  it('requires a source version reference for translated work', () => {
    expect(() =>
      editorialSubmissionSchema.parse({
        ...baseSubmission,
        contentKind: 'translation',
        sourceUrl: 'https://example.com/source',
      }),
    ).toThrow();
    expect(
      editorialSubmissionSchema.parse({
        ...baseSubmission,
        contentKind: 'translation',
        sourceUrl: 'https://example.com/source',
        translationOfVersionId: 'work-version-en-1',
      }).translationOfVersionId,
    ).toBe('work-version-en-1');
  });

  it('marks external and translated work for a separate rights review', () => {
    expect(requiresRightsReview('original')).toBe(false);
    expect(requiresRightsReview('guest')).toBe(false);
    expect(requiresRightsReview('curated')).toBe(true);
    expect(requiresRightsReview('licensed')).toBe(true);
    expect(requiresRightsReview('translation')).toBe(true);
  });
});
