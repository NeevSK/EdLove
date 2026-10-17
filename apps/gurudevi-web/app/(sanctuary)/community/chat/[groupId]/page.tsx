import Link from 'next/link';
import type { ReactNode } from 'react';
import { resolveAuthorizedEntry } from '../../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../../lib/supabase/server';
import { signInPath } from '../../../auth/routeSafety';
import { SanctuaryShell } from '../../../components/SanctuaryShell';
import { GroupChatFloor } from './GroupChatFloor';

export const metadata = { title: 'Discussion Circle | Gurudevi Sanctuary' };

interface GroupChatPageProps {
  params: Promise<{ groupId: string }>;
}

export default async function GroupChatPage({ params }: GroupChatPageProps) {
  const { groupId } = await params;
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <ChatState
        displayName="Explorer"
        title="Discussion circles are unavailable"
        detail="Browser sign-in is not configured in this environment."
      />
    );
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    return (
      <ChatState
        action={<Link href={signInPath(`/community/chat/${groupId}`)}>Sign in</Link>}
        displayName="Explorer"
        detail="Sign in to participate in classroom discussion circles."
        title="Discussion circles are private"
      />
    );
  }

  if (entry.kind === 'onboarding-required') {
    return (
      <ChatState
        displayName="Explorer"
        title="Complete enrollment first"
        detail="Finish onboarding before accessing discussion circles."
      />
    );
  }

  if (entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <ChatState
        displayName="Explorer"
        title="Discussion circles are unavailable"
        detail={entry.message}
      />
    );
  }

  return (
    <SanctuaryShell
      displayName={entry.displayName}
      navigationPrefix=""
      activeCapacity={entry.activeCapacity}
    >
      <GroupChatFloor
        groupId={groupId}
        displayName={entry.displayName}
        capacity={entry.activeCapacity}
      />
    </SanctuaryShell>
  );
}

function ChatState({
  title,
  detail,
  action,
  displayName,
}: Readonly<{
  title: string;
  detail: string;
  action?: ReactNode;
  displayName: string;
}>) {
  return (
    <SanctuaryShell displayName={displayName} navigationPrefix="">
      <div style={{ maxWidth: '40rem', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
        <h2
          style={{
            fontFamily: 'var(--font-display, "Fraunces", serif)',
            fontSize: '1.5rem',
            color: 'var(--color-ink, #131e27)',
          }}
        >
          {title}
        </h2>
        <p
          style={{ color: 'var(--color-ink-soft, #453c35)', marginTop: '0.5rem', lineHeight: 1.5 }}
        >
          {detail}
        </p>
        {action && <div style={{ marginTop: '1.5rem' }}>{action}</div>}
      </div>
    </SanctuaryShell>
  );
}
