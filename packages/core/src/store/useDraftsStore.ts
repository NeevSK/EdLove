import { persistStorage } from '@repo/core/effect/bindings/state';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface DraftEntry<T = unknown> {
  data: T;
  updatedAt: number;
}

export interface DraftsState {
  drafts: Record<string, DraftEntry>;
  setDraft: <T>(key: string, data: T) => void;
  getDraft: <T>(key: string) => T | null;
  clearDraft: (key: string) => void;
  clearAllDrafts: () => void;
}

/**
 * useDraftsStore: High-speed, MMKV-persisted draft store for Gurudevi.
 *
 * Prevents loss of user work (half-filled grade entries, reflections,
 * teacher notes, forms) across document tab switches, app closures, or crashes.
 */
export const useDraftsStore = create<DraftsState>()(
  persist(
    (set, get) => ({
      drafts: {},
      setDraft: (key, data) =>
        set((state) => ({
          drafts: {
            ...state.drafts,
            [key]: {
              data,
              updatedAt: Date.now(),
            },
          },
        })),
      getDraft: <T>(key: string): T | null => {
        const entry = get().drafts[key];
        return (entry?.data as T) ?? null;
      },
      clearDraft: (key) =>
        set((state) => {
          const next = { ...state.drafts };
          delete next[key];
          return { drafts: next };
        }),
      clearAllDrafts: () => set({ drafts: {} }),
    }),
    {
      name: 'gurudevi-drafts-storage',
      // The shape on the device today. Bump it, with a `migrate`, when the persisted shape changes.
      version: 0,
      storage: createJSONStorage(() => persistStorage),
    },
  ),
);
