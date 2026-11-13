import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, HeadContent, Outlet, redirect } from '@tanstack/react-router';
import { SkipLink } from '../../app/(sanctuary)/components/SkipLink';
import { PDPAConsentBanner } from '../../app/components/PDPAConsentBanner';
import { LocaleProvider } from '../../lib/i18n/LocaleContext';
import { GurudeviWebVerger } from '../../lib/runtime/GurudeviWebVerger';
import { ACCOUNT_PATHS, type AccountHome, type Commands, type Sources } from '../surface/sources';

export interface RouterContext {
  readonly queryClient: QueryClient;
  readonly sources: Sources;
  readonly commands: Commands;
  readonly accountHome: AccountHome;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  // Each place names itself; a page that doesn't is simply "Gurudevi".
  head: () => ({ meta: [{ title: 'Gurudevi' }] }),
  // Signing in and recovering an account happen where accounts live. On a surface without them
  // (Explore), the same address opens there, so a shared link works from either host.
  beforeLoad: ({ context, location }) => {
    const home = context.accountHome;
    if (home.kind === 'elsewhere' && ACCOUNT_PATHS.some((path) => path === location.pathname)) {
      throw redirect({ href: `${home.origin}${location.href}`, reloadDocument: true });
    }
  },
  component: () => (
    <LocaleProvider>
      <HeadContent />
      <GurudeviWebVerger>
        <SkipLink />
        <Outlet />
        <PDPAConsentBanner />
      </GurudeviWebVerger>
    </LocaleProvider>
  ),
});
