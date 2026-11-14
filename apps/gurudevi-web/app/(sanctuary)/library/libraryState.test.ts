import { describe, expect, it } from 'vitest';
import {
  classifyLibraryFailure,
  filterBrowserResources,
  getGuestBookmarks,
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

  it('filters resources by category and search keyword', () => {
    const list = [
      {
        id: 'r1',
        title: 'Sinhala Grammar Essentials',
        description: 'Grade 10 grammar rules',
        type: 'pdf',
        url: 'https://example.com/grammar.pdf',
        subjects: ['Sinhala', 'Language'],
        verified: true,
      },
      {
        id: 'r2',
        title: 'Mangrove Ecology Video',
        description: 'Coastal biology lecture',
        type: 'video',
        url: 'https://example.com/mangrove.mp4',
        subjects: ['Science', 'Biology'],
        verified: false,
      },
    ];

    expect(filterBrowserResources(list, '', 'All')).toHaveLength(2);
    expect(filterBrowserResources(list, '', 'pdf')).toHaveLength(1);
    expect(filterBrowserResources(list, 'grammar', 'All')).toHaveLength(1);
    expect(filterBrowserResources(list, 'biology', 'All')[0]?.id).toBe('r2');
  });

  it('isolates guest bookmarks safely in browser storage', () => {
    const bookmarks = getGuestBookmarks();
    expect(bookmarks).toBeInstanceOf(Set);
  });
});
