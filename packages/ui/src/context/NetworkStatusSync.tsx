import NetInfo from '@react-native-community/netinfo';
import { useStore } from '@repo/core/store/useStore';
import { type ReactNode, useEffect } from 'react';

/**
 * Publishes whether the app is online to the core store (`isOnline`), which the network banner,
 * notifications and link handling read. It decides nothing about quality: verger does.
 */
export function NetworkStatusSync({ children }: { children: ReactNode }) {
  useEffect(
    () =>
      NetInfo.addEventListener((state) => {
        useStore.getState().setIsOnline(state.isConnected ?? false);
      }),
    [],
  );
  return <>{children}</>;
}
