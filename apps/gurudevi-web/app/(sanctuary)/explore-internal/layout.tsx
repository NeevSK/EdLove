import type { ReactNode } from 'react';
import { SanctuaryShell } from '../components/SanctuaryShell';

export default async function ExploreLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <SanctuaryShell displayName="Explorer" navigationPrefix="" showAccountNavigation={false}>
      {children}
    </SanctuaryShell>
  );
}
