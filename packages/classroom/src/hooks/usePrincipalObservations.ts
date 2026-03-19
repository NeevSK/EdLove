import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@repo/core';

export function usePrincipalObservations(userId: string, schoolId: string, viewDate: string) {
    const [observations, setObservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const loadObservations = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const { data } = await supabase
                .from('principal_observations')
                .select('*')
                .eq('principal_id', userId)
                .lte('created_at', viewDate + 'T23:59:59.999Z')
                .order('created_at', { ascending: false })
                .limit(10);
            setObservations(data ?? []);
        } catch (err) {
            console.error('Failed to load observations:', err);
        } finally {
            setLoading(false);
        }
    }, [userId, viewDate]);

    useEffect(() => {
        loadObservations();
    }, [loadObservations]);

    const saveObservation = async (content: string, type: string) => {
        if (!content.trim() || !userId || !schoolId) return;
        setSaving(true);
        try {
            const { data } = await supabase.from('principal_observations').insert({
                principal_id: userId,
                school_id: schoolId,
                type,
                content: content.trim(),
            }).select().single();
            if (data) setObservations(prev => [data, ...prev]);
            return data;
        } catch (err) {
            console.error('Failed to save observation:', err);
            throw err;
        } finally {
            setSaving(false);
        }
    };

    return { observations, loading, saving, saveObservation, refresh: loadObservations };
}
