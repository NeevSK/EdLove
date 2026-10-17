'use client';

import { storage } from '@repo/core/lib/storage';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import { useOfflineStatus } from '@repo/core/offline/resilience';
import { useCallback, useEffect, useState } from 'react';

export interface ClimateMetrics {
  psychologicalSafety: number;
  academicPacing: number;
  peerBelonging: number;
  teacherWarmth: number;
  cognitiveChallenge: number;
}

export interface ClimateSubmission {
  id: string;
  metrics: ClimateMetrics;
  note?: string;
  submittedAt: string;
}

const DEFAULT_METRICS: ClimateMetrics = {
  psychologicalSafety: 4.2,
  academicPacing: 3.5,
  peerBelonging: 4.4,
  teacherWarmth: 4.8,
  cognitiveChallenge: 3.9,
};

function getStorageKey(classroomId: string): string {
  return `classroom:climate:${classroomId}`;
}

export function loadDurableClimate(classroomId: string): {
  metrics: ClimateMetrics;
  history: ClimateSubmission[];
} {
  const key = getStorageKey(classroomId);
  const raw = storage.getString(key);
  if (!raw) {
    const initial = { metrics: DEFAULT_METRICS, history: [] };
    storage.set(key, JSON.stringify(initial));
    return initial;
  }
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.metrics === 'object') return parsed;
  } catch {
    // fallback if corrupted
  }
  return { metrics: DEFAULT_METRICS, history: [] };
}

export function saveDurableClimate(
  classroomId: string,
  data: { metrics: ClimateMetrics; history: ClimateSubmission[] },
): void {
  storage.set(getStorageKey(classroomId), JSON.stringify(data));
}

/**
 * useClimateSensing
 *
 * Domain hook for classroom emotional & cognitive climate sensing,
 * offline anonymous Likert logging, and local radar calculation.
 */
export function useClimateSensing(classroomId = 'class-10a') {
  const { isOffline, isOnline } = useOfflineStatus();
  const [data, setData] = useState(() => loadDurableClimate(classroomId));
  const pendingCount = useMutationQueue(
    (s) =>
      s.queue.filter((item) => item.scope === 'classroom' && item.name === 'submitClimateSensing')
        .length,
  );

  useEffect(() => {
    setData(loadDurableClimate(classroomId));
  }, [classroomId]);

  const submitRating = useCallback(
    async (ratings: ClimateMetrics, note?: string): Promise<ClimateSubmission> => {
      const nowIso = new Date().toISOString();
      const submission: ClimateSubmission = {
        id: `climate-${Date.now()}`,
        metrics: ratings,
        note,
        submittedAt: nowIso,
      };

      const current = loadDurableClimate(classroomId);
      // Recalculate rolling average
      const count = current.history.length + 1;
      const updatedMetrics: ClimateMetrics = {
        psychologicalSafety: Number(
          (
            (current.metrics.psychologicalSafety * (count - 1) + ratings.psychologicalSafety) /
            count
          ).toFixed(1),
        ),
        academicPacing: Number(
          ((current.metrics.academicPacing * (count - 1) + ratings.academicPacing) / count).toFixed(
            1,
          ),
        ),
        peerBelonging: Number(
          ((current.metrics.peerBelonging * (count - 1) + ratings.peerBelonging) / count).toFixed(
            1,
          ),
        ),
        teacherWarmth: Number(
          ((current.metrics.teacherWarmth * (count - 1) + ratings.teacherWarmth) / count).toFixed(
            1,
          ),
        ),
        cognitiveChallenge: Number(
          (
            (current.metrics.cognitiveChallenge * (count - 1) + ratings.cognitiveChallenge) /
            count
          ).toFixed(1),
        ),
      };

      const updatedData = {
        metrics: updatedMetrics,
        history: [submission, ...current.history],
      };

      saveDurableClimate(classroomId, updatedData);
      setData(updatedData);

      await useMutationQueue.getState().addToQueue({
        name: 'submitClimateSensing',
        scope: 'classroom',
        variables: {
          classroomId,
          ratings,
          note,
          submittedAt: nowIso,
        },
        type: 'CUSTOM',
      });

      return submission;
    },
    [classroomId],
  );

  return {
    metrics: data.metrics,
    history: data.history,
    submitRating,
    isOffline,
    isOnline,
    pendingCount,
  };
}
