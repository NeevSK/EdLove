'use client';

import {
  Award,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Heart,
  MessageSquare,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import styles from './guardian.module.css';

import { useGuardianDomain } from '@/lib/domain/guardianDomain';

export function GuardianFloor({
  displayName = 'Guardian',
  isExplore = false,
}: Readonly<{
  displayName?: string;
  isExplore?: boolean;
}>): React.ReactElement {
  const {
    children,
    selectedChild,
    selectedChildId,
    setSelectedChildId,
    events,
    notices,
    isLoading,
  } = useGuardianDomain();

  const [activeTab, setActiveTab] = useState<'presence' | 'progress' | 'notices'>('presence');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Family & Institutional Bridge</p>
          <h1 className={styles.title}>Guardian Portal</h1>
          <p className={styles.subtitle}>
            Continuous real-time visibility into your child’s learning journey, attendance, and school notices.
          </p>
        </div>
      </header>

      {/* Children Selector Ribbon */}
      <section aria-label="Select Enrolled Child">
        <p style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-ink-muted)', marginBottom: '0.75rem' }}>
          Enrolled Learners
        </p>
        <div className={styles.childrenRibbon}>
          {children.map((child) => {
            const isSelected = child.id === selectedChildId;
            return (
              <button
                key={child.id}
                type="button"
                className={`${styles.childChip} ${isSelected ? styles.activeChildChip : ''}`}
                onClick={() => setSelectedChildId(child.id)}
              >
                <div className={styles.childAvatar}>{child.avatarInitials}</div>
                <div className={styles.childInfo}>
                  <h3 className={styles.childName}>{child.name}</h3>
                  <span className={styles.childGrade}>{child.grade}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Navigation Tabs */}
      <nav className={styles.tabBar} aria-label="Guardian Portal Views">
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'presence' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('presence')}
        >
          <Clock size={18} />
          Presence & Attendance ({selectedChild?.attendanceRate}%)
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'progress' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          <GraduationCap size={18} />
          Academic Progress
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'notices' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('notices')}
        >
          <Bell size={18} />
          Teacher Notices ({notices.length})
        </button>
      </nav>

      {/* Tab: Presence */}
      {activeTab === 'presence' && (
        <section className={styles.section}>
          <div
            style={{
              background: '#fdfaf6',
              border: '1px solid #e8ddd3',
              borderRadius: '0.75rem',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-ink)' }}>
                Term 3 Cumulative Attendance: {selectedChild?.attendanceRate}%
              </p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--color-ink-muted)' }}>
                Homeroom Educator: {selectedChild?.homeroomTeacher}
              </p>
            </div>
            <span
              style={{
                background: '#dcfce7',
                color: '#15803d',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.82rem',
                textTransform: 'uppercase',
              }}
            >
              Regular & Punctual
            </span>
          </div>

          <div className={styles.timelineList}>
            {events.map((evt) => (
              <article key={evt.id} className={styles.timelineCard}>
                <div className={styles.timelineEvent}>
                  <div className={styles.timelineIcon}>
                    <CheckCircle2 size={20} />
                  </div>
                  <div className={styles.timelineDetails}>
                    <h3 className={styles.timelineTitle}>{evt.type} — {evt.session}</h3>
                    <span className={styles.timelineMeta}>
                      {evt.date} at {evt.time}
                    </span>
                  </div>
                </div>
                <span className={`${styles.statusBadge} ${styles.statusPresent}`}>
                  {evt.status}
                </span>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Tab: Progress */}
      {activeTab === 'progress' && (
        <section className={styles.section}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: '#fffdfa', border: '1px solid #e8ddd3', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-gold-deep)' }}>
                Science & Ecology
              </span>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-ink)' }}>Current Mark: 88% (A)</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-ink-soft)' }}>
                Demonstrated high mastery on Cellular Respiration and Mendelian genetics.
              </p>
            </div>

            <div style={{ background: '#fffdfa', border: '1px solid #e8ddd3', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-gold-deep)' }}>
                Pure Mathematics
              </span>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-ink)' }}>Current Mark: 92% (A+)</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-ink-soft)' }}>
                Exemplary problem-solving in quadratic equations and geometric proofs.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Tab: Notices */}
      {activeTab === 'notices' && (
        <section className={styles.section}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notices.map((notice) => (
              <article key={notice.id} className={styles.messageCard}>
                <div className={styles.messageHeader}>
                  <div>
                    <h3 className={styles.messageAuthor}>{notice.title}</h3>
                    <span className={styles.messageDate}>
                      From {notice.author} ({notice.role}) • {notice.date}
                    </span>
                  </div>
                </div>
                <p className={styles.messageBody}>{notice.content}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
