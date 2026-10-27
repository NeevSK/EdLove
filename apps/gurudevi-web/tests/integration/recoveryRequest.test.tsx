import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RecoveryForm } from '@/app/(sanctuary)/auth/RecoveryForm';

const resetPasswordForEmail = vi.hoisted(() => vi.fn());
vi.mock('@/app/(sanctuary)/auth/browserAuth', async (original) => ({
  ...(await original<typeof import('@/app/(sanctuary)/auth/browserAuth')>()),
  browserAuthRuntime: () => ({ client: { auth: { resetPasswordForEmail } } }),
}));
beforeEach(() => {
  vi.resetAllMocks();
  resetPasswordForEmail.mockResolvedValue({ error: null });
});
describe('G3 recovery request / provider substituted', () => {
  it('reports a request without asserting email ownership or delivery', async () => {
    render(<RecoveryForm returnTo="/profile" />);
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'citizen@example.invalid' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send recovery email' }));
    await screen.findByText(
      'If this address has a Gurudevi account, a recovery link has been requested. Check your email.',
    );
    const redirect = new URL(resetPasswordForEmail.mock.calls[0]![1].redirectTo);
    expect(redirect.pathname).toBe('/auth/complete');
    expect(redirect.searchParams.get('next')).toBe('/reset-password');
    expect(redirect.searchParams.get('returnTo')).toBe('/profile');
  });
  it.each(['rejection', 'exception'])(
    'keeps failed requests retryable without exposing provider details: %s',
    async (mode) => {
      if (mode === 'rejection')
        resetPasswordForEmail.mockResolvedValueOnce({
          error: { message: 'private-provider-detail' },
        });
      else resetPasswordForEmail.mockRejectedValueOnce(new Error('private-provider-detail'));
      render(<RecoveryForm returnTo="/profile" />);
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'citizen@example.invalid' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Send recovery email' }));
      await screen.findByText(
        'Could not request account recovery. Check your connection and try again.',
      );
      expect(screen.queryByText('private-provider-detail')).toBeNull();
      expect((screen.getByLabelText('Email address') as HTMLInputElement).value).toBe(
        'citizen@example.invalid',
      );
      fireEvent.click(screen.getByRole('button', { name: 'Send recovery email' }));
      await screen.findByRole('button', { name: 'Recovery requested' });
      expect(resetPasswordForEmail).toHaveBeenCalledTimes(2);
    },
  );
  it('blocks repeated submissions before rerender', async () => {
    let finish!: (value: { error: null }) => void;
    resetPasswordForEmail.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    render(<RecoveryForm returnTo="/profile" />);
    const input = screen.getByLabelText('Email address');
    fireEvent.change(input, { target: { value: 'citizen@example.invalid' } });
    const form = input.closest('form')!;
    act(() => {
      fireEvent.submit(form);
      fireEvent.submit(form);
    });
    expect(resetPasswordForEmail).toHaveBeenCalledTimes(1);
    await act(async () => {
      finish({ error: null });
    });
  });
});
