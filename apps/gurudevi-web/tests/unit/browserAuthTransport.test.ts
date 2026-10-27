import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { browserAuthRuntime } from '../../app/(sanctuary)/auth/browserAuth';

const mock = vi.hoisted(() => ({ password: vi.fn(), otp: vi.fn(), setSession: vi.fn() }));
vi.mock('../../lib/supabase/browser', () => ({
  createBrowserSupabaseClient: () => ({
    auth: {
      signInWithPassword: mock.password,
      signInWithOtp: mock.otp,
      setSession: mock.setSession,
    },
  }),
}));
const credentials = { email: 'fixture@example.invalid', password: 'fixture-password' };
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.invalid');
  mock.setSession.mockResolvedValue({
    data: { session: null, user: null },
    error: new Error('Synthetic invalid session'),
  });
  mock.otp.mockResolvedValue({ data: { user: null, session: null }, error: null });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
describe('G1 browser credential transport', () => {
  it('surfaces gateway outage without retrying credentials through another path', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Synthetic outage'));
    const result = await browserAuthRuntime()?.signInWithPassword(credentials);
    expect(result?.error?.message).toBe('Synthetic outage');
    expect(mock.password).not.toHaveBeenCalled();
  });
  it('does not bypass a provider rejection', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({ error: 'Rejected' }, { status: 401 }),
    );
    expect((await browserAuthRuntime()?.signInWithPassword(credentials))?.error?.message).toBe(
      'Rejected',
    );
    expect(mock.password).not.toHaveBeenCalled();
  });
  it('rejects malformed successful gateway output without direct fallback', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ session: {} }));
    expect((await browserAuthRuntime()?.signInWithPassword(credentials))?.error).toBeInstanceOf(
      Error,
    );
    expect(mock.password).not.toHaveBeenCalled();
  });
  it('preserves SDK session establishment failure without submitting the password twice', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        session: { access_token: 'synthetic-access', refresh_token: 'synthetic-refresh' },
      }),
    );
    expect((await browserAuthRuntime()?.signInWithPassword(credentials))?.error?.message).toBe(
      'Synthetic invalid session',
    );
    expect(mock.setSession).toHaveBeenCalledTimes(1);
    expect(mock.password).not.toHaveBeenCalled();
  });
  it('keeps the provider SDK responsible for magic-link PKCE state', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch');
    await browserAuthRuntime()?.signInWithOtp({
      email: credentials.email,
      emailRedirectTo: 'https://gurudevi.app/auth/complete',
    });
    expect(mock.otp).toHaveBeenCalledWith({
      email: credentials.email,
      options: { emailRedirectTo: 'https://gurudevi.app/auth/complete', shouldCreateUser: true },
    });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('rejects an unsafe configured gateway instead of selecting direct auth', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://unsafe.example.invalid');
    await expect(browserAuthRuntime()?.signInWithPassword(credentials)).rejects.toThrow();
    expect(mock.password).not.toHaveBeenCalled();
  });
});
