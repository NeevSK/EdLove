import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { SOVEREIGN_API_PUBLIC_URL, SOVEREIGN_ORPC_URL } from '@repo/core/api/base';
import { assertSecureApiUrl } from '@repo/core/api/transportSecurity';
import {
  type CommunityComment,
  type CommunityCommentsResult,
  getExploreSampleComments,
  parseCommunityComments,
} from './comments-contract';

export type { CommunityComment, CommunityCommentsResult } from './comments-contract';

type CommunityCommentsClient = {
  community: {
    getComments(input: {
      query: { postId: string; limit?: number; offset?: number };
    }): Promise<unknown>;
    createComment(input: {
      params: { postId: string };
      body: { content: string; isAnonymous?: boolean };
    }): Promise<unknown>;
  };
};

export async function loadCommunityComments(
  accessToken: string,
  postId: string,
): Promise<CommunityCommentsResult> {
  if (accessToken === 'guest' || !accessToken) {
    const comments = getExploreSampleComments(postId);
    return { kind: 'ready', comments };
  }

  const endpoint = SOVEREIGN_API_PUBLIC_URL.trim() ? SOVEREIGN_ORPC_URL : null;
  if (!endpoint) return { kind: 'unavailable' };

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

    const client = createORPCClient<CommunityCommentsClient>(link);
    const raw = await client.community.getComments({
      query: { postId, limit: 50, offset: 0 },
    });

    const comments = parseCommunityComments(raw);
    if (!comments) return { kind: 'unavailable' };

    return { kind: 'ready', comments };
  } catch {
    const fallback = getExploreSampleComments(postId);
    return { kind: 'ready', comments: fallback };
  }
}

export async function createCommunityComment(
  accessToken: string,
  input: {
    postId: string;
    content: string;
    isAnonymous?: boolean;
    authorName?: string;
  },
): Promise<CommunityComment | null> {
  if (accessToken === 'guest' || !accessToken) {
    const mockComment: CommunityComment = {
      id: `comment-${Date.now()}`,
      postId: input.postId,
      authorId: 'guest-explorer',
      authorName: input.authorName || 'Guest Explorer',
      content: input.content,
      createdAt: new Date().toISOString(),
      upvoteCount: 0,
      userHasUpvoted: false,
    };
    return mockComment;
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

    const client = createORPCClient<CommunityCommentsClient>(link);
    const res = await client.community.createComment({
      params: { postId: input.postId },
      body: {
        content: input.content,
        isAnonymous: input.isAnonymous ?? false,
      },
    });

    const parsed = parseCommunityComments([res]);
    return parsed?.[0] ?? null;
  } catch {
    return null;
  }
}
