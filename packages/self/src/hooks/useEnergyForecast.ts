import { useStore, useTemporalStore } from '@repo/core/logic';
import { SafeZustandStorage } from '@repo/core/storage-wrapper';
import { useCallback, useEffect, useState } from 'react';
import {
  fetchEnergyForecastsForView,
  saveEnergyForecastForDate,
} from '@repo/self/api/selfInsightsRepository';
import type { EnergyForecast } from '@repo/self/types';

const ENERGY_CACHE_KEY = 'gurudevi-energy-cache';
/**
 * useEnergyForecast Hook
 *
 * Manages energy forecasts with "Local-First" resilience.
 * - Loads recent forecasts instantly from cache.
 * - Syncs with Supabase in background.
 */
export function useEnergyForecast(userId?: string) {
  const isOnline = useStore((state) => state.isOnline);
  const { viewDate, isPastView } = useTemporalStore();
  const [forecasts, setForecasts] = useState<EnergyForecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Initial load from cache
  useEffect(() => {
    if (!userId) return;
    const loadCache = async () => {
      try {
        const cached = await SafeZustandStorage.getItem(
          `${ENERGY_CACHE_KEY}-${userId}-${viewDate}`,
        );
        if (cached) {
          setForecasts(JSON.parse(cached));
        }
      } catch (e) {
        console.warn('Failed to load energy cache', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadCache();
  }, [userId, viewDate]);
  // Refresh from API
  const refreshData = useCallback(async () => {
    if (!userId || !isOnline) return;
    try {
      const data = await fetchEnergyForecastsForView(userId, {
        viewDate,
        isPastView,
      });
      if (data) {
        setForecasts(data);
        // Persist to cache
        await SafeZustandStorage.setItem(
          `${ENERGY_CACHE_KEY}-${userId}-${viewDate}`,
          JSON.stringify(data),
        );
      }
    } catch (e) {
      console.error('Failed to refresh energy forecasts', e);
    }
  }, [userId, isOnline, viewDate, isPastView]);
  // Fetch on mount/online change
  useEffect(() => {
    refreshData();
  }, [refreshData]);
  return {
    forecasts,
    isLoading,
    refreshData,
    setForecasts,
    saveForecast: async (payload: {
      forecastDate: string;
      energyLevel: EnergyForecast['energy_level'];
      notes?: string;
      existingId?: string;
    }) => {
      if (!userId) return;
      await saveEnergyForecastForDate(userId, payload);
    },
  };
}
