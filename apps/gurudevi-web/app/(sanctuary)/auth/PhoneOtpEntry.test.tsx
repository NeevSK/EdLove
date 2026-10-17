import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PasswordlessEntry } from './PasswordlessEntry';
import { PhoneOtpEntry } from './PhoneOtpEntry';

const browserAuthRuntime = vi.hoisted(() => vi.fn());
const signInWithOtp = vi.hoisted(() => vi.fn());
const verifyOtp = vi.hoisted(() => vi.fn());
const replace = vi.hoisted(() => vi.fn());
const refresh = vi.hoisted(() => vi.fn());

vi.mock('./browserAuth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./browserAuth')>();
  return { browserAuthRuntime, safeReturnPath: actual.safeReturnPath };
});
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace, refresh }) }));

describe('PhoneOtpEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signInWithOtp.mockResolvedValue({ error: null });
    verifyOtp.mockResolvedValue({
      data: { session: { access_token: 'test-session' }, user: { id: 'provider-user' } },
      error: null,
    });
    browserAuthRuntime.mockReturnValue({ client: { auth: { signInWithOtp, verifyOtp } } });
  });

  it('requests a code with account creation off by default and does not navigate', async () => {
    const user = userEvent.setup();
    render(<PhoneOtpEntry returnTo="/workspace" />);
    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: '+94771234567' } });
    await user.click(screen.getByRole('button', { name: 'Send a sign-in code' }));

    expect(signInWithOtp).toHaveBeenCalledWith({
      phone: '+94771234567',
      options: { channel: 'sms', shouldCreateUser: false },
    });
    expect((await screen.findByRole('status')).textContent).toMatch(/sms will arrive/i);
    expect(replace).not.toHaveBeenCalled();
  });

  it('only requests account creation after the user checks it', async () => {
    const user = userEvent.setup();
    render(<PhoneOtpEntry returnTo="/self" />);
    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: '+94771234567' } });
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Send a sign-in code' }));
    expect(signInWithOtp).toHaveBeenCalledWith({
      phone: '+94771234567',
      options: { channel: 'sms', shouldCreateUser: true },
    });
  });

  it('verifies an actual provider session before navigating to the safe return path', async () => {
    const user = userEvent.setup();
    render(<PhoneOtpEntry returnTo="/workspace" />);
    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: '+94771234567' } });
    await user.click(screen.getByRole('button', { name: 'Send a sign-in code' }));
    fireEvent.change(await screen.findByLabelText('SMS code'), { target: { value: '123456' } });
    await user.click(screen.getByRole('button', { name: 'Verify code' }));

    expect(verifyOtp).toHaveBeenCalledWith({ phone: '+94771234567', token: '123456', type: 'sms' });
    expect(replace).toHaveBeenCalledWith('/workspace');
    expect(refresh).toHaveBeenCalledOnce();
  });

  it('retains the draft and allows retry after a request failure', async () => {
    const user = userEvent.setup();
    signInWithOtp.mockRejectedValueOnce(new Error('private provider details'));
    render(<PhoneOtpEntry returnTo="/self" />);
    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: '+94771234567' } });
    await user.click(screen.getByRole('button', { name: 'Send a sign-in code' }));
    expect((await screen.findByRole('alert')).textContent).toMatch(
      /could not complete phone sign-in/i,
    );
    expect((screen.getByLabelText('Phone number') as HTMLInputElement).value).toBe('+94771234567');
    await user.click(screen.getByRole('button', { name: 'Send a sign-in code' }));
    expect(signInWithOtp).toHaveBeenCalledTimes(2);
    expect(await screen.findByLabelText('SMS code')).toBeTruthy();
  });

  it('keeps an invalid code draft after a provider rejection and allows a safe retry', async () => {
    const user = userEvent.setup();
    verifyOtp
      .mockResolvedValueOnce({
        data: { session: null, user: null },
        error: new Error('private provider details'),
      })
      .mockResolvedValueOnce({
        data: { session: { access_token: 'test-session' }, user: { id: 'provider-user' } },
        error: null,
      });
    render(<PhoneOtpEntry returnTo="https://attacker.example/steal" />);
    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: '+94771234567' } });
    await user.click(screen.getByRole('button', { name: 'Send a sign-in code' }));
    const code = await screen.findByLabelText('SMS code');
    fireEvent.change(code, { target: { value: '123456' } });
    await user.click(screen.getByRole('button', { name: 'Verify code' }));
    expect((await screen.findByRole('alert')).textContent).toMatch(
      /could not complete phone sign-in/i,
    );
    expect(screen.getByRole('alert').textContent).not.toContain('private provider details');
    expect((screen.getByLabelText('SMS code') as HTMLInputElement).value).toBe('123456');
    expect(replace).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Verify code' }));
    expect(replace).toHaveBeenCalledWith('/self');
    expect(replace).not.toHaveBeenCalledWith('https://attacker.example/steal');
  });

  it('blocks duplicate requests while pending', async () => {
    let settleRequest: ((value: { error: null }) => void) | undefined;
    signInWithOtp.mockImplementation(
      () =>
        new Promise((resolve: (value: { error: null }) => void) => {
          settleRequest = resolve;
        }),
    );
    render(<PhoneOtpEntry returnTo="/self" />);
    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: '+94771234567' } });
    const form = screen.getByLabelText('Phone number').closest('form');
    if (!(form instanceof HTMLFormElement)) throw new Error('Expected phone form');
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(signInWithOtp).toHaveBeenCalledTimes(1);
    await act(async () => {
      settleRequest?.({ error: null });
    });
  });

  it('clears a previous challenge when the phone number changes', async () => {
    const user = userEvent.setup();
    render(<PhoneOtpEntry returnTo="/self" />);
    const phoneInput = screen.getByLabelText('Phone number');
    fireEvent.change(phoneInput, { target: { value: '+94771234567' } });
    await user.click(screen.getByRole('button', { name: 'Send a sign-in code' }));
    expect(await screen.findByLabelText('SMS code')).toBeTruthy();
    fireEvent.change(phoneInput, { target: { value: '+14155550100' } });
    expect(screen.queryByLabelText('SMS code')).toBeNull();
    expect(screen.getByRole('button', { name: 'Send a sign-in code' })).toBeTruthy();
  });

  it('shows a safe error when the browser auth runtime is missing', async () => {
    browserAuthRuntime.mockReturnValue(null);
    const user = userEvent.setup();
    render(<PhoneOtpEntry returnTo="/self" />);
    await user.type(screen.getByLabelText('Phone number'), '+94771234567');
    await user.click(screen.getByRole('button', { name: 'Send a sign-in code' }));
    expect((await screen.findByRole('alert')).textContent).toMatch(
      /could not complete phone sign-in/i,
    );
    expect((screen.getByLabelText('Phone number') as HTMLInputElement).value).toBe('+94771234567');
  });

  it('keeps phone entry hidden unless the explicit public feature flag is true', () => {
    const original = process.env.NEXT_PUBLIC_PHONE_AUTH_ENABLED;
    try {
      process.env.NEXT_PUBLIC_PHONE_AUTH_ENABLED = 'false';
      const hidden = render(<PasswordlessEntry returnTo="/self" />);
      expect(screen.queryByLabelText('Phone number')).toBeNull();
      hidden.unmount();
      process.env.NEXT_PUBLIC_PHONE_AUTH_ENABLED = 'true';
      render(<PasswordlessEntry returnTo="/self" />);
      expect(screen.getByLabelText('Phone number')).toBeTruthy();
    } finally {
      if (original === undefined) delete process.env.NEXT_PUBLIC_PHONE_AUTH_ENABLED;
      else process.env.NEXT_PUBLIC_PHONE_AUTH_ENABLED = original;
    }
  });
});
