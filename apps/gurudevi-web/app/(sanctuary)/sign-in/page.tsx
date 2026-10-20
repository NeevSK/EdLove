import { AuthFrame } from '../auth/AuthFrame';
import { safeReturnPath } from '../auth/routeSafety';
import { SignInFlow } from '../auth/SignInFlow';

export const metadata = { title: 'Sign in | Gurudevi Sanctuary' };

export default async function SignInPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ returnTo?: string }> }>) {
  const { returnTo } = await searchParams;
  const safeReturnTo = safeReturnPath(returnTo ?? null);

  return (
    <AuthFrame
      title="Gurudevi: Sanctuary for Education"
      description="A calm, sovereign space to teach, learn, and grow. Everything is held safely on your device."
    >
      <SignInFlow returnTo={safeReturnTo} />
    </AuthFrame>
  );
}
