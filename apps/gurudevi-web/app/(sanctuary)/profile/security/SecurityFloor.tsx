import { Link } from '@tanstack/react-router';
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
        <Link to="/profile">← Back to Profile</Link>
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
              Connect Google or Apple accounts for seamless single-sign-on to this citizen profile.
              At least one confirmed sign-in method must remain active.
            </p>
            {snapshot.identities.length === 0 && <p>No linked sign-in methods were returned.</p>}
            <ul className={styles.sessionsList}>
              {snapshot.identities.map((identity) => (
                <li key={identity.id} className={styles.sessionItem}>
                  <span>
                    {identity.provider === 'email'
                      ? 'Email & Password'
                      : identity.provider === 'google'
                        ? 'Google Account'
                        : identity.provider === 'apple'
                          ? 'Apple ID'
                          : identity.provider}
                  </span>
                  {identity.provider !== 'email' && (
                    <button
                      type="button"
                      className={styles.revokeButton}
                      disabled={security.pending || snapshot.identities.length <= 1}
                      title={
                        snapshot.identities.length <= 1
                          ? 'Cannot disconnect the only remaining login method'
                          : undefined
                      }
                      onClick={() => security.selectTarget(identity.id)}
                    >
                      Unlink
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {/* Link Additional Identity Providers */}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--line, #e5e7eb)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 10px', color: 'var(--ink, #1f2937)' }}>
                Add more sign-in methods
              </h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {!snapshot.identities.some((id) => id.provider === 'google') && (
                  <button
                    type="button"
                    className={styles.actionButton}
                    disabled={security.pending}
                    onClick={() => void security.linkProvider('google')}
                  >
                    + Connect Google Account
                  </button>
                )}
                {!snapshot.identities.some((id) => id.provider === 'apple') && (
                  <button
                    type="button"
                    className={styles.actionButton}
                    disabled={security.pending}
                    onClick={() => void security.linkProvider('apple')}
                  >
                    + Connect Apple ID
                  </button>
                )}
                {snapshot.identities.some((id) => id.provider === 'google') &&
                  snapshot.identities.some((id) => id.provider === 'apple') && (
                    <p style={{ fontSize: '13px', color: 'var(--ink-soft, #6b7280)', margin: 0 }}>
                      All supported identity providers are connected to this citizen account.
                    </p>
                  )}
              </div>
            </div>

            {security.target && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'var(--paper-light, #fef3c7)', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 600 }}>
                  Confirm unlinking this sign-in method from your account. You will no longer be able to use it to log in.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className={styles.revokeButton}
                    disabled={security.pending}
                    onClick={() => void security.unlink()}
                  >
                    Confirm Unlink
                  </button>
                  <button
                    type="button"
                    className={styles.actionButton}
                    disabled={security.pending}
                    onClick={() => security.selectTarget(null)}
                  >
                    Cancel
                  </button>
                </div>
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
        <Link to="/profile">Return to profile</Link>
      </section>
    </div>
  );
}
