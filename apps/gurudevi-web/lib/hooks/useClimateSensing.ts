import { storage } from '@repo/core/lib/storage.adapter';
import { useMutationQueue } from '@repo/core/lib/sync/mutationQueue.store';
import { useOfflineStatus } from '@repo/core/offline/resilience.adapter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

export interface ClimateDimensionRating {
  id: string;
  name: string;
  description: string;
  score: number;
}

export const CANONICAL_CLIMATE_DIMENSIONS: readonly ClimateDimensionRating[] = [
  {
    id: 'safety',
    name: 'Psychological & Emotional Safety',
    description: 'Students feel accepted, safe from bullying, and unjudged when making errors.',
    score: 4,
  },
  {
    id: 'belonging',
    name: 'Peer Belonging & Collaboration',
    description: 'Classmates support each other naturally during group learning and quiet study.',
    score: 5,
  },
  {
    id: 'connection',
    name: 'Teacher Warmth & Attunement',
    description: 'Educators notice student distress, listen empathetically, and guide kindly.',
    score: 4,
  },
  {
    id: 'balance',
    name: 'Workload & Sensory Pace',
    description: 'Homework and syllabus speed allow adequate rest, sleep, and family time.',
    score: 3,
  },
  {
    id: 'vitality',
    name: 'Classroom Vitality & Hope',
    description:
      'Joy, wonder, and curiosity are alive in classroom discussions and hands-on experiments.',
    score: 4,
  },
];

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
 * Domain hook for classroom emotional & cognitive climate sensing, offline anonymous Likert
 * logging and local radar calculation. A local query keyed by classroom, written by a mutation
 * that saves on the device, updates the cache and queues the submission in the outbox.
 */
/** Folds one more rating into the running average, to one decimal place. */
function withRating(average: ClimateMetrics, ratings: ClimateMetrics, count: number): ClimateMetrics {
  const fold = (key: keyof ClimateMetrics) =>
    Number(((average[key] * (count - 1) + ratings[key]) / count).toFixed(1));
  return {
    psychologicalSafety: fold('psychologicalSafety'),
    academicPacing: fold('academicPacing'),
    peerBelonging: fold('peerBelonging'),
    teacherWarmth: fold('teacherWarmth'),
    cognitiveChallenge: fold('cognitiveChallenge'),
  };
}

export const climateSensingKey = (classroomId: string) =>
  ['classroom', 'climate', classroomId] as const;

export function useClimateSensing(classroomId = 'class-10a') {
  const { isOffline, isOnline } = useOfflineStatus();
  const queryClient = useQueryClient();
  const queryKey = climateSensingKey(classroomId);

  // Ratings are kept on the device; the read is synchronous and never waits for the network.
  const { data } = useQuery({
    queryKey,
    queryFn: () => loadDurableClimate(classroomId),
    initialData: () => loadDurableClimate(classroomId),
    staleTime: Number.POSITIVE_INFINITY,
    networkMode: 'always',
  });

  const pendingCount = useMutationQueue(
    (s) =>
      s.queue.filter((item) => item.scope === 'classroom' && item.name === 'submitClimateSensing')
        .length,
  );

  const submit = useMutation({
    mutationKey: ['classroom', 'climate', 'submit'],
    networkMode: 'always',
    mutationFn: async ({
      ratings,
      note,
    }: {
      ratings: ClimateMetrics;
      note?: string;
    }): Promise<ClimateSubmission> => {
      const submittedAt = new Date().toISOString();
      const submission: ClimateSubmission = {
        id: `climate-${Date.now()}`,
        metrics: ratings,
        note,
        submittedAt,
      };
      const current = loadDurableClimate(classroomId);
      const updated = {
        metrics: withRating(current.metrics, ratings, current.history.length + 1),
        history: [submission, ...current.history],
      };
      saveDurableClimate(classroomId, updated);
      queryClient.setQueryData(queryKey, updated);

      await useMutationQueue.getState().addToQueue({
        name: 'submitClimateSensing',
        scope: 'classroom',
        variables: { classroomId, ratings, note, submittedAt },
        type: 'CUSTOM',
      });
      return submission;
    },
  });

  return {
    metrics: data.metrics,
    history: data.history,
    submitRating: (ratings: ClimateMetrics, note?: string) => submit.mutateAsync({ ratings, note }),
    isSubmitting: submit.isPending,
    isOffline,
    isOnline,
    pendingCount,
  };
}
