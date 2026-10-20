'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import styles from '../auth/auth.module.css';
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
    <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={(event) => void signUp(event)}>
      <div className={styles.inputGroup}>
        <label className={styles.inputLabel} htmlFor="sign-up-email">
          Email address
        </label>
        <input
          autoComplete="email"
          className={styles.textInput}
          id="sign-up-email"
          name="email"
          required
          type="email"
          placeholder="you@school.edu.lk"
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel} htmlFor="sign-up-password">
          Password
        </label>
        <input
          autoComplete="new-password"
          className={styles.textInput}
          id="sign-up-password"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </div>

      {state === 'pending' || state === 'created' ? (
        <div className={styles.statusMessage} role="status">
          {message}
        </div>
      ) : null}

      {state === 'error' || state === 'unavailable' ? (
        <div className={styles.errorMessage} role="alert">
          {message}
        </div>
      ) : null}

      <button
        className={styles.submitBtn}
        disabled={state === 'submitting' || state === 'pending' || state === 'created'}
        type="submit"
      >
        {state === 'submitting' ? 'Creating account…' : 'Create account with password'}
      </button>

      <div className={styles.guestOptionRow}>
        <span>Already have an account?</span>
        <Link className={styles.guestLink} href={`/sign-in?returnTo=${encodeURIComponent(safeReturnPath(returnTo))}`}>
          Sign in here →
        </Link>
      </div>
    </form>
  );
}
