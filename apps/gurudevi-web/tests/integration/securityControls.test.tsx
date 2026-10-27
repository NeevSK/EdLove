import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SecurityFloor } from '@/app/(sanctuary)/profile/security/SecurityFloor';

const mocks = vi.hoisted(() => ({
  load: vi.fn(),
  verify: vi.fn(),
  unlink: vi.fn(),
  unsubscribe: vi.fn(),
  callback: null as null | ((event: string, session: { user: { id: string } } | null) => void),
}));
vi.mock('@/lib/sanctuary/securityClient', () => ({
  loadSecuritySnapshot: mocks.load,
  verifySecurityTotp: mocks.verify,
  unlinkSecurityCredential: mocks.unlink,
}));
vi.mock('@/lib/supabase/browser', () => ({
  createBrowserSupabaseClient: () => ({
    auth: {
      onAuthStateChange: (callback: NonNullable<typeof mocks.callback>) => {
        mocks.callback = callback;
        return { data: { subscription: { unsubscribe: mocks.unsubscribe } } };
      },
    },
  }),
}));
const owner = {
  accountId: '123e4567-e89b-8101-8100-426614174000',
  authSubjectId: 'f0570000-0000-4000-8000-000000000001',
};
const googleId = 'f0570000-0000-4000-8000-000000000002';
const factorId = 'f0570000-0000-4000-8000-000000000003';
const snapshot = {
  ...owner,
  anonymous: false,
  provider: 'supabase',
  identities: [
    { id: googleId, provider: 'google' },
    { id: factorId, provider: 'email' },
  ],
  factors: [{ id: factorId, friendly_name: 'Personal authenticator' }],
  assurance: 'aal1',
};
const mount = (strict = false) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const content = (
    <QueryClientProvider client={client}>
      <SecurityFloor {...owner} displayName="Citizen" />
    </QueryClientProvider>
  );
  return {
    client,
    ...render(strict ? <StrictMode>{content}</StrictMode> : content),
  };
};
beforeEach(() => {
  vi.resetAllMocks();
  mocks.callback = null;
  mocks.load.mockResolvedValue(snapshot);
  mocks.verify.mockResolvedValue(undefined);
  mocks.unlink.mockResolvedValue({ identityId: googleId });
});
describe('G3 browser security controls / jsdom with substituted auth and HTTP', () => {
  it('supports effect replay under React Strict Mode', async () => {
    mount(true);
    const input = await screen.findByLabelText('Six-digit authenticator code');
    fireEvent.change(input, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verify authenticator' }));
    await screen.findByText('Authenticator verified for this session.');
    expect(mocks.verify).toHaveBeenCalledTimes(1);
  });
  it('renders live inventory without fabricated sessions, trust score or successful revocations', async () => {
    mount();
    expect(await screen.findByText('Google sign-in')).toBeDefined();
    expect(screen.getByText('Email sign-in')).toBeDefined();
    expect(
      screen.queryByText(/98\/100|Colombo|Kandy|revoked successfully|wizard initialized/),
    ).toBeNull();
    expect(
      screen.getByText(
        /Device inventory, individual device revocation and passkey setup are not available/,
      ),
    ).toBeDefined();
    expect(mocks.verify).not.toHaveBeenCalled();
    expect(mocks.unlink).not.toHaveBeenCalled();
  });
  it('shows unavailable inventory and recovers through an explicit retry', async () => {
    mocks.load.mockRejectedValueOnce(new Error('service unavailable'));
    mount();
    const retry = await screen.findByRole('button', { name: 'Retry security details' });
    expect(screen.queryByText('Google sign-in')).toBeNull();
    fireEvent.click(retry);
    expect(await screen.findByText('Google sign-in')).toBeDefined();
  });
  it('preserves a rejected TOTP draft and clears it only after verification', async () => {
    mocks.verify.mockRejectedValueOnce(new Error('Authenticator verification failed.'));
    mount();
    const input = await screen.findByLabelText('Six-digit authenticator code');
    fireEvent.change(input, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verify authenticator' }));
    await screen.findByText('Authenticator verification failed.');
    expect((input as HTMLInputElement).value).toBe('123456');
    fireEvent.click(screen.getByRole('button', { name: 'Verify authenticator' }));
    await screen.findByText('Authenticator verified for this session.');
    expect((input as HTMLInputElement).value).toBe('');
    expect(mocks.verify).toHaveBeenCalledWith(owner, factorId, '123456');
    expect(mocks.unlink).not.toHaveBeenCalled();
  });
  it('requires explicit unlink confirmation and preserves the credential on rejection', async () => {
    mocks.unlink.mockRejectedValueOnce(new Error('Keep a confirmed email sign-in method.'));
    mount();
    fireEvent.click(await screen.findByRole('button', { name: 'Unlink Google' }));
    expect(mocks.unlink).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm unlink Google' }));
    await screen.findByText('Keep a confirmed email sign-in method.');
    expect(screen.getByText('Google sign-in')).toBeDefined();
    expect(screen.queryByText('Google sign-in unlinked. Your account is retained.')).toBeNull();
  });
  it('does not remove a credential until the server confirms it', async () => {
    let finish!: (value: { identityId: string }) => void;
    mocks.unlink.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const { client } = mount();
    fireEvent.click(await screen.findByRole('button', { name: 'Unlink Google' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm unlink Google' }));
    expect(screen.getByText('Google sign-in')).toBeDefined();
    mocks.load.mockRejectedValue(new Error('refresh unavailable'));
    await act(async () => {
      finish({ identityId: googleId });
    });
    await screen.findByText('Google sign-in unlinked. Your account is retained.');
    expect(screen.queryByText('Google sign-in')).toBeNull();
    expect(client.getQueryCache().getAll()[0]?.queryKey.slice(0, 2)).toEqual([
      'scope',
      owner.accountId,
    ]);
  });
  it('clears credentials and ignores stale completion after an account switch', async () => {
    let finish!: () => void;
    mocks.verify.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    const { client } = mount();
    const input = await screen.findByLabelText('Six-digit authenticator code');
    fireEvent.change(input, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verify authenticator' }));
    await act(async () => {
      mocks.callback?.('SIGNED_IN', { user: { id: 'other-subject' } });
      finish();
    });
    expect(screen.queryByText('Google sign-in')).toBeNull();
    expect(screen.queryByLabelText('Six-digit authenticator code')).toBeNull();
    expect(screen.queryByText('Authenticator verified for this session.')).toBeNull();
    await waitFor(() =>
      expect(
        client
          .getQueryCache()
          .getAll()
          .every((query) => query.state.data === undefined),
      ).toBe(true),
    );
  });
  it('does not claim verification after unmount', async () => {
    let finish!: () => void;
    mocks.verify.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    const view = mount();
    const input = await screen.findByLabelText('Six-digit authenticator code');
    fireEvent.change(input, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verify authenticator' }));
    view.unmount();
    await act(async () => {
      finish();
    });
    expect(mocks.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
