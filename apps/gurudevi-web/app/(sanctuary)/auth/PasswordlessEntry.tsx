'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import styles from './auth.module.css';
import { browserAuthRuntime, safeReturnPath } from './browserAuth';
import { PhoneOtpEntry } from './PhoneOtpEntry';

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
    const identity = await runtime.bootstrapIdentity();
    const isAnonymousGuest =
      identity.status === 'authenticated' && identity.session.user.is_anonymous === true;
    const { error: authError } = isAnonymousGuest
      ? await runtime.client.auth.updateUser({ email }, { emailRedirectTo: callbackUrl() })
      : typeof runtime.signInWithOtp === 'function'
        ? await runtime.signInWithOtp({
            email,
            emailRedirectTo: callbackUrl(),
          })
        : await runtime.client.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: callbackUrl(), shouldCreateUser: true },
          });
    setPending(null);
    if (authError) {
      setError('We could not send an email link. Check the address and try again.');
      return;
    }
    setMessage(
      isAnonymousGuest
        ? 'Check your email to secure this guest sanctuary. Your existing work stays attached to it.'
        : 'Check your email for a secure link. If this address is new, confirming it creates your account.',
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
    const identity = await runtime.bootstrapIdentity();
    const isAnonymousGuest =
      identity.status === 'authenticated' && identity.session.user.is_anonymous === true;
    const authResult = isAnonymousGuest
      ? await runtime.client.auth.linkIdentity({ provider, options: { redirectTo: callbackUrl() } })
      : await runtime.client.auth.signInWithOAuth({
          provider,
          options: { redirectTo: callbackUrl() },
        });
    const { data, error: authError } = authResult;
    if (authError) {
      setPending(null);
      setError(
        isAnonymousGuest
          ? `${providerName(provider)} could not be linked to this guest sanctuary. You can keep exploring as a guest, or sign in to that existing account from a fresh entry.`
          : `${providerName(provider)} sign in could not start. Check the provider connection and try again.`,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div className={styles.formHeader}>
        <div className={styles.formBadge}>
          <span className={styles.statusDot} />
          <span className={styles.formBadgeText}>Sign In</span>
        </div>
        <h2 className={styles.formTitle}>Welcome</h2>
        <p className={styles.formSub}>
          Continue with Google, Apple, or your email address.
        </p>
      </div>

      <div className={styles.oauthRow}>
        <button
          type="button"
          aria-label="Continue with Google"
          className={styles.oauthBtn}
          disabled={pending !== null}
          onClick={() => void continueWithProvider('google')}
        >
          <div className={styles.googleGlyph} aria-hidden="true">
            G
          </div>
          <span>{pending === 'google' ? 'Connecting…' : 'Continue with Google'}</span>
        </button>

        <button
          type="button"
          aria-label="Continue with Apple"
          className={styles.oauthBtn}
          disabled={pending !== null}
          onClick={() => void continueWithProvider('apple')}
        >
          <span className={styles.appleGlyph} aria-hidden="true">
            
          </span>
          <span>{pending === 'apple' ? 'Connecting…' : 'Continue with Apple'}</span>
        </button>
      </div>

      <div className={styles.orDivider}>
        <div className={styles.dividerLine} aria-hidden="true" />
        <span>Or with email magic link</span>
        <div className={styles.dividerLine} aria-hidden="true" />
      </div>

      <form onSubmit={(e) => void sendMagicLink(e)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel} htmlFor="passwordless-email">
            Email address
          </label>
          <input
            id="passwordless-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@school.edu.lk"
            className={styles.textInput}
            disabled={pending !== null}
          />
        </div>

        <button
          type="submit"
          disabled={pending !== null}
          className={styles.submitBtn}
        >
          {pending === 'email' ? 'Sending link…' : 'Continue with email'}
          <span aria-hidden="true">→</span>
        </button>

        <p style={{ fontSize: '12px', color: '#7a6e5f', margin: 0, lineHeight: 1.5 }}>
          If this address is new, we will create your account after you confirm the email link.
        </p>
      </form>

      {message ? (
        <div className={styles.statusMessage} role="status">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      ) : null}

      {process.env.NEXT_PUBLIC_PHONE_AUTH_ENABLED === 'true' ? (
        <PhoneOtpEntry returnTo={returnTo} />
      ) : null}

      <div className={styles.guestOptionRow}>
        <span>Prefer to explore first?</span>
        <Link className={styles.guestLink} href="/self">
          Enter Guest House freely →
        </Link>
      </div>
    </div>
  );
}
