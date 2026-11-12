import { GoTo } from '../surface/navigation';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router';
import { SanctuaryShell } from '../../app/(sanctuary)/components/SanctuaryShell';
import { unreadCount } from '../../app/(sanctuary)/notifications/notificationFeed';
import { useAccess } from '../surface/access';
import { type Session, SessionScope } from '../surface/session';

/** Every place inside Gurudevi: one shell, entered only when the surface says who is here. */
export const Route = createFileRoute('/_app')({
  loader: ({ context }) => context.queryClient.ensureQueryData(context.sources.notifications()),
  component: AppLayout,
});

function AppLayout() {
  const access = useAccess();
  const { href } = useLocation();
  switch (access.kind) {
    case 'loading':
      return <Waiting />;
    case 'signed-out':
      return <GoTo to="/welcome" returnTo={href} />;
    case 'onboarding-required':
      return <GoTo to="/onboarding" />;
    case 'inactive':
      return <GoTo to="/account-recovery" returnTo={href} />;
    case 'unavailable':
      return <Unavailable message={access.message} />;
    case 'ready':
      return (
        <SessionScope session={access.session}>
          <Frame session={access.session} />
        </SessionScope>
      );
  }
}

function Frame({ session }: { readonly session: Session }) {
  const { sources } = Route.useRouteContext();
  const { data: notifications } = useSuspenseQuery(sources.notifications());
  return (
    <SanctuaryShell
      displayName={session.displayName}
      navigationPrefix=""
      showAccountNavigation
      isExploreMode={session.surface === 'explore'}
      activeCapacity={session.surface === 'explore' ? undefined : session.capacity}
      unreadNotifications={unreadCount(notifications)}
    >
      <Outlet />
    </SanctuaryShell>
  );
}

function Waiting() {
  return (
    <main id="main-content" className="sanctuary-container" aria-busy="true">
      <p role="status">Opening your sanctuary…</p>
    </main>
  );
}

function Unavailable({ message }: { readonly message: string }) {
  return (
    <main id="main-content" className="sanctuary-container">
      <section aria-live="polite">
        <h1>Sanctuary is unavailable</h1>
        <p>{message}</p>
      </section>
    </main>
  );
}
