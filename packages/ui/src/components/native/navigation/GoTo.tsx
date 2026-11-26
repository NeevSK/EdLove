import { captureException } from '@repo/core/monitoring';
import { buildHref, checkInternalHref } from '@repo/core/routing/internalHref';
import { type Href, Redirect } from 'expo-router';
import type { Destination } from './navigator';

/**
 * Declarative navigation: renders expo-router's `<Redirect>` to a destination that has passed the
 * same check as `useNavigator` (typed against the route catalogue, then `checkInternalHref`). Use it
 * where a route decides during render that the person belongs elsewhere. A refused destination
 * renders nothing and is reported, rather than redirecting to an unmatched screen.
 */
export function GoTo({ href }: Readonly<{ href: Destination }>) {
  const raw = typeof href === 'string' ? href : buildHref(href.pathname, href.params);
  const checked = checkInternalHref(raw, 'mobile');
  if (!checked.ok) {
    captureException(new Error(`Redirect refused: ${checked.reason}`), {
      boundary: 'navigator',
      source: 'redirect',
      reason: checked.reason,
      path: checked.path,
    });
    return null;
  }
  return <Redirect href={checked.href as Href} />;
}
