'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { browserAuthRuntime, safeReturnPath } from './browserAuth';

type FormState = 'ready' | 'submitting' | 'sent' | 'unavailable' | 'error';

export function RecoveryForm({ returnTo }: Readonly<{ returnTo: string }>) {
  const [state, setState] = useState<FormState>('ready');
  const [message, setMessage] = useState('');

  async function requestRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const runtime = browserAuthRuntime();
    if (!runtime) {
      setState('unavailable');
      setMessage('Account recovery is not configured in this environment.');
      return;
    }
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim();
    const redirectTo = new URL('/auth/callback', window.location.origin);
    redirectTo.searchParams.set('next', '/reset-password');
    redirectTo.searchParams.set('returnTo', safeReturnPath(returnTo));

    setState('submitting');
    const { error } = await runtime.client.auth.resetPasswordForEmail(email, { redirectTo: redirectTo.toString() });
    if (error) {
      setState('error');
      setMessage(error.message);
      return;
    }
    setState('sent');
    setMessage('If this address has a Gurudevi account, a recovery link is on its way.');
  }

  return (
    <form className="space-y-5" onSubmit={(event) => void requestRecovery(event)}>
      <label className="block font-sans text-sm font-semibold" htmlFor="recovery-email">Email address</label>
      <input autoComplete="email" className="mt-2 min-h-12 w-full border border-line bg-paper px-3 font-sans text-base focus:outline-3 focus:outline-offset-2 focus:outline-water" id="recovery-email" name="email" required type="email" />
      {state === 'sent' ? <p className="font-sans text-sm text-green-800" role="status">{message}</p> : null}
      {state === 'error' || state === 'unavailable' ? <p className="font-sans text-sm text-red-700" role="alert">{message}</p> : null}
      <button className="inline-flex min-h-12 w-full items-center justify-center bg-ink px-5 font-sans text-sm font-bold text-paper hover:bg-lotus disabled:cursor-wait disabled:opacity-60 focus:outline-3 focus:outline-offset-4 focus:outline-water" disabled={state === 'submitting' || state === 'sent'} type="submit">{state === 'submitting' ? 'Sending…' : state === 'sent' ? 'Email sent' : 'Send recovery email'}</button>
      <Link className="block text-center font-sans text-sm font-semibold underline underline-offset-4 focus:outline-3 focus:outline-offset-2 focus:outline-water" href={`/sign-in?returnTo=${encodeURIComponent(safeReturnPath(returnTo))}`}>Back to sign in</Link>
      <p className="text-center font-sans text-sm text-ink-soft">Need an account? <Link className="font-semibold underline underline-offset-4 focus:outline-3 focus:outline-offset-2 focus:outline-water" href={`/sign-up?returnTo=${encodeURIComponent(safeReturnPath(returnTo))}`}>Sign up</Link></p>
    </form>
  );
}
