import Link from 'next/link';
import { AuthFrame } from '../auth/AuthFrame';
import { PasswordlessEntry } from '../auth/PasswordlessEntry';
import { safeReturnPath } from '../auth/routeSafety';
import { SignUpForm } from './SignUpForm';

export const metadata = { title: 'Sign up' };

export default async function SignUpPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ returnTo?: string }> }>) {
  const { returnTo } = await searchParams;
  // A new account always establishes its explicit capacity before entering a
  // requested destination. Existing accounts use the sign-in return path.
  const safeReturnTo = safeReturnPath(returnTo ?? '/onboarding');
  return (
    <AuthFrame
      description="Create an account to keep eligible work with you. You choose your capacity during the next step."
      title="Create your account"
    >
      <nav
        aria-label="Account entry choice"
        className="flex w-fit rounded-full border border-line p-1 font-sans text-sm font-semibold"
      >
        <Link
          className="rounded-full px-4 py-2 text-ink no-underline hover:bg-paper"
          href={`/sign-in?returnTo=${encodeURIComponent(safeReturnTo)}`}
        >
          Sign in
        </Link>
        <span aria-current="page" className="rounded-full bg-ink px-4 py-2 text-paper">
          Create account
        </span>
      </nav>
      <PasswordlessEntry returnTo={safeReturnTo} />
      <details className="mt-8 border-t border-line pt-5">
        <summary className="cursor-pointer font-sans text-sm font-semibold focus:outline-3 focus:outline-offset-4 focus:outline-water">
          Use a password instead
        </summary>
        <div className="mt-6">
          <SignUpForm returnTo={safeReturnTo} />
        </div>
      </details>
    </AuthFrame>
  );
}
