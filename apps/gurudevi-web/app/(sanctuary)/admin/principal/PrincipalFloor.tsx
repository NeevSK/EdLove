'use client';

import {
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Layers,
  Shield,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import styles from './principal.module.css';

import {
  type CurriculumProgress,
  type PendingStaffLeave as PendingLeave,
  usePrincipalDomain,
} from '@/lib/domain/principalDomain';

export function PrincipalFloor({
  displayName = 'Principal',
  isExplore = false,
}: Readonly<{
  displayName?: string;
  isExplore?: boolean;
}>): React.ReactElement {
  const [activeTab, setActiveTab] = useState<'brief' | 'curriculum' | 'leaves'>('brief');
  const { curriculumData, pendingLeaves, reviewLeave } = usePrincipalDomain();
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleReviewLeave = (id: string, decision: 'approved' | 'rejected') => {
    void reviewLeave(id, decision);
    setActionNotice(`Leave application ${id} ${decision}.`);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Institutional Executive Leadership</p>
          <h1 className={styles.title}>Principal Command Center</h1>
          <p className={styles.subtitle}>
            Morning situational intelligence, pedagogical governance, and institutional faculty oversight.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/workspace/workforce" className={styles.btnSecondary}>
            <Users size={16} /> Workforce Roster
          </Link>
          <Link href="/admin/analytics" className={styles.btnPrimary}>
            <TrendingUp size={16} /> Campus Analytics
          </Link>
        </div>
      </header>

      {/* Operational Pulse Ribbon */}
      <section className={styles.pulseGrid} aria-label="Campus Pulse">
        <div className={styles.pulseCard}>
          <span className={styles.pulseLabel}>Student Census</span>
          <span className={styles.pulseValue}>1,428</span>
          <span className={styles.pulseHint}>94.2% daily presence</span>
        </div>
        <div className={styles.pulseCard}>
          <span className={styles.pulseLabel}>Active Faculty</span>
          <span className={styles.pulseValue}>74 / 76</span>
          <span className={styles.pulseHint}>2 on sanctioned leave</span>
        </div>
        <div className={styles.pulseCard}>
          <span className={styles.pulseLabel}>Curriculum Pace</span>
          <span className={styles.pulseValue}>76.8%</span>
          <span className={styles.pulseHint}>Target: 75% for Week 9</span>
        </div>
        <div className={styles.pulseCard}>
          <span className={styles.pulseLabel}>Attention Flags</span>
          <span className={styles.pulseValue}>3</span>
          <span className={styles.pulseHint}>Pedagogical & health items</span>
        </div>
      </section>

      {actionNotice && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '0.85rem 1.25rem',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          {actionNotice}
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className={styles.tabBar} aria-label="Command Center Views">
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'brief' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('brief')}
        >
          <Shield size={18} />
          Morning Situational Brief
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'curriculum' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('curriculum')}
        >
          <BookOpen size={18} />
          Curriculum Syllabus Pulse
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'leaves' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('leaves')}
        >
          <Calendar size={18} />
          Staff Leave Desk ({pendingLeaves.length})
        </button>
      </nav>

      {/* Tab: Morning Situational Brief */}
      {activeTab === 'brief' && (
        <section className={styles.section}>
          <div className={styles.briefCard}>
            <h2 className={styles.briefTitle}>Institutional Status Summary • Term 3, Week 9</h2>
            <p className={styles.briefText}>
              All four academic divisions have reported normal morning homeroom census. Secondary assembly
              concluded at 08:15. Water salinity testing in the biological research pond is completed with
              zero anomalies. Grade 10 Sinhala syllabus requires reinforcement following the sports meet hiatus.
            </p>
          </div>

          <div className={styles.columns}>
            <div className={styles.columnCard}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-ink)' }}>
                Immediate Governance Priorities
              </h3>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: 'var(--color-ink-soft)', lineHeight: 1.5 }}>
                <li>Review Grade 10 Science laboratory equipment replenishment requisition.</li>
                <li>Sign off on Muthurajawela Ecology Field Trip transport clearances.</li>
                <li>Convene Section Head coordination meeting on Friday 14:00.</li>
              </ul>
            </div>

            <div className={styles.columnCard}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-ink)' }}>
                Pedagogical Resonance & Community Voice
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-ink-soft)' }}>
                  “Grade 11 students exhibited remarkable engagement during the Mendelian genetics practical session.”
                </p>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)' }}>
                  — Bandula Karunaratne (Senior Science Master)
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab: Curriculum Pulse */}
      {activeTab === 'curriculum' && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Syllabus Pacing & Departmental Coverage</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {curriculumData.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--color-surface, #fffdfa)',
                  border: '1px solid var(--color-border, #e8ddd3)',
                  borderRadius: '0.75rem',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--color-ink)', fontSize: '1.05rem' }}>
                      {item.grade} — {item.subject}
                    </span>
                  </div>
                  <span
                    style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background:
                        item.status === 'accelerated'
                          ? '#e0e7ff'
                          : item.status === 'on_track'
                            ? '#dcfce7'
                            : '#fee2e2',
                      color:
                        item.status === 'accelerated'
                          ? '#3730a3'
                          : item.status === 'on_track'
                            ? '#15803d'
                            : '#b91c1c',
                    }}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      flex: 1,
                      height: '8px',
                      background: '#eee',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${item.completionPercent}%`,
                        background:
                          item.status === 'lagging'
                            ? '#b91c1c'
                            : 'var(--color-gold-deep, #9a5b2d)',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-ink)' }}>
                    {item.completionPercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab: Staff Leave Approvals */}
      {activeTab === 'leaves' && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Institutional Faculty Leave Authorizations</h2>
            <Link href="/workspace/workforce" className={styles.btnSecondary}>
              Open Full Leave Registry →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingLeaves.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-ink-muted)', padding: '3rem' }}>
                All faculty leave requests have been reviewed.
              </p>
            ) : (
              pendingLeaves.map((leave) => (
                <div
                  key={leave.id}
                  style={{
                    background: 'var(--color-surface, #fffdfa)',
                    border: '1px solid var(--color-border, #e8ddd3)',
                    borderRadius: '0.75rem',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div className={styles.leaveMeta}>
                    <h3 className={styles.leaveName}>{leave.staffName}</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-gold-deep)' }}>
                      {leave.role} • {leave.type} Leave
                    </p>
                    <p className={styles.leaveDates}>
                      Duration: {leave.duration} • Nominated Substitute: {leave.substitute}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handleReviewLeave(leave.id, 'rejected')}
                      style={{
                        background: '#fff',
                        border: '1px solid #fca5a5',
                        color: '#b91c1c',
                        padding: '0.45rem 0.85rem',
                        borderRadius: '0.4rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.85rem',
                      }}
                    >
                      <XCircle size={15} /> Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReviewLeave(leave.id, 'approved')}
                      style={{
                        background: 'var(--color-gold-deep, #9a5b2d)',
                        border: 'none',
                        color: '#fff',
                        padding: '0.45rem 0.85rem',
                        borderRadius: '0.4rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.85rem',
                      }}
                    >
                      <CheckCircle2 size={15} /> Authorize
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
