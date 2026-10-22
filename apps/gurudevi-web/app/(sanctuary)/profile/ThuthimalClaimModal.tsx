'use client';

import { thuthimalAPI } from '@repo/core/api/thuthimal';
import React, { useState } from 'react';
import styles from './thuthimal-claim-modal.module.css';

interface ThuthimalClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (gifterName: string) => void;
  defaultToken?: string;
}

type ClaimStatus = 'idle' | 'claiming' | 'success' | 'already_claimed' | 'error';

export function ThuthimalClaimModal({
  isOpen,
  onClose,
  onSuccess,
  defaultToken = '',
}: Readonly<ThuthimalClaimModalProps>) {
  const [token, setToken] = useState(defaultToken);
  const [gifterName, setGifterName] = useState<string>('Someone special');
  const [status, setStatus] = useState<ClaimStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    const cleanToken = token.trim();
    if (!cleanToken) return;

    setStatus('claiming');
    setErrorMessage('');

    try {
      const res = await thuthimalAPI.claimGift({
        gift_token: cleanToken,
        recipient_id: 'current-user',
      });
      if (res.success) {
        const gifter = res.gifter_name ?? 'A grateful sponsor';
        setGifterName(gifter);
        setStatus('success');
        onSuccess?.(gifter);
      } else if (res.error === 'already_claimed_or_invalid') {
        setStatus('already_claimed');
      } else {
        setStatus('error');
        setErrorMessage(res.error ?? 'Unable to claim this gift token.');
      }
    } catch (cause) {
      setStatus('error');
      setErrorMessage(cause instanceof Error ? cause.message : 'Gift claim failed. Check token.');
    }
  }

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-labelledby="thuthimal-title">
      <div className={styles.modal}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        {status === 'success' ? (
          <div className={styles.bloomContainer}>
            <div className={styles.flowerEmoji}>🌸</div>
            <p className={styles.sinhalTitle}>තුතිමල් පිදුම</p>
            <h2 id="thuthimal-title" className={styles.successHeading}>
              Flower of Gratitude Bloomed
            </h2>
            <div className={styles.giftCard}>
              <span className={styles.giftFromLabel}>Honoring your teaching with deep gratitude:</span>
              <span className={styles.gifterName}>{gifterName}</span>
              <p className={styles.giftDesc}>
                This gift recognizes your dedication and activates permanent Sanctuary Pro for your classroom.
              </p>
            </div>
            <div className={styles.proPill}>✨ Sanctuary Pro Active</div>
            <button type="button" className={styles.primaryBtn} onClick={onClose}>
              Enter Sanctuary with Pro
            </button>
          </div>
        ) : status === 'already_claimed' ? (
          <div className={styles.content}>
            <div className={styles.iconHeader}>🪷</div>
            <h2 id="thuthimal-title">This Flower Has Already Bloomed</h2>
            <p className={styles.subtext}>
              This gratitude token was already claimed. If you believe this is an error, please verify with the person who gifted it to you.
            </p>
            <button type="button" className={styles.secondaryBtn} onClick={onClose}>
              Return to Profile
            </button>
          </div>
        ) : (
          <div className={styles.content}>
            <div className={styles.iconHeader}>🌸</div>
            <p className={styles.sinhalTitle}>තුතිමල්</p>
            <h2 id="thuthimal-title">Claim a Flower of Gratitude</h2>
            <p className={styles.subtext}>
              Have you received a Thuthimal gift code or QR from a past student, alumni, or community member? Enter the code below to claim your sponsored Pro tools.
            </p>

            <form onSubmit={handleClaim} className={styles.form}>
              <label htmlFor="gift-token-input" className={styles.label}>
                Gift Code / Token UUID
              </label>
              <input
                id="gift-token-input"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="e.g. thuthi-uuid-..."
                className={styles.input}
                disabled={status === 'claiming'}
                required
              />

              {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}

              <button
                type="submit"
                className={styles.primaryBtn}
                disabled={status === 'claiming' || !token.trim()}
              >
                {status === 'claiming' ? 'Verifying with Sanctuary…' : 'Claim Gift & Upgrade 🪷'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
