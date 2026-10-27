import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResetPasswordForm } from '@/app/(sanctuary)/auth/ResetPasswordForm';

const owner = {
  accountId: '123e4567-e89b-8101-8100-426614174000',
  authSubjectId: 'f0580000-0000-4000-8000-000000000001',
};
const factorId = 'f0580000-0000-4000-8000-000000000002';
const mocks = vi.hoisted(() => ({
  resolve: vi.fn(),
  load: vi.fn(),
  verify: vi.fn(),
  change: vi.fn(),
  request: vi.fn(),
  unsubscribe: vi.fn(),
  callbacks: [] as ((event: string, session: { user: { id: string } } | null) => void)[],
}));
vi.mock('@/lib/sanctuary/securityClient', () => ({
  resolveSecurityOwner: mocks.resolve,
  loadSecuritySnapshot: mocks.load,
  verifySecurityTotp: mocks.verify,
  changeSecurityPassword: mocks.change,
  requestSecurityPasswordCode: mocks.request,
  unlinkSecurityCredential: vi.fn(),
}));
vi.mock('@/lib/supabase/browser', () => ({
  createBrowserSupabaseClient: () => ({
    auth: {
      onAuthStateChange: (callback: (typeof mocks.callbacks)[number]) => {
        mocks.callbacks.push(callback);
        return { data: { subscription: { unsubscribe: mocks.unsubscribe } } };
      },
    },
  }),
}));
function mount(returnTo = '/profile') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ResetPasswordForm returnTo={returnTo} />
    </QueryClientProvider>,
  );
}
async function fill() {
  const password = await screen.findByLabelText('New password');
  await screen.findByLabelText('Six-digit authenticator code');
  fireEvent.change(password, { target: { value: 'synthetic-new-password' } });
  fireEvent.change(screen.getByLabelText('Confirm new password'), {
    target: { value: 'synthetic-new-password' },
  });
  fireEvent.change(screen.getByLabelText('Six-digit authenticator code'), {
    target: { value: '123456' },
  });
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.callbacks = [];
  mocks.resolve.mockResolvedValue(owner);
  mocks.load.mockResolvedValue({
    ...owner,
    factors: [{ id: factorId, friendly_name: 'My authenticator' }],
    identities: [],
    assurance: 'aal1',
  });
  mocks.verify.mockResolvedValue(undefined);
  mocks.change.mockResolvedValue({ status: 'confirmed' });
  mocks.request.mockResolvedValue(undefined);
});
describe('G3 browser recovery / mounted jsdom with auth and HTTP substituted', () => {
  it('verifies TOTP before password dispatch and forwards entered confirmations', async () => {
    mount();
    await fill();
    fireEvent.change(screen.getByLabelText('Current password, if required'), {
      target: { value: 'synthetic-old' },
    });
    fireEvent.change(screen.getByLabelText('Confirmation code, if requested'), {
      target: { value: '654321' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save new password' }));
    await screen.findByText('Password changed successfully.');
    expect(mocks.verify).toHaveBeenCalledWith(owner, factorId, '123456');
    expect(mocks.change).toHaveBeenCalledWith(owner, 'synthetic-new-password', {
      currentPassword: 'synthetic-old',
      nonce: '654321',
    });
    expect(mocks.verify.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.change.mock.invocationCallOrder[0]!,
    );
    expect(screen.queryByLabelText('New password')).toBeNull();
    expect(
      screen.getByRole('link', { name: 'Continue to your account' }).getAttribute('href'),
    ).toBe('/profile');
  });
  it('keeps a failed password draft editable and permits a successful retry', async () => {
    mocks.change.mockRejectedValueOnce(new Error('Request a confirmation code.'));
    mount();
    await fill();
    fireEvent.click(screen.getByRole('button', { name: 'Save new password' }));
    await screen.findByText('Request a confirmation code.');
    expect((screen.getByLabelText('New password') as HTMLInputElement).value).toBe(
      'synthetic-new-password',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save new password' }));
    await screen.findByText('Password changed successfully.');
    expect(mocks.change).toHaveBeenCalledTimes(2);
  });
  it('does not dispatch a password after rejected TOTP', async () => {
    mocks.verify.mockRejectedValue(new Error('Authenticator verification failed.'));
    mount();
    await fill();
    fireEvent.click(screen.getByRole('button', { name: 'Save new password' }));
    await screen.findByText('Authenticator verification failed.');
    expect(mocks.change).not.toHaveBeenCalled();
    expect((screen.getByLabelText('New password') as HTMLInputElement).value).toBe(
      'synthetic-new-password',
    );
  });
  it('does not treat a code request as password completion or send it automatically', async () => {
    mount();
    await fill();
    expect(mocks.request).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Request confirmation code' }));
    await screen.findByText('Confirmation code requested. Check your verified email or phone.');
    expect(mocks.change).not.toHaveBeenCalled();
    expect(screen.getByLabelText('New password')).toBeDefined();
  });
  it('does not bypass an empty authenticator inventory', async () => {
    mocks.load.mockResolvedValue({ ...owner, factors: [], identities: [], assurance: 'aal1' });
    mount();
    await screen.findByText(
      'No verified authenticator is available. Recovery without this factor is not supported here yet.',
    );
    expect(
      (screen.getByRole('button', { name: 'Save new password' }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(mocks.change).not.toHaveBeenCalled();
  });
  it('clears password fields and stops mutation after sign-out during verification', async () => {
    let finish!: () => void;
    mocks.verify.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    mount();
    await fill();
    fireEvent.click(screen.getByRole('button', { name: 'Save new password' }));
    await act(async () => {
      mocks.callbacks.forEach((callback) => callback('SIGNED_OUT', null));
      finish();
    });
    expect(screen.queryByLabelText('New password')).toBeNull();
    expect(mocks.change).not.toHaveBeenCalled();
    expect(screen.queryByText('Password changed successfully.')).toBeNull();
  });
  it('keeps invalid sessions unavailable with a real recovery destination', async () => {
    mocks.resolve.mockRejectedValue(new Error('session unavailable'));
    mount();
    expect(
      (await screen.findByRole('link', { name: 'Request recovery' })).getAttribute('href'),
    ).toBe('/recovery');
    expect(mocks.change).not.toHaveBeenCalled();
  });
  it('does not allow an external post-reset return destination', async () => {
    mount('https://attacker.example');
    await fill();
    fireEvent.click(screen.getByRole('button', { name: 'Save new password' }));
    await screen.findByText('Password changed successfully.');
    expect(
      screen.getByRole('link', { name: 'Continue to your account' }).getAttribute('href'),
    ).not.toBe('https://attacker.example');
  });
});
