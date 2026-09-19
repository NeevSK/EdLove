import Link from 'next/link';
import { AuthFrame } from '../auth/AuthFrame';
import { PasswordlessEntry } from '../auth/PasswordlessEntry';
import { safeReturnPath } from '../auth/routeSafety';
import { SignInForm } from '../auth/SignInForm';

export const metadata = { title: 'Sign in' };

export default async function SignInPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ returnTo?: string }> }>) {
  const { returnTo } = await searchParams;
  const safeReturnTo = safeReturnPath(returnTo ?? null);
  return (
    <AuthFrame
      description="Use an existing account, or create one without leaving this entry path."
      title="Enter Gurudevi"
    >
      <nav
        aria-label="Account entry choice"
        className="flex w-fit rounded-full border border-line p-1 font-sans text-sm font-semibold"
      >
        <span aria-current="page" className="rounded-full bg-ink px-4 py-2 text-paper">
          Sign in
        </span>
        <Link
          className="rounded-full px-4 py-2 text-ink no-underline hover:bg-paper"
          href="/sign-up?returnTo=%2Fonboarding"
        >
          Create account
        </Link>
      </nav>
      <PasswordlessEntry returnTo={safeReturnTo} />
      <details className="mt-8 border-t border-line pt-5">
        <summary className="cursor-pointer font-sans text-sm font-semibold focus:outline-3 focus:outline-offset-4 focus:outline-water">
          Use a password instead
        </summary>
        <div className="mt-6">
          <SignInForm returnTo={safeReturnTo} />
        </div>
      </details>
    </AuthFrame>
  );
}
