'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import { browserAuthRuntime, safeReturnPath } from './browserAuth';

type FormState = 'ready' | 'submitting' | 'unavailable' | 'error';

export function SignInForm({ returnTo }: Readonly<{ returnTo: string }>) {
  const [state, setState] = useState<FormState>('ready');
  const [message, setMessage] = useState('');
  const [remember, setRemember] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    const runtime = browserAuthRuntime();

    if (!runtime) {
      setState('unavailable');
      setMessage('Sanctuary sign-in is not configured in this environment.');
      return;
    }

    setState('submitting');
    setMessage('');
    const { data, error } = await runtime.client.auth.signInWithPassword({ email, password });
    if (error) {
      setState('error');
      setMessage('We could not sign in with those details. Check them and try again.');
      return;
    }

    // Set session duration preference (non-blocking)
    runtime.setSessionDuration(remember).catch(() => {});

    // Give Supabase client time to persist session to cookies before navigation
    if (data.session) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Use href assignment for more reliable navigation
    const destination = safeReturnPath(returnTo);
    console.log('[SignInForm] Navigating to:', destination);
    window.location.href = destination;
  }

  return (
    <form className="space-y-5" onSubmit={(event) => void signIn(event)}>
      <label className="block font-sans text-sm font-semibold" htmlFor="email">
        Email address
      </label>
      <input
        autoComplete="email"
        className="mt-2 min-h-12 w-full border border-line bg-paper px-3 font-sans text-base focus:outline-3 focus:outline-offset-2 focus:outline-water"
        id="email"
        name="email"
        required
        type="email"
      />
      <label className="block font-sans text-sm font-semibold" htmlFor="password">
        Password
      </label>
      <input
        autoComplete="current-password"
        className="mt-2 min-h-12 w-full border border-line bg-paper px-3 font-sans text-base focus:outline-3 focus:outline-offset-2 focus:outline-water"
        id="password"
        minLength={8}
        name="password"
        required
        type="password"
      />
      <label className="flex items-center gap-2 font-sans text-sm cursor-pointer">
        <input
          className="w-4 h-4 border border-line bg-paper focus:outline-3 focus:outline-offset-2 focus:outline-water"
          id="remember"
          name="remember"
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        <span>Remember me for 30 days</span>
      </label>
      {state !== 'ready' && state !== 'submitting' ? (
        <p className="font-sans text-sm text-red-700" role="alert">
          {message}
        </p>
      ) : null}
      <button
        className="inline-flex min-h-12 w-full items-center justify-center bg-ink px-5 font-sans text-sm font-bold text-paper hover:bg-lotus disabled:cursor-wait disabled:opacity-60 focus:outline-3 focus:outline-offset-4 focus:outline-water"
        disabled={state === 'submitting'}
        type="submit"
      >
        {state === 'submitting' ? 'Signing in…' : 'Sign in'}
      </button>
      <Link
        className="block text-center font-sans text-sm font-semibold underline underline-offset-4 focus:outline-3 focus:outline-offset-2 focus:outline-water"
        href={`/recovery?returnTo=${encodeURIComponent(safeReturnPath(returnTo))}`}
      >
        Forgot your password?
      </Link>
      <p className="text-center font-sans text-sm text-ink-soft">
        New to Gurudevi?{' '}
        <Link
          className="font-semibold underline underline-offset-4 focus:outline-3 focus:outline-offset-2 focus:outline-water"
          href="/sign-up?returnTo=%2Fonboarding"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
