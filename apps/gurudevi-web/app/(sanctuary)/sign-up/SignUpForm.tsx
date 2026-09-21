'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import { browserAuthRuntime, safeReturnPath } from '../auth/browserAuth';

type FormState = 'ready' | 'submitting' | 'pending' | 'created' | 'unavailable' | 'error';

export function SignUpForm({ returnTo }: Readonly<{ returnTo: string }>) {
  const [state, setState] = useState<FormState>('ready');
  const [message, setMessage] = useState('');

  async function signUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const runtime = browserAuthRuntime();
    if (!runtime) {
      setState('unavailable');
      setMessage('Sign up is not configured in this environment.');
      return;
    }

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    const redirectTo = new URL('/auth/complete', window.location.origin);
    redirectTo.searchParams.set('next', safeReturnPath(returnTo));
    redirectTo.searchParams.set('returnTo', safeReturnPath(returnTo));

    setState('submitting');
    const { data, error } = await runtime.client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo.toString() },
    });
    if (error) {
      setState('error');
      setMessage(error.message);
      return;
    }
    if (data.session) {
      window.location.replace('/onboarding');
      return;
    }
    setState('pending');
    setMessage('Check your email to confirm your account. Sign in after you confirm it.');
  }

  return (
    <form className="space-y-5" onSubmit={(event) => void signUp(event)}>
      <div>
        <label className="block font-sans text-sm font-semibold" htmlFor="sign-up-email">
          Email address
        </label>
        <input
          autoComplete="email"
          className="mt-2 min-h-12 w-full border border-line bg-paper px-3 font-sans text-base focus:outline-3 focus:outline-offset-2 focus:outline-water"
          id="sign-up-email"
          name="email"
          required
          type="email"
        />
      </div>
      <div>
        <label className="block font-sans text-sm font-semibold" htmlFor="sign-up-password">
          Password
        </label>
        <input
          autoComplete="new-password"
          className="mt-2 min-h-12 w-full border border-line bg-paper px-3 font-sans text-base focus:outline-3 focus:outline-offset-2 focus:outline-water"
          id="sign-up-password"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </div>
      {state === 'pending' || state === 'created' ? (
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
        disabled={state === 'submitting' || state === 'pending' || state === 'created'}
        type="submit"
      >
        {state === 'submitting' ? 'Signing up…' : 'Sign up'}
      </button>
      <p className="text-center font-sans text-sm text-ink-soft">
        Already have an account?{' '}
        <Link
          className="font-semibold underline underline-offset-4 focus:outline-3 focus:outline-offset-2 focus:outline-water"
          href={`/sign-in?returnTo=${encodeURIComponent(safeReturnPath(returnTo))}`}
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
