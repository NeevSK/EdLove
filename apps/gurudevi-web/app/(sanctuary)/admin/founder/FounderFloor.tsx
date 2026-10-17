'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import styles from './founder.module.css';

interface SchoolItem {
  id: string;
  name: string;
  censusId: string;
  students: number;
  teachers: number;
  status: 'active' | 'onboarding';
}

const initialSchools: SchoolItem[] = [
  {
    id: 'sch-1',
    name: 'Ananda College Educational Sanctuary',
    censusId: 'LK-WP-COL-001',
    students: 1240,
    teachers: 68,
    status: 'active',
  },
  {
    id: 'sch-2',
    name: 'Dharmaraja College Heritage Circle',
    censusId: 'LK-CP-KAN-004',
    students: 980,
    teachers: 52,
    status: 'active',
  },
  {
    id: 'sch-3',
    name: 'Jaffna Hindu College Sanctuary Hall',
    censusId: 'LK-NP-JAF-012',
    students: 860,
    teachers: 44,
    status: 'active',
  },
];

interface FounderFloorProps {
  displayName: string;
  capacity?: string;
}

export function FounderFloor({ displayName, capacity }: Readonly<FounderFloorProps>) {
  const [tab, setTab] = useState<'pulse' | 'schools' | 'sentinel'>('pulse');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    setNotice('Emergency educational announcement broadcast across all active sanctuaries.');
    setBroadcastMsg('');
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className={styles.container}>
      <header className={styles.headerBar}>
        <div className={styles.titleArea}>
          <div style={{ marginBottom: '0.25rem' }}>
            <Link
              href="/workspace"
              style={{
                fontSize: '0.75rem',
                fontWeight: 650,
                color: 'var(--color-action, #a85022)',
                textDecoration: 'none',
              }}
            >
              ← Back to Sanctuary
            </Link>
          </div>
          <h1>Founder Ecosystem Command Cockpit</h1>
          <p>
            Multi-tenant sanctuary oversight, infrastructure telemetry, and national announcements.
          </p>
        </div>

        <div className={styles.tabBar}>
          <button
            type="button"
            className={styles.tabBtn}
            data-active={tab === 'pulse'}
            onClick={() => setTab('pulse')}
          >
            📊 Ecosystem Pulse
          </button>
          <button
            type="button"
            className={styles.tabBtn}
            data-active={tab === 'schools'}
            onClick={() => setTab('schools')}
          >
            🏫 Schools Directory
          </button>
          <button
            type="button"
            className={styles.tabBtn}
            data-active={tab === 'sentinel'}
            onClick={() => setTab('sentinel')}
          >
            🛡️ Sentinel Broadcast
          </button>
        </div>
      </header>

      {notice && (
        <div aria-live="polite" style={{ color: '#2e5d32', fontWeight: 700, fontSize: '0.85rem' }}>
          ✓ {notice}
        </div>
      )}

      {tab === 'pulse' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Active Schools</span>
              <span className={styles.statValue}>18</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Enrolled Students</span>
              <span className={styles.statValue}>14,250</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Sanctuary Educators</span>
              <span className={styles.statValue}>740</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>API Health / Uptime</span>
              <span className={styles.statValue} style={{ color: '#2e5d32' }}>
                99.98%
              </span>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <h2
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                margin: 0,
                color: 'var(--color-ink, #131e27)',
              }}
            >
              Substrate Health & Edge Sync
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft, #453c35)', margin: 0 }}>
              SSR cookies active across all tenant clusters. Offline practice boundaries logged 0
              sync conflicts in the past 24 hours.
            </p>
          </div>
        </div>
      )}

      {tab === 'schools' && (
        <div className={styles.institutionsGrid}>
          {initialSchools.map((sch) => (
            <div key={sch.id} className={styles.instCard}>
              <span
                style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-ink, #131e27)' }}
              >
                {sch.name}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-soft, #453c35)' }}>
                Census ID: {sch.censusId}
              </span>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  marginTop: '0.5rem',
                }}
              >
                <span>Students: {sch.students.toLocaleString()}</span>
                <span>Teachers: {sch.teachers}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'sentinel' && (
        <div className={styles.sectionCard}>
          <h2
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              margin: 0,
              color: 'var(--color-ink, #131e27)',
            }}
          >
            National Educational Broadcast
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft, #453c35)', margin: 0 }}>
            Dispatch instant high-priority notices to all student and educator dashboards.
          </p>

          <form
            onSubmit={handleBroadcast}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <textarea
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              placeholder="Compose national curricular circular or weather alert..."
              rows={3}
              style={{
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-line, rgba(104, 94, 85, 0.25))',
                fontFamily: 'inherit',
                fontSize: '0.85rem',
              }}
            />
            <button type="submit" className={styles.actionButton}>
              Broadcast Notice
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
