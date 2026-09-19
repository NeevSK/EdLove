import { describe, expect, it } from 'vitest';
import { loadCommunityGroups } from './groups';
import { parseCommunityGroups, parseCommunityGroupsResult } from './groups-contract';

describe('parseCommunityGroups', () => {
  it('maps scoped group DTOs and tolerates absent optional fields', () => {
    expect(
      parseCommunityGroups([
        { id: 'circle-1', name: 'Quiet practice', description: null, member_count: 4 },
      ]),
    ).toEqual([{ id: 'circle-1', name: 'Quiet practice', description: null, memberCount: 4 }]);
  });

  it('rejects malformed API payloads instead of rendering a partial directory', () => {
    expect(parseCommunityGroups({ groups: [] })).toBeNull();
    expect(parseCommunityGroups([{ id: 'circle-1' }])).toBeNull();
  });

  it('parses a same-origin page response with an explicit continuation marker', () => {
    expect(
      parseCommunityGroupsResult({
        groups: [{ id: 'circle-1', name: 'Quiet practice' }],
        hasMore: true,
      }),
    ).toMatchObject({ kind: 'ready', hasMore: true, groups: [{ id: 'circle-1' }] });
    expect(parseCommunityGroupsResult({ groups: [], hasMore: 'yes' })).toBeNull();
  });

  it('reports Cedar denial separately and never turns it into an empty directory', async () => {
    let authorizationHeader: string | null = null;
    const fetcher: typeof fetch = async (input, init) => {
      authorizationHeader = new Headers(
        input instanceof Request ? input.headers : init?.headers,
      ).get('authorization');
      return new Response('forbidden', { status: 403 });
    };
    await expect(
      loadCommunityGroups('verified-session-token', {
        fetcher,
        endpoint: 'https://api.test/api',
      }),
    ).resolves.toEqual({ kind: 'denied' });
    expect(authorizationHeader).toBe('Bearer verified-session-token');
  });

  it('reports transport failure as unavailable', async () => {
    const fetcher: typeof fetch = async () => {
      throw new TypeError('network unavailable');
    };
    await expect(
      loadCommunityGroups('verified-session-token', {
        fetcher,
        endpoint: 'https://api.test/api',
      }),
    ).resolves.toEqual({ kind: 'unavailable' });
  });
});
