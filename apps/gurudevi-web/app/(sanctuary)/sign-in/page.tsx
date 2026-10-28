import { AuthFrame } from '../auth/AuthFrame';
import { safeReturnPath } from '../auth/routeSafety';
import { SignInFlow } from '../auth/SignInFlow';

export const metadata = { title: 'Sign in | Gurudevi Sanctuary' };

export default async function SignInPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ returnTo?: string; reason?: string; intent?: string }>;
}>) {
  const { returnTo, reason, intent } = await searchParams;
  const safeReturnTo = safeReturnPath(returnTo ?? null);
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
      <SignInFlow returnTo={safeReturnTo} intent={isSignUp ? 'signup' : 'signin'} />
    </AuthFrame>
  );
}
