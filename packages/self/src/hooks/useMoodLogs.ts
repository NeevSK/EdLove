import { SafeZustandStorage } from '@repo/core';
import { authAPI } from '@repo/core/api';
import { useStore, useTemporalStore } from '@repo/core/logic';
import { GuestDataManager } from '@repo/core/native';;

import { useCallback, useEffect, useState } from 'react';
import {
  createMoodLog,
  fetchMoodHistoryForView,
  moodToScore,
  scoreToMood,
} from '../api/wellbeingRepository';
import type { MoodLog } from '../types';

const MOOD_CACHE_KEY = 'gurudevi-mood-cache';

/**
 * useMoodLogs Hook
 *
 * Manages mood tracking with local-first resilience.
 * - Loads recent history instantly from cache.
 * - Supports both authenticated and guest modes.
 * - Syncs with the repository layer in the background.
 */
export const useMoodLogs = (userId?: string) => {
  const isOnline = useStore((state) => state.isOnline);
  const { viewDate, phase } = useTemporalStore();

  const [moodHistory, setMoodHistory] = useState<MoodLog[]>([]);
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
        if (isAnonymous) {
          const guestLogs = await GuestDataManager.getMoodLogs();
          const mappedLogs = guestLogs.map((gl) => ({
            id: gl.localId,
            user_id: 'guest',
            mood_score: moodToScore(scoreToMood(gl.mood)),
            mood: scoreToMood(gl.mood),
            note: gl.note,
            created_at: gl.timestamp,
          }));
          setMoodHistory(mappedLogs as MoodLog[]);
        } else if (userId) {
          const cached = await SafeZustandStorage.getItem(
            `${MOOD_CACHE_KEY}-${userId}-${viewDate}`,
          );

          if (cached) {
            setMoodHistory(JSON.parse(cached));
          }
        }
      } catch (error) {
        console.warn('Failed to load initial mood logs', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitial();
  }, [isAnonymous, userId, viewDate]);

  const refreshData = useCallback(async () => {
    if (isAnonymous) {
      const guestLogs = await GuestDataManager.getMoodLogs();
      const mappedLogs = guestLogs.map((gl) => ({
        id: gl.localId,
        user_id: 'guest',
        mood_score: moodToScore(scoreToMood(gl.mood)),
        mood: scoreToMood(gl.mood),
        note: gl.note,
        created_at: gl.timestamp,
      }));
      setMoodHistory(mappedLogs as MoodLog[]);
      return;
    }

    if (!userId || !isOnline) return;

    try {
      const data = await fetchMoodHistoryForView(userId, { phase });
      setMoodHistory(data);
      await SafeZustandStorage.setItem(
        `${MOOD_CACHE_KEY}-${userId}-${viewDate}`,
        JSON.stringify(data),
      );
    } catch (error) {
      console.error('Failed to refresh mood logs', error);
    }
  }, [isAnonymous, isOnline, phase, userId, viewDate]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addMoodLog = useCallback(
    async (mood: MoodLog['mood'], note?: string) => {
      if (!mood) return;

      try {
        const score = moodToScore(mood);

        if (isAnonymous) {
          const guestLog = await GuestDataManager.addMoodLog(score, note);
          const newLog: MoodLog = {
            id: guestLog.localId,
            user_id: 'guest',
            mood_score: score,
            mood,
            note,
            created_at: guestLog.timestamp,
          };
          setMoodHistory((prev) => [newLog, ...prev]);
          return newLog;
        }

        if (!userId) throw new Error('Missing user id for mood log');

        const data = await createMoodLog(userId, mood, note);
        const currentHistory = [data, ...moodHistory].slice(0, 30);
        setMoodHistory((prev) => [data, ...prev]);
        await SafeZustandStorage.setItem(
          `${MOOD_CACHE_KEY}-${userId}-${viewDate}`,
          JSON.stringify(currentHistory),
        );

        return data;
      } catch (error) {
        console.error('Failed to add mood log:', error);
        throw error;
      }
    },
    [isAnonymous, moodHistory, userId, viewDate],
  );

  return {
    moodHistory,
    logs: moodHistory,
    isLoading,
    loading: isLoading,
    isAnonymous,
    refreshData,
    addMoodLog,
    setMoodHistory,
  };
};
