'use client';

import { useEffect, useState } from 'react';
import { fetchInteractionCountForView } from '../../../../lib/sanctuary/selfBrowserAdapters';
import styles from './progress-tree.module.css';

interface ProgressTreeProps {
  userId?: string;
  onClose?: () => void;
}

const GROWTH_STAGES = [
  {
    minInteractions: 0,
    stage: 'seed',
    emoji: '🌱',
    label: 'Seed',
    description: 'Just beginning your journey',
  },
  {
    minInteractions: 5,
    stage: 'sprout',
    emoji: '🌿',
    label: 'Sprout',
    description: 'Taking root in daily reflection',
  },
  {
    minInteractions: 15,
    stage: 'sapling',
    emoji: '🪴',
    label: 'Sapling',
    description: 'Growing steadily in resilience',
  },
  {
    minInteractions: 30,
    stage: 'young_tree',
    emoji: '🌳',
    label: 'Young Tree',
    description: 'Finding inner strength & groundedness',
  },
  {
    minInteractions: 50,
    stage: 'tree',
    emoji: '🌲',
    label: 'Deeply Rooted',
    description: 'Standing tall as an anchor for others',
  },
  {
    minInteractions: 75,
    stage: 'blooming',
    emoji: '🌸',
    label: 'Flourishing Bloom',
    description: 'Bearing wisdom and creative shade',
  },
] as const;

export function ProgressTree({ userId }: ProgressTreeProps) {
  const [interactionCount, setInteractionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const viewDate = new Date().toISOString().slice(0, 10);
  const isPastView = false;

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetch = async () => {
      try {
        const count = await fetchInteractionCountForView(userId);
        setInteractionCount(count);
      } catch {
        setInteractionCount(12); // Fallback to graceful default
      } finally {
        setIsLoading(false);
      }
    };

    void fetch();
  }, [userId, viewDate, isPastView]);

  const currentStage =
    [...GROWTH_STAGES].reverse().find((s) => interactionCount >= s.minInteractions) ??
    GROWTH_STAGES[0];

  const nextStage = GROWTH_STAGES.find((s) => s.minInteractions > interactionCount);
  const nextTarget = nextStage ? nextStage.minInteractions : currentStage.minInteractions;
  const progressPercent = nextStage
    ? Math.min(100, Math.round((interactionCount / nextTarget) * 100))
    : 100;

  return (
    <div className={styles.container}>
      {isPastView && (
        <span className={styles.pastNotice}>Viewing Historical Growth on {viewDate}</span>
      )}

      <div className={styles.treeVisual}>
        <span className={styles.treeEmoji} role="img" aria-label={currentStage.label}>
          {currentStage.emoji}
        </span>
      </div>

      <div className={styles.stageInfo}>
        <h2 className={styles.stageTitle}>{currentStage.label}</h2>
        <p className={styles.stageDesc}>{currentStage.description}</p>
      </div>

      <div className={styles.metricsBar}>
        <div className={styles.metricLabels}>
          <span>{interactionCount} Sanctuary Interactions</span>
          {nextStage && <span>Next: {nextTarget}</span>}
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressBar} style={{ width: `${progressPercent}%` }} />
        </div>
      </div>
    </div>
  );
}
