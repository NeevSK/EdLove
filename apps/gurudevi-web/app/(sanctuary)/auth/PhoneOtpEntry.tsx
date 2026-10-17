'use client';

import { requestPhoneOtp, verifyPhoneOtp } from '@repo/core/api/phoneAuth';
import { useRouter } from 'next/navigation';
import { type FormEvent, useRef, useState } from 'react';
import { browserAuthRuntime, safeReturnPath } from './browserAuth';

export function PhoneOtpEntry({ returnTo }: Readonly<{ returnTo: string }>) {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [challengedPhone, setChallengedPhone] = useState('');
  const [token, setToken] = useState('');
  const [shouldCreateUser, setShouldCreateUser] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const pendingRef = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    setError('');
    setMessage('');
    try {
      const runtime = browserAuthRuntime();
      if (!runtime) throw new Error('unavailable');
      if (!challengedPhone) {
        await requestPhoneOtp(runtime.client.auth, { phone, shouldCreateUser });
        setChallengedPhone(phone);
        setMessage('If this number can receive a code, an SMS will arrive shortly.');
        return;
      }
      await verifyPhoneOtp(runtime.client.auth, { phone: challengedPhone, token });
      const destination = safeReturnPath(returnTo);
      router.replace(destination);
      router.refresh();
    } catch {
      setError('We could not complete phone sign-in. Check the details and try again.');
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }

  return (
    <form className="space-y-5 border-t border-line pt-6" onSubmit={(event) => void submit(event)}>
      <div>
        <label className="block font-sans text-sm font-semibold" htmlFor="passwordless-phone">
          Phone number
        </label>
        <input
          autoComplete="tel"
          className="mt-2 min-h-12 w-full border border-line bg-paper px-3 font-sans text-base focus:outline-3 focus:outline-offset-2 focus:outline-water"
          disabled={pending}
          id="passwordless-phone"
          inputMode="tel"
          onChange={(event) => {
            setPhone(event.currentTarget.value);
            setChallengedPhone('');
            setToken('');
            setMessage('');
            setError('');
          }}
          required
          type="tel"
          value={phone}
          aria-describedby="passwordless-phone-help"
        />
        <p className="mt-2 font-sans text-sm leading-6 text-ink-soft" id="passwordless-phone-help">
          Include the country code, for example +94 followed by your number.
        </p>
      </div>
      <label className="flex items-start gap-3 font-sans text-sm leading-6 text-ink-soft">
        <input
          checked={shouldCreateUser}
          className="mt-1"
          disabled={pending || Boolean(challengedPhone)}
          onChange={(event) => setShouldCreateUser(event.currentTarget.checked)}
          type="checkbox"
        />
        Create a new account if this number is not registered
      </label>
      {challengedPhone ? (
        <div>
          <label className="block font-sans text-sm font-semibold" htmlFor="phone-otp-code">
            SMS code
          </label>
          <input
            autoComplete="one-time-code"
            className="mt-2 min-h-12 w-full border border-line bg-paper px-3 font-sans text-base focus:outline-3 focus:outline-offset-2 focus:outline-water"
            disabled={pending}
            id="phone-otp-code"
            inputMode="numeric"
            onChange={(event) => setToken(event.currentTarget.value)}
            required
            type="text"
            value={token}
          />
        </div>
      ) : null}
      <button
        className="inline-flex min-h-12 w-full items-center justify-center bg-ink px-5 font-sans text-sm font-bold text-paper hover:bg-lotus disabled:cursor-wait disabled:opacity-60 focus:outline-3 focus:outline-offset-4 focus:outline-water"
        disabled={pending}
        type="submit"
      >
        {pending ? 'Working…' : challengedPhone ? 'Verify code' : 'Send a sign-in code'}
      </button>
      {message ? (
        <p className="font-sans text-sm text-green-800" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="font-sans text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
