import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { classifyGurudeviHost } from '@/lib/host-routing';
import {
  generateOrganizationJsonLd,
  generateWebSiteJsonLd,
  JsonLdScript,
} from '@/lib/schema-org';
import { MarketingFooter } from './MarketingFooter';
import { MarketingHeader } from './MarketingHeader';

export default async function MarketingLayout({ children }: Readonly<{ children: ReactNode }>) {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') ?? '';
  const hostKind = classifyGurudeviHost(host);

  // If accessed directly on an authenticated sanctuary, explore, or school host,
  // pass children through directly so the inner surface can render its own sovereign shell.
  if (hostKind === 'sanctuary' || hostKind === 'explore' || hostKind === 'school') {
    return <>{children}</>;
  }

  const orgJsonLd = generateOrganizationJsonLd();
  const websiteJsonLd = generateWebSiteJsonLd();

  return (
    <div className="landing-shell">
      <JsonLdScript data={orgJsonLd} />
      <JsonLdScript data={websiteJsonLd} />
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  );
}
