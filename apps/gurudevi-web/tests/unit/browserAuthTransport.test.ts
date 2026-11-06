import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { browserAuthRuntime } from '../../app/(sanctuary)/auth/browserAuth';

const mock = vi.hoisted(() => ({ password: vi.fn(), otp: vi.fn() }));
vi.mock('../../lib/supabase/browser', () => ({
  createBrowserSupabaseClient: () => ({
    auth: {
      signInWithPassword: mock.password,
      signInWithOtp: mock.otp,
    },
  }),
}));
const credentials = { email: 'fixture@example.invalid', password: 'fixture-password' };
beforeEach(() => {
  vi.clearAllMocks();
  mock.password.mockResolvedValue({ data: { session: null, user: null }, error: null });
  mock.otp.mockResolvedValue({ data: { user: null, session: null }, error: null });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
describe('G1 browser credential transport', () => {
  it('submits password credentials through the configured Supabase auth client', async () => {
    await browserAuthRuntime()?.signInWithPassword(credentials);
    expect(mock.password).toHaveBeenCalledWith(credentials);
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
});
