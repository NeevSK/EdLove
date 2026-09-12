import { AuthFrame } from '../auth/AuthFrame';
import { safeReturnPath } from '../auth/routeSafety';
import { ResetPasswordForm } from '../auth/ResetPasswordForm';

export const metadata = { title: 'Set a new password' };

export default async function ResetPasswordPage({ searchParams }: Readonly<{ searchParams: Promise<{ returnTo?: string }> }>) {
  const { returnTo } = await searchParams;
  return <AuthFrame description="Choose a new password for your Gurudevi account." title="Set a new password"><ResetPasswordForm returnTo={safeReturnPath(returnTo ?? null)} /></AuthFrame>;
}
