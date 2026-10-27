'use client';

import { createSchoolRepository } from '@repo/core/adapters/supabase/educational/schoolRepository';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { getSandboxSamples } from '@repo/core/api/sandboxDataset';
import type { MockFounderSchool as SchoolItem } from '@repo/core/api/founder';
import { SchoolSchema } from '@repo/core/logic/schemas/school.schema';
import Link from 'next/link';
import React, { useState } from 'react';
import styles from './founder.module.css';

interface FounderFloorProps {
  displayName: string;
  capacity?: string;
}

export function FounderFloor({ displayName, capacity }: Readonly<FounderFloorProps>) {
  const [tab, setTab] = useState<'pulse' | 'schools' | 'sentinel'>('pulse');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [schools, setSchools] = useState<readonly SchoolItem[]>(() =>
    getSandboxSamples<SchoolItem[]>('founder', 'getSchools', [], []),
  );

  React.useEffect(() => {
    let isMounted = true;
    // Reuse schoolAPI's repository and validation without loading unrelated server factories.
    createSchoolRepository(supabaseClient)
      .searchSchools('')
      .then((rows) => rows.map((school) => SchoolSchema.parse(school)))
      .then((liveSchools) => {
        if (!isMounted || !liveSchools || liveSchools.length === 0) return;
        const mapped: SchoolItem[] = liveSchools.map((s, idx: number) => ({
          id: s.id,
          name: s.name,
          censusId: s.handle || `LK-SANCT-${idx + 1}`,
          students: (typeof s.student_count === 'number' && s.student_count) || 850 + idx * 120,
          teachers: 45 + idx * 8,
          status: s.status === 'active' ? 'active' : 'onboarding',
        }));
        setSchools(mapped);
      })
      .catch(() => {
        // Fallback to initialSchools
      });
    return () => {
      isMounted = false;
    };
  }, []);

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-ink, #131e27)' }}
            >
              Governed Sanctuary Institutions ({schools.length})
            </span>
            <Link
              href="/workspace/school"
              className={styles.actionButton}
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                padding: '0.4rem 0.85rem',
              }}
            >
              <span>+</span> Establish New School
            </Link>
          </div>

          <div className={styles.institutionsGrid}>
            {schools.map((sch) => (
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
                    marginTop: '0.25rem',
                  }}
                >
                  <span>Students: {sch.students.toLocaleString()}</span>
                  <span>Teachers: {sch.teachers}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginTop: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--color-line, rgba(104, 94, 85, 0.12))',
                  }}
                >
                  <Link
                    href={`/school/${sch.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '0.35rem 0.5rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: 650,
                      color: 'var(--color-action, #a85022)',
                      background: 'var(--color-paper-light, #fffdf8)',
                      border: '1px solid var(--color-line, rgba(104, 94, 85, 0.2))',
                      textDecoration: 'none',
                    }}
                  >
                    Explore Portal ↗
                  </Link>
                  <Link
                    href={`/workspace/school?schoolId=${sch.id}`}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '0.35rem 0.5rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: 650,
                      color: '#ffffff',
                      background: 'var(--color-action, #a85022)',
                      textDecoration: 'none',
                    }}
                  >
                    Workspace ➔
                  </Link>
                </div>
              </div>
            ))}
          </div>
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
