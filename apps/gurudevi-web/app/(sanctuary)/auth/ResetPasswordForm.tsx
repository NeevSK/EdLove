'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { browserAuthRuntime, safeReturnPath } from './browserAuth';

type ResetState = 'checking' | 'ready' | 'submitting' | 'unavailable' | 'error';

export function ResetPasswordForm({ returnTo }: Readonly<{ returnTo: string }>) {
  const [state, setState] = useState<ResetState>('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      const runtime = browserAuthRuntime();
      if (!runtime) {
        if (active) {
          setState('unavailable');
          setMessage('Password recovery is not configured in this environment.');
        }
        return;
      }
      const identity = await runtime.bootstrapIdentity();
      if (!active) return;
      if (identity.status === 'authenticated') setState('ready');
      else {
        setState('error');
        setMessage('This recovery link has expired or is invalid. Request a new link to continue.');
      }
    });
    return () => { active = false; };
  }, []);

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') ?? '');
    const confirmation = String(form.get('confirmation') ?? '');
    if (password !== confirmation) {
      setState('error');
      setMessage('The two passwords do not match.');
      return;
    }
    const runtime = browserAuthRuntime();
    if (!runtime) {
      setState('unavailable');
      setMessage('Password recovery is not configured in this environment.');
      return;
    }
    setState('submitting');
    const { error } = await runtime.client.auth.updateUser({ password });
    if (error) {
      setState('error');
      setMessage(error.message);
      return;
    }
    window.location.assign(safeReturnPath(returnTo));
  }

  if (state === 'checking') return <p className="font-sans text-lg text-ink-soft" role="status">Verifying your recovery link…</p>;
  if (state === 'unavailable' || state === 'error') return <p className="font-sans text-sm text-red-700" role="alert">{message}</p>;
  return <form className="space-y-5" onSubmit={(event) => void resetPassword(event)}><label className="block font-sans text-sm font-semibold" htmlFor="new-password">New password</label><input autoComplete="new-password" className="mt-2 min-h-12 w-full border border-line bg-paper px-3 font-sans text-base focus:outline-3 focus:outline-offset-2 focus:outline-water" id="new-password" minLength={8} name="password" required type="password" /><label className="block font-sans text-sm font-semibold" htmlFor="confirm-password">Confirm new password</label><input autoComplete="new-password" className="mt-2 min-h-12 w-full border border-line bg-paper px-3 font-sans text-base focus:outline-3 focus:outline-offset-2 focus:outline-water" id="confirm-password" minLength={8} name="confirmation" required type="password" /><button className="inline-flex min-h-12 w-full items-center justify-center bg-ink px-5 font-sans text-sm font-bold text-paper hover:bg-lotus disabled:cursor-wait disabled:opacity-60 focus:outline-3 focus:outline-offset-4 focus:outline-water" disabled={state === 'submitting'} type="submit">{state === 'submitting' ? 'Saving…' : 'Save new password'}</button></form>;
}
