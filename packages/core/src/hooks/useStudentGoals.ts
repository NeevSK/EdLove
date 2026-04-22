import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface StudentGoal {
  id: string;
  title: string;
  status: 'pending' | 'completed' | 'in_progress';
  target_date: string;
}

/**
 * useStudentGoals
 *
 * Fetches the user's focus goals for the Student role.
 */
export const useStudentGoals = (userId?: string) => {
  const [goals, setGoals] = useState<StudentGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchGoals = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase
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

    fetchGoals();
  }, [userId]);

  return { goals, isLoading };
};
