import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { executeSovereignSignOut } from '../../lib/sanctuary/signOut';

const mock = vi.hoisted(() => ({
  session: vi.fn(),
  signOut: vi.fn(),
  clear: vi.fn(),
  replace: vi.fn(),
}));
vi.mock('../../lib/supabase/browser', () => ({
  createBrowserSupabaseClient: () => ({
    auth: { getSession: mock.session, signOut: mock.signOut },
  }),
}));
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.invalid');
  vi.stubGlobal('window', {
    sessionStorage: { clear: mock.clear },
    location: { replace: mock.replace },
  });
  mock.session
    .mockReset()
    .mockResolvedValueOnce({ data: { session: { access_token: 'synthetic-access' } }, error: null })
    .mockResolvedValue({ data: { session: null }, error: null });
  mock.signOut.mockReset().mockResolvedValue({ error: null });
  mock.clear.mockReset();
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () => Response.json({ ok: true }));
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe('G1 browser sign-out with substituted provider and API', () => {
  it('redirects only after confirmed revocation and all local cleanup', async () => {
    await executeSovereignSignOut('/');
    expect(mock.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(mock.clear).toHaveBeenCalledTimes(1);
    expect(mock.replace).toHaveBeenCalledWith('/');
  });
  it('asks only the API to revoke, and clears the session this browser keeps', async () => {
    await executeSovereignSignOut('/');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(String(vi.mocked(globalThis.fetch).mock.calls[0]?.[0])).toBe(
      'https://api.example.invalid/api/auth/sign-out',
    );
    expect(mock.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(mock.replace).toHaveBeenCalledWith('/');
  });
  it('refuses to finish while the local session remains', async () => {
    mock.session
      .mockReset()
      .mockResolvedValue({ data: { session: { access_token: 'synthetic-access' } }, error: null });
    await expect(executeSovereignSignOut('/')).rejects.toMatchObject({ localCleanupComplete: false });
    expect(mock.replace).not.toHaveBeenCalled();
  });
  it('cleans an already signed-out device without inventing a revocation request', async () => {
    mock.session.mockReset().mockResolvedValue({ data: { session: null }, error: null });
    await executeSovereignSignOut('/');
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(mock.replace).toHaveBeenCalledWith('/');
  });
  it('reports unconfirmed revocation while still clearing local state', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(new Response(null, { status: 503 }));
    await expect(executeSovereignSignOut('/')).rejects.toMatchObject({
      localCleanupComplete: true,
      remoteRevocationConfirmed: false,
    });
    expect(mock.signOut).toHaveBeenCalledTimes(1);
    expect(mock.clear).toHaveBeenCalledTimes(1);
    expect(mock.replace).not.toHaveBeenCalled();
  });
  it('continues privacy cleanup after a network failure', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error('Synthetic outage'));
    await expect(executeSovereignSignOut('/')).rejects.toMatchObject({
      localCleanupComplete: true,
      remoteRevocationConfirmed: false,
    });
    expect(mock.clear).toHaveBeenCalledTimes(1);
  });
  it('does not claim global revocation when the API origin is absent', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', '');
    await expect(executeSovereignSignOut('/')).rejects.toMatchObject({
      localCleanupComplete: true,
      remoteRevocationConfirmed: false,
    });
    expect(mock.replace).not.toHaveBeenCalled();
  });
  it('checks actual local session removal when the SDK reports an upstream error', async () => {
    mock.signOut.mockResolvedValue({ error: new Error('Synthetic SDK outage') });
    await executeSovereignSignOut('/');
    expect(mock.session).toHaveBeenCalledTimes(2);
    expect(mock.replace).toHaveBeenCalledWith('/');
  });
  it('keeps an uncleared browser session visible', async () => {
    mock.signOut.mockRejectedValue(new Error('Local storage failure'));
    await expect(executeSovereignSignOut('/')).rejects.toMatchObject({
      localCleanupComplete: false,
    });
    expect(mock.clear).toHaveBeenCalledTimes(1);
  });
  it('reports transient storage failure without claiming success', async () => {
    mock.clear.mockImplementation(() => {
      throw new Error('Blocked storage');
    });
    await expect(executeSovereignSignOut('/')).rejects.toMatchObject({
      localCleanupComplete: false,
    });
    expect(mock.replace).not.toHaveBeenCalled();
  });
});
