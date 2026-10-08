import type { ReactNode } from 'react';

/**
 * DeepLinkProvider
 *
 * Decommissioned redundant OS listeners in favor of Expo Router's canonical
 * `app/+native-intent.tsx` middleware and `pendingIntentStore` / `SessionRouteGate.tsx`.
 *
 * Eliminates the dual-brain race condition where both Expo Router and DeepLinkProvider
 * simultaneously intercepted system deep links, universal links, and cold starts.
 *
 * Retained as a transparent shell component in EntryShell to preserve
 * tree topology without registering duplicate background listeners.
 */
export function DeepLinkProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
