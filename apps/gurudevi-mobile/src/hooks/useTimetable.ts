import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '@/ui';
import { SafeZustandStorage } from '../lib/storageWrapper';
import { useStore } from '../store/useStore';

const TIMETABLE_CACHE_KEY = 'gurudevi-timetable-cache';

export interface Period {
    id: string;
    user_id: string;
    day_of_week: number;
    period_number: number;
    subject: string;
    class_name: string;
    type: 'subject' | 'relief' | 'interval';
    start_time: string;
    end_time: string;
}

export const useTimetable = (activeDay: number) => {
    const isOnline = useStore(state => state.isOnline);
    const [periods, setPeriods] = useState<Period[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initial load from cache
    useEffect(() => {
        const loadCache = async () => {
            try {
                const cached = await SafeZustandStorage.getItem(`${TIMETABLE_CACHE_KEY}-${activeDay}`);
                if (cached) {
                    setPeriods(JSON.parse(cached));
                }
            } catch (e) {
                console.warn('Failed to load timetable cache', e);
            } finally {
                setLoading(false); // Fixed: was setIsLoading
            }
        };
        loadCache();
    }, [activeDay]);

    const fetchPeriods = useCallback(async () => {
        if (!isOnline) {
            setLoading(false);
            return;
        }
        // Keep loading true only if we don't have data, otherwise background refresh
        if (periods.length === 0) setLoading(true);

        setError(null);
        try {
            const { data, error } = await supabase
                .from('timetable')
                .select('*')
                .eq('day_of_week', activeDay)
                .order('start_time', { ascending: true });

            if (error) throw error; // Removed duplicate check

            if (data) {
                setPeriods(data);
                // Persist to cache
                SafeZustandStorage.setItem(
                    `${TIMETABLE_CACHE_KEY}-${activeDay}`,
                    JSON.stringify(data)
                );
            }
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching timetable:', err);
        } finally {
            setLoading(false);
        }
    }, [activeDay, periods.length, isOnline]); // Added missing dependencies

    useEffect(() => {
        fetchPeriods();
    }, [fetchPeriods, isOnline]);

    const addPeriod = async (period: Omit<Period, 'id' | 'user_id'>) => {
        // Optimistic Update
        const tempId = `temp-${Date.now()}`;
        const previousPeriods = [...periods];
        const newPeriodOptimistic = {
            ...period,
            id: tempId,
            user_id: 'optimistic'
        } as Period;

        setPeriods(prev => [...prev, newPeriodOptimistic].sort((a, b) => a.start_time.localeCompare(b.start_time)));

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from('timetable')
                .insert([{ ...period, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;

            // Replace temp with real
            setPeriods(prev => prev.map(p => p.id === tempId ? data : p));
        } catch (err: any) {
            // Rollback
            setPeriods(previousPeriods);
            setError(err.message);
            throw err;
        }
    };

    const updatePeriod = async (id: string, updates: Partial<Period>) => {
        const previousPeriods = [...periods];
        setPeriods(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

        try {
            const { error } = await supabase
                .from('timetable')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
        } catch (err: any) {
            setPeriods(previousPeriods);
            setError(err.message);
            throw err;
        }
    };

    const deletePeriod = async (id: string) => {
        const previousPeriods = [...periods];
        setPeriods(prev => prev.filter(p => p.id !== id));

        try {
            const { error } = await supabase
                .from('timetable')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (err: any) {
            setPeriods(previousPeriods);
            setError(err.message);
            throw err;
        }
    };

    return {
        periods,
        loading,
        error,
        fetchPeriods,
        addPeriod,
        updatePeriod,
        deletePeriod
    };
};
