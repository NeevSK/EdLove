import { useEffect, useState, useCallback, useRef } from 'react';
import { QRBuilder } from '@repo/core/logic/utils/QRBuilder';
import {
  generatePairingKey,
  decryptPairingPayload,
  type EncryptedPairingEnvelope,
} from '@repo/core/logic/pairing/pairingCrypto';
import { QRCodeSvg } from '@/lib/workspace/QRCodeSvg';
import { browserAuthRuntime, safeReturnPath } from './browserAuth';
import { saveDeviceAccount, setActiveDeviceAccountId, maskEmail } from '@/lib/sanctuary/deviceAccountRegistry';
import styles from './device-link-qr.module.css';

interface DeviceLinkQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnTo?: string;
}

export function DeviceLinkQRModal({
  isOpen,
  onClose,
  returnTo = '/',
}: Readonly<DeviceLinkQRModalProps>) {
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [installId, setInstallId] = useState<string>('');
  const [pairingKey, setPairingKey] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(120);
  const [status, setStatus] = useState<'generating' | 'waiting' | 'authorized' | 'claiming' | 'expired' | 'error'>('generating');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initChallenge = useCallback(async () => {
    setStatus('generating');
    setErrorMessage(null);
    setSecondsRemaining(120);

    try {
      const runtime = browserAuthRuntime();
      if (!runtime) throw new Error('Browser authentication unavailable.');

      let currentInstallId = window.localStorage.getItem('gurudevi_web_install_id');
      if (!currentInstallId) {
        currentInstallId = window.crypto?.randomUUID ? window.crypto.randomUUID() : `web-${Date.now()}`;
        window.localStorage.setItem('gurudevi_web_install_id', currentInstallId);
      }
      setInstallId(currentInstallId);

      const metadata = {
        platform: 'web',
        userAgent: navigator.userAgent,
        screen: `${window.innerWidth}x${window.innerHeight}`,
      };

      const { data, error } = await runtime.client.rpc('create_device_pairing_challenge', {
        p_install_id: currentInstallId,
        p_metadata: metadata,
      });

      if (error || !data) {
        throw new Error(error?.message || 'Failed to initialize pairing challenge.');
      }

      const cId = data.challenge_id;
      const expiresAt = data.expires_at;
      setChallengeId(cId);

      const key = generatePairingKey();
      setPairingKey(key);

      const payload = QRBuilder.linkDevice(cId, currentInstallId, 'web', expiresAt, key);
      setQrValue(payload);
      setStatus('waiting');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Could not prepare QR link.');
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      void initChallenge();
    } else {
      setQrValue(null);
      setChallengeId(null);
      setPairingKey(null);
    }
  }, [isOpen, initChallenge]);

  // Countdown timer
  useEffect(() => {
    if (status !== 'waiting') return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Realtime subscription and polling fallback for claim/authorization status
  useEffect(() => {
    if (status !== 'waiting' || !challengeId || !installId) return;

    let mounted = true;
    const runtime = browserAuthRuntime();
    if (!runtime) return;

    const performClaim = async () => {
      try {
        const { data, error } = await runtime.client.rpc('claim_device_pairing_session', {
          p_challenge_id: challengeId,
          p_install_id: installId,
        });

        if (error || !data || !mounted) return;

        if (data.ok && data.status === 'claimed' && data.account) {
          setStatus('authorized');

          // Authenticate browser session if delegated session tokens exist
          if (data.session) {
            try {
              let sessionTokens: { access_token?: string; refresh_token?: string } | null = null;

              if (data.session.ivHex && data.session.cipherTextHex && pairingKey) {
                sessionTokens = await decryptPairingPayload<{ access_token: string; refresh_token: string }>(
                  data.session as EncryptedPairingEnvelope,
                  pairingKey,
                );
              } else if (data.session.access_token && data.session.refresh_token) {
                sessionTokens = data.session;
              }

              if (sessionTokens?.access_token && sessionTokens?.refresh_token) {
                const { error: sessionError } = await runtime.client.auth.setSession({
                  access_token: sessionTokens.access_token,
                  refresh_token: sessionTokens.refresh_token,
                });
                if (sessionError) {
                  console.warn('[DeviceLinkQRModal] Auth setSession warning:', sessionError);
                }
              }
            } catch (decryptErr) {
              console.warn('[DeviceLinkQRModal] Decryption failed:', decryptErr);
            }
          }

          saveDeviceAccount({
            accountId: data.account.accountId,
            authUserId: data.account.accountId,
            displayName: data.account.displayName || 'Gurudevi Citizen',
            avatarUrl: data.account.avatarUrl || null,
            maskedEmail: maskEmail(data.account.email || ''),
            rawEmail: data.account.email || undefined,
            schoolId: data.account.schoolId || null,
            capacity: data.account.capacity || 'scholar',
            hasPin: false,
          });

          setActiveDeviceAccountId(data.account.accountId);

          setTimeout(() => {
            window.location.href = safeReturnPath(returnTo);
          }, 1000);
        } else if (data.status === 'expired' || data.status === 'rejected') {
          setStatus(data.status);
        }
      } catch {
        // Continue listening/polling until expiration
      }
    };

    // 1. Instant Realtime push channel
    const channel = runtime.client
      .channel(`pairing:${challengeId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'device_pairing_challenges',
          filter: `id=eq.${challengeId}`,
        },
        async (payload: any) => {
          if (payload.new?.status === 'authorized') {
            void performClaim();
          } else if (payload.new?.status === 'rejected' || payload.new?.status === 'expired') {
            if (mounted) setStatus(payload.new.status);
          }
        },
      )
      .subscribe();

    // 2. Polling fallback (2.5s interval)
    const pollInterval = setInterval(() => {
      void performClaim();
    }, 2500);

    return () => {
      mounted = false;
      clearInterval(pollInterval);
      void runtime.client.removeChannel(channel);
    };
  }, [status, challengeId, installId, pairingKey, returnTo]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="qr-modal-title">
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.badge}>MULTI-DEVICE PAIRING</span>
            <h2 id="qr-modal-title" className={styles.title}>
              Link with Gurudevi Mobile
            </h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} type="button" aria-label="Close">
            ✕
          </button>
        </div>

        <p className={styles.description}>
          Scan this QR code using the <strong>Gurudevi App</strong> on your phone (under <em>Profile → Scan QR</em> or <em>Settings → Link Device</em>) to sign in instantly without typing your password.
        </p>

        <div className={styles.qrContainer}>
          {status === 'generating' && (
            <div className={styles.loadingBox}>
              <div className={styles.spinner} />
              <span>Generating secure challenge…</span>
            </div>
          )}

          {status === 'waiting' && qrValue && (
            <div className={styles.qrCard}>
              <QRCodeSvg value={qrValue} size={220} showLotus={true} />
              <div className={styles.timerBadge}>
                ⏱ Expires in <strong>{secondsRemaining}s</strong>
              </div>
            </div>
          )}

          {status === 'authorized' && (
            <div className={styles.successBox}>
              <span className={styles.successIcon}>✓</span>
              <h3>Device Authorized!</h3>
              <p>Entering sanctuary…</p>
            </div>
          )}

          {status === 'expired' && (
            <div className={styles.expiredBox}>
              <p>This pairing QR has expired for security.</p>
              <button className={styles.refreshBtn} onClick={() => void initChallenge()} type="button">
                ↻ Generate New QR Code
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className={styles.errorBox}>
              <p>{errorMessage || 'Unable to establish pairing challenge.'}</p>
              <button className={styles.refreshBtn} onClick={() => void initChallenge()} type="button">
                Try Again
              </button>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.securityNote}>
            🛡️ Zero-Trust Ephemeral Challenge • Auto-revokes in 120s
          </span>
        </div>
      </div>
    </div>
  );
}
