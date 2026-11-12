import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { AuthFrame } from '../../../app/(sanctuary)/auth/AuthFrame';
import { safeReturnPath } from '../../../app/(sanctuary)/auth/routeSafety';
import { SignInFlow } from '../../../app/(sanctuary)/auth/SignInFlow';

export const Route = createFileRoute('/_account/sign-in')({
  validateSearch: z.object({
    returnTo: z.string().optional(),
    reason: z.literal('sign-out-incomplete').optional().catch(undefined),
    intent: z.enum(['signin', 'signup']).optional().catch(undefined),
    auth: z.literal('retry').optional().catch(undefined),
  }),
  component: SignInScreen,
});

function SignInScreen() {
  const { returnTo, reason, intent } = Route.useSearch();
  const isSignUp = intent === 'signup';
  return (
    <AuthFrame
      title={isSignUp ? 'Join Gurudevi Sanctuary' : 'Teach. Learn. Reflect.'}
      description={
        isSignUp
          ? 'Create your calm, secure personal sanctuary held safely on your device.'
          : 'Calm, private, and held safely on your device.'
      }
    >
      {reason === 'sign-out-incomplete' ? (
        <p role="alert">
          Sign-out could not be fully confirmed. Sign in again to review your sessions.
        </p>
      ) : null}
      <SignInFlow
        returnTo={safeReturnPath(returnTo ?? null)}
        intent={isSignUp ? 'signup' : 'signin'}
      />
    </AuthFrame>
  );
}
