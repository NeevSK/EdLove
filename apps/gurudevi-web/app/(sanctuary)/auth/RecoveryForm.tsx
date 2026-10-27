'use client';

import Link from 'next/link';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { browserAuthRuntime, safeReturnPath } from './browserAuth';

type FormState = 'ready' | 'submitting' | 'sent' | 'unavailable' | 'error';

export function RecoveryForm({ returnTo }: Readonly<{ returnTo: string }>) {
  const [state, setState] = useState<FormState>('ready');
  const [message, setMessage] = useState('');
  const busy = useRef(false);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  async function requestRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const runtime = browserAuthRuntime();
    if (!runtime) {
      setState('unavailable');
      setMessage('Account recovery is not configured in this environment.');
      return;
    }
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim();
    const redirectTo = new URL('/auth/complete', window.location.origin);
    redirectTo.searchParams.set('next', '/reset-password');
    redirectTo.searchParams.set('returnTo', safeReturnPath(returnTo));

    setState('submitting');
    busy.current = true;
    setMessage('');
    try {
      const { error } = await runtime.client.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo.toString(),
      });
      if (error) throw new Error('Recovery request unavailable');
      if (!active.current) return;
      setState('sent');
      setMessage(
        'If this address has a Gurudevi account, a recovery link has been requested. Check your email.',
      );
    } catch {
      if (!active.current) return;
      setState('error');
      setMessage('Could not request account recovery. Check your connection and try again.');
    } finally {
      busy.current = false;
    }
  }

  return (
    <form className="space-y-5" onSubmit={(event) => void requestRecovery(event)}>
      <label className="block font-sans text-sm font-semibold" htmlFor="recovery-email">
        Email address
      </label>
      <input
        autoComplete="email"
        className="mt-2 min-h-12 w-full border border-line bg-paper px-3 font-sans text-base focus:outline-3 focus:outline-offset-2 focus:outline-water"
        id="recovery-email"
        name="email"
        disabled={state === 'submitting' || state === 'sent'}
        required
        type="email"
      />
      {state === 'sent' ? (
        <p className="font-sans text-sm text-green-800" role="status">
          {message}
        </p>
      ) : null}
      {state === 'error' || state === 'unavailable' ? (
        <p className="font-sans text-sm text-red-700" role="alert">
          {message}
        </p>
      ) : null}
      <button
        className="inline-flex min-h-12 w-full items-center justify-center bg-ink px-5 font-sans text-sm font-bold text-paper hover:bg-lotus disabled:cursor-wait disabled:opacity-60 focus:outline-3 focus:outline-offset-4 focus:outline-water"
        disabled={state === 'submitting' || state === 'sent'}
        type="submit"
      >
        {state === 'submitting'
          ? 'Sending…'
          : state === 'sent'
            ? 'Recovery requested'
            : 'Send recovery email'}
      </button>
      <Link
        className="block text-center font-sans text-sm font-semibold underline underline-offset-4 focus:outline-3 focus:outline-offset-2 focus:outline-water"
        href={`/sign-in?returnTo=${encodeURIComponent(safeReturnPath(returnTo))}`}
      >
        Back to sign in
      </Link>
      <p className="text-center font-sans text-sm text-ink-soft">
        Need an account?{' '}
        <Link
          className="font-semibold underline underline-offset-4 focus:outline-3 focus:outline-offset-2 focus:outline-water"
          href={`/sign-up?returnTo=${encodeURIComponent(safeReturnPath(returnTo))}`}
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
