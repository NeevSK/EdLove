import { useAuthStore } from '@repo/core/store';
import { useOfflineStatus } from '@repo/core/offline/useOfflineStatus';
import { assignmentsAPI } from '@repo/core/api/client';

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
  const { isOnline } = useOfflineStatus();
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

  // Fetch / Sync function
  const refreshData = useCallback(async () => {
    if (!studentId || !isOnline) return;
    setError(null);
    try {
      const data = await assignmentsAPI.getRecentGradesOverviewForStudent(studentId, 20);
      if (data) {
        const parsedData = ((data as any[]) ?? []).filter(
          (r): r is GradeRow => r !== null && typeof r.grade === 'number',
        );
        setGrades(parsedData);
        // Persist to local cache
        await SafeZustandStorage.setItem(
          `${GRADES_CACHE_KEY}-${studentId}`,
          JSON.stringify(parsedData),
        );
      }
    } catch (e) {
      console.error('Failed to sync student grades', e);
      setError('Grades could not be loaded. Please try again.');
    }
  }, [studentId, isOnline]);

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
