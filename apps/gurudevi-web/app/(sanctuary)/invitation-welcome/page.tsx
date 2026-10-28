import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Classroom Invitation | Gurudevi Sanctuary',
  description: 'Join a learning sanctuary classroom on Gurudevi',
};

interface InvitationWelcomePageProps {
  searchParams?: Promise<{ code?: string; inviteCode?: string }>;
}

export default async function InvitationWelcomePage({
  searchParams,
}: InvitationWelcomePageProps = {}) {
  const resolved = searchParams ? await searchParams : {};
  const code = resolved.code || resolved.inviteCode;

  if (code) {
    const cleanCode = code.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32);
    redirect(`/c/${encodeURIComponent(cleanCode)}`);
  }

  redirect('/welcome');
}
