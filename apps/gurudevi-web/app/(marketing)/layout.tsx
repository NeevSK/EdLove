import type { ReactNode } from 'react';
import { MarketingFooter } from './MarketingFooter';
import { MarketingHeader } from './MarketingHeader';

export default function MarketingLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="landing-shell">
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  );
}
