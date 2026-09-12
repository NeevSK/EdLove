import { AuthFrame } from '../auth/AuthFrame';
import { PasswordlessEntry } from '../auth/PasswordlessEntry';
import { safeReturnPath } from '../auth/routeSafety';
import { SignUpForm } from './SignUpForm';

export const metadata = { title: 'Sign up' };

export default async function SignUpPage({ searchParams }: Readonly<{ searchParams: Promise<{ returnTo?: string }> }>) {
  const { returnTo } = await searchParams;
  const safeReturnTo = safeReturnPath(returnTo ?? null);
  return (
    <AuthFrame description="Create a Gurudevi account with an email link or connected account. A password remains available if you prefer one." title="Sign up">
      <PasswordlessEntry returnTo={safeReturnTo} />
      <details className="mt-8 border-t border-line pt-5">
        <summary className="cursor-pointer font-sans text-sm font-semibold focus:outline-3 focus:outline-offset-4 focus:outline-water">Use a password instead</summary>
        <div className="mt-6"><SignUpForm returnTo={safeReturnTo} /></div>
      </details>
    </AuthFrame>
  );
}
