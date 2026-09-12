import { AuthFrame } from '../auth/AuthFrame';
import { safeReturnPath } from '../auth/routeSafety';
import { RecoveryForm } from '../auth/RecoveryForm';

export const metadata = { title: 'Recover your account' };

export default async function RecoveryPage({ searchParams }: Readonly<{ searchParams: Promise<{ returnTo?: string }> }>) {
  const { returnTo } = await searchParams;
  return <AuthFrame description="We will send a recovery link to the email address on your account." title="Recover your account"><RecoveryForm returnTo={safeReturnPath(returnTo ?? null)} /></AuthFrame>;
}
