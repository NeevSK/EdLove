import { headers } from 'next/headers';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { classifyGurudeviHost } from '@/lib/host-routing';
import { QueryProvider } from '@/lib/query/QueryProvider';
import { GurudeviWebVerger } from '@/lib/runtime/GurudeviWebVerger';
import { AuthProvider } from './auth/AuthProvider';
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

/**
 * Sanctuary Layout — surface-aware auth wiring.
 *
 * SECURITY INVARIANT (P1 — Proactive Guard):
 * The explore host MUST NOT receive <AuthProvider>. AuthProvider bootstraps the
 * Supabase browser client which reads session cookies. Even though the middleware
 * amputates sanctuary session cookies before the response reaches the browser,
 * defence-in-depth demands that the React tree also cannot accidentally trigger
 * Supabase auth flows on the demo surface.
 *
 * Rules:
 * - explore host: render children directly — no AuthProvider, no Supabase client init
 * - sanctuary / school host: wrap with AuthProvider as normal
 * - Never add a Supabase import or auth hook to a component that runs on explore
 *   without first confirming isExploreHost and gating behind it
 *
 * The middleware layer (proxy.ts) provides the first firewall (cookie amputation +
 * CSP blocking Supabase endpoints). This layout provides the second firewall
 * (no Supabase client instantiation in the React tree).
 */
export default async function SanctuaryLayout({ children }: Readonly<{ children: ReactNode }>) {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') ?? '';
  const isExploreHost = classifyGurudeviHost(host) === 'explore';

  if (isExploreHost) {
    return (
      <GurudeviWebVerger>
        <QueryProvider>
          <SkipLink />
          {children}
        </QueryProvider>
      </GurudeviWebVerger>
    );
  }

  return (
    <GurudeviWebVerger>
      <AuthProvider>
        <QueryProvider>
          <SkipLink />
          {children}
        </QueryProvider>
      </AuthProvider>
    </GurudeviWebVerger>
  );
}
