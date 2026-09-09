import { communityORPCContract } from '@repo/core/api/community.orpc.contract';
import { libraryContract } from '@repo/core/api/library.contract';
import { describe, expect, it } from 'vitest';

describe('social and knowledge contract coverage', () => {
  it('registers strict native procedures for community and library APIs', () => {
    expect((communityORPCContract as any).getGroups).toBeTruthy();
    expect((communityORPCContract as any).createPost).toBeTruthy();
    expect((communityORPCContract as any).createComment).toBeTruthy();
    expect((libraryContract as any).getResources).toBeTruthy();
  });
});
