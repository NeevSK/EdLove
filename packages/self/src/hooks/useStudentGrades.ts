import { useAuthStore } from '@repo/core/store';
import { SafeZustandStorage } from '@repo/core/storage-wrapper';
import { useCallback, useEffect, useState } from 'react';

const GRADES_CACHE_KEY = 'gurudevi-grades-cache';

export interface GradeRow {
  id: string;
  grade: number;
  feedback: string | null;
  submitted_at: string;
  assignments: { title: string } | null;
  classrooms: { name: string } | null;
}

export function useStudentGrades(studentId?: string) {
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load from local cache on mount
  useEffect(() => {
    if (!studentId) {
      setIsLoading(false);
      return;
    }
    const loadCache = async () => {
      try {
        const cached = await SafeZustandStorage.getItem(`${GRADES_CACHE_KEY}-${studentId}`);
        if (cached) {
          setGrades(JSON.parse(cached));
        }
      } catch (e) {
        console.warn('Failed to load grades cache', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadCache();
  }, [studentId]);

  // The retired assignment API is not admitted by the current foundation.
  const refreshData = useCallback(async () => {
    if (!studentId) return;
    const cached = await SafeZustandStorage.getItem(`${GRADES_CACHE_KEY}-${studentId}`);
    if (cached) setGrades(JSON.parse(cached) as GradeRow[]);
    setError(null);
  }, [studentId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    grades,
    isLoading,
    error,
    refreshData,
  };
}
