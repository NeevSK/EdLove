import { afterEach, describe, expect, it, vi } from 'vitest';

const { getSession, addToQueue, getQueueForUser } = vi.hoisted(() => ({
  getSession: vi.fn(),
  addToQueue: vi.fn(),
  getQueueForUser: vi.fn(),
}));

vi.mock('../supabase/browser', () => ({
  createBrowserSupabaseClient: () => ({ auth: { getSession } }),
}));
vi.mock('@repo/core/lib/sync/useMutationQueue', () => ({
  useMutationQueue: { getState: () => ({ addToQueue, getQueueForUser }) },
}));

import { loadBrowserAssignments, submitBrowserAssignment } from './assignmentSubmissions';

describe('assignment browser API transport security', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetAllMocks();
  });

  it('rejects an insecure API origin before session lookup or fetch', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://api.example.test');
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);

    await expect(loadBrowserAssignments('account-1', 'subject-1')).rejects.toThrow(
      'not configured securely',
    );
    expect(getSession).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects insecure configuration before creating a queued submission', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://api.example.test');

    await expect(
      submitBrowserAssignment('account-1', 'subject-1', {
        assignmentId: 'assignment-1',
        content: 'Draft',
      }),
    ).rejects.toThrow('not configured securely');
    expect(addToQueue).not.toHaveBeenCalled();
    expect(getQueueForUser).not.toHaveBeenCalled();
    expect(getSession).not.toHaveBeenCalled();
  });

  it('forces redirect errors for authenticated assignment reads', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
    getSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'account-token',
          user: { id: 'subject-1', is_anonymous: false },
        },
      },
      error: null,
    });
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(loadBrowserAssignments('account-1', 'subject-1')).resolves.toEqual([]);
    expect(fetchMock.mock.calls[0]?.[1]?.redirect).toBe('error');
  });
});
