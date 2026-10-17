import { describe, expect, it, vi } from 'vitest';
import { MemoryAuthAdapter } from '../memory/MemoryAuthAdapter';

describe('MemoryAuthAdapter (G0 Unit Contract)', () => {
  it('does not simulate phone OTP ownership', async () => {
    const adapter = new MemoryAuthAdapter();

    await expect(adapter.signInWithPhoneOtp({ phone: '+94771234567' })).rejects.toMatchObject({
      code: 'AUTH_PHONE_UNAVAILABLE',
    });
    await expect(
      adapter.verifyPhoneOtp({ phone: '+94771234567', token: '123456' }),
    ).rejects.toMatchObject({ code: 'AUTH_PHONE_UNAVAILABLE' });
    await expect(adapter.getSession()).resolves.toBeNull();
  });

  it('manages sessions and emits auth events to subscribers', async () => {
    const adapter = new MemoryAuthAdapter();
    const listener = vi.fn();

    const {
      data: { subscription },
    } = adapter.onAuthStateChange(listener);

    expect(await adapter.getSession()).toBeNull();
    expect(await adapter.getUser()).toBeNull();

    // Sign up / sign in
    const signUpResult = await adapter.signUp({
      email: 'alex@example.com',
      password: 'secure-password',
      options: { data: { display_name: 'Alex' } },
    });

    expect(signUpResult.user).not.toBeNull();
    expect(signUpResult.user?.email).toBe('alex@example.com');
    expect(signUpResult.session).not.toBeNull();
    expect(listener).toHaveBeenCalledWith('SIGNED_IN', signUpResult.session);

    // Sign out
    await adapter.signOut();
    expect(await adapter.getSession()).toBeNull();
    expect(listener).toHaveBeenCalledWith('SIGNED_OUT', null);

    // Unsubscribe
    subscription.unsubscribe();
    await adapter.signInWithPassword('alex@example.com', 'secure-password');
    // Listener shouldn't be called after unsubscribe
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('supports anonymous sessions and custom RPC execution', async () => {
    const adapter = new MemoryAuthAdapter();
    const anonResult = await adapter.signInAnonymously();

    expect(anonResult.session?.user.is_anonymous).toBe(true);
    expect(await adapter.getUser()).toEqual(anonResult.user);

    // RPC handler
    adapter.registerRpcHandler('check_status', async (params) => {
      return { status: 'healthy', input: params };
    });

    const rpcResult = await adapter.executeRpc('check_status', { foo: 'bar' });
    expect(rpcResult).toEqual({ status: 'healthy', input: { foo: 'bar' } });
  });
});
