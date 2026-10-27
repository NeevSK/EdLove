import { getSandboxSamples } from '@repo/core/api/sandboxDataset';

export type CommunityPost = Readonly<{
  id: string;
  groupId: string;
  authorId: string;
  authorName: string | null;
  authorRole: string | null;
  content: string;
  postType: string | null;
  reactionCount: number;
  commentCount: number;
  createdAt: string;
  userHasLiked?: boolean;
}>;

export type CommunityPostsResult =
  | Readonly<{ kind: 'ready'; posts: readonly CommunityPost[]; hasMore: boolean }>
  | Readonly<{ kind: 'denied' }>
  | Readonly<{ kind: 'unavailable' }>;

export type CommunityPostsQuery = Readonly<{
  groupId?: string;
  limit: number;
  offset: number;
}>;

export const COMMUNITY_POSTS_PAGE_SIZE = 20;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function parseCommunityPosts(value: unknown): readonly CommunityPost[] | null {
  if (!Array.isArray(value)) return null;
  const posts: CommunityPost[] = [];
  for (const valueItem of value) {
    const item = asRecord(valueItem);
    if (!item || typeof item.id !== 'string' || typeof item.content !== 'string') continue;
    posts.push({
      id: item.id,
      groupId:
        typeof item.group_id === 'string'
          ? item.group_id
          : typeof item.groupId === 'string'
            ? item.groupId
            : '',
      authorId:
        typeof item.author_id === 'string'
          ? item.author_id
          : typeof item.authorId === 'string'
            ? item.authorId
            : '',
      authorName:
        typeof item.author_name === 'string'
          ? item.author_name
          : typeof item.authorName === 'string'
            ? item.authorName
            : null,
      authorRole:
        typeof item.author_role === 'string'
          ? item.author_role
          : typeof item.authorRole === 'string'
            ? item.authorRole
            : null,
      content: item.content,
      postType:
        typeof item.post_type === 'string'
          ? item.post_type
          : typeof item.postType === 'string'
            ? item.postType
            : 'discussion',
      reactionCount:
        typeof item.reaction_count === 'number'
          ? item.reaction_count
          : typeof item.reactionCount === 'number'
            ? item.reactionCount
            : 0,
      commentCount:
        typeof item.comment_count === 'number'
          ? item.comment_count
          : typeof item.commentCount === 'number'
            ? item.commentCount
            : 0,
      createdAt:
        typeof item.created_at === 'string'
          ? item.created_at
          : typeof item.createdAt === 'string'
            ? item.createdAt
            : new Date().toISOString(),
      userHasLiked: Boolean(item.user_has_liked ?? item.userHasLiked),
    });
  }
  return posts;
}

/** Canonical explore mode posts from registered sandbox dataset */
export function getExploreSamplePosts(groupId?: string): readonly CommunityPost[] {
  const allPosts = getSandboxSamples<any[]>('community', 'getPosts', [groupId], []);
  const list = groupId
    ? allPosts.filter((p) => p.group_id === groupId)
    : allPosts;
  const rawDemo = list.length > 0 ? list : allPosts;
  return rawDemo.map((p) => ({
    id: p.id,
    groupId: p.group_id ?? '',
    authorId: p.author_id,
    authorName: p.author_name ?? 'Seeker',
    authorRole: p.author_policy
      ? p.author_policy.charAt(0).toUpperCase() + p.author_policy.slice(1)
      : 'Seeker',
    content: p.content,
    postType: p.post_type ?? 'discussion',
    reactionCount: typeof p.reaction_count === 'number' ? p.reaction_count : 0,
    commentCount: typeof p.comment_count === 'number' ? p.comment_count : 0,
    createdAt: p.created_at instanceof Date ? p.created_at.toISOString() : String(p.created_at),
    userHasLiked: Boolean(p.has_liked),
  }));
}
