import { getSandboxSamples } from '@repo/core/api/sandboxDataset';

export type CommunityComment = Readonly<{
  id: string;
  postId: string;
  authorId: string;
  authorName: string | null;
  content: string;
  createdAt: string;
  upvoteCount: number;
  userHasUpvoted?: boolean;
}>;

export type CommunityCommentsResult =
  | Readonly<{ kind: 'ready'; comments: readonly CommunityComment[] }>
  | Readonly<{ kind: 'denied' }>
  | Readonly<{ kind: 'unavailable' }>;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function parseCommunityComments(value: unknown): readonly CommunityComment[] | null {
  if (!Array.isArray(value)) return null;
  const comments: CommunityComment[] = [];
  for (const valueItem of value) {
    const item = asRecord(valueItem);
    if (!item || typeof item.id !== 'string' || typeof item.content !== 'string') continue;
    comments.push({
      id: item.id,
      postId:
        typeof item.post_id === 'string'
          ? item.post_id
          : typeof item.postId === 'string'
            ? item.postId
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
      content: item.content,
      createdAt:
        typeof item.created_at === 'string'
          ? item.created_at
          : typeof item.createdAt === 'string'
            ? item.createdAt
            : new Date().toISOString(),
      upvoteCount:
        typeof item.upvote_count === 'number'
          ? item.upvote_count
          : typeof item.upvoteCount === 'number'
            ? item.upvoteCount
            : 0,
      userHasUpvoted: Boolean(item.user_has_upvoted ?? item.userHasUpvoted),
    });
  }
  return comments;
}

/** Canonical explore comments from registered sandbox dataset */
export function getExploreSampleComments(postId?: string): readonly CommunityComment[] {
  const allComments = getSandboxSamples<any[]>('community', 'getComments', [postId], []);
  const list = postId
    ? allComments.filter((c) => c.post_id === postId)
    : allComments;
  const rawDemo = list.length > 0 ? list : allComments;
  return rawDemo.map((c) => ({
    id: c.id,
    postId: c.post_id,
    authorId: c.author_id,
    authorName: c.author_name ?? 'Seeker',
    content: c.content,
    createdAt: typeof c.created_at === 'string' ? c.created_at : String(c.created_at),
    upvoteCount: 3,
    userHasUpvoted: false,
  }));
}
