'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  type DeviceAccountRecord,
  getDeviceAccounts,
  removeDeviceAccount,
} from '@/lib/sanctuary/deviceAccountRegistry';
import { DeviceLinkQRModal } from '../auth/DeviceLinkQRModal';
import styles from './web-device-accounts.module.css';

interface WebDeviceAccountManagerProps {
  currentAccountId: string;
  currentDisplayName: string;
}

export function WebDeviceAccountManager({
  currentAccountId,
  currentDisplayName: _currentDisplayName,
}: Readonly<WebDeviceAccountManagerProps>) {
  const [accounts, setAccounts] = useState<DeviceAccountRecord[]>([]);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  useEffect(() => {
    setAccounts(getDeviceAccounts());
  }, []);

  const handleRemove = (accountId: string, name: string) => {
    if (window.confirm(`Remove ${name} from this computer's remembered profiles?`)) {
      removeDeviceAccount(accountId);
      setAccounts(getDeviceAccounts());
    }
  };

  const otherAccounts = accounts.filter((a) => a.accountId !== currentAccountId);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleCol}>
          <h3 className={styles.title}>Profiles Remembered on this Computer</h3>
          <p className={styles.subtitle}>
            Switch quickly between multiple accounts without entering credentials every time.
          </p>
        </div>
      </div>

      <div className={styles.accountsList}>
        {accounts.map((acc) => {
          const isActive = acc.accountId === currentAccountId;
          return (
            <div
              key={acc.accountId}
              className={`${styles.accountRow} ${isActive ? styles.activeRow : ''}`}
            >
              <div className={styles.accountInfo}>
                <div className={styles.avatar}>
                  {acc.displayName.charAt(0).toUpperCase()}
                </div>
                <div className={styles.details}>
                  <div className={styles.nameLine}>
                    <span className={styles.name}>{acc.displayName}</span>
                    {isActive ? (
                      <span className={styles.activeBadge}>Current</span>
                    ) : null}
                    {acc.hasPin ? <span title="Protected with PIN">🔒</span> : null}
                  </div>
                  <span className={styles.email}>{acc.maskedEmail}</span>
                </div>
              </div>

              <div className={styles.actions}>
                <span className={styles.capacityBadge}>{acc.capacity}</span>
                {!isActive ? (
                  <Link
                    href={`/sign-in?returnTo=${encodeURIComponent('/profile')}`}
                    className={styles.switchBtn}
                  >
                    Switch
                  </Link>
                ) : null}
                <button
                  type="button"
                  className={styles.removeBtn}
                  title="Remove from this computer"
                  aria-label={`Remove ${acc.displayName}`}
                  onClick={() => handleRemove(acc.accountId, acc.displayName)}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}

        {otherAccounts.length === 0 && accounts.length <= 1 && (
          <p className={styles.emptyNote}>
            No other accounts remembered on this computer. You can add another family, faculty, or student profile below.
          </p>
        )}
      </div>

      <div className={styles.footerRow}>
        <Link href="/sign-in" className={styles.addAccountBtn}>
          + Sign in to another account on this browser
        </Link>
      </div>

      <div
        style={{
          marginTop: '24px',
          padding: '16px 20px',
          background: 'var(--paper-light, #fdfbf7)',
          border: '1px solid var(--line, #e7ded0)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: 'var(--ink, #2b261f)' }}>
            Companion Device Linking
          </h4>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-soft, #685e52)' }}>
            Authorize access for another web browser or workstation using your active mobile app.
          </p>
        </div>
        <button
          type="button"
          className={styles.qrLinkBtn}
          onClick={() => setIsQRModalOpen(true)}
        >
          📲 Authorize via QR
        </button>
      </div>

      <DeviceLinkQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        returnTo="/profile"
      />
    </div>
  );
}
