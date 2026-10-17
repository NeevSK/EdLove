'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import styles from './analytics.module.css';

interface SubjectMastery {
  subject: string;
  masteryPercentage: number;
  averageScore: number;
}

const subjects: SubjectMastery[] = [
  { subject: 'Language & Literature', masteryPercentage: 86, averageScore: 78.4 },
  { subject: 'Science & Ecology', masteryPercentage: 91, averageScore: 82.1 },
  { subject: 'Mathematics', masteryPercentage: 74, averageScore: 68.9 },
  { subject: 'Social Studies & Heritage', masteryPercentage: 88, averageScore: 79.5 },
  { subject: 'Contemplative Health', masteryPercentage: 96, averageScore: 92.0 },
];

interface EnhancedAnalyticsFloorProps {
  displayName: string;
  capacity?: string;
}

export function EnhancedAnalyticsFloor({
  displayName,
  capacity,
}: Readonly<EnhancedAnalyticsFloorProps>) {
  const [selectedScope, setSelectedScope] = useState('All Sanctuary Circles');

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
          <h1>Institutional Learning & Performance Analytics</h1>
          <p>
            Curriculum mastery distributions, attendance retention trends, and proactive student
            insights.
          </p>
        </div>

        <select
          value={selectedScope}
          onChange={(e) => setSelectedScope(e.target.value)}
          style={{
            minHeight: 44,
            padding: '0.4rem 0.85rem',
            borderRadius: '0.375rem',
            border: '1px solid var(--color-line, rgba(104, 94, 85, 0.25))',
            background: '#ffffff',
            fontSize: '0.85rem',
          }}
        >
          <option value="All Sanctuary Circles">All Sanctuary Circles</option>
          <option value="Grade 10-A (Lotus Sanctuary)">Grade 10-A (Lotus Sanctuary)</option>
          <option value="Grade 10-B (Cedar Circle)">Grade 10-B (Cedar Circle)</option>
          <option value="Grade 11-A (Monsoon Hall)">Grade 11-A (Monsoon Hall)</option>
        </select>
      </header>

      {/* Aggregate KPI Cards */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Attendance Retention</span>
          <span className={styles.metricValue}>96.4%</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Curricular Mastery</span>
          <span className={styles.metricValue}>87.0%</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Practice Participation</span>
          <span className={styles.metricValue}>92.8%</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Intervention Risk</span>
          <span className={styles.metricValue} style={{ color: '#2e5d32' }}>
            Low (2.1%)
          </span>
        </div>
      </div>

      {/* Subject Mastery Distribution */}
      <section className={styles.chartCard}>
        <h2
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            margin: 0,
            color: 'var(--color-ink, #131e27)',
          }}
        >
          Curriculum Subject Mastery Benchmarks ({selectedScope})
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft, #453c35)', margin: 0 }}>
          Weighted average based on formative assessments, homework portfolios, and active classroom
          dialogues.
        </p>

        <div className={styles.barList}>
          {subjects.map((sub) => (
            <div key={sub.subject} className={styles.barRow}>
              <span className={styles.barLabel}>{sub.subject}</span>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${sub.masteryPercentage}%` }} />
              </div>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--color-ink, #131e27)',
                  width: '3.5rem',
                }}
              >
                {sub.masteryPercentage}%
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
