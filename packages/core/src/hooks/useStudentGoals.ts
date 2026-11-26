import { readStudentGoals } from '@repo/core/store/queries/experienceQueries';
import type { StudentGoal } from '@repo/core/types/uiExperience';
import { useEffect, useMemo, useState } from 'react';

/**
 * useStudentGoals
 *
 * Fetches the user's focus goals for the Student capacity.
 */
export const useStudentGoals = (userId?: string) => {
  const [goals, setGoals] = useState<StudentGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchGoals = async () => {
      setIsLoading(true);
      try {
        const data = await readStudentGoals(userId);
        if (data) setGoals(data);
      } catch (e) {
        console.error('[useStudentGoals] Error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoals().catch((e) => {
      console.error('StudentGoals: Failed to load on mount', e);
    });
  }, [userId]);

  return useMemo(() => ({ goals, isLoading }), [goals, isLoading]);
};
