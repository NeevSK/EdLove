import { describe, expect, it } from 'vitest';
import { EXPLORE_COMMUNITY_GROUPS, getExploreCommunityGroups } from '../../../app/(sanctuary)/community/exploreGroups';
import { getExploreSampleAnnouncements } from '../../../lib/community/announcements-contract';
import { getExploreSampleComments } from '../../../lib/community/comments-contract';
import { getExploreSampleConversations } from '../../../lib/community/conversations-contract';
import { getExploreSamplePosts } from '../../../lib/community/posts-contract';
import { loadDurableChat } from '../../../lib/hooks/useCommunityChat';

describe('Community Triad Substrate & Explore Data', () => {
  it('hydrates EXPLORE_COMMUNITY_GROUPS from sandbox dataset without empty state failure', () => {
    const groups = getExploreCommunityGroups();
    expect(groups.length).toBeGreaterThan(0);
    const firstGroup = groups[0]!;
    expect(firstGroup).toHaveProperty('id');
    expect(firstGroup).toHaveProperty('name');
    expect(typeof firstGroup.memberCount).toBe('number');
  });

  it('provides explore sample posts across circles for the global feed', () => {
    const posts = getExploreSamplePosts();
    expect(posts.length).toBeGreaterThan(0);
    const firstPost = posts[0]!;
    expect(firstPost).toHaveProperty('content');
    expect(firstPost).toHaveProperty('authorName');
    expect(typeof firstPost.reactionCount).toBe('number');
  });

  it('provides explore sample announcements integrated for groups', () => {
    const announcements = getExploreSampleAnnouncements();
    expect(announcements.length).toBeGreaterThan(0);
    expect(announcements[0]).toHaveProperty('content');
    expect(announcements[0]).toHaveProperty('authorName');
  });

  it('provides explore sample comments registered in sandbox domain', () => {
    const comments = getExploreSampleComments('demo-post-1');
    expect(comments.length).toBeGreaterThan(0);
    expect(comments[0]).toHaveProperty('content');
    expect(comments[0]).toHaveProperty('authorName');
  });

  it('provides explore sample conversations including Tutii and Saved Messages', () => {
    const conversations = getExploreSampleConversations();
    expect(conversations.length).toBeGreaterThanOrEqual(2);

    const tutii = conversations.find((c) => c.id === 'tutii');
    expect(tutii).toBeDefined();
    expect(tutii?.name).toBe('Tutii');
    expect(tutii?.isSpecial).toBe(true);

    const saved = conversations.find((c) => c.id === 'saved');
    expect(saved).toBeDefined();
    expect(saved?.name).toBe('Saved Messages');
    expect(saved?.isSpecial).toBe(true);
  });

  it('hydrates durable chat from sandbox dataset seeds', () => {
    const messages = loadDurableChat('dm-tutii');
    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0]?.senderName).toBe('Tutii');
  });
});
