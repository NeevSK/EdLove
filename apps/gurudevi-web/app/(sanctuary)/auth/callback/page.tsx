import { redirect } from 'next/navigation';
import { safeReturnPath } from '../routeSafety';

export const metadata = { title: 'Confirming your account' };

export default async function CallbackPage({
  searchParams,
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const params = await searchParams;
  const complete = new URLSearchParams({
    next: safeReturnPath(typeof params.next === 'string' ? params.next : null),
    returnTo: safeReturnPath(typeof params.returnTo === 'string' ? params.returnTo : null),
  });
  for (const name of ['code', 'error']) {
    const value = params[name];
    if (typeof value === 'string') complete.set(name, value);
  }
  redirect(`/auth/complete?${complete.toString()}`);
}
