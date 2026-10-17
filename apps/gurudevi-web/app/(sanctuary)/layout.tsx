import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import { classifyGurudeviHost } from '@/lib/host-routing';
import { AuthProvider } from './auth/AuthProvider';
import { SkipLink } from './components/SkipLink';

export default async function SanctuaryLayout({ children }: Readonly<{ children: ReactNode }>) {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') ?? '';

  if (classifyGurudeviHost(host) === 'explore') {
    return (
      <>
        <SkipLink />
        {children}
      </>
    );
  }

  return (
    <AuthProvider>
      <SkipLink />
      {children}
    </AuthProvider>
  );
}
