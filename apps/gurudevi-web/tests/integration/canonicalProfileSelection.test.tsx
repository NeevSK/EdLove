import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { SignInFlow } from '@/app/(sanctuary)/auth/SignInFlow';

const mock = vi.hoisted(() => ({ bootstrap: vi.fn(), resolve: vi.fn(), accounts: vi.fn() }));
const account = {
  accountId: '123e4567-e89b-8101-8100-426614174001',
  authUserId: 'f0560000-0000-4000-8000-000000000001',
};
vi.mock('@/lib/sanctuary/deviceAccountRegistry', () => ({ getDeviceAccounts: mock.accounts }));
vi.mock('@/lib/sanctuary/canonicalDeviceAccount', () => ({
  resolveCanonicalDeviceAccount: mock.resolve,
}));
vi.mock('@/app/(sanctuary)/auth/browserAuth', async (original) => ({
  ...(await original<typeof import('@/app/(sanctuary)/auth/browserAuth')>()),
  browserAuthRuntime: () => ({ client: {}, bootstrapIdentity: mock.bootstrap }),
}));
vi.mock('@/app/(sanctuary)/auth/AccountSwitcher', () => ({
  AccountSwitcher: ({
    onSelectAccount,
  }: {
    onSelectAccount: (selected: typeof account) => Promise<void>;
  }) => <button onClick={() => void onSelectAccount(account)}>Choose remembered profile</button>,
}));
vi.mock('@/app/(sanctuary)/auth/PasswordlessEntry', () => ({
  PasswordlessEntry: () => <div>Email sign-in</div>,
}));
vi.mock('@/app/(sanctuary)/auth/SignInForm', () => ({
  SignInForm: () => <div>Password sign-in</div>,
}));
beforeEach(() => {
  window.history.replaceState(null, '', '/self');
  mock.accounts.mockReset().mockReturnValue([account]);
  mock.bootstrap.mockReset().mockResolvedValue({
    status: 'authenticated',
    session: { access_token: 'fixture-access', user: { id: account.authUserId } },
  });
  mock.resolve.mockReset().mockResolvedValue(account);
});
async function choose() {
  render(<SignInFlow returnTo="/self#verified" />);
  fireEvent.click(await screen.findByRole('button', { name: 'Choose remembered profile' }));
}
it('G3 / permits a profile only after matching canonical account and provider subject; picker/auth/network substituted', async () => {
  await choose();
  await waitFor(() => expect(window.location.hash).toBe('#verified'));
  expect(mock.resolve).toHaveBeenCalledWith(
    {},
    { accessToken: 'fixture-access', subject: account.authUserId },
  );
});
it.each(['different-account', 'signed-out', 'unavailable'])(
  'G3 / requires credentials for profile selection with %s',
  async (state) => {
    if (state === 'different-account')
      mock.resolve.mockResolvedValue({
        ...account,
        accountId: '123e4567-e89b-8101-8100-426614174002',
      });
    if (state === 'signed-out')
      mock.bootstrap.mockResolvedValue({ status: 'signed-out', session: null });
    if (state === 'unavailable') mock.resolve.mockRejectedValue(new Error('fixture unavailable'));
    await choose();
    expect(await screen.findByRole('status')).toHaveProperty(
      'textContent',
      'Please sign in to open your account.',
    );
    expect(screen.getByText('Password sign-in')).toBeTruthy();
    expect(window.location.hash).toBe('');
  },
);
