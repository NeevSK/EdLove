'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import { resolveCanonicalDeviceAccount } from '@/lib/sanctuary/canonicalDeviceAccount';
import { getDeviceAccounts, saveDeviceAccount } from '@/lib/sanctuary/deviceAccountRegistry';
import styles from './auth.module.css';
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
    const result = await runtime.signInWithPassword({ email, password });
    const { data, error } = result;
    if (error) {
      setState('error');
      setMessage(
        error.message || 'We could not sign in with those details. Check them and try again.',
      );
      return;
    }

    try {
      if (!data.session) throw new Error('A browser session is required.');
      const account = await resolveCanonicalDeviceAccount(runtime.client, {
        accessToken: data.session.access_token,
        subject: data.session.user.id,
      });
      const existing = getDeviceAccounts().find((entry) => entry.accountId === account.accountId);
      saveDeviceAccount({ ...account, hasPin: existing?.hasPin ?? false });
    } catch {
      setState('error');
      setMessage('Signed in, but your account could not be verified. Please retry.');
      return;
    }

    runtime.setSessionDuration(remember).catch(() => {});

    // Give Supabase client time to persist session to cookies before navigation
    if (data.session) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Use href assignment for more reliable navigation
    const destination = safeReturnPath(returnTo);
    window.location.href = destination;
  }

  return (
    <form
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      onSubmit={(event) => void signIn(event)}
    >
      <div className={styles.inputGroup}>
        <label className={styles.inputLabel} htmlFor="email">
          Email address
        </label>
        <input
          autoComplete="email"
          className={styles.textInput}
          id="email"
          name="email"
          required
          type="email"
          placeholder="you@school.edu.lk"
        />
      </div>

      <div className={styles.inputGroup}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className={styles.inputLabel} htmlFor="password">
            Password
          </label>
          <Link
            style={{ fontSize: '12px', color: '#7a6e5f', textDecoration: 'underline' }}
            href={`/recovery?returnTo=${encodeURIComponent(safeReturnPath(returnTo))}`}
          >
            Forgot password?
          </Link>
        </div>
        <input
          autoComplete="current-password"
          className={styles.textInput}
          id="password"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </div>

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: '#453c35',
          cursor: 'pointer',
        }}
      >
        <input
          id="remember"
          name="remember"
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        <span>Remember me for 30 days</span>
      </label>

      {state !== 'ready' && state !== 'submitting' ? (
        <div className={styles.errorMessage} role="alert">
          {message}
        </div>
      ) : null}

      <button className={styles.submitBtn} disabled={state === 'submitting'} type="submit">
        {state === 'submitting' ? 'Signing in…' : 'Sign in with password'}
      </button>
    </form>
  );
}
