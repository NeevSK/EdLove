import { supabaseGrowthAdapter } from '@repo/core/adapters/supabase/growth.adapter';
import { storage } from '@repo/core/lib/storage.adapter';
import type { GrowthViewSource } from '@repo/core/logic/ports/growthView.port';
import {
  type GrowthView,
  GrowthViewSchema,
  type SavedGrowth,
  SavedGrowthSchema,
} from '@repo/core/logic/schemas/growth.schema';

/**
 * The growth view at the boundary: read from the database and decoded once, and the offline
 * snapshot on the device, also decoded here. Everything above receives a typed GrowthView.
 */
export const growthViewSource: GrowthViewSource = {
  /** The account's growth view, or null if it has none yet. Rejects a row owned by anyone else. */
  async read(principalId: string): Promise<GrowthView | null> {
    const result = await supabaseGrowthAdapter.getGrowthState(principalId);
    const data = result === null ? null : GrowthViewSchema.parse(result);
    if (data && data.user_id !== principalId)
      throw new Error('Growth response belongs to another account.');
    return data;
  },

  snapshotKey: (principalId: string): string => `growth-snapshot:v1:${principalId}`,

  /** A saved snapshot; rejects one that belongs to another account. */
  decodeSnapshot(raw: string, principalId: string | null): SavedGrowth {
    const saved = SavedGrowthSchema.parse(JSON.parse(raw));
    if (saved.data && saved.data.user_id !== principalId)
      throw new Error('Saved growth belongs to another account.');
    return saved;
  },

  writeSnapshot(key: string, data: GrowthView | null): Promise<void> {
    return Promise.resolve(
      storage.setAsync(key, JSON.stringify({ savedAt: Date.now(), data })),
    ).then(() => undefined);
  },
};
