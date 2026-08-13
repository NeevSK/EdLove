import { describe, expect, it, vi } from 'vitest';

vi.mock('@repo/ui/utils', () => ({ GURUDEVI_APP: 'https://gurudevi.example' }));

import { buildLibraryResourceOpenParams, buildLibraryResourceShareUrl } from './resourceLinks';

describe('Library resource links', () => {
  it('normalizes viewer payloads while preserving legacy deep-link keys', () => {
    expect(
      buildLibraryResourceOpenParams({
        id: 'resource-1',
        title: 'A living lesson',
        url: 'https://example.com/lesson.pdf',
        creator_name: 'Gurudevi',
        format: 'document',
      }),
    ).toEqual({
      resourceId: 'resource-1',
      title: 'A living lesson',
      url: 'https://example.com/lesson.pdf',
      creator: 'Gurudevi',
      format: 'document',
    });
  });

  it('keeps share links stable and URL-safe', () => {
    expect(buildLibraryResourceShareUrl('resource/with spaces')).toContain(
      'resource%2Fwith%20spaces',
    );
  });
});
