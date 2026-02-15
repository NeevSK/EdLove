import { useState, useCallback, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { SafeZustandStorage } from '../../lib/storageWrapper';
import { supabase } from '../../lib/supabase';
import { EnergyForecast } from '../../types/Wellbeing';

const ENERGY_CACHE_KEY = 'gurudevi-energy-cache';

/**
 * useEnergyForecast Hook
 * 
 * Manages energy forecasts with "Local-First" resilience.
 * - Loads recent forecasts instantly from cache.
 * - Syncs with Supabase in background.
 */
export function useEnergyForecast(userId?: string) {
    const isOnline = useStore(state => state.isOnline);
    const [forecasts, setForecasts] = useState<EnergyForecast[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial load from cache
    useEffect(() => {
        if (!userId) return;

        const loadCache = async () => {
            try {
                const cached = await SafeZustandStorage.getItem(`${ENERGY_CACHE_KEY}-${userId}`);
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
    }, [userId]);

    // Refresh from API
    const refreshData = useCallback(async () => {
        if (!userId || !isOnline) return;

        try {
            const { data, error } = await supabase
                .from('energy_forecasts')
                .select('*')
                .eq('user_id', userId)
                .order('forecast_date', { ascending: false })
                .limit(7); // Last 7 days

            if (error) throw error;

            if (data) {
                setForecasts(data);
                // Persist to cache
                await SafeZustandStorage.setItem(
                    `${ENERGY_CACHE_KEY}-${userId}`,
                    JSON.stringify(data)
                );
            }
        } catch (e) {
            console.error('Failed to refresh energy forecasts', e);
        }
    }, [userId, isOnline]);

    // Fetch on mount/online change
    useEffect(() => {
        refreshData();
    }, [refreshData, isOnline]);

    return {
        forecasts,
        isLoading,
        refreshData,
        setForecasts
    };
}
