import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { SOVEREIGN_API_PUBLIC_URL, SOVEREIGN_ORPC_URL } from '@repo/core/api/base';
import { assertSecureApiUrl } from '@repo/core/api/transportSecurity';
import {
  type CommunityGroupsQuery,
  type CommunityGroupsResult,
  parseCommunityGroups,
} from './groups-contract';

type CommunityClient = {
  community: {
    getGroups(input: {
      query: { limit: number; offset: number; search?: string };
    }): Promise<unknown>;
  };
};

export type {
  CommunityGroup,
  CommunityGroupsQuery,
  CommunityGroupsResult,
} from './groups-contract';

type CommunityGroupsLoadOptions = Readonly<{
  query?: CommunityGroupsQuery;
  fetcher?: typeof fetch;
  endpoint?: string | null;
}>;

/** Reads circles filtered by the Sanctuary API's persisted selected scope. */
export async function loadCommunityGroups(
  accessToken: string,
  options: CommunityGroupsLoadOptions = {},
): Promise<CommunityGroupsResult> {
  const query = options.query ?? { limit: 30, offset: 0 };
  const fetcher = options.fetcher ?? fetch;
  const endpoint =
    options.endpoint ?? (SOVEREIGN_API_PUBLIC_URL.trim() ? SOVEREIGN_ORPC_URL : null);
  if (!endpoint) return { kind: 'unavailable' };
  try {
    assertSecureApiUrl(endpoint);
  } catch {
    return { kind: 'unavailable' };
  }
  if (
    !Number.isSafeInteger(query.limit) ||
    query.limit < 1 ||
    query.limit > 50 ||
    !Number.isSafeInteger(query.offset) ||
    query.offset < 0 ||
    (query.search !== undefined && (query.search.trim().length === 0 || query.search.length > 120))
  ) {
    return { kind: 'unavailable' };
  }

  let responseStatus: number | null = null;
  const parsedEndpoint = new URL(endpoint);
  const link = new RPCLink<Record<never, never>>({
    origin: parsedEndpoint.origin as `http://${string}` | `https://${string}`,
    url: (parsedEndpoint.pathname === '/' ? '/api' : parsedEndpoint.pathname) as `/${string}`,
    headers: { Authorization: `Bearer ${accessToken}` },
    fetch: async (url, init) => {
      assertSecureApiUrl(url);
      const response = await fetcher(url, {
        ...init,
        cache: 'no-store',
        redirect: 'error',
      });
      responseStatus = response.status;
      return response;
    },
  });

  try {
    const client = createORPCClient<CommunityClient>(link);
    const payload = await client.community.getGroups({
      query: { ...query, limit: query.limit + 1 },
    });
    const groups = parseCommunityGroups(payload);
    return groups
      ? {
          kind: 'ready',
          groups: groups.slice(0, query.limit),
          hasMore: groups.length > query.limit,
        }
      : { kind: 'unavailable' };
  } catch {
    return responseStatus === 403 ? { kind: 'denied' } : { kind: 'unavailable' };
  }
}
