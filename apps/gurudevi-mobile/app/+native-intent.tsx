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
 * - Rewrites vanity paths (/c/:code) to internal router canonical destinations
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

      case 'classroomInvite': {
        const targetPath = `/community?inviteCode=${encodeURIComponent(intent.inviteCode)}`;
        // Stash intent so that if the user is unauthenticated, SessionRouteGate
        // will automatically drain and navigate to this target after sign-in.
        pendingIntentStore.getState().setPendingIntent({
          targetPath,
          intentKind: 'classroomInvite',
          params: { inviteCode: intent.inviteCode },
          originalUrl: intent.url,
        });
        return targetPath;
      }

      case 'qr': {
        const payloadString = JSON.stringify(intent.payload);
        const targetPath = `/qr?payload=${encodeURIComponent(payloadString)}`;
        // Stash unauthenticated QR intent for post-auth resumption
        pendingIntentStore.getState().setPendingIntent({
          targetPath,
          intentKind: 'qr',
          params: { payload: payloadString },
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
