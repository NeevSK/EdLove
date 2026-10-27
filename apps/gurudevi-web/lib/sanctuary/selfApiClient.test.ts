import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSession, getClaims } = vi.hoisted(() => ({ getSession: vi.fn(), getClaims: vi.fn() }));
const canonicalAccountId = '01234567-89ab-8101-8000-010203040506';

vi.mock('../supabase/browser', () => ({
  createBrowserSupabaseClient: () => ({ auth: { getSession, getClaims } }),
}));

import { requestAccountSelfProcedure } from './selfApiClient';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

describe('account Self browser adapter', () => {
  beforeEach(() => {
    getSession.mockReset();
    getClaims.mockReset().mockImplementation(async () => ({
      data: {
        claims: {
          sub: (await getSession()).data.session.user.id,
          canonical_account_id: canonicalAccountId,
        },
      },
      error: null,
    }));
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example/');
    vi.stubGlobal('fetch', vi.fn());
  });

  it('sends a private, no-store request with the verified account bearer token', async () => {
    getSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'account-token',
          user: { id: 'account-1', is_anonymous: false },
        },
      },
      error: null,
    });
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ json: { id: 'entry-1' } }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }),
    );

    const result = await requestAccountSelfProcedure(
      'getJournalHistory',
      { query: { limit: 12 } },
      (value): value is { id: string } => isRecord(value) && typeof value.id === 'string',
      'Invalid journal response.',
    );

    expect(result).toEqual({ id: 'entry-1' });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://sanctuary.example/api/self/getJournalHistory',
      expect.objectContaining({
        body: JSON.stringify({ json: { query: { limit: 12 } } }),
        cache: 'no-store',
        headers: {
          Authorization: 'Bearer account-token',
          'Content-Type': 'application/json',
        },
        method: 'POST',
        redirect: 'error',
      }),
    );
  });

  it('rejects an insecure API origin before session lookup or fetch', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://api.example.test');

    await expect(
      requestAccountSelfProcedure(
        'getJournalHistory',
        { query: { limit: 12 } },
        (value): value is { id: string } => isRecord(value) && typeof value.id === 'string',
        'Invalid journal response.',
      ),
    ).rejects.toThrow('not configured securely');
    expect(getSession).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('serializes account writes using the server procedure body contract', async () => {
    getSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'account-token',
          user: { id: 'account-1', is_anonymous: false },
        },
      },
      error: null,
    });
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ json: { id: 'entry-1' } }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }),
    );

    await requestAccountSelfProcedure(
      'burnJournal',
      { body: { content: 'private thought' } },
      (value): value is { id: string } => isRecord(value) && typeof value.id === 'string',
      'Invalid journal response.',
    );

    expect(fetch).toHaveBeenCalledWith(
      'https://sanctuary.example/api/self/burnJournal',
      expect.objectContaining({
        body: JSON.stringify({ json: { body: { content: 'private thought' } } }),
        method: 'POST',
      }),
    );
  });

  it('binds a mood write to the authenticated account id at the adapter boundary', async () => {
    getSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'account-token',
          user: { id: 'verified-account', is_anonymous: false },
        },
      },
      error: null,
    });
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ json: { id: 'mood-1' } }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }),
    );

    await requestAccountSelfProcedure(
      'logMood',
      (userId) => ({
        body: { user_id: userId, mood: 'calm', mood_score: 4, note: null },
      }),
      (value): value is { id: string } => isRecord(value) && typeof value.id === 'string',
      'Invalid mood response.',
    );

    const [, options] = vi.mocked(fetch).mock.calls[0] ?? [];
    expect(options?.body).toBe(
      JSON.stringify({
        json: {
          body: {
            user_id: canonicalAccountId,
            mood: 'calm',
            mood_score: 4,
            note: null,
          },
        },
      }),
    );
  });

  it('does not send Explore or anonymous sessions to the cloud account API', async () => {
    getSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'guest-token',
          user: { id: 'guest-1', is_anonymous: true },
        },
      },
      error: null,
    });

    await expect(
      requestAccountSelfProcedure(
        'burnJournal',
        { body: { content: 'private thought' } },
        isRecord,
        'Invalid.',
      ),
    ).rejects.toThrow('Your secure session has ended. Please sign in again.');
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    { sub: 'credential-a' },
    { sub: 'credential-b', canonical_account_id: canonicalAccountId },
    { sub: 'credential-a', canonical_account_id: '123e4567-e89b-42d3-a456-426614174020' },
  ])('rejects a missing, mismatched or legacy account claim before writing: %j', async (claims) => {
    getSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'account-token',
          user: { id: 'credential-a', is_anonymous: false },
        },
      },
      error: null,
    });
    getClaims.mockResolvedValue({ data: { claims }, error: null });
    await expect(
      requestAccountSelfProcedure(
        'burnJournal',
        { body: { content: 'private thought' } },
        isRecord,
        'Invalid.',
      ),
    ).rejects.toThrow('account identity could not be verified');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('reports scope denial distinctly and does not turn it into success', async () => {
    getSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'account-token',
          user: { id: 'account-1', is_anonymous: false },
        },
      },
      error: null,
    });
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 403 }));

    await expect(
      requestAccountSelfProcedure(
        'burnJournal',
        { body: { content: 'private thought' } },
        isRecord,
        'Invalid.',
      ),
    ).rejects.toThrow('Your selected scope cannot access this Self practice.');
  });

  it('preserves retryable failure behavior when Sanctuary cannot be reached', async () => {
    getSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'account-token',
          user: { id: 'account-1', is_anonymous: false },
        },
      },
      error: null,
    });
    vi.mocked(fetch).mockRejectedValue(new TypeError('network down'));

    await expect(
      requestAccountSelfProcedure(
        'burnJournal',
        { body: { content: 'private thought' } },
        isRecord,
        'Invalid.',
      ),
    ).rejects.toThrow('We could not reach Sanctuary. Please check your connection and retry.');
  });
});
