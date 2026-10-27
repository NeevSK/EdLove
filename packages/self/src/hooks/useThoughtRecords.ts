import { useAuthStore } from '@repo/core/store';
import { useOfflineStatus } from '@repo/core/offline/useOfflineStatus';
import { authAPI } from '@repo/core/api/client';
import { useTemporalStore } from '@repo/core/logic';
import { SafeZustandStorage } from '@repo/core/storage-wrapper';
import {
  completeThoughtRecordFollowUp,
  createThoughtRecord,
  fetchThoughtRecordsForView,
} from '@repo/self/api/thoughtRecordRepository';
import type { ReframeOutcome, ThoughtRecord } from '@repo/self/types';
import { useCallback, useEffect, useState } from 'react';

const THOUGHT_RECORD_CACHE_KEY = 'gurudevi-thought-record-cache';

/**
 * useThoughtRecords Hook
 *
 * Local-first management for the Reframe feature.
 * - Loads recent records instantly from cache.
 * - Requires a signed-in account (no guest state for sensitive reflection).
 * - Syncs via the repository's outbox queue.
 */
export const useThoughtRecords = (userId?: string) => {
  const { isOnline } = useOfflineStatus();
  const { viewDate, phase } = useTemporalStore();
  const [records, setRecords] = useState<ThoughtRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const anon = await authAPI.isAnonymous();
      setIsAnonymous(anon);
    };
    checkStatus();
  }, []);

  useEffect(() => {
    const loadInitial = async () => {
      try {
        if (!isAnonymous && userId) {
          const cached = await SafeZustandStorage.getItem(
            `${THOUGHT_RECORD_CACHE_KEY}-${userId}-${viewDate}`,
          );
          if (cached) {
            setRecords(JSON.parse(cached));
          }
        }
      } catch (error) {
        console.warn('Failed to load initial thought records', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitial();
  }, [isAnonymous, userId, viewDate]);

  const refreshData = useCallback(async () => {
    if (isAnonymous || !userId || !isOnline) return;
    try {
      const data = await fetchThoughtRecordsForView(userId, { phase });
      setRecords(data);
      await SafeZustandStorage.setItem(
        `${THOUGHT_RECORD_CACHE_KEY}-${userId}-${viewDate}`,
        JSON.stringify(data),
      );
    } catch (error) {
      console.error('Failed to refresh thought records', error);
    }
  }, [isAnonymous, isOnline, phase, userId, viewDate]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addThoughtRecord = useCallback(
    async (record: ThoughtRecord) => {
      if (isAnonymous) {
        throw new Error('Reframe requires a signed-in account');
      }
      if (!userId) throw new Error('Missing user id for thought record');
      const data = await createThoughtRecord(userId, record);
      setRecords((prev) => [data, ...prev].slice(0, 30));
      await SafeZustandStorage.setItem(
        `${THOUGHT_RECORD_CACHE_KEY}-${userId}-${viewDate}`,
        JSON.stringify([data, ...records].slice(0, 30)),
      );
      return data;
    },
    [isAnonymous, records, userId, viewDate],
  );

  const completeFollowUp = useCallback(
    async (recordId: string, input: { outcome: ReframeOutcome; reflection?: string }) => {
      if (!userId) throw new Error('Missing user id for thought record');
      await completeThoughtRecordFollowUp(recordId, input);
      setRecords((prev) =>
        prev.map((r) =>
          r.id === recordId
            ? {
                ...r,
                postOutcome: input.outcome,
                followUp: {
                  ...(r.followUp ?? { dueAt: new Date().toISOString() }),
                  completedAt: new Date().toISOString(),
                  outcome: input.outcome,
                  reflection: input.reflection,
                },
              }
            : r,
        ),
      );
    },
    [userId],
  );

  return {
    records,
    isLoading,
    loading: isLoading,
    isAnonymous,
    refreshData,
    addThoughtRecord,
    completeFollowUp,
    setRecords,
  };
};
