import { useEffect, useMemo, useState } from 'react';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@repo/core/api/supabase';

export interface StudentGoal {
  id: string;
  title: string;
  status: 'pending' | 'completed' | 'in_progress';
  target_date: string;
}

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
        const { data } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
          .from('student_goals')
          .select('*')
          .eq('user_id', userId)
          .order('target_date', { ascending: true });

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
