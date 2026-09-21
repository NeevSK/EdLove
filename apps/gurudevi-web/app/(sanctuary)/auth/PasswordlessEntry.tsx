'use client';

import { type FormEvent, useState } from 'react';
import { browserAuthRuntime, safeReturnPath } from './browserAuth';

type Provider = 'google' | 'apple';
type PendingAction = 'email' | Provider | null;

function providerName(provider: Provider): string {
  return provider === 'google' ? 'Google' : 'Apple';
}

export function PasswordlessEntry({ returnTo }: Readonly<{ returnTo: string }>) {
  const [pending, setPending] = useState<PendingAction>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function callbackUrl() {
    const url = new URL('/auth/complete', window.location.origin);
    const next = safeReturnPath(returnTo);
    url.searchParams.set('next', next);
    url.searchParams.set('returnTo', next);
    return url.toString();
  }

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');
    const runtime = browserAuthRuntime();
    if (!runtime) {
      setError(
        'Sign in is unavailable because this environment is missing its public Supabase settings.',
      );
      return;
    }

    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim();
    setPending('email');
    const { error: authError } = await runtime.client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl(), shouldCreateUser: true },
    });
    setPending(null);
    if (authError) {
      setError('We could not send an email link. Check the address and try again.');
      return;
    }
    setMessage(
      'Check your email for a secure link. If this address is new, confirming it creates your account.',
    );
  }

  async function continueWithProvider(provider: Provider) {
    setMessage('');
    setError('');
    const runtime = browserAuthRuntime();
    if (!runtime) {
      setError(
        'Sign in is unavailable because this environment is missing its public Supabase settings.',
      );
      return;
    }

    setPending(provider);
    const { data, error: authError } = await runtime.client.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl() },
    });
    if (authError) {
      setPending(null);
      setError(
        `${providerName(provider)} sign in could not start. Check the provider connection and try again.`,
      );
      return;
    }
    if (!data.url) {
      setPending(null);
      setError(
        `${providerName(provider)} sign in did not provide a redirect. Check the provider connection and try again.`,
      );
      return;
    }
    window.location.assign(data.url);
  }

  return (
    <div className="space-y-7">
      <form className="space-y-5" onSubmit={(event) => void sendMagicLink(event)}>
        <div>
          <label className="block font-sans text-sm font-semibold" htmlFor="passwordless-email">
            Email address
          </label>
          <input
            autoComplete="email"
            className="mt-2 min-h-12 w-full border border-line bg-paper px-3 font-sans text-base focus:outline-3 focus:outline-offset-2 focus:outline-water"
            id="passwordless-email"
            name="email"
            required
            type="email"
          />
        </div>
        <button
          className="inline-flex min-h-12 w-full items-center justify-center bg-ink px-5 font-sans text-sm font-bold text-paper hover:bg-lotus disabled:cursor-wait disabled:opacity-60 focus:outline-3 focus:outline-offset-4 focus:outline-water"
          disabled={pending !== null}
          type="submit"
        >
          {pending === 'email' ? 'Sending…' : 'Continue with email'}
        </button>
        <p className="font-sans text-sm leading-6 text-ink-soft">
          If this address is new, we will create your account after you confirm the email link.
        </p>
      </form>

      <div className="flex items-center gap-3 font-sans text-xs uppercase tracking-[0.14em] text-ink-soft">
        <span className="h-px flex-1 bg-line" />
        <span>Or continue with</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {(['google', 'apple'] as const).map((provider) => (
          <button
            aria-label={`Sign in with ${providerName(provider)}`}
            className="inline-flex min-h-12 items-center justify-center border border-line px-4 font-sans text-sm font-bold text-ink hover:border-lotus hover:text-lotus disabled:cursor-wait disabled:opacity-60 focus:outline-3 focus:outline-offset-4 focus:outline-water"
            disabled={pending !== null}
            key={provider}
            onClick={() => void continueWithProvider(provider)}
            type="button"
          >
            {pending === provider ? 'Continuing…' : `Continue with ${providerName(provider)}`}
          </button>
        ))}
      </div>

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
    </div>
  );
}
