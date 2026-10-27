import { AuthFrame } from '../auth/AuthFrame';
import { safeReturnPath } from '../auth/routeSafety';
import { SignInFlow } from '../auth/SignInFlow';

export const metadata = { title: 'Sign in | Gurudevi Sanctuary' };

export default async function SignInPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ returnTo?: string; reason?: string }> }>) {
  const { returnTo, reason } = await searchParams;
  const safeReturnTo = safeReturnPath(returnTo ?? null);

  return (
    <AuthFrame
      title="Gurudevi: Sanctuary for Education"
      description="A calm, sovereign space to teach, learn, and grow. Everything is held safely on your device."
    >
      {reason === 'sign-out-incomplete' ? (
        <p role="alert">
          Sign-out could not be fully confirmed. Sign in again to review your sessions.
        </p>
      ) : null}
      <SignInFlow returnTo={safeReturnTo} />
    </AuthFrame>
  );
}
