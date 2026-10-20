'use client';

import { useEffect, useState } from 'react';
import styles from './account-switcher.module.css';
import {
  type DeviceAccountRecord,
  getDeviceAccounts,
  isKioskMode,
  setKioskMode,
  verifyAccountPin,
} from '@/lib/sanctuary/deviceAccountRegistry';

interface AccountSwitcherProps {
  onSelectAccount: (account: DeviceAccountRecord) => void;
  onUseAnotherAccount: () => void;
}

export function AccountSwitcher({
  onSelectAccount,
  onUseAnotherAccount,
}: Readonly<AccountSwitcherProps>) {
  const [accounts, setAccounts] = useState<DeviceAccountRecord[]>([]);
  const [kiosk, setKiosk] = useState(false);
  const [selectedPinAccount, setSelectedPinAccount] = useState<DeviceAccountRecord | null>(null);
  const [pinValue, setPinValue] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    setAccounts(getDeviceAccounts());
    setKiosk(isKioskMode());
  }, []);

  const handleKioskChange = (enabled: boolean) => {
    setKiosk(enabled);
    setKioskMode(enabled);
  };

  const handleAccountClick = (account: DeviceAccountRecord) => {
    if (account.hasPin) {
      setSelectedPinAccount(account);
      setPinValue('');
      setPinError(null);
    } else {
      onSelectAccount(account);
    }
  };

  const handleUnlockPin = async () => {
    if (!selectedPinAccount) return;
    setIsVerifying(true);
    setPinError(null);

    try {
      const valid = await verifyAccountPin(selectedPinAccount.accountId, pinValue);
      if (valid) {
        const target = selectedPinAccount;
        setSelectedPinAccount(null);
        onSelectAccount(target);
      } else {
        setPinError('Incorrect PIN. Please try again.');
      }
    } catch {
      setPinError('Unable to verify PIN.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (accounts.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.kioskBanner}>
        <label className={styles.kioskToggle}>
          <input
            className={styles.kioskCheckbox}
            type="checkbox"
            checked={kiosk}
            onChange={(e) => handleKioskChange(e.target.checked)}
          />
          <span>Shared / School Lab Workstation</span>
        </label>
        <span style={{ opacity: 0.8 }}>Auto-purge on close</span>
      </div>

      <div style={{ fontSize: '13px', fontWeight: 600, color: '#7a6e5f' }}>
        Select your profile on this computer:
      </div>

      <div className={styles.accountsGrid}>
        {accounts.map((acc) => (
          <button
            key={acc.accountId}
            className={styles.accountCard}
            type="button"
            onClick={() => handleAccountClick(acc)}
          >
            <div className={styles.accountMeta}>
              <div className={styles.avatar}>
                {acc.displayName.charAt(0).toUpperCase()}
              </div>
              <div className={styles.accountDetails}>
                <span className={styles.accountName}>{acc.displayName}</span>
                <span className={styles.accountEmail}>{acc.maskedEmail}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {acc.hasPin ? <span title="Protected with PIN">🔒</span> : null}
              <span className={styles.accountBadge}>{acc.capacity}</span>
            </div>
          </button>
        ))}
      </div>

      <button
        className={styles.anotherAccountBtn}
        type="button"
        onClick={onUseAnotherAccount}
      >
        + Sign in to a different account
      </button>

      {selectedPinAccount ? (
        <div className={styles.pinGateModal} role="dialog" aria-modal="true">
          <div className={styles.pinCard}>
            <h3 className={styles.pinTitle}>Enter your 4-digit PIN</h3>
            <p style={{ fontSize: '13px', color: '#7a6e5f', margin: 0 }}>
              Unlock {selectedPinAccount.displayName} on this device.
            </p>
            <input
              autoFocus
              className={styles.pinInput}
              maxLength={8}
              type="password"
              value={pinValue}
              onChange={(e) => setPinValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleUnlockPin();
              }}
              placeholder="••••"
            />
            {pinError ? (
              <span style={{ fontSize: '12px', color: '#dc2626' }}>{pinError}</span>
            ) : null}
            <div className={styles.actionRow}>
              <button
                className={styles.cancelBtn}
                type="button"
                onClick={() => setSelectedPinAccount(null)}
              >
                Cancel
              </button>
              <button
                className={styles.unlockBtn}
                disabled={isVerifying || pinValue.length < 4}
                type="button"
                onClick={() => void handleUnlockPin()}
              >
                {isVerifying ? 'Checking…' : 'Unlock'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
