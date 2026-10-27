import { createScopedStateStorage } from '@repo/core/lib/scopedStateStorage';
import {
  getActiveAccountId,
  getAccountScopeRevision,
} from '@repo/core/lib/accountScope';
import {
  getGuestScope,
  getGuestScopeRevision,
  isGuestUserId,
} from '@repo/core/native/guestScope';
import { storage } from '@repo/core/lib/storage';
import { createUISlice, type UISlice } from '@repo/core/store/slices/ui.slice';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * useUIStore: shared UI content state; theme preferences have a device owner.
 */
export const useUIStore = create<UISlice>()(
  persist(
    (...a) => ({
      ...createUISlice(...a),
    }),
    {
      name: 'gurudevi-ui-storage',
      storage: createJSONStorage(() => createScopedStateStorage()),
      partialize: (state) => ({
        dismissedSampleIds: state.dismissedSampleIds,
        deskItems: state.deskItems,
        scaffoldCompletions: state.scaffoldCompletions,
      }),
    },
  ),
);

/** Move only legacy dismissals whose adjacent Auth record proves the owner. */
export async function migrateLegacyDismissalsForCurrentOwner(): Promise<void> {
  const accountId = getActiveAccountId();
  const ownerId = accountId ?? getGuestScope();
  const ownerRevision = accountId ? getAccountScopeRevision() : getGuestScopeRevision();
  try {
    const raw = await storage.getStringAsync('gurudevi-auth-storage');
    if (!raw) return;
    const decoded: unknown = JSON.parse(raw);
    if (!isRecord(decoded) || !isRecord(decoded.state)) return;
    const legacyState = decoded.state;
    if (!isRecord(legacyState.user) || legacyState.user.id !== ownerId) return;
    if (!accountId && !isGuestUserId(ownerId)) return;
    if (!Array.isArray(legacyState.dismissedSampleIds)) return;
    const migratedIds = legacyState.dismissedSampleIds.filter(
      (id): id is string => typeof id === 'string' && id.length > 0,
    );
    if (getActiveAccountId() !== accountId) return;
    if (!accountId && getGuestScope() !== ownerId) return;
    if (
      (accountId ? getAccountScopeRevision() : getGuestScopeRevision()) !== ownerRevision
    ) return;
    if (migratedIds.length === 0) return;
    useUIStore.setState((state) => ({
      dismissedSampleIds: [...new Set([...state.dismissedSampleIds, ...migratedIds])],
    }));
  } catch (error) {
    console.warn('[UIStore] Legacy sample dismissals could not be migrated.', error);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
