import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { AuthFrame } from '../../../app/(sanctuary)/auth/AuthFrame';
import { RecoveryForm } from '../../../app/(sanctuary)/auth/RecoveryForm';
import { safeReturnPath } from '../../../app/(sanctuary)/auth/routeSafety';

export const Route = createFileRoute('/_account/recovery')({
  head: () => ({ meta: [{ title: 'Recover your account' }] }),
  validateSearch: z.object({ returnTo: z.string().optional() }),
  component: RecoveryScreen,
});

function RecoveryScreen() {
  const { returnTo } = Route.useSearch();
  return (
    <AuthFrame
      title="Recover your account"
      description="We will send a recovery link to the email address on your account."
    >
      <RecoveryForm returnTo={safeReturnPath(returnTo ?? null)} />
    </AuthFrame>
  );
}
