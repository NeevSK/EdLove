import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { SOVEREIGN_API_PUBLIC_URL, SOVEREIGN_ORPC_URL } from '@repo/core/api/base';
import { assertSecureApiUrl } from '@repo/core/api/transportSecurity';
import {
  COMMUNITY_POSTS_PAGE_SIZE,
  type CommunityPost,
  type CommunityPostsQuery,
  type CommunityPostsResult,
  getExploreSamplePosts,
  parseCommunityPosts,
} from './posts-contract';

export type { CommunityPost, CommunityPostsResult } from './posts-contract';

type CommunityPostsClient = {
  community: {
    getPosts(input: {
      query: { groupId?: string; limit?: number; offset?: number };
    }): Promise<unknown>;
    createPost(input: {
      body: { groupId: string; content: string; postType: string; authorTier: string };
    }): Promise<unknown>;
  };
};

type CommunityPostsLoadOptions = Readonly<{
  query?: Partial<CommunityPostsQuery>;
  fetcher?: typeof fetch;
  endpoint?: string | null;
}>;

export async function loadCommunityPosts(
  accessToken: string,
  options: CommunityPostsLoadOptions = {},
): Promise<CommunityPostsResult> {
  if (accessToken === 'guest' || !accessToken) {
    const posts = getExploreSamplePosts(options.query?.groupId);
    return { kind: 'ready', posts, hasMore: false };
  }

  const query: CommunityPostsQuery = {
    groupId: options.query?.groupId,
    limit: options.query?.limit ?? COMMUNITY_POSTS_PAGE_SIZE,
    offset: options.query?.offset ?? 0,
  };

  const fetcher = options.fetcher ?? fetch;
  const endpoint =
    options.endpoint ?? (SOVEREIGN_API_PUBLIC_URL.trim() ? SOVEREIGN_ORPC_URL : null);
  if (!endpoint) return { kind: 'unavailable' };

  try {
    assertSecureApiUrl(endpoint);
  } catch {
    return { kind: 'unavailable' };
  }

  const parsedEndpoint = new URL(endpoint);
  const link = new RPCLink<Record<never, never>>({
    origin: parsedEndpoint.origin as `http://${string}` | `https://${string}`,
    url: (parsedEndpoint.pathname === '/' ? '/api' : parsedEndpoint.pathname) as `/${string}`,
    headers: { Authorization: `Bearer ${accessToken}` },
    fetch: async (url, init) => {
      assertSecureApiUrl(url);
      return fetcher(url, { ...init, cache: 'no-store', redirect: 'error' });
    },
  });

  try {
    const client = createORPCClient<CommunityPostsClient>(link);
    const raw = await client.community.getPosts({
      query: {
        groupId: query.groupId,
        limit: query.limit,
        offset: query.offset,
      },
    });

    const posts = parseCommunityPosts(raw);
    if (!posts) return { kind: 'unavailable' };

    return {
      kind: 'ready',
      posts,
      hasMore: posts.length >= query.limit,
    };
  } catch {
    // If remote call fails or user lacks group access, gracefully degrade to demo provider
    const fallback = getExploreSamplePosts(query.groupId);
    return { kind: 'ready', posts: fallback, hasMore: false };
  }
}

export async function createCommunityPost(
  accessToken: string,
  input: {
    groupId: string;
    content: string;
    postType?: string;
    authorTier?: string;
  },
): Promise<CommunityPost | null> {
  if (accessToken === 'guest' || !accessToken) {
    const mockPost: CommunityPost = {
      id: `local-${Date.now()}`,
      groupId: input.groupId,
      authorId: 'guest-explorer',
      authorName: 'Guest Explorer',
      authorRole: 'Seeker',
      content: input.content,
      postType: input.postType ?? 'reflection',
      reactionCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      userHasLiked: false,
    };
    return mockPost;
  }

  const endpoint = SOVEREIGN_API_PUBLIC_URL.trim() ? SOVEREIGN_ORPC_URL : null;
  if (!endpoint) return null;

  try {
    assertSecureApiUrl(endpoint);
    const parsedEndpoint = new URL(endpoint);
    const link = new RPCLink<Record<never, never>>({
      origin: parsedEndpoint.origin as `http://${string}` | `https://${string}`,
      url: (parsedEndpoint.pathname === '/' ? '/api' : parsedEndpoint.pathname) as `/${string}`,
      headers: { Authorization: `Bearer ${accessToken}` },
      fetch: async (url, init) => {
        assertSecureApiUrl(url);
        return fetch(url, { ...init, cache: 'no-store', redirect: 'error' });
      },
    });

    const client = createORPCClient<CommunityPostsClient>(link);
    const res = await client.community.createPost({
      body: {
        groupId: input.groupId,
        content: input.content,
        postType: input.postType ?? 'discussion',
        authorTier: input.authorTier ?? 'Seeker',
      },
    });

    const parsed = parseCommunityPosts([res]);
    return parsed?.[0] ?? null;
  } catch {
    return null;
  }
}
