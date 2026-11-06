'use client';

import {
  Button,
  Chip,
  Section,
  Surface,
  Text,
} from '@repo/ui/components/web';
import Link from 'next/link';
import React, { useState } from 'react';
import type { FurnitureDefinition } from '../../components/FloorStudioDrawer';
import { SanctuaryFloorCanvas } from '../../components/SanctuaryFloorCanvas';
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

const ANALYTICS_FURNITURE_ITEMS: readonly FurnitureDefinition[] = [
  { id: 'header', label: 'Analytics Scope & Header', icon: '📊' },
  { id: 'kpis', label: 'Institutional Key Performance Indicators', icon: '📈' },
  { id: 'mastery', label: 'Subject Mastery Benchmarks Distribution', icon: '🎯' },
];

export function EnhancedAnalyticsFloor({
  displayName,
  capacity,
}: Readonly<EnhancedAnalyticsFloorProps>) {
  const [selectedScope, setSelectedScope] = useState('All Sanctuary Circles');

  return (
    <SanctuaryFloorCanvas domain="workspace" furnitureItems={ANALYTICS_FURNITURE_ITEMS}>
      {({ isModuleVisible }) => (
        <div className={styles.container}>
          {isModuleVisible('header') && (
            <Surface tone="raised" className={styles.headerBar}>
              <div className={styles.titleArea}>
                <div style={{ marginBottom: '0.25rem' }}>
                  <Link href="/workspace" style={{ textDecoration: 'none' }}>
                    <Button variant="quiet" size="sm" label="← Back to Sanctuary" />
                  </Link>
                </div>
                <Text kind="title" tone="ink">Institutional Learning & Performance Analytics</Text>
                <Text kind="body" tone="soft">
                  Curriculum mastery distributions, attendance retention trends, and proactive student insights.
                </Text>
              </div>

              <select
                value={selectedScope}
                onChange={(e) => setSelectedScope(e.target.value)}
                style={{
                  minHeight: 44,
                  padding: '0.4rem 0.85rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--w-line, rgba(104, 94, 85, 0.25))',
                  background: 'var(--w-raised, #ffffff)',
                  color: 'var(--w-ink, inherit)',
                  fontSize: '0.85rem',
                }}
              >
                <option value="All Sanctuary Circles">All Sanctuary Circles</option>
                <option value="Grade 10-A (Lotus Sanctuary)">Grade 10-A (Lotus Sanctuary)</option>
                <option value="Grade 10-B (Cedar Circle)">Grade 10-B (Cedar Circle)</option>
                <option value="Grade 11-A (Monsoon Hall)">Grade 11-A (Monsoon Hall)</option>
              </select>
            </Surface>
          )}

          {/* Aggregate KPI Cards */}
          {isModuleVisible('kpis') && (
            <div className={styles.metricsGrid}>
              <Surface tone="raised" className={styles.metricCard}>
                <span className={styles.metricLabel}>Attendance Retention</span>
                <span className={styles.metricValue}>96.4%</span>
              </Surface>
              <Surface tone="raised" className={styles.metricCard}>
                <span className={styles.metricLabel}>Curricular Mastery</span>
                <span className={styles.metricValue}>87.0%</span>
              </Surface>
              <Surface tone="raised" className={styles.metricCard}>
                <span className={styles.metricLabel}>Practice Participation</span>
                <span className={styles.metricValue}>92.8%</span>
              </Surface>
              <Surface tone="raised" className={styles.metricCard}>
                <span className={styles.metricLabel}>Intervention Risk</span>
                <span className={styles.metricValue} style={{ color: 'var(--w-ink-lamp, #2e5d32)' }}>
                  Low (2.1%)
                </span>
              </Surface>
            </div>
          )}

          {/* Subject Mastery Distribution */}
          {isModuleVisible('mastery') && (
            <Surface tone="raised" className={styles.chartCard}>
              <Text kind="title" tone="ink">
                Curriculum Subject Mastery Benchmarks ({selectedScope})
              </Text>
              <Text kind="body" tone="soft">
                Weighted average based on formative assessments, homework portfolios, and active classroom
                dialogues.
              </Text>

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
                        color: 'var(--w-ink, #131e27)',
                        width: '3.5rem',
                      }}
                    >
                      {sub.masteryPercentage}%
                    </span>
                  </div>
                ))}
              </div>
            </Surface>
          )}
        </div>
      )}
    </SanctuaryFloorCanvas>
  );
}
