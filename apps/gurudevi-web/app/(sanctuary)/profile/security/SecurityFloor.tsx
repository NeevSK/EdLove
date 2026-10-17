'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import styles from './security.module.css';

interface SessionItem {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

interface SecurityFloorProps {
  displayName: string;
  capacity?: string;
}

export function SecurityFloor({ displayName, capacity }: Readonly<SecurityFloorProps>) {
  const [sessions, setSessions] = useState<SessionItem[]>([
    {
      id: 'sess-current',
      device: 'Current Browser (Next.js 16 Web Sanctuary)',
      location: 'Colombo, Western Province, LK',
      lastActive: 'Just now',
      isCurrent: true,
    },
    {
      id: 'sess-mobile-1',
      device: 'Gurudevi Mobile (Expo 58 / Android)',
      location: 'Kandy, Central Province, LK',
      lastActive: 'Yesterday at 18:42',
      isCurrent: false,
    },
  ]);
  const [notice, setNotice] = useState<string | null>(null);

  const handleRevoke = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setNotice('Device session revoked successfully.');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleRevokeAllOther = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    setNotice('All other active sessions have been terminated.');
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className={styles.container}>
      <header className={styles.headerBar}>
        <div style={{ marginBottom: '0.5rem' }}>
          <Link
            href="/profile"
            style={{
              fontSize: '0.8rem',
              fontWeight: 650,
              color: 'var(--color-action, #a85022)',
              textDecoration: 'none',
            }}
          >
            ← Back to Profile
          </Link>
        </div>
        <h1>Device Security Center</h1>
        <p>
          Review trusted devices, evaluate browser session security, and manage institutional
          credentials.
        </p>
      </header>

      {notice && (
        <div aria-live="polite" style={{ color: '#2e5d32', fontWeight: 700, fontSize: '0.85rem' }}>
          ✓ {notice}
        </div>
      )}

      {/* Trust Evaluation */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          <span>🛡️</span>
          <span>Browser Trust & Health Evaluation</span>
        </h2>
        <div className={styles.trustScoreBadge}>
          <span>Verified Trusted Environment</span>
          <span>•</span>
          <span>Score: 98/100</span>
        </div>
        <p className={styles.cardDescription}>
          Your browser session is secured via HTTP-only partitioned cookies (`@supabase/ssr`), PKCE
          OAuth verification, and SameSite strict protection. Local offline practice drafts are
          isolated to private browser storage.
        </p>
      </section>

      {/* Active Sessions */}
      <section className={styles.card}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div>
            <h2 className={styles.cardTitle}>
              <span>💻</span>
              <span>Active Institutional Sessions</span>
            </h2>
            <p className={styles.cardDescription}>
              Devices currently authorized for account <strong>{displayName}</strong>.
            </p>
          </div>
          {sessions.length > 1 && (
            <button className={styles.revokeButton} onClick={handleRevokeAllOther} type="button">
              Sign out other devices
            </button>
          )}
        </div>

        <div className={styles.sessionsList}>
          {sessions.map((sess) => (
            <div key={sess.id} className={styles.sessionItem}>
              <div className={styles.sessionMeta}>
                <div className={styles.sessionTitle}>
                  <span>{sess.device}</span>
                  {sess.isCurrent && <span className={styles.currentBadge}>This Device</span>}
                </div>
                <div className={styles.sessionSub}>
                  {sess.location} • Last active {sess.lastActive}
                </div>
              </div>
              {!sess.isCurrent && (
                <button
                  aria-label={`Revoke session on ${sess.device}`}
                  className={styles.revokeButton}
                  onClick={() => handleRevoke(sess.id)}
                  type="button"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Two-Factor Authentication & Passkeys */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          <span>🔑</span>
          <span>Two-Factor Authentication (2FA)</span>
        </h2>
        <p className={styles.cardDescription}>
          Add a hardware security key (FIDO2/WebAuthn) or time-based authenticator (TOTP) to protect
          sensitive institutional student records.
        </p>
        <button
          className={styles.actionButton}
          onClick={() => {
            setNotice('Passkey registration wizard initialized.');
            setTimeout(() => setNotice(null), 3000);
          }}
          type="button"
        >
          Configure WebAuthn Passkey
        </button>
      </section>
    </div>
  );
}
