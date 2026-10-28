import type { ReactNode } from 'react';
import { LegalNav } from './LegalNav';

export default function LegalLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="legal-shell">
      <LegalNav />
      {children}
    </div>
  );
}
