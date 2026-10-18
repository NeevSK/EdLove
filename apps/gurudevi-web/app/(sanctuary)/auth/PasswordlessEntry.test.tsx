import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PasswordlessEntry } from './PasswordlessEntry';

const browserAuthRuntime = vi.hoisted(() => vi.fn());
const signInWithOtp = vi.hoisted(() => vi.fn());
const updateUser = vi.hoisted(() => vi.fn());

vi.mock('./browserAuth', () => ({
  browserAuthRuntime,
  safeReturnPath: (value: string) => value,
}));

describe('PasswordlessEntry email magic link', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    browserAuthRuntime.mockReturnValue({
      client: { auth: { signInWithOtp, updateUser } },
      bootstrapIdentity: vi
        .fn()
        .mockResolvedValue({ status: 'signed-out', session: null, user: null }),
    });
  });

  it('sends a magic link to the entered address with a safe completion URL', async () => {
    signInWithOtp.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<PasswordlessEntry returnTo="/onboarding" />);

    await user.type(screen.getByLabelText('Email address'), 'learner@example.org');
    await user.click(screen.getByRole('button', { name: 'Continue with email' }));

    expect(signInWithOtp).toHaveBeenCalledWith({
      email: 'learner@example.org',
      options: {
        emailRedirectTo: `${window.location.origin}/auth/complete?next=%2Fonboarding&returnTo=%2Fonboarding`,
        shouldCreateUser: true,
      },
    });
    expect((await screen.findByRole('status')).textContent).toMatch(/check your email/i);
  });

  it('keeps the form usable and explains a delivery failure', async () => {
    signInWithOtp.mockResolvedValue({ error: new Error('provider unavailable') });
    const user = userEvent.setup();
    render(<PasswordlessEntry returnTo="/self" />);

    await user.type(screen.getByLabelText('Email address'), 'learner@example.org');
    await user.click(screen.getByRole('button', { name: 'Continue with email' }));

    expect((await screen.findByRole('alert')).textContent).toMatch(/could not send an email link/i);
    expect(
      screen.getByRole('button', { name: 'Continue with email' }).hasAttribute('disabled'),
    ).toBe(false);
  });

  it('links an anonymous guest email to its existing subject instead of creating another account', async () => {
    updateUser.mockResolvedValue({ error: null });
    browserAuthRuntime.mockReturnValue({
      client: { auth: { signInWithOtp, updateUser } },
      bootstrapIdentity: vi.fn().mockResolvedValue({
        status: 'authenticated',
        session: { user: { id: 'guest-1', is_anonymous: true } },
      }),
    });
    const user = userEvent.setup();
    render(<PasswordlessEntry returnTo="/onboarding" />);

    await user.type(screen.getByLabelText('Email address'), 'learner@example.org');
    await user.click(screen.getByRole('button', { name: 'Continue with email' }));

    expect(updateUser).toHaveBeenCalledWith(
      { email: 'learner@example.org' },
      {
        emailRedirectTo: `${window.location.origin}/auth/complete?next=%2Fonboarding&returnTo=%2Fonboarding`,
      },
    );
    expect(signInWithOtp).not.toHaveBeenCalled();
    expect((await screen.findByRole('status')).textContent).toMatch(
      /existing work stays attached/i,
    );
  });
});
