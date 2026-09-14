import type { ReactNode } from 'react';
import { SanctuaryShell } from '../components/SanctuaryShell';

export default function ExploreLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <SanctuaryShell displayName="Explorer" navigationPrefix="/explore">
      {children}
    </SanctuaryShell>
  );
}
