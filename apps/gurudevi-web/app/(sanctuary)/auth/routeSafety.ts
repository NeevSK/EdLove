import { normalizeAcceptedInternalRoute } from '@repo/core/logic/deeplink/deepLinkPolicyPipeline';
import { checkInternalHref } from '@repo/core/routing/internalHref';

const sanctuaryPath = '/self';

export function safeReturnPath(candidate: string | null): string {
  if (!candidate) return sanctuaryPath;
  try {
    const origin = 'https://gurudevi.invalid';
    const destination = new URL(candidate, origin);
    if (destination.origin !== origin || !destination.pathname.startsWith('/')) {
      return sanctuaryPath;
    }
    const fullPath = `${destination.pathname}${destination.search}${destination.hash}`;
    const normalized = normalizeAcceptedInternalRoute(destination.pathname);
    if (!normalized) return sanctuaryPath;
    // Allowed by the deep-link allowlist, and a page that exists: the floor every destination passes.
    return checkInternalHref(fullPath, 'web').ok ? fullPath : sanctuaryPath;
  } catch {
    return sanctuaryPath;
  }
}

export function signInPath(returnPath = sanctuaryPath): string {
  return `/sign-in?returnTo=${encodeURIComponent(safeReturnPath(returnPath))}`;
}
