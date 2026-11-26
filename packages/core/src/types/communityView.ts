/**
 * Community read models as the web shows them (camelCase, read-only), with the result shapes its
 * API boundary returns. The database-shaped Community types are in types/Community.ts.
 */

export type CommunityPostView = Readonly<{
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
  | Readonly<{ kind: 'ready'; posts: readonly CommunityPostView[]; hasMore: boolean }>
  | Readonly<{ kind: 'denied' }>
  | Readonly<{ kind: 'unavailable' }>;

export type CommunityPostsQuery = Readonly<{
  groupId?: string;
  limit: number;
  offset: number;
}>;

export const COMMUNITY_POSTS_PAGE_SIZE = 20;

export type CommunityGroupView = Readonly<{
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
}>;

export type CommunityGroupsResult =
  | Readonly<{ kind: 'ready'; groups: readonly CommunityGroupView[]; hasMore: boolean }>
  | Readonly<{ kind: 'denied' }>
  | Readonly<{ kind: 'unavailable' }>;

export type CommunityGroupsQuery = Readonly<{
  limit: number;
  offset: number;
  search?: string;
}>;

export const COMMUNITY_GROUP_PAGE_SIZE = 30;

export const COMMUNITY_GROUP_MAX_PAGE_SIZE = 50;
