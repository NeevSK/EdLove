import { type QueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { SanctuaryShell } from '../../app/(sanctuary)/components/SanctuaryShell';
import { SkipLink } from '../../app/(sanctuary)/components/SkipLink';
import { unreadCount } from '../../app/(sanctuary)/notifications/notificationFeed';
import { LocaleProvider } from '../../lib/i18n/LocaleContext';
import { QueryProvider } from '../../lib/query/QueryProvider';
import { GurudeviWebVerger } from '../../lib/runtime/GurudeviWebVerger';
import { useSession } from '../surface/session';
import type { Sources } from '../surface/sources';

export interface RouterContext {
  readonly queryClient: QueryClient;
  readonly sources: Sources;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  loader: ({ context }) => context.queryClient.ensureQueryData(context.sources.notifications()),
  component: Root,
});

function Root() {
  return (
    <LocaleProvider>
      <GurudeviWebVerger>
        <QueryProvider>
          <SkipLink />
          <Frame />
        </QueryProvider>
      </GurudeviWebVerger>
    </LocaleProvider>
  );
}

/** One shell for every screen, mounted once, so moving between places keeps it in place. */
function Frame() {
  const { surface, displayName } = useSession();
  const { sources } = Route.useRouteContext();
  const { data: notifications } = useSuspenseQuery(sources.notifications());
  return (
    <SanctuaryShell
      displayName={displayName}
      navigationPrefix=""
      showAccountNavigation
      isExploreMode={surface === 'explore'}
      unreadNotifications={unreadCount(notifications)}
    >
      <Outlet />
    </SanctuaryShell>
  );
}
