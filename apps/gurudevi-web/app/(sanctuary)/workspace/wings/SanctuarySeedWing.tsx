import type { SanctuarySeed } from '@/lib/domain/multiSphereDomain';
import { BookOpen, Lock } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import React from 'react';
import styles from './sanctuary-seed-wing.module.css';

interface SanctuarySeedWingProps {
  seeds: readonly SanctuarySeed[];
}

export function SanctuarySeedWing({ seeds }: SanctuarySeedWingProps): React.ReactElement {
  if (!seeds || seeds.length === 0) {
    return <></>;
  }

  return (
    <section className={styles.container} aria-label="Personal Educator Sanctuary & Draft Seeds">
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h2>
            <span>📝</span> Private Drafts & Lesson Notes
          </h2>
          <p className={styles.subtitle}>
            Your personal lesson drafts, teaching reflections, and unpublished notes.
          </p>
        </div>
        <span className={styles.sphereTag}>Private Notes</span>
      </header>

      <div className={styles.grid}>
        {seeds.map((seed) => (
          <Link
            key={seed.id}
            to="/self"
            className={styles.seedCard}
            title="Open private reflection workspace"
          >
            <h3 className={styles.seedTitle}>{seed.title}</h3>
            <p className={styles.seedSummary}>{seed.summary}</p>
            <div className={styles.seedFooter}>
              <span>Updated: {seed.updatedAt}</span>
              <span className={styles.privacyBadge}>
                <Lock size={11} style={{ display: 'inline', marginRight: '3px' }} />
                Private & Unmonitored
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
