import { useTracking } from '@repo/core/hooks/useTracking';
import { uiExperience } from '@repo/core/logic/managers/factory';
import { usePermissions } from '@repo/core/logic/permissions/hooks/usePermissions';
import { useTemporalStore } from '@repo/core/store/useTemporalStore';
import { useCallback, useMemo, useState } from 'react';

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
  const takeSnapshot = useCallback(
    async (label: string = 'Snapshot Moment', additionalMetadata: any = {}) => {
      if (!userId) return null;

      setIsSaving(true);
      try {
        const data = await uiExperience.createSnapshotMoment({
          userId,
          resonanceDate: viewDate,
          label,
          metadata: additionalMetadata,
        });

        // Analytics
        trackSnapshot(label, viewDate).catch((e) => {
          console.error('Snapshot: Failed to track analytics', e);
        });

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
    },
    [userId, viewDate, trackSnapshot],
  );

  return useMemo(
    () => ({
      takeSnapshot,
      isSaving,
    }),
    [takeSnapshot, isSaving],
  );
}
