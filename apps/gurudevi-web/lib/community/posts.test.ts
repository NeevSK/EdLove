import { describe, expect, it } from 'vitest';
import { createCommunityPost, loadCommunityPosts } from './posts';
import { parseCommunityPosts } from './posts-contract';

describe('Web Community Posts Substrate', () => {
  it('parses valid community post records into typed CommunityPost', () => {
    const raw = [
      {
        id: 'post-1',
        group_id: 'group-1',
        author_id: 'user-1',
        author_name: 'Ananda',
        author_role: 'Seeker',
        content: 'Testing contemplative inquiry reflection.',
        post_type: 'reflection',
        reaction_count: 5,
        comment_count: 2,
        created_at: '2026-10-26T12:00:00Z',
        user_has_liked: true,
      },
    ];

    const parsed = parseCommunityPosts(raw);
    expect(parsed).toHaveLength(1);
    expect(parsed?.[0]).toEqual({
      id: 'post-1',
      groupId: 'group-1',
      authorId: 'user-1',
      authorName: 'Ananda',
      authorRole: 'Seeker',
      content: 'Testing contemplative inquiry reflection.',
      postType: 'reflection',
      reactionCount: 5,
      commentCount: 2,
      createdAt: '2026-10-26T12:00:00Z',
      userHasLiked: true,
    });
  });

  it('rejects invalid or non-array records', () => {
    expect(parseCommunityPosts(null)).toBeNull();
    expect(parseCommunityPosts({})).toBeNull();
    expect(parseCommunityPosts('invalid')).toBeNull();
  });

  it('loads canonical demo provider posts in guest mode', async () => {
    const result = await loadCommunityPosts('guest', {
      query: { groupId: 'demo-group-2' },
    });

    expect(result.kind).toBe('ready');
    if (result.kind === 'ready') {
      expect(result.posts.length).toBeGreaterThan(0);
      expect(result.posts.some((p) => p.groupId === 'demo-group-2')).toBe(true);
    }
  });

  it('simulates optimistic post creation in guest mode', async () => {
    const created = await createCommunityPost('guest', {
      groupId: 'demo-group-2',
      content: 'Reflecting on mindfulness and code.',
      postType: 'reflection',
      authorTier: 'Seeker',
    });

    expect(created).not.toBeNull();
    expect(created?.groupId).toBe('demo-group-2');
    expect(created?.content).toBe('Reflecting on mindfulness and code.');
    expect(created?.authorName).toBe('Guest Explorer');
  });
});
