import { afterEach, describe, expect, it, vi } from 'vitest';
import { capabilityIsAvailable, loadAccountCapabilities } from './capabilityBootstrap';

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock('../supabase/browser', () => ({
  createBrowserSupabaseClient: () => ({
    auth: { getSession },
  }),
}));

describe('capability bootstrap browser boundary', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  it('does not grant an account capability without a verified session', async () => {
    await expect(loadAccountCapabilities('self')).resolves.toEqual([]);
  });

  it('rejects an insecure API origin before session lookup or fetch', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://api.example.test');
    const fetcher = vi.fn();

    await expect(loadAccountCapabilities('self', fetcher)).resolves.toEqual([]);
    expect(getSession).not.toHaveBeenCalled();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('forces redirect errors for authenticated capability requests', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example');
    getSession.mockResolvedValue({
      data: { session: { access_token: 'account-token', user: { is_anonymous: false } } },
      error: null,
    });
    const fetcherMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ features: [] }), { status: 200 }),
    );
    const fetcher = fetcherMock as unknown as typeof fetch;

    await expect(loadAccountCapabilities('self', fetcher)).resolves.toEqual([]);
    expect(fetcherMock.mock.calls[0]?.[1]?.redirect).toBe('error');
  });

  it('only treats an explicitly available server feature as launchable', () => {
    expect(
      capabilityIsAvailable(
        [{ id: 'fire_journal', status: 'available', allowedOperations: ['read'] }],
        'fire_journal',
      ),
    ).toBe(true);
    expect(
      capabilityIsAvailable(
        [{ id: 'fire_journal', status: 'locked', allowedOperations: [] }],
        'fire_journal',
      ),
    ).toBe(false);
  });
});
