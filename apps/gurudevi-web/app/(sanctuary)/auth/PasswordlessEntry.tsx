'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import styles from './auth.module.css';
import { browserAuthRuntime, safeReturnPath } from './browserAuth';
import { PhoneOtpEntry } from './PhoneOtpEntry';

type Provider = 'google' | 'apple';
type PendingAction = 'email' | Provider | null;

function providerName(provider: Provider): string {
  return provider === 'google' ? 'Google' : 'Apple';
}

export function PasswordlessEntry({
  returnTo,
  onSwitchToPassword,
  title,
  badgeText,
}: Readonly<{
  returnTo: string;
  onSwitchToPassword?: () => void;
  title?: string;
  badgeText?: string;
}>) {
  const { t } = useTranslation();
  const [pending, setPending] = useState<PendingAction>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const displayTitle = title ?? t('auth.welcomeTitle');
  const displayBadge = badgeText ?? t('auth.badgeText');

  const [emailExpanded, setEmailExpanded] = useState(false);

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

    const email = String(new FormData(event.currentTarget).get('email') ?? '')
      .trim()
      .toLowerCase();
    if (process.env.NODE_ENV !== 'production') {
      const sandboxKeywords = ['dev', 'sandbox', 'demo', 'test', 'teacher', 'student'];
      if (sandboxKeywords.some((kw) => email.includes(kw))) {
        try {
          sessionStorage.setItem('gurudevi_sandbox_mode', 'true');
        } catch {}
        window.location.href = '/onboarding';
        return;
      }
    }

    const runtime = browserAuthRuntime();
    if (!runtime) {
      setError(
        'Sign in is unavailable because this environment is missing its public Supabase settings.',
      );
      return;
    }

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
        <h2 className={styles.formTitle}>{displayTitle}</h2>
        <span className={styles.authModePill}>{displayBadge}</span>
      </div>

      {!emailExpanded ? (
        <div className={styles.pillRowStack}>
          <button
            type="button"
            aria-label={t('auth.continueGoogle')}
            className={styles.pillBtn}
            disabled={pending !== null}
            onClick={() => void continueWithProvider('google')}
          >
            <div className={styles.googleGlyph} aria-hidden="true">
              G
            </div>
            <span>{pending === 'google' ? t('auth.connecting') : t('auth.continueGoogle')}</span>
          </button>

          <button
            type="button"
            aria-label={t('auth.continueApple')}
            className={styles.pillBtn}
            disabled={pending !== null}
            onClick={() => void continueWithProvider('apple')}
          >
            <span className={styles.appleGlyph} aria-hidden="true">
              
            </span>
            <span>{pending === 'apple' ? t('auth.connecting') : t('auth.continueApple')}</span>
          </button>

          <button
            type="button"
            aria-label={t('auth.continueEmail')}
            className={`${styles.pillBtn} ${styles.pillBtnEmail}`}
            onClick={() => setEmailExpanded(true)}
          >
            <span className={styles.emailGlyph} aria-hidden="true">
              ✉
            </span>
            <span>{t('auth.continueEmail')}</span>
          </button>

          {process.env.NODE_ENV !== 'production' ? (
            <div className={styles.sandboxInlineHint}>
              <button
                type="button"
                className={styles.sandboxTextTrigger}
                onClick={() => {
                  try {
                    sessionStorage.setItem('gurudevi_sandbox_mode', 'true');
                  } catch {}
                  window.location.href = '/onboarding';
                }}
              >
                ⚡ Dev Sandbox &amp; Onboarding
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className={styles.emailFocusContainer}>
          <button
            type="button"
            className={styles.backToPillsBtn}
            onClick={() => setEmailExpanded(false)}
          >
            {t('auth.allSignInOptions')}
          </button>

          <form
            onSubmit={(e) => void sendMagicLink(e)}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="passwordless-email">
                {t('auth.emailLabel')}
              </label>
              <input
                id="passwordless-email"
                name="email"
                type="text"
                autoComplete="email"
                autoFocus
                required
                placeholder="you@school.edu.lk"
                className={styles.textInput}
                disabled={pending !== null}
              />
            </div>

            <button type="submit" disabled={pending !== null} className={styles.submitBtn}>
              {pending === 'email' ? t('auth.sendingLink') : t('auth.sendMagicLink')}
              <span aria-hidden="true">→</span>
            </button>

            <p className={styles.magicLinkNote}>
              A secure magic link will be sent to your email to verify and sign in instantly.
            </p>

            {onSwitchToPassword ? (
              <button
                type="button"
                className={styles.passwordSwitchBtn}
                onClick={onSwitchToPassword}
              >
                <span>🔑 Prefer a password?</span>
                <span className={styles.passwordSwitchAction}>{t('auth.usePasswordInstead')} →</span>
              </button>
            ) : null}
          </form>
        </div>
      )}

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
    </div>
  );
}
