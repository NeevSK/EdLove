import { AuthContext } from '@repo/core/hooks/useAuth';
import { useAuthLifecycle } from '@repo/core/hooks/useAuthLifecycle';
import type React from 'react';
import type { ReactNode } from 'react';

export const AuthProvider: React.FC<{
  children: ReactNode;
  readLocalGuestId?: () => Promise<string | null>;
}> = ({ children, readLocalGuestId }) => {
  const authLifecycle = useAuthLifecycle(readLocalGuestId);

  return <AuthContext.Provider value={authLifecycle}>{children}</AuthContext.Provider>;
};
