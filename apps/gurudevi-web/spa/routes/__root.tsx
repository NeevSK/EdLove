import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { SkipLink } from '../../app/(sanctuary)/components/SkipLink';
import { LocaleProvider } from '../../lib/i18n/LocaleContext';
import { GurudeviWebVerger } from '../../lib/runtime/GurudeviWebVerger';
import type { Roles } from '../surface/session';
import type { AccountHome, Sources } from '../surface/sources';

export interface RouterContext {
  readonly queryClient: QueryClient;
  readonly sources: Sources;
  readonly accountHome: AccountHome;
  /** Roles anyone can switch to here (Explore's personas); none for accounts. */
  readonly roles: Roles | undefined;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <LocaleProvider>
      <GurudeviWebVerger>
        <SkipLink />
        <Outlet />
      </GurudeviWebVerger>
    </LocaleProvider>
  ),
});
