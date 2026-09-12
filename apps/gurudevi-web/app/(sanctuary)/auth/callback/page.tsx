import { AuthFrame } from '../AuthFrame';
import { CallbackHandler } from '../CallbackHandler';
import { safeReturnPath } from '../routeSafety';

export const metadata = { title: 'Confirming your account' };

export default async function CallbackPage({ searchParams }: Readonly<{ searchParams: Promise<{ next?: string; returnTo?: string }> }>) {
  const { next, returnTo } = await searchParams;
  return <AuthFrame description="Please keep this page open while we confirm your account link." title="One moment"><CallbackHandler next={safeReturnPath(next ?? null)} returnTo={safeReturnPath(returnTo ?? null)} /></AuthFrame>;
}
