import { headers } from 'next/headers';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { classifyGurudeviHost } from '@/lib/host-routing';
import { QueryProvider } from '@/lib/query/QueryProvider';
import { AuthProvider } from './auth/AuthProvider';
import { ExploreMuseumModal } from './components/ExploreMuseumModal';
import { SkipLink } from './components/SkipLink';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function SanctuaryLayout({ children }: Readonly<{ children: ReactNode }>) {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') ?? '';
  const isExploreHost = classifyGurudeviHost(host) === 'explore';

  if (isExploreHost) {
    return (
      <QueryProvider>
        <SkipLink />
        {children}
        <ExploreMuseumModal isExploreHost />
      </QueryProvider>
    );
  }

  return (
    <AuthProvider>
      <QueryProvider>
        <SkipLink />
        {children}
        <ExploreMuseumModal isExploreHost={false} />
      </QueryProvider>
    </AuthProvider>
  );
}
