'use client';

import { useEffect, useState } from 'react';
import { resolveCanonicalDeviceAccount } from '@/lib/sanctuary/canonicalDeviceAccount';
import { type DeviceAccountRecord, getDeviceAccounts } from '@/lib/sanctuary/deviceAccountRegistry';
import { AccountSwitcher } from './AccountSwitcher';
import styles from './auth.module.css';
import { browserAuthRuntime, safeReturnPath } from './browserAuth';
import { PasswordlessEntry } from './PasswordlessEntry';
import { SignInForm } from './SignInForm';

interface SignInFlowProps {
  returnTo: string;
}

export function SignInFlow({ returnTo }: Readonly<SignInFlowProps>) {
  const [hasAccounts, setHasAccounts] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [accountMessage, setAccountMessage] = useState<string | null>(null);

  useEffect(() => {
    const list = getDeviceAccounts();
    if (list.length > 0) {
      setHasAccounts(true);
    }
  }, []);

  const handleAccountSelected = async (account: DeviceAccountRecord) => {
    try {
      const runtime = browserAuthRuntime();
      if (!runtime) throw new Error('Browser authentication is unavailable.');
      const current = await runtime.bootstrapIdentity();
      if (current.status !== 'authenticated') throw new Error('A signed-in session is required.');
      const verified = await resolveCanonicalDeviceAccount(runtime.client, {
        accessToken: current.session.access_token,
        subject: current.session.user.id,
      });
      if (verified.accountId !== account.accountId || verified.authUserId !== account.authUserId)
        throw new Error('The selected profile does not match the current session.');
      window.location.href = safeReturnPath(returnTo);
    } catch {
      setAccountMessage('Please sign in to open your account.');
      setShowManualEntry(true);
    }
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
      {accountMessage ? <p role="status">{accountMessage}</p> : null}
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
        <summary className={styles.disclosureSummary}>Use a password instead</summary>
        <div style={{ marginTop: '16px' }}>
          <SignInForm returnTo={returnTo} />
        </div>
      </details>
    </>
  );
}
