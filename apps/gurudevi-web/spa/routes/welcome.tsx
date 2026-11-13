import { GoTo, ReturnTo } from '../surface/navigation';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { safeReturnPath } from '../../app/(sanctuary)/auth/routeSafety';
import { WelcomeStage } from '../../app/(sanctuary)/welcome/WelcomeStage';
import { useAccess } from '../surface/access';

export const Route = createFileRoute('/welcome')({
  head: () => ({ meta: [{ title: 'Welcome | Gurudevi Sanctuary' }] }),
  validateSearch: z.object({ returnTo: z.string().optional() }),
  component: WelcomeScreen,
});

function WelcomeScreen() {
  const { returnTo } = Route.useSearch();
  const access = useAccess();
  if (access.kind === 'ready' && access.session.surface === 'explore')
    return <WelcomeStage mode="explore" returnTo={returnTo} />;
  if (access.kind === 'ready') return <ReturnTo path={safeReturnPath(returnTo ?? null)} />;
  if (access.kind === 'onboarding-required') return <GoTo to="/onboarding" />;
  return <WelcomeStage mode="sanctuary" returnTo={returnTo} />;
}
