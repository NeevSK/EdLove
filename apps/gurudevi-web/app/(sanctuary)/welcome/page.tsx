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

export default async function WelcomePage() {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') ?? '';
  const hostKind = classifyGurudeviHost(host);

  if (hostKind === 'explore') {
    return <WelcomeStage mode="explore" />;
  }

  // On Sanctuary host: check if already signed in
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return <WelcomeStage mode="sanctuary" />;
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'ready') {
    // If user is already ready, redirect them to their sanctuary
    redirect('/self');
  }

  if (entry.kind === 'onboarding-required') {
    redirect('/onboarding');
  }

  return <WelcomeStage mode="sanctuary" />;
}
