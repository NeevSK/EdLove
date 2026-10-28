'use client';

import { useEffect, useState } from 'react';
import { resolveCanonicalDeviceAccount } from '@/lib/sanctuary/canonicalDeviceAccount';
import {
  type DeviceAccountRecord,
  getDeviceAccounts,
  clearActiveDeviceAccountId,
} from '@/lib/sanctuary/deviceAccountRegistry';
import { AccountSwitcher } from './AccountSwitcher';
import { DeviceLinkQRModal } from './DeviceLinkQRModal';
import styles from './auth.module.css';
import { browserAuthRuntime, safeReturnPath } from './browserAuth';
import { PasswordlessEntry } from './PasswordlessEntry';
import { SignInForm } from './SignInForm';

interface SignInFlowProps {
  returnTo: string;
  intent?: 'signin' | 'signup';
}

export function SignInFlow({ returnTo, intent = 'signin' }: Readonly<SignInFlowProps>) {
  const [hasAccounts, setHasAccounts] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [accountMessage, setAccountMessage] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'magic' | 'password'>('magic');
  const [selectedAccountEmail, setSelectedAccountEmail] = useState<string>('');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  useEffect(() => {
    const list = getDeviceAccounts();
    if (list.length > 0) {
      setHasAccounts(true);
    }
  }, []);

  const handleAccountSelected = async (account: DeviceAccountRecord) => {
    const runtime = browserAuthRuntime();
    if (!runtime) return;

    try {
      const current = await runtime.bootstrapIdentity();
      if (current.status === 'authenticated') {
        const verified = await resolveCanonicalDeviceAccount(runtime.client, {
          accessToken: current.session.access_token,
          subject: current.session.user.id,
        });
        if (verified.accountId === account.accountId && verified.authUserId === account.authUserId) {
          // Already signed in as this exact account -> navigate directly
          window.location.href = safeReturnPath(returnTo);
          return;
        }

        // Scope boundary transition: sign out active session to prevent data cache contamination
        await runtime.client.auth.signOut();
      }
    } catch {
      // Session unavailable or signOut completed
    }

    clearActiveDeviceAccountId();
    setAccountMessage(`Enter your password to open ${account.displayName}.`);
    if (account.rawEmail) {
      setSelectedAccountEmail(account.rawEmail);
      setAuthMode('password');
    }
    setShowManualEntry(true);
  };

  if (hasAccounts && !showManualEntry) {
    return (
      <AccountSwitcher
        onSelectAccount={handleAccountSelected}
        onUseAnotherAccount={() => {
          setSelectedAccountEmail('');
          setShowManualEntry(true);
        }}
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
          className={styles.chooseProfileBtn}
        >
          ← Choose a remembered profile on this computer
        </button>
      ) : null}

      {authMode === 'magic' ? (
        <PasswordlessEntry
          returnTo={returnTo}
          badgeText={intent === 'signup' ? 'Create Account' : undefined}
          title={intent === 'signup' ? 'Join Gurudevi 🙏' : 'Welcome to Gurudevi 🙏'}
          onSwitchToPassword={() => setAuthMode('password')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>
              {intent === 'signup' ? 'Join Gurudevi 🙏' : 'Welcome to Gurudevi 🙏'}
            </h2>
            <span className={styles.authModePill}>
              {intent === 'signup' ? 'Create Account' : 'Login / Signup'}
            </span>
          </div>
          <SignInForm returnTo={returnTo} defaultEmail={selectedAccountEmail} />
          <button
            type="button"
            className={styles.passwordSwitchBtn}
            onClick={() => setAuthMode('magic')}
          >
            <span>✉️ Prefer passwordless?</span>
            <span className={styles.passwordSwitchAction}>Sign in with email magic link →</span>
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
        <button
          type="button"
          onClick={() => setIsQRModalOpen(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#b45309',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '999px',
            textDecoration: 'underline',
          }}
        >
          📲 Sign in with Phone QR Code
        </button>
      </div>

      <DeviceLinkQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        returnTo={returnTo}
      />
    </>
  );
}
