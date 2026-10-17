'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import styles from './forest.module.css';

interface TreeItem {
  id: string;
  teacherName: string;
  classroom: string;
  stage: 'seedling' | 'growing' | 'flourishing' | 'flowering' | 'ancient';
  vitalityScore: number;
  lastActive: string;
  recentPractice: string;
}

const initialTrees: TreeItem[] = [
  {
    id: 'tree-1',
    teacherName: 'Mrs. Anoma Ratnayake',
    classroom: 'Grade 10-A (Lotus Sanctuary)',
    stage: 'flowering',
    vitalityScore: 94,
    lastActive: 'Active today',
    recentPractice: 'Breath Guide & Morning Calm',
  },
  {
    id: 'tree-2',
    teacherName: 'Mr. Susantha Jayasuriya',
    classroom: 'Grade 10-B (Cedar Circle)',
    stage: 'flourishing',
    vitalityScore: 82,
    lastActive: 'Active today',
    recentPractice: 'Gratitude Glimmers',
  },
  {
    id: 'tree-3',
    teacherName: 'Ms. Tharushi Wickramasinghe',
    classroom: 'Grade 11-A (Monsoon Hall)',
    stage: 'ancient',
    vitalityScore: 98,
    lastActive: 'Active today',
    recentPractice: 'Fire Journal & Reflection',
  },
  {
    id: 'tree-4',
    teacherName: 'Mr. Dinesh Mendis',
    classroom: 'Grade 9-C (River Bend)',
    stage: 'growing',
    vitalityScore: 68,
    lastActive: '2 days ago',
    recentPractice: 'Joy Jar note shared',
  },
  {
    id: 'tree-5',
    teacherName: 'Mrs. Kumari Silva',
    classroom: 'Grade 8-A (Hill Grove)',
    stage: 'seedling',
    vitalityScore: 54,
    lastActive: '3 days ago',
    recentPractice: 'Breath Guide session',
  },
];

const STAGE_EMOJI: Record<TreeItem['stage'], string> = {
  seedling: '🌱',
  growing: '🌿',
  flourishing: '🌳',
  flowering: '🌸',
  ancient: '🌲',
};

interface SchoolForestFloorProps {
  displayName: string;
  capacity?: string;
}

export function SchoolForestFloor({ displayName, capacity }: Readonly<SchoolForestFloorProps>) {
  const [trees, setTrees] = useState<TreeItem[]>(initialTrees);
  const [notice, setNotice] = useState<string | null>(null);

  const handleNurture = (teacherName: string) => {
    setNotice(`Warmth note sent to ${teacherName} to encourage their learning circle.`);
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className={styles.container}>
      <header className={styles.headerBar}>
        <div className={styles.titleArea}>
          <div style={{ marginBottom: '0.5rem' }}>
            <Link
              href="/community"
              style={{
                fontSize: '0.8rem',
                fontWeight: 650,
                color: 'var(--color-action, #a85022)',
                textDecoration: 'none',
              }}
            >
              ← Back to Community Feed
            </Link>
          </div>
          <h1>The School Forest & Wellbeing Ecology</h1>
          <p>
            A collective living canvas where each educator and classroom circle grows a resilient
            tree nourished by daily practice.
          </p>
        </div>
      </header>

      {notice && (
        <div aria-live="polite" style={{ color: '#2e5d32', fontWeight: 700, fontSize: '0.85rem' }}>
          ✓ {notice}
        </div>
      )}

      {/* Forest Weather */}
      <section className={styles.weatherCard}>
        <div className={styles.weatherNarrative}>
          <span className={styles.weatherIcon}>☀️</span>
          <div className={styles.weatherText}>
            <h2>Radiant & Steady Forest Canopy</h2>
            <p>
              Overall school vitality is at 82%. 4 of 5 classrooms logged contemplative grounding
              today.
            </p>
          </div>
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2e5d32' }}>
          Season: Vasantha (Renewal)
        </div>
      </section>

      {/* Trees Grid */}
      <section className={styles.forestCanvas}>
        {trees.map((t) => (
          <div key={t.id} className={styles.treeCard}>
            <div className={styles.treeHeader}>
              <span className={styles.treeTeacher}>{t.teacherName}</span>
              <span className={styles.treeStageBadge}>{t.stage.toUpperCase()}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft, #453c35)' }}>
              {t.classroom}
            </div>

            <div className={styles.treeVisual}>{STAGE_EMOJI[t.stage]}</div>

            <div
              style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-ink, #131e27)' }}
            >
              Recent Practice: {t.recentPractice}
            </div>

            <div className={styles.treeMeta}>
              <span>{t.lastActive}</span>
              <span>Vitality: {t.vitalityScore}%</span>
            </div>

            <button
              type="button"
              className={styles.nurtureBtn}
              onClick={() => handleNurture(t.teacherName)}
            >
              Send Encouraging Warmth Note
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
