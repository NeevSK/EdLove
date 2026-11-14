import { create } from 'zustand';

/**
 * Rooms ask the shell to open its own sheets (the bond switcher, the join-with-a-code
 * dialog) instead of mounting second copies. The tabs layout listens and opens them.
 */
export type ShellSheet = 'perspectives' | 'invite';

interface ShellRequests {
  /** The sheet asked for, until the shell takes it. */
  asked: ShellSheet | null;
  ask: (sheet: ShellSheet) => void;
  take: () => ShellSheet | null;
}

export const useShellRequests = create<ShellRequests>((set, get) => ({
  asked: null,
  ask: (sheet) => set({ asked: sheet }),
  take: () => {
    const asked = get().asked;
    set({ asked: null });
    return asked;
  },
}));
