import { describe, expect, it } from 'vitest';
import {
  classifyLibraryFailure,
  parseBrowserLibraryResources,
  safeResourceUrl,
} from './libraryState';

describe('Library browser boundary helpers', () => {
  it('surfaces authorization failures as denied rather than empty catalog', () => {
    expect(classifyLibraryFailure({ status: 403 })).toBe('denied');
    expect(classifyLibraryFailure({ code: 'UNAUTHORIZED' })).toBe('denied');
  });

  it('keeps transient failures separate from permission failures', () => {
    expect(classifyLibraryFailure(new Error('offline'))).toBe('error');
  });

  it('allows only web links as resource destinations', () => {
    expect(safeResourceUrl('https://example.org/resource')).toBe('https://example.org/resource');
    expect(safeResourceUrl('javascript:alert(1)')).toBeNull();
    expect(safeResourceUrl('not a URL')).toBeNull();
  });

  it('accepts server resource records with the fields used by the catalog', () => {
    expect(
      parseBrowserLibraryResources([
        {
          id: 'resource-1',
          title: 'Listening to the forest',
          type: 'article',
          description: 'A short practice.',
          subjects: ['ecology'],
          verified: true,
          url: 'https://example.org/forest',
        },
      ]),
    ).toEqual([
      {
        id: 'resource-1',
        title: 'Listening to the forest',
        type: 'article',
        description: 'A short practice.',
        subjects: ['ecology'],
        verified: true,
        url: 'https://example.org/forest',
      },
    ]);
  });

  it('rejects malformed server resource records rather than rendering guessed data', () => {
    expect(() => parseBrowserLibraryResources([{ id: 'resource-1' }])).toThrow(
      'The Library returned an invalid resource.',
    );
  });
});
