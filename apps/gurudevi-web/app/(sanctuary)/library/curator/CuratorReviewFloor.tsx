'use client';

import { getSandboxSamples } from '@repo/core/api/sandboxDataset';
import type {
  MockCuratorBrokenItem as BrokenItem,
  MockCuratorStagedItem as StagedItem,
} from '@repo/core/api/library';
import Link from 'next/link';
import React, { useState } from 'react';
import styles from './curator.module.css';

interface CuratorReviewFloorProps {
  displayName: string;
  capacity?: string;
}

export function CuratorReviewFloor({ displayName, capacity }: Readonly<CuratorReviewFloorProps>) {
  const [activeTab, setActiveTab] = useState<'staging' | 'broken'>('staging');
  const [stagedItems, setStagedItems] = useState<StagedItem[]>(() => {
    try {
      const stored = localStorage.getItem('gurudevi_curator_staged');
      return stored ? JSON.parse(stored) : getSandboxSamples<StagedItem[]>('curator', 'getStagedItems', [], []);
    } catch {
      return getSandboxSamples<StagedItem[]>('curator', 'getStagedItems', [], []);
    }
  });
  const [brokenItems, setBrokenItems] = useState<BrokenItem[]>(() => {
    try {
      const stored = localStorage.getItem('gurudevi_curator_broken');
      return stored ? JSON.parse(stored) : getSandboxSamples<BrokenItem[]>('curator', 'getBrokenItems', [], []);
    } catch {
      return getSandboxSamples<BrokenItem[]>('curator', 'getBrokenItems', [], []);
    }
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const approveItem = (id: string) => {
    setStagedItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('gurudevi_curator_staged', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast('Resource approved and published to the live Knowledge Library.');
  };

  const rejectItem = (id: string) => {
    setStagedItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('gurudevi_curator_staged', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast('Submission returned to contributor with feedback.');
  };

  const resolveBroken = (id: string) => {
    setBrokenItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('gurudevi_curator_broken', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast('Resource marked as verified and URL link refreshed.');
  };

  return (
    <main className={styles.container}>
      <div className={styles.topBar}>
        <Link href="/library" className={styles.backButton}>
          ← Back to Library Floor
        </Link>
        <span className={styles.roleBadge}>
          Curator: {displayName} {capacity ? `(${capacity})` : ''}
        </span>
      </div>

      <header className={styles.header}>
        <p className={styles.eyebrow}>Curator Studio</p>
        <h1 className={styles.title}>Epistemic Moderation & Curation</h1>
        <p className={styles.description}>
          Uphold the trust, curriculum alignment, and link integrity of the Gurudevi Sanctuary Knowledge
          Library.
        </p>
      </header>

      {toastMessage ? (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            marginBottom: '1.5rem',
            borderRadius: '0.75rem',
            background: 'color-mix(in srgb, #2e7d32 15%, transparent)',
            color: '#2e7d32',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          {toastMessage}
        </div>
      ) : null}

      <div className={styles.tabBar}>
        <button
          className={`${styles.tabButton} ${activeTab === 'staging' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('staging')}
          type="button"
        >
          Community Submissions ({stagedItems.length})
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'broken' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('broken')}
          type="button"
        >
          Broken Links Queue ({brokenItems.length})
        </button>
      </div>

      {activeTab === 'staging' ? (
        stagedItems.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>All submissions reviewed</h3>
            <p>The community staging queue is currently clear. New submissions will appear here.</p>
          </div>
        ) : (
          <ul className={styles.itemList}>
            {stagedItems.map((item) => (
              <li key={item.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div>
                    <div className={styles.itemType}>{item.type}</div>
                    <h3 className={styles.itemTitle}>{item.title}</h3>
                    <p className={styles.itemDescription}>{item.description}</p>
                  </div>
                </div>
                <div className={styles.cardMeta}>
                  <span>Contributor: <strong>{item.contributor}</strong></span>
                  <span>• Submitted: {item.submittedAt}</span>
                  <span>• Subjects: {item.subjects.join(', ')}</span>
                </div>
                <div className={styles.cardActions}>
                  <button className={styles.approveButton} onClick={() => approveItem(item.id)} type="button">
                    ✓ Publish to Library
                  </button>
                  <button className={styles.rejectButton} onClick={() => rejectItem(item.id)} type="button">
                    ✕ Reject / Return
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : brokenItems.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>Zero broken links</h3>
          <p>All active library resource URLs are passing integrity health checks.</p>
        </div>
      ) : (
        <ul className={styles.itemList}>
          {brokenItems.map((item) => (
            <li key={item.id} className={styles.card}>
              <div>
                <div className={styles.itemType} style={{ color: '#c62828' }}>
                  Link Failure Detected
                </div>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.itemDescription} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  Target: {item.url}
                </p>
              </div>
              <div className={styles.cardMeta}>
                <span>Fail count: <strong>{item.failCount} consecutive reports</strong></span>
                <span>• Flagged: {item.reportedAt}</span>
              </div>
              <div className={styles.cardActions}>
                <button className={styles.approveButton} onClick={() => resolveBroken(item.id)} type="button">
                  ✓ Confirm URL Verified
                </button>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '0.5rem 1.1rem',
                    borderRadius: '9999px',
                    border: '1px solid var(--line)',
                    color: 'var(--ink)',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  Test Link ↗
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
