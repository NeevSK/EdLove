import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { createUISlice, type UISlice } from '@repo/core/store/slices/ui.slice';

/**
 * useUIStore: Sovereign store for UI state, themes, and global notifications.
 */
export const useUIStore = create<UISlice>()(
  persist(
    (...a) => ({
      ...createUISlice(...a),
    }),
    {
      name: 'gurudevi-ui-storage',
      storage: createJSONStorage(() => SafeZustandStorage),
      partialize: (state) => ({
        theme: state.theme,
        themeMode: state.themeMode,
        dismissedSampleIds: state.dismissedSampleIds,
        deskItems: state.deskItems,
      }),
    },
  ),
);
