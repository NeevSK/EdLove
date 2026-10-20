'use client';

import { useEffect, useState } from 'react';
import styles from './auth.module.css';
import { AccountSwitcher } from './AccountSwitcher';
import { PasswordlessEntry } from './PasswordlessEntry';
import { SignInForm } from './SignInForm';
import {
  type DeviceAccountRecord,
  getDeviceAccounts,
} from '@/lib/sanctuary/deviceAccountRegistry';

interface SignInFlowProps {
  returnTo: string;
}

export function SignInFlow({ returnTo }: Readonly<SignInFlowProps>) {
  const [hasAccounts, setHasAccounts] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);

  useEffect(() => {
    const list = getDeviceAccounts();
    if (list.length > 0) {
      setHasAccounts(true);
    }
  }, []);

  const handleAccountSelected = (account: DeviceAccountRecord) => {
    // If the account was unlocked via PIN, navigate to sanctuary destination
    // The account session boundary will bind to the active account
    window.location.href = returnTo;
  };

  if (hasAccounts && !showManualEntry) {
    return (
      <AccountSwitcher
        onSelectAccount={handleAccountSelected}
        onUseAnotherAccount={() => setShowManualEntry(true)}
      />
    );
  }

  return (
    <>
      {hasAccounts ? (
        <button
          type="button"
          onClick={() => setShowManualEntry(false)}
          style={{
            alignSelf: 'flex-start',
            background: 'none',
            border: 'none',
            color: '#a85022',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '0 0 8px 0',
            textDecoration: 'underline',
          }}
        >
          ← Choose a remembered profile on this computer
        </button>
      ) : null}

      <PasswordlessEntry returnTo={returnTo} />

      <details className={styles.disclosureDetails}>
        <summary className={styles.disclosureSummary}>
          Use a password instead
        </summary>
        <div style={{ marginTop: '16px' }}>
          <SignInForm returnTo={returnTo} />
        </div>
      </details>
    </>
  );
}
