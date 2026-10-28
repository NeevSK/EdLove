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
  const surfaceMode =
    hostKind === 'sanctuary' || params?.mode === 'sanctuary' || params?.surface === 'sanctuary'
      ? 'sanctuary'
      : 'explore';

  // Check if already signed in
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
