import { useStore, useTemporalStore } from '@repo/core/logic';
import { SafeZustandStorage } from '@repo/core/storage-wrapper';
import { createDecisionLog, fetchDecisionLogs } from '@repo/self/api/selfFeatureRepository';
import type { DecisionLog } from '@repo/self/types';
import { useCallback, useEffect, useState } from 'react';

const DECISION_journal_CACHE_KEY = 'gurudevi-decision-journal-cache';
/**
 * useDecisionJournal Hook
 *
 * Manages principal's decision logs with "Local-First" resilience.
 * - Loads recent history instantly from cache.
 * - Syncs with Supabase in background.
 */
export function useDecisionJournal(userId?: string) {
  const isOnline = useStore((state) => state.isOnline);
  const { viewDate, isPastView } = useTemporalStore();
  const [decisions, setDecisions] = useState<DecisionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Initial load from cache
  useEffect(() => {
    if (!userId) return;
    const loadCache = async () => {
      try {
        const cached = await SafeZustandStorage.getItem(
          `${DECISION_journal_CACHE_KEY}-${userId}-${viewDate}`,
        );
        if (cached) {
          setDecisions(JSON.parse(cached));
        }
      } catch (e) {
        console.warn('Failed to load decision journal cache', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadCache();
  }, [userId, viewDate]);
  // Refresh from API
  const refreshData = useCallback(async () => {
    if (!userId || !isOnline) return;
    setError(null);
    try {
      const data = await fetchDecisionLogs(userId, { viewDate, isPastView });
      if (data) {
        setDecisions(data);
        // Persist to cache
        await SafeZustandStorage.setItem(
          `${DECISION_journal_CACHE_KEY}-${userId}-${viewDate}`,
          JSON.stringify(data),
        );
      }
    } catch (e) {
      console.error('Failed to refresh decision history', e);
      setError('Decision history is temporarily unavailable.');
    }
  }, [userId, isOnline, viewDate, isPastView]);
  // Fetch on mount/online change
  useEffect(() => {
    refreshData();
  }, [refreshData]);
  return {
    decisions,
    isLoading,
    error,
    refreshData,
    setDecisions,
    addDecision: async (text: string) => {
      if (!userId) throw new Error('Not authenticated');
      const newDecision = await createDecisionLog(userId, text);
      if (newDecision) {
        const nextDecisions = [newDecision, ...decisions];
        setDecisions(nextDecisions);
        await SafeZustandStorage.setItem(
          `${DECISION_journal_CACHE_KEY}-${userId}-${viewDate}`,
          JSON.stringify(nextDecisions),
        );
      }
      return newDecision;
    },
  };
}
