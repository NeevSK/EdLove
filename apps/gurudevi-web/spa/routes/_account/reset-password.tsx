import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { AuthFrame } from '../../../app/(sanctuary)/auth/AuthFrame';
import { ResetPasswordForm } from '../../../app/(sanctuary)/auth/ResetPasswordForm';
import { safeReturnPath } from '../../../app/(sanctuary)/auth/routeSafety';

export const Route = createFileRoute('/_account/reset-password')({
  validateSearch: z.object({ returnTo: z.string().optional() }),
  component: ResetPasswordScreen,
});

function ResetPasswordScreen() {
  const { returnTo } = Route.useSearch();
  return (
    <AuthFrame
      title="Set a new password"
      description="Choose a new password for your Gurudevi account."
    >
      <ResetPasswordForm returnTo={safeReturnPath(returnTo ?? null)} />
    </AuthFrame>
  );
}
