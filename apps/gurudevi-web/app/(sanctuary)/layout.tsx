import type { ReactNode } from 'react';
import { AuthProvider } from './auth/AuthProvider';
import { SkipLink } from './components/SkipLink';

export default function SanctuaryLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AuthProvider>
      <SkipLink />
      {children}
    </AuthProvider>
  );
}
