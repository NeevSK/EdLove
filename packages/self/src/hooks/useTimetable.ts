import { SafeZustandStorage } from "@repo/core/storage-wrapper";
import { authAPI, identityAPI } from '@repo/core/api';
import { useStore } from '@repo/core/logic';
import { GuestDataManager } from '@repo/core/native';
import { supabase } from '@repo/core/api';
;
import { useCallback, useEffect, useState } from 'react';
const TIMETABLE_CACHE_KEY = 'gurudevi-timetable-cache';
import type { Period } from '../types';
export type { Period };
export const useTimetable = (activeDay: number) => {
    const isOnline = useStore((state) => state.isOnline);
    const [periods, setPeriods] = useState<Period[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAnonymous, setIsAnonymous] = useState(false);
    // Check anonymous status on mount
    useEffect(() => {
        const checkAnonymous = async () => {
            const anon = await authAPI.isAnonymous();
            setIsAnonymous(anon);
        };
        checkAnonymous();
    }, []);
    // Initial load from cache or guest storage
    useEffect(() => {
        const loadCache = async () => {
            try {
                if (isAnonymous) {
                    // Load from guest storage
                    const guestPeriods = await GuestDataManager.getTimetable(activeDay);
                    const mappedPeriods = guestPeriods.map((gp) => ({
                        id: gp.localId,
                        user_id: 'guest',
                        day_of_week: gp.day_of_week,
                        period_number: gp.period_number,
                        subject: gp.subject,
                        class_name: gp.class_name,
                        type: gp.type,
                        start_time: gp.start_time,
                        end_time: gp.end_time,
                    }));
                    setPeriods(mappedPeriods);
                }
                else {
                    // Load from regular cache
                    const cached = await SafeZustandStorage.getItem(`${TIMETABLE_CACHE_KEY}-${activeDay}`);
                    if (cached) {
                        setPeriods(JSON.parse(cached));
                    }
                }
            }
            catch (e) {
                console.warn('Failed to load timetable cache', e);
            }
            finally {
                setLoading(false);
            }
        };
        loadCache();
    }, [activeDay, isAnonymous]);
    const fetchPeriods = useCallback(async () => {
        // Skip Supabase fetch for anonymous users - they use local storage only
        if (isAnonymous || !isOnline) {
            setLoading(false);
            return;
        }
        // Keep loading true only if we don't have data, otherwise background refresh
        if (periods.length === 0)
            setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('timetable')
                .select('*')
                .eq('day_of_week', activeDay)
                .order('start_time', { ascending: true });
            if (error)
                throw error;
            if (data) {
                setPeriods(data);
                // Persist to cache
                SafeZustandStorage.setItem(`${TIMETABLE_CACHE_KEY}-${activeDay}`, JSON.stringify(data));
            }
        }
        catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
            console.error('Error fetching timetable:', err);
            // Don't throw - just log for authenticated users
        }
        finally {
            setLoading(false);
        }
    }, [activeDay, isAnonymous, isOnline, periods.length]);
    useEffect(() => {
        fetchPeriods();
    }, [fetchPeriods]);
    const addPeriod = async (period: Omit<Period, 'id' | 'user_id'>) => {
        // Optimistic Update
        const tempId = `temp-${Date.now()}`;
        const previousPeriods = [...periods];
        const newPeriodOptimistic = {
            ...period,
            id: tempId,
            user_id: isAnonymous ? 'guest' : 'optimistic',
        } as Period;
        setPeriods((prev) => [...prev, newPeriodOptimistic].sort((a, b) => a.start_time.localeCompare(b.start_time)));
        try {
            if (isAnonymous) {
                // Guest mode: Save to local storage
                const guestPeriod = await GuestDataManager.addTimetablePeriod({
                    day_of_week: period.day_of_week,
                    period_number: period.period_number,
                    subject: period.subject || '',
                    class_name: period.class_name || '',
                    type: period.type,
                    start_time: period.start_time,
                    end_time: period.end_time,
                });
                // Replace temp with real local ID
                setPeriods((prev) => prev.map((p) => p.id === tempId
                    ? {
                        ...newPeriodOptimistic,
                        id: guestPeriod.localId,
                    }
                    : p));
            }
            else {
                // Authenticated mode: Save to Supabase
                const myId = await identityAPI.getMyInternalId();
                if (!myId)
                    throw new Error('Not authenticated');
                const { data, error } = await supabase
                    .from('timetable')
                    .insert([{ ...period, user_id: myId }])
                    .select()
                    .single();
                if (error)
                    throw error;
                // Replace temp with real
                setPeriods((prev) => prev.map((p) => (p.id === tempId ? data : p)));
            }
        }
        catch (err: unknown) {
            // Rollback
            setPeriods(previousPeriods);
            setError(err instanceof Error ? err.message : String(err));
            throw err;
        }
    };
    const updatePeriod = async (id: string, updates: Partial<Period>) => {
        const previousPeriods = [...periods];
        setPeriods((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
        try {
            if (isAnonymous) {
                // Guest mode: Update local storage
                await GuestDataManager.updateTimetablePeriod(id, updates as Partial<Period>);
            }
            else {
                // Authenticated mode: Update Supabase
                const { error } = await supabase.from('timetable').update(updates).eq('id', id);
                if (error)
                    throw error;
            }
        }
        catch (err: unknown) {
            setPeriods(previousPeriods);
            setError(err instanceof Error ? err.message : String(err));
            throw err;
        }
    };
    const deletePeriod = async (id: string) => {
        const previousPeriods = [...periods];
        setPeriods((prev) => prev.filter((p) => p.id !== id));
        try {
            if (isAnonymous) {
                // Guest mode: Delete from local storage
                await GuestDataManager.deleteTimetablePeriod(id);
            }
            else {
                // Authenticated mode: Delete from Supabase
                const { error } = await supabase.from('timetable').delete().eq('id', id);
                if (error)
                    throw error;
            }
        }
        catch (err: unknown) {
            setPeriods(previousPeriods);
            setError(err instanceof Error ? err.message : String(err));
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
        deletePeriod,
    };
};
