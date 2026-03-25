import { useState, useEffect, useCallback } from 'react';
import { observationsAPI } from '@repo/admin';

export function usePrincipalObservations(userId: string, schoolId: string, viewDate: string) {
    const [observations, setObservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const loadObservations = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const data = await observationsAPI.listByDate(userId, viewDate, 10);
            setObservations(data);
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
            const data = await observationsAPI.create({
                principalId: userId,
                schoolId,
                type,
                content: content.trim()
            });
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
