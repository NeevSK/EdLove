import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUserRole } from './useUserRole';
import { useResonanceStore } from '../store/useResonanceStore';
import { useTracking } from './useTracking';

export interface SnapshotMoment {
    id: string;
    user_id: string;
    resonance_date: string;
    label: string;
    metadata: any;
    created_at: string;
}

/**
 * useManualSnapshot
 * 
 * Capability to explicitly "Snapshot" the current state of resonance
 * into a persistent "Moment".
 */
export function useManualSnapshot() {
    const { userId } = useUserRole();
    const { resonanceDate } = useResonanceStore();
    const { trackSnapshot } = useTracking();
    const [isSaving, setIsSaving] = useState(false);

    /**
     * Captures a snapshot of the current temporal state.
     */
    const takeSnapshot = async (label: string = 'Resonant Moment', additionalMetadata: any = {}) => {
        if (!userId) return null;
        
        setIsSaving(true);
        try {
            // In a real implementation, we would aggregate current state of all features here.
            // For now, we capture the core temporal context and label.
            const { data, error } = await supabase
                .from('snapshot_moments')
                .insert([{
                    user_id: userId,
                    resonance_date: resonanceDate,
                    label,
                    metadata: {
                        ...additionalMetadata,
                        captured_at: new Date().toISOString(),
                    }
                }])
                .select()
                .single();

            if (error) throw error;

            // Analytics
            trackSnapshot(label, resonanceDate);

            return data;
        } catch (error) {
            console.error('Failed to capture snapshot:', error);
            return null;
        } finally {
            setIsSaving(false);
        }
    };

    return {
        takeSnapshot,
        isSaving
    };
}
