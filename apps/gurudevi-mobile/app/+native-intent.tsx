import { classifyRouteIntent, pendingIntentStore } from '@repo/core/logic';

/**
 * Expo Router Native Intent Middleware (+native-intent.tsx)
 *
 * Single authoritative ingress for all incoming system deep links,
 * Universal Links, and external intents in Gurudevi Mobile.
 *
 * Security:
 * - Sanitizes hostile payloads (path traversal, control chars, overlong URLs)
 * - Preserves unauthenticated intents in pendingIntentStore with 15-min TTL
 * - Retired invitation and QR intents fail closed without creating pending work
 */
export async function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}): Promise<string> {
  try {
    const intent = classifyRouteIntent(path);

    switch (intent.kind) {
      case 'authCallback': {
        const parsed = new URL(intent.url);
        const search = parsed.searchParams.toString();
        return search ? `/auth/callback?${search}` : '/auth/callback';
      }

      case 'internalRoute': {
        const targetPath = intent.path;
        if (targetPath.startsWith('/pulse')) {
          // Immediately awaken the Somatic Sanctuary Space without gating
          try {
            const { useUIStore } = await import('@repo/core/store');
            useUIStore.getState().setBreathingOpen(true);
          } catch {
            // Safe fallback
          }
          return '/pulse';
        }

        // Stash internal intent so that if the user is unauthenticated, SessionRouteGate
        // will automatically drain and navigate to this target after sign-in.
        pendingIntentStore.getState().setPendingIntent({
          targetPath,
          intentKind: 'generic',
          params: { path: targetPath },
          originalUrl: intent.url,
        });
        return targetPath;
      }

      case 'unsupported':
      case 'rejected':
      default:
        // Fail closed: route to default entry point without executing unvalidated paths
        return '/';
    }
  } catch (error) {
    console.warn('[+native-intent] Failed to classify incoming system intent:', error);
    return '/';
  }
}
