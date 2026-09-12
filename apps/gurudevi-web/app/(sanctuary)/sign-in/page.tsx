import { AuthFrame } from '../auth/AuthFrame';
import { PasswordlessEntry } from '../auth/PasswordlessEntry';
import { safeReturnPath } from '../auth/routeSafety';
import { SignInForm } from '../auth/SignInForm';

export const metadata = { title: 'Sign in' };

export default async function SignInPage({ searchParams }: Readonly<{ searchParams: Promise<{ returnTo?: string }> }>) {
  const { returnTo } = await searchParams;
  const safeReturnTo = safeReturnPath(returnTo ?? null);
  return (
    <AuthFrame description="Choose an email link or a connected account to enter the sanctuary." title="Sign in">
      <PasswordlessEntry returnTo={safeReturnTo} />
      <details className="mt-8 border-t border-line pt-5">
        <summary className="cursor-pointer font-sans text-sm font-semibold focus:outline-3 focus:outline-offset-4 focus:outline-water">Use a password instead</summary>
        <div className="mt-6"><SignInForm returnTo={safeReturnTo} /></div>
      </details>
    </AuthFrame>
  );
}
