import {
  INITIAL_SYNC_STATUS,
  type SyncStatus,
  type SyncStatusEvent,
  reduceSyncStatus,
} from '@repo/core/logic/sync/syncStatus';
import { create } from 'zustand';

interface SyncStatusState {
  status: SyncStatus;
  dispatch: (event: SyncStatusEvent) => void;
  reset: () => void;
}

/** The sync picture for the active account. Fed by `syncStatus.coordinator`; read through `useSyncStatus`. */
export const useSyncStatusStore = create<SyncStatusState>((set) => ({
  status: INITIAL_SYNC_STATUS,
  dispatch: (event) => set((state) => ({ status: reduceSyncStatus(state.status, event) })),
  reset: () => set({ status: INITIAL_SYNC_STATUS }),
}));
