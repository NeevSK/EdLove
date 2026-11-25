import { usePathname } from 'expo-router';
import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';
import { type BootstrapRouteState, useBootstrapRouteState } from '@/entry/bootstrapRouteState';

/**
 * Single authoritative provider for mobile bootstrap session state.
 *
 * Mounted once above `SessionRouteGate` inside `EntryShell` (under `GurudeviVerger`
 * and `GlobalProvider`) so local guest restoration, remembered-account detection,
 * and session/scope resolution run once instead of re-executing in every screen.
 */
export const BootstrapSessionContext = createContext<BootstrapRouteState | null>(null);
const RefreshLocalGuestContext = createContext<() => void>(() => {});

export function BootstrapSessionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [guestRefreshNonce, setGuestRefreshNonce] = useState(0);
  const refreshLocalGuest = useCallback(() => {
    setGuestRefreshNonce((n) => n + 1);
  }, []);
  const routeState = useBootstrapRouteState(pathname, guestRefreshNonce);
  return (
    <RefreshLocalGuestContext.Provider value={refreshLocalGuest}>
      <BootstrapSessionContext.Provider value={routeState}>
        {children}
      </BootstrapSessionContext.Provider>
    </RefreshLocalGuestContext.Provider>
  );
}

/**
 * Read-only accessor for the shared bootstrap session state.
 * Screens (`/welcome`, `/onboarding`, etc.) must use this instead of calling
 * `useBootstrapRouteState()` directly.
 */
export function useBootstrapSession(): BootstrapRouteState {
  const context = useContext(BootstrapSessionContext);
  if (!context) {
    throw new Error('useBootstrapSession must be used within BootstrapSessionProvider');
  }
  return context;
}

/**
 * Signals `BootstrapSessionProvider` to re-read persisted local guest state
 * after a screen mutates it (e.g. creating a guest session or completing guest onboarding).
 */
export function useRefreshLocalGuest(): () => void {
  return useContext(RefreshLocalGuestContext);
}
