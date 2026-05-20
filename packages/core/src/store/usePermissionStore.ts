import { eq } from 'drizzle-orm';
import { create } from 'zustand';
import { getDrizzleDB } from '../adapters/powersync/database';
import { permissionSnapshots } from '../adapters/powersync/schema';
import { verifySnapshotSignature } from '../logic/permissions/signature';

export interface PermissionState {
  permissionsMap: Record<string, Record<string, boolean>> | null;
  isLoading: boolean;
  error: string | null;
  loadPermissions: (userId: string) => Promise<void>;
  clearPermissions: () => void;
}

export const usePermissionStore = create<PermissionState>((set) => ({
  permissionsMap: null,
  isLoading: false,
  error: null,

  loadPermissions: async (userId: string) => {
    if (!userId) {
      set({ permissionsMap: null, error: 'No user ID provided', isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const db = getDrizzleDB();
      const snapshotRecord = await db.query.permissionSnapshots.findFirst({
        where: eq(permissionSnapshots.userId, userId),
      });

      if (!snapshotRecord) {
        set({ permissionsMap: null, isLoading: false });
        return;
      }

      // Cryptographic signature check
      const isSignatureValid = await verifySnapshotSignature(snapshotRecord);
      if (!isSignatureValid) {
        set({
          permissionsMap: null,
          error: 'Cryptographic tamper detected on permission snapshot',
          isLoading: false,
        });
        return;
      }

      // Expiration check
      const expiresAt = new Date(snapshotRecord.expiresAt);
      if (expiresAt < new Date()) {
        set({ permissionsMap: null, error: 'Permission snapshot has expired', isLoading: false });
        return;
      }

      const permissionsMap = JSON.parse(snapshotRecord.permissions) as Record<
        string,
        Record<string, boolean>
      >;
      set({ permissionsMap, isLoading: false });
    } catch (err) {
      console.error('[PermissionStore] Error loading permission snapshot:', err);
      set({
        permissionsMap: null,
        error: err instanceof Error ? err.message : String(err),
        isLoading: false,
      });
    }
  },

  clearPermissions: () => set({ permissionsMap: null, isLoading: false, error: null }),
}));
