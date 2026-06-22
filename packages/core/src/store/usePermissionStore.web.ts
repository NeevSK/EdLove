import { create } from 'zustand';

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

  loadPermissions: async (_userId: string) => {
    set({
      permissionsMap: null,
      isLoading: false,
      error: null,
    });
  },

  clearPermissions: () => set({ permissionsMap: null, isLoading: false, error: null }),
}));
