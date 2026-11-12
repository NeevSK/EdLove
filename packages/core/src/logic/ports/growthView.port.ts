import type { GrowthView, SavedGrowth } from '@repo/core/logic/schemas/growth.schema';

/** The account's growth view and its offline copy on the device, decoded by the adapter. */
export interface GrowthViewSource {
  /** The growth view, or null if the account has none yet. Rejects a row owned by anyone else. */
  read(principalId: string): Promise<GrowthView | null>;
  snapshotKey(principalId: string): string;
  /** A saved snapshot; rejects one that belongs to another account. */
  decodeSnapshot(raw: string, principalId: string | null): SavedGrowth;
  writeSnapshot(key: string, data: GrowthView | null): Promise<void>;
}
