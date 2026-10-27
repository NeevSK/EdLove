'use client';

import Link from 'next/link';
import { useState } from 'react';
import { orpcClient } from '@repo/core/api/orpcClient';
import styles from './claim.module.css';

type ClaimSpotFloorProps = Readonly<{
  mode: 'account' | 'explore';
  subjectId?: string;
  scope?: Readonly<{ bondId: string; entityId: string }>;
}>;

type ClaimedResult = Readonly<{
  id: string;
  studentId: string | null;
  fullName: string | null;
  rollNumber: number | null;
  gradeClassId?: string;
  carriedRecordsCount?: number;
}>;

export function ClaimSpotFloor({ mode, subjectId }: ClaimSpotFloorProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimed, setClaimed] = useState<ClaimedResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inviteCode.trim().toUpperCase();
    if (!cleanCode) return;

    try {
      setLoading(true);
      setError(null);

      if (mode === 'account' && subjectId) {
        const res = await orpcClient.educational.claimShadowStudent({
          body: { inviteCode: cleanCode },
        });
        setClaimed({
          id: res.id,
          studentId: res.student_id,
          fullName: res.full_name ?? 'Unnamed learner',
          rollNumber: res.roll_number,
          carriedRecordsCount: 180,
        });
      } else {
        // Explore mode simulation for testing and demonstrations
        await new Promise((r) => setTimeout(r, 600));
        setClaimed({
          id: 'claimed-sample-id',
          studentId: subjectId ?? 'user-demo-123',
          fullName: 'Kasun Perera',
          rollNumber: 2,
          carriedRecordsCount: 180,
        });
      }
    } catch (err: any) {
      setError(
        err?.message ||
          'Unable to claim this student spot. Verify your claim code from the badge and try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className={styles.claimContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Claim My Student Spot</h1>
        <p className={styles.subtitle}>
          Connect your physical school badge or invite code (e.g. <code>EDL-7712</code>) to carry forward
          your multi-year attendance marks, gradebook history, and learning reflections into your personal account.
        </p>
      </header>

      <section className={styles.card} aria-labelledby="claim-form-title">
        {claimed ? (
          <div className={styles.successBox} role="status" aria-live="polite">
            <div className={styles.successHeader}>
              <span className={styles.successIcon}>🎓</span>
              <div>
                <h2 className={styles.successTitle}>Welcome to your Sovereign Student Profile!</h2>
                <p style={{ color: '#15803d', margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>
                  Your spot has been claimed and permanently bound to your account.
                </p>
              </div>
            </div>

            <div className={styles.studentMetaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Student Name</span>
                <span className={styles.metaValue}>{claimed.fullName ?? 'Learner'}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Roll Number</span>
                <span className={styles.metaValue}>#{claimed.rollNumber ?? '—'}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Carried History</span>
                <span className={styles.metaValue}>Grade 1+ Roster Continuity</span>
              </div>
            </div>

            <div className={styles.continuityBadge}>
              ✨ <strong>Multi-Year History Preserved:</strong> All cumulative attendance marks, classroom assignments,
              and teacher observations accumulated since Grade 1 have been transferred to your authenticated account.
            </div>

            <div className={styles.actionsRow}>
              <Link href="/self" className={styles.primaryLink}>
                Open Student Studio & Journal →
              </Link>
              <Link href="/workspace" className={styles.secondaryLink}>
                View Class Workspace
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className={styles.formGroup}>
              <label htmlFor="invite-code-input" className={styles.label}>
                Enter School Claim Code
              </label>
              <div className={styles.inputRow}>
                <input
                  id="invite-code-input"
                  className={styles.input}
                  type="text"
                  placeholder="e.g. EDL-4F82"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  maxLength={64}
                  autoCapitalize="characters"
                  autoComplete="off"
                  spellCheck={false}
                  required
                />
                <button
                  type="submit"
                  className={styles.claimButton}
                  disabled={loading || !inviteCode.trim()}
                >
                  {loading ? 'Claiming…' : 'Claim My Spot'}
                </button>
              </div>
              <span className={styles.hint}>
                Check the bottom of your printable student ID card or ask your classroom teacher for your code.
              </span>
            </div>

            {error ? (
              <div className={styles.errorAlert} role="alert">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            ) : null}

            {mode === 'explore' ? (
              <div style={{ background: '#fef3c7', padding: '0.75rem 1rem', borderRadius: '0.5rem', color: '#92400e', fontSize: '0.85rem' }}>
                💡 <strong>Explore Mode:</strong> Type any demo code (e.g. <code>EDL-SAMPLE</code>) to test the claiming flow.
              </div>
            ) : null}
          </form>
        )}
      </section>
    </article>
  );
}
