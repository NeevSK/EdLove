'use client';

import Link from 'next/link';
import { useSecurityControls } from '@/lib/sanctuary/useSecurityControls';
import styles from './security.module.css';

interface SecurityFloorProps {
  displayName: string;
  accountId: string;
  authSubjectId: string;
}

export function SecurityFloor({
  displayName,
  accountId,
  authSubjectId,
}: Readonly<SecurityFloorProps>) {
  const security = useSecurityControls({ accountId, authSubjectId });
  const snapshot = security.snapshot;
  return (
    <div className={styles.container}>
      <header className={styles.headerBar}>
        <Link href="/profile">← Back to Profile</Link>
        <h1>Account security</h1>
        <p>Review sign-in methods for {displayName} and verify sensitive account changes.</p>
      </header>
      {security.notice && <p role="status">{security.notice}</p>}
      {security.error && <p role="alert">{security.error}</p>}
      {security.query.isPending && !security.blocked && (
        <p role="status">Loading account security…</p>
      )}
      {security.query.isError && !security.blocked && (
        <div role="alert">
          <p>
            Security details could not be refreshed.{' '}
            {snapshot
              ? 'The details below were loaded earlier.'
              : 'No credential inventory is available.'}
          </p>
          <button
            type="button"
            className={styles.actionButton}
            disabled={security.pending}
            onClick={() => void security.query.refetch()}
          >
            Retry security details
          </button>
        </div>
      )}
      {snapshot && (
        <>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Linked sign-in methods</h2>
            <p className={styles.cardDescription}>
              Unlinking Google keeps your Gurudevi account. A confirmed email sign-in method must
              remain.
            </p>
            {snapshot.identities.length === 0 && <p>No linked sign-in methods were returned.</p>}
            <ul className={styles.sessionsList}>
              {snapshot.identities.map((identity) => (
                <li key={identity.id} className={styles.sessionItem}>
                  <span>
                    {identity.provider === 'email'
                      ? 'Email sign-in'
                      : identity.provider === 'google'
                        ? 'Google sign-in'
                        : identity.provider}
                  </span>
                  {identity.provider === 'google' && (
                    <button
                      type="button"
                      className={styles.revokeButton}
                      disabled={security.pending}
                      onClick={() => security.selectTarget(identity.id)}
                    >
                      Unlink Google
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {security.target && (
              <div>
                <p>Confirm unlinking Google from this account. Verify your authenticator first.</p>
                <button
                  type="button"
                  className={styles.revokeButton}
                  disabled={security.pending}
                  onClick={() => void security.unlink()}
                >
                  Confirm unlink Google
                </button>
                <button
                  type="button"
                  className={styles.actionButton}
                  disabled={security.pending}
                  onClick={() => security.selectTarget(null)}
                >
                  Cancel unlink
                </button>
              </div>
            )}
          </section>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Authenticator verification</h2>
            <p className={styles.cardDescription}>
              Current session assurance:{' '}
              {snapshot.assurance === 'aal2' ? 'second factor verified' : 'first factor only'}.
              Sensitive changes require a recent verification.
            </p>
            {snapshot.factors.length === 0 ? (
              <p>
                No verified authenticator is available. Authenticator setup and recovery are not
                available on this page yet.
              </p>
            ) : (
              <>
                <label htmlFor="security-factor">Authenticator</label>
                <select
                  id="security-factor"
                  value={security.factorId}
                  disabled={security.pending}
                  onChange={(event) => security.selectFactor(event.target.value)}
                >
                  {snapshot.factors.map((factor, index) => (
                    <option key={factor.id} value={factor.id}>
                      {factor.friendly_name || `Authenticator ${index + 1}`}
                    </option>
                  ))}
                </select>
                <label htmlFor="security-code">Six-digit authenticator code</label>
                <input
                  id="security-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={security.code}
                  disabled={security.pending}
                  onChange={(event) => security.editCode(event.target.value)}
                />
                <button
                  type="button"
                  className={styles.actionButton}
                  disabled={security.pending}
                  onClick={() => void security.verify()}
                >
                  Verify authenticator
                </button>
              </>
            )}
          </section>
        </>
      )}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Device sessions and passkeys</h2>
        <p className={styles.cardDescription}>
          Device inventory, individual device revocation and passkey setup are not available here
          yet. This page does not assign a browser trust score.
        </p>
        <Link href="/profile">Return to profile</Link>
      </section>
    </div>
  );
}
