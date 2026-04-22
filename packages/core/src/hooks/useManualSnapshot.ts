import { useState } from 'react';
import { supabase } from '../native/supabase';
import { usePermissions } from '../permissions/hooks/usePermissions';
import { useTemporalStore } from '../store/useTemporalStore';
import { useTracking } from './useTracking';

export interface SnapshotMoment {
  id: string;
  user_id: string;
  snapshot_date: string;
  label: string;
  metadata: any;
  created_at: string;
}

/**
 * useManualSnapshot
 *
 * Capability to explicitly snapshot the current temporal context
 * into a persistent moment.
 */
export function useManualSnapshot() {
  const { context } = usePermissions();
  const userId = context.userId;
  const { viewDate } = useTemporalStore();
  const { trackSnapshot } = useTracking();
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Captures a snapshot of the current temporal state.
   */
  const takeSnapshot = async (label: string = 'Snapshot Moment', additionalMetadata: any = {}) => {
    if (!userId) return null;

    setIsSaving(true);
    try {
      // In a real implementation, we would aggregate current state of all features here.
      // For now, we capture the core temporal context and label.
      const { data, error } = await supabase
        .from('snapshot_moments')
        .insert([
          {
            user_id: userId,
            // Keep database writes compatible with the current schema.
            resonance_date: viewDate,
            label,
            metadata: {
              ...additionalMetadata,
              captured_at: new Date().toISOString(),
            },
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Analytics
      trackSnapshot(label, viewDate);

      if (!data) return null;

      return {
        ...data,
        snapshot_date: data.resonance_date,
      } as SnapshotMoment;
    } catch (error) {
      console.error('Failed to capture snapshot:', error);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    takeSnapshot,
    isSaving,
  };
}
