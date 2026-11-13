import { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import styles from './account-switcher.module.css';
import {
  type DeviceAccountRecord,
  getDeviceAccountConfig,
  getDeviceAccounts,
  isKioskMode,
  removeDeviceAccount,
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
  const { t } = useTranslation();
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

  const handleRemoveAccount = (e: React.MouseEvent, accountId: string) => {
    e.stopPropagation();
    if (window.confirm(t('auth.removeAccountConfirm'))) {
      removeDeviceAccount(accountId);
      setAccounts(getDeviceAccounts());
    }
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
        setPinError(t('auth.incorrectPin'));
      }
    } catch {
      setPinError(t('auth.unableVerifyPin'));
    } finally {
      setIsVerifying(false);
    }
  };

  if (accounts.length === 0) {
    return null;
  }

  const allowKiosk = getDeviceAccountConfig().allowKioskMode;

  return (
    <div className={styles.container}>
      {allowKiosk ? (
        <div className={styles.kioskBanner}>
          <label className={styles.kioskToggle}>
            <input
              className={styles.kioskCheckbox}
              type="checkbox"
              checked={kiosk}
              onChange={(e) => handleKioskChange(e.target.checked)}
            />
            <span>{t('auth.kioskWorkstation')}</span>
          </label>
          <span style={{ opacity: 0.8 }}>{t('auth.autoPurge')}</span>
        </div>
      ) : null}

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
              <button
                type="button"
                className={styles.removeAccountBtn}
                title="Remove from this computer"
                aria-label={`Remove ${acc.displayName} from this computer`}
                onClick={(e) => handleRemoveAccount(e, acc.accountId)}
              >
                ✕
              </button>
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
        <button
          className={styles.anotherAccountBtn}
          type="button"
          onClick={onUseAnotherAccount}
        >
          + {t('auth.useAnotherAccount')}
        </button>
      </div>

      {selectedPinAccount ? (
        <div className={styles.pinGateModal} role="dialog" aria-modal="true">
          <div className={styles.pinCard}>
            <h3 className={styles.pinTitle}>{t('auth.enterPin')}</h3>
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
                {t('actions.cancel')}
              </button>
              <button
                className={styles.unlockBtn}
                disabled={isVerifying || pinValue.length < 4}
                type="button"
                onClick={() => void handleUnlockPin()}
              >
                {isVerifying ? t('actions.loading') : t('auth.unlockSanctuary')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
