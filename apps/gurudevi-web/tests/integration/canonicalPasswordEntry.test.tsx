import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { SignInForm } from '@/app/(sanctuary)/auth/SignInForm';
import { getDeviceAccounts } from '@/lib/sanctuary/deviceAccountRegistry';

const mock = vi.hoisted(() => ({ login: vi.fn(), resolve: vi.fn(), duration: vi.fn() }));
vi.mock('@/app/(sanctuary)/auth/browserAuth', async (original) => ({
  ...(await original<typeof import('@/app/(sanctuary)/auth/browserAuth')>()),
  browserAuthRuntime: () => ({
    client: {},
    signInWithPassword: mock.login,
    setSessionDuration: mock.duration,
  }),
}));
vi.mock('@/lib/sanctuary/canonicalDeviceAccount', () => ({
  resolveCanonicalDeviceAccount: mock.resolve,
}));
const accountId = '123e4567-e89b-8101-8100-426614174001';
const subject = 'f0560000-0000-4000-8000-000000000001';
beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, '', '/self');
  mock.login.mockReset().mockResolvedValue({
    data: {
      session: { access_token: 'fixture-access', user: { id: subject } },
      user: { id: subject },
    },
    error: null,
  });
  mock.resolve.mockReset().mockResolvedValue({
    accountId,
    authUserId: subject,
    displayName: 'Server name',
    avatarUrl: null,
    maskedEmail: 'm***r@example.invalid',
    schoolId: null,
    capacity: 'principal',
  });
  mock.duration.mockReset().mockResolvedValue(undefined);
});
function submit() {
  render(<SignInForm returnTo="/self#verified" />);
  fireEvent.change(screen.getByLabelText('Email address'), {
    target: { value: 'member@example.invalid' },
  });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'fixture-password' } });
  fireEvent.click(screen.getByRole('button', { name: /^Sign in with password$/ }));
}
it('G3 / actual password form and local registry store canonical identity; auth/identity network substituted', async () => {
  submit();
  await waitFor(() => expect(window.location.hash).toBe('#verified'));
  expect(getDeviceAccounts()).toEqual([
    expect.objectContaining({
      accountId,
      authUserId: subject,
      displayName: 'Server name',
      capacity: 'principal',
    }),
  ]);
  expect(mock.resolve).toHaveBeenCalledWith({}, { accessToken: 'fixture-access', subject });
  expect(window.localStorage.getItem('gurudevi_device_accounts')).not.toContain('fixture-access');
});
it('G3 / identity failure shows an error and does not persist or navigate as a provider account', async () => {
  mock.resolve.mockRejectedValue(new Error('fixture identity unavailable'));
  submit();
  expect(await screen.findByRole('alert')).toHaveProperty(
    'textContent',
    'Signed in, but your account could not be verified. Please retry.',
  );
  expect(getDeviceAccounts()).toEqual([]);
  expect(window.location.hash).toBe('');
});
