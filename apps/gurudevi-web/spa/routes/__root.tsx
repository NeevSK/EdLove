import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, HeadContent, Outlet } from '@tanstack/react-router';
import { SkipLink } from '../../app/(sanctuary)/components/SkipLink';
import { PDPAConsentBanner } from '../../app/components/PDPAConsentBanner';
import { LocaleProvider } from '../../lib/i18n/LocaleContext';
import { GurudeviWebVerger } from '../../lib/runtime/GurudeviWebVerger';
import type { AccountHome, Commands, Sources } from '../surface/sources';

export interface RouterContext {
  readonly queryClient: QueryClient;
  readonly sources: Sources;
  readonly commands: Commands;
  readonly accountHome: AccountHome;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  // Each place names itself; a page that doesn't is simply "Gurudevi".
  head: () => ({ meta: [{ title: 'Gurudevi' }] }),
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
