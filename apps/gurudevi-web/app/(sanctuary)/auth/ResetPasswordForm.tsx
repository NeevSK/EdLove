'use client';

import Link from 'next/link';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { resolveSecurityOwner, type SecurityOwner } from '@/lib/sanctuary/securityClient';
import { useSecurityControls } from '@/lib/sanctuary/useSecurityControls';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { safeReturnPath } from './browserAuth';

export function ResetPasswordForm({ returnTo }: Readonly<{ returnTo: string }>) {
  const [owner, setOwner] = useState<SecurityOwner | null>(null);
  const [message, setMessage] = useState('');
  const subject = useRef<string | null>(null);
  useEffect(() => {
    let active = true;
    const client = createBrowserSupabaseClient();
    const subscription = client?.auth.onAuthStateChange(
      (event: string, session: { user: { id: string } } | null) => {
        if (event !== 'SIGNED_OUT' && (!subject.current || session?.user.id === subject.current))
          return;
        active = false;
        subject.current = null;
        setOwner(null);
        setMessage('Your account session changed. Open a new recovery link or sign in again.');
      },
    );
    void resolveSecurityOwner()
      .then((result) => {
        if (!active) return;
        subject.current = result.authSubjectId;
        setOwner(result);
      })
      .catch(() => {
        if (active)
          setMessage(
            'This recovery session could not be verified. Open a new recovery link or sign in again.',
          );
      });
    return () => {
      active = false;
      subject.current = null;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);
  if (message)
    return (
      <p role="alert">
        {message} <Link href="/recovery">Request recovery</Link>
      </p>
    );
  if (!owner) return <p role="status">Verifying your recovery session…</p>;
  return (
    <VerifiedPasswordForm
      key={`${owner.accountId}:${owner.authSubjectId}`}
      owner={owner}
      returnTo={returnTo}
    />
  );
}

function VerifiedPasswordForm({
  owner,
  returnTo,
}: Readonly<{ owner: SecurityOwner; returnTo: string }>) {
  const security = useSecurityControls(owner);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (security.blocked || security.passwordChanged) formRef.current?.reset();
  }, [security.blocked, security.passwordChanged]);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (security.pending) return;
    const data = new FormData(event.currentTarget);
    const password = String(data.get('password') ?? '');
    if (password.length < 8) {
      setError('Use at least 8 characters.');
      return;
    }
    if (password !== String(data.get('confirmation') ?? '')) {
      setError('The two passwords do not match.');
      return;
    }
    setError('');
    const currentPassword = String(data.get('currentPassword') ?? '');
    const nonce = String(data.get('nonce') ?? '');
    await security.recoverPassword(password, {
      ...(currentPassword ? { currentPassword } : {}),
      ...(nonce ? { nonce } : {}),
    });
  }
  if (security.blocked) return <p role="alert">Your account session changed. Reload this page.</p>;
  if (security.passwordChanged)
    return (
      <div>
        <p role="status">Password changed successfully.</p>
        <Link href={safeReturnPath(returnTo)}>Continue to your account</Link>
      </div>
    );
  const factors = security.snapshot?.factors ?? [];
  return (
    <form ref={formRef} className="space-y-5" onSubmit={(event) => void save(event)}>
      <p>
        Verify your authenticator before saving. A recovery link alone does not replace the second
        factor.
      </p>
      {security.query.isPending && <p role="status">Loading authenticators…</p>}
      {security.query.isError && (
        <div role="alert">
          Authenticator details are unavailable.{' '}
          <button
            type="button"
            disabled={security.pending}
            onClick={() => void security.query.refetch()}
          >
            Retry authenticators
          </button>
        </div>
      )}
      {security.snapshot && factors.length === 0 && (
        <p role="alert">
          No verified authenticator is available. Recovery without this factor is not supported here
          yet.
        </p>
      )}
      <label className="block font-sans text-sm font-semibold" htmlFor="new-password">
        New password
      </label>
      <input
        id="new-password"
        name="password"
        autoComplete="new-password"
        minLength={8}
        maxLength={1024}
        required
        type="password"
        disabled={security.pending}
        className={inputStyle}
      />
      <label className="block font-sans text-sm font-semibold" htmlFor="confirm-password">
        Confirm new password
      </label>
      <input
        id="confirm-password"
        name="confirmation"
        autoComplete="new-password"
        minLength={8}
        maxLength={1024}
        required
        type="password"
        disabled={security.pending}
        className={inputStyle}
      />
      {factors.length > 0 && (
        <>
          <label className="block font-sans text-sm font-semibold" htmlFor="reset-factor">
            Authenticator
          </label>
          <select
            id="reset-factor"
            value={security.factorId}
            disabled={security.pending}
            onChange={(event) => security.selectFactor(event.target.value)}
            className={inputStyle}
          >
            {factors.map((factor, index) => (
              <option key={factor.id} value={factor.id}>
                {factor.friendly_name || `Authenticator ${index + 1}`}
              </option>
            ))}
          </select>
          <label className="block font-sans text-sm font-semibold" htmlFor="reset-totp">
            Six-digit authenticator code
          </label>
          <input
            id="reset-totp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={security.code}
            required
            disabled={security.pending}
            onChange={(event) => security.editCode(event.target.value)}
            className={inputStyle}
          />
        </>
      )}
      <label className="block font-sans text-sm font-semibold" htmlFor="reset-current">
        Current password, if required
      </label>
      <input
        id="reset-current"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        maxLength={1024}
        disabled={security.pending}
        className={inputStyle}
      />
      <button
        type="button"
        disabled={security.pending}
        onClick={() => void security.requestPasswordCode()}
      >
        Request confirmation code
      </button>
      <label className="block font-sans text-sm font-semibold" htmlFor="reset-nonce">
        Confirmation code, if requested
      </label>
      <input
        id="reset-nonce"
        name="nonce"
        autoComplete="one-time-code"
        maxLength={256}
        disabled={security.pending}
        className={inputStyle}
      />
      {security.notice && <p role="status">{security.notice}</p>}
      {(error || security.error) && <p role="alert">{error || security.error}</p>}
      <button
        className="inline-flex min-h-12 w-full items-center justify-center bg-ink px-5 font-sans text-sm font-bold text-paper hover:bg-lotus disabled:cursor-wait disabled:opacity-60 focus:outline-3 focus:outline-offset-4 focus:outline-water"
        disabled={security.pending || factors.length === 0}
        type="submit"
      >
        {security.pending ? 'Saving…' : 'Save new password'}
      </button>
    </form>
  );
}
const inputStyle =
  'mt-2 min-h-12 w-full border border-line bg-paper px-3 font-sans text-base focus:outline-3 focus:outline-offset-2 focus:outline-water';
