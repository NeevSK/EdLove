import { useMemo } from 'react';
import type { SelfViewFeature } from '@repo/self/components/BaseSelfView.types';
import { useFeatureActivity } from '@repo/self/hooks/useFeatureActivity';

/**
 * useDynamicSelfFeatures - The "Brain" of the Discovery Hub.
 *
 * Implements a Weighted Resonance Algorithm:
 * 1. Pinned items are teleported to the front (100,000 weight).
 * 2. Recency gives a sliding boost (Up to 1,000 weight).
 * 3. Frequency indicates "Life Rhythms" (Up to 500 weight).
 * 4. Temporal Phase (Morning/Night) provides context resonance (2,000 weight).
 */
export function useDynamicSelfFeatures(features: SelfViewFeature[]) {
  const { getStats, getPinnedFeatures } = useFeatureActivity();

  const sortedFeatures = useMemo(() => {
    const stats = getStats();
    const pinned = getPinnedFeatures();
    const now = Date.now();
    const currentHour = new Date().getHours();

    // Determine current phase
    let phase: 'morning' | 'afternoon' | 'night' = 'afternoon';
    if (currentHour >= 5 && currentHour < 12) phase = 'morning';
    else if (currentHour >= 18 || currentHour < 5) phase = 'night';

    return [...features].sort((a, b) => {
      const scoreA = calculateScore(a, stats[a.id], pinned.includes(a.id), now, phase);
      const scoreB = calculateScore(b, stats[b.id], pinned.includes(b.id), now, phase);
      return scoreB - scoreA;
    });
  }, [features, getStats, getPinnedFeatures]);

  const topItems = useMemo(() => sortedFeatures.slice(0, 10), [sortedFeatures]);
  const remainingItems = useMemo(() => sortedFeatures.slice(10), [sortedFeatures]);

  return {
    sortedFeatures,
    topItems,
    remainingItems,
  };
}

function calculateScore(
  feature: SelfViewFeature,
  stat: { lastUsed: number; count: number } | undefined,
  isPinned: boolean,
  now: number,
  currentPhase: 'morning' | 'afternoon' | 'night',
): number {
  let score = 0;

  // 1. PINNED (Ultimate Priority)
  if (isPinned) score += 100000;

  // 2. TEMPORAL RESONANCE (Architecture Protocol: Circadian Respect)
  if (feature.timing?.preferredPhase === currentPhase) {
    score += 2000;
  }

  if (stat) {
    // 3. RECENCY (Temporal Scale)
    // Decays over 24 hours
    const hoursSinceLastUse = (now - stat.lastUsed) / (1000 * 60 * 60);
    if (hoursSinceLastUse < 24) {
      score += Math.max(0, 1000 * (1 - hoursSinceLastUse / 24));
    }

    // 4. FREQUENCY (Structural Strength)
    score += Math.min(500, stat.count * 10);
  }

  return score;
}
