import { AuthFrame } from '../auth/AuthFrame';
import styles from '../auth/auth.module.css';
import { PasswordlessEntry } from '../auth/PasswordlessEntry';
import { safeReturnPath } from '../auth/routeSafety';
import { SignUpForm } from './SignUpForm';

export const metadata = { title: 'Create account | Gurudevi Sanctuary' };

export default async function SignUpPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ returnTo?: string }> }>) {
  const { returnTo } = await searchParams;
  const safeReturnTo = safeReturnPath(returnTo ?? '/onboarding');

  return (
    <AuthFrame
      title="Create your account"
      description="Create an account to keep eligible work with you. You choose your capacity during the next step."
    >
      <PasswordlessEntry returnTo={safeReturnTo} />

      <details className={styles.disclosureDetails}>
        <summary className={styles.disclosureSummary}>
          Use a password instead
        </summary>
        <div style={{ marginTop: '16px' }}>
          <SignUpForm returnTo={safeReturnTo} />
        </div>
      </details>
    </AuthFrame>
  );
}
