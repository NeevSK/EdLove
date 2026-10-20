import type { ReactNode } from 'react';
import {
  generateOrganizationJsonLd,
  generateWebSiteJsonLd,
  JsonLdScript,
} from '@/lib/schema-org';
import { MarketingFooter } from './MarketingFooter';
import { MarketingHeader } from './MarketingHeader';

export default function MarketingLayout({ children }: Readonly<{ children: ReactNode }>) {
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
