import { useSanctuaryFeature } from '@repo/core/logic/permissions/hooks/useSanctuaryFeature';
import { saveSnapshotMoment } from '@repo/core/store/queries/experienceQueries';
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
  const { context } = useSanctuaryFeature();
  const userId = context.userId;
  const viewDate = useTemporalStore((s) => s.viewDate);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Captures a snapshot of the current temporal state.
   */
  const takeSnapshot = useCallback(
    async (label: string = 'Snapshot Moment', additionalMetadata: any = {}) => {
      if (!userId) return null;

      setIsSaving(true);
      try {
        const data = await saveSnapshotMoment({
          userId,
          resonanceDate: viewDate,
          label,
          metadata: additionalMetadata,
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
    [userId, viewDate],
  );

  return useMemo(
    () => ({
      takeSnapshot,
      isSaving,
    }),
    [takeSnapshot, isSaving],
  );
}
