'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import styles from './create-account-guidance-modal.module.css';

interface CreateAccountGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  exploreRoleTitle?: string;
}

export function CreateAccountGuidanceModal({
  isOpen,
  onClose,
  exploreRoleTitle = 'Educator',
}: Readonly<CreateAccountGuidanceModalProps>) {
  const [preserveSandboxData, setPreserveSandboxData] = useState(true);

  if (!isOpen) return null;

  const handleCarryoverToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setPreserveSandboxData(checked);
    try {
      if (checked) {
        localStorage.setItem('gurudevi_preserve_guest_on_signup', 'true');
      } else {
        localStorage.removeItem('gurudevi_preserve_guest_on_signup');
      }
    } catch {
      // storage unavailable
    }
  };

  const signUpHref = preserveSandboxData
    ? 'https://sanctuary.gurudevi.app/sign-up?preserve_guest=1'
    : 'https://sanctuary.gurudevi.app/sign-up';

  const signInHref = 'https://sanctuary.gurudevi.app/sign-in';

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guidance-modal-title"
      onClick={onClose}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close guidance dialog"
        >
          ✕
        </button>

        <header className={styles.header}>
          <h2 id="guidance-modal-title" className={styles.title}>
            <span>🪷</span> Step into Your Sovereign Sanctuary
          </h2>
          <p className={styles.subtext}>
            You are currently experiencing Gurudevi as an explorer in the sample <strong>{exploreRoleTitle}</strong> lens.
            Establishing a real Sanctuary account binds you to your verified educational institution.
          </p>
        </header>

        <div className={styles.comparisonGrid}>
          {/* Active Sandbox Column */}
          <div className={styles.column}>
            <div className={styles.columnHeader}>
              <span className={styles.columnBadge}>Active Now</span>
            </div>
            <h3 className={styles.columnTitle}>🧭 Explore Sandbox</h3>
            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <span>🛡️</span> Zero cloud telemetry (Sri Lanka PDPA 2022)
              </li>
              <li className={styles.featureItem}>
                <span>💾</span> Stored only in local browser session
              </li>
              <li className={styles.featureItem}>
                <span>🧪</span> Sample classroom rosters and mock curriculum
              </li>
              <li className={styles.featureItem}>
                <span>🔄</span> Freely reversible and resettable
              </li>
            </ul>
          </div>

          {/* Verified Sanctuary Column */}
          <div className={`${styles.column} ${styles.columnActive}`}>
            <div className={styles.columnHeader}>
              <span className={`${styles.columnBadge} ${styles.columnBadgeActive}`}>Sovereign Account</span>
            </div>
            <h3 className={styles.columnTitle}>🏛️ Verified Sanctuary</h3>
            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <span>🔐</span> Immutable UUIDv8 account &amp; cross-device sync
              </li>
              <li className={styles.featureItem}>
                <span>🏫</span> School tenancy &amp; official classroom registers
              </li>
              <li className={styles.featureItem}>
                <span>📜</span> Certified teacher credentials &amp; student records
              </li>
              <li className={styles.featureItem}>
                <span>🪷</span> Communal gratitude tokens &amp; verified pass
              </li>
            </ul>
          </div>
        </div>

        {/* Data Carryover Toggle */}
        <label className={styles.carryoverBox}>
          <input
            type="checkbox"
            checked={preserveSandboxData}
            onChange={handleCarryoverToggle}
          />
          <span>
            <strong>Preserve my sandbox work:</strong> Carry over my edited bio, credentials, and settings into my new account.
          </span>
        </label>

        {/* Action Buttons */}
        <div className={styles.actionsRow}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <a href={signUpHref} className={styles.actionPrimary}>
              <span>✨</span> Create Sovereign Account ↗
            </a>
            <a href={signInHref} className={styles.actionSecondary}>
              Sign In
            </a>
          </div>
          <button type="button" className={styles.actionGhost} onClick={onClose}>
            Keep Exploring Sandbox
          </button>
        </div>
      </div>
    </div>
  );
}
