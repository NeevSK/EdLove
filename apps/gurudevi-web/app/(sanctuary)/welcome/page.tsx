import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { classifyGurudeviHost } from '../../../lib/host-routing';
import { resolveAuthorizedEntry } from '../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { WelcomeStage } from './WelcomeStage';

export const metadata = {
  title: 'Welcome | Gurudevi Sanctuary',
  description: 'A sanctuary for learning, reflection, and community.',
};

export default async function WelcomePage({
  searchParams,
}: {
  searchParams?: Promise<{
    mode?: string;
    surface?: string;
    returnTo?: string;
    dev?: string;
    role?: string;
    name?: string;
  }>;
}) {
  const params = await searchParams;
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') ?? '';
  const hostKind = classifyGurudeviHost(host);

  // R4: The host is the authoritative source of surface mode.
  // On the explore host, query params cannot elevate the surface to 'sanctuary'
  // — this would allow attacker-crafted URLs to present sanctuary UI on the
  // demo surface and confuse users about which surface they are on.
  const isExploreHost = hostKind === 'explore';

  const isSanctuaryReturn =
    !isExploreHost &&
    typeof params?.returnTo === 'string' &&
    (params.returnTo.startsWith('/workspace') ||
      params.returnTo.startsWith('/self') ||
      params.returnTo.startsWith('/community') ||
      params.returnTo.startsWith('/library') ||
      params.returnTo.startsWith('/notifications') ||
      params.returnTo.startsWith('/settings'));

  const surfaceMode =
    hostKind === 'sanctuary' ||
    // Only trust mode/surface params on non-explore hosts.
    (!isExploreHost && params?.mode === 'sanctuary') ||
    (!isExploreHost && params?.surface === 'sanctuary') ||
    isSanctuaryReturn
      ? 'sanctuary'
      : 'explore';

  // Check if already signed in — explore host has session cookies amputated by
  // the middleware so createServerSupabaseClient() will return null or find no session.
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const entry = await resolveAuthorizedEntry(supabase);
    if (entry.kind === 'ready') {
      redirect(params?.returnTo || '/self');
    }
    if (entry.kind === 'onboarding-required') {
      redirect('/onboarding');
    }
  }

  return <WelcomeStage mode={surfaceMode} returnTo={params?.returnTo} />;
}
