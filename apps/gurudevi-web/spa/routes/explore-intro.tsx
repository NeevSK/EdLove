import { createFileRoute, redirect } from '@tanstack/react-router';
import { resolveSurfaceUrl } from '../../lib/surface-urls';

/** The introduction to Explore opens on Explore's Self floor, from either host. */
export const Route = createFileRoute('/explore-intro')({
  head: () => ({ meta: [{ title: 'A quick introduction to Explore | Gurudevi' }] }),
  beforeLoad: () => {
    throw redirect({ href: resolveSurfaceUrl('explore', '/self'), reloadDocument: true });
  },
});
