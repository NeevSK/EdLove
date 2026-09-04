import { AssetsProvider } from '@repo/core/providers/AssetsProvider';
import { AuthorityLifecycleProvider } from '@repo/core/providers/AuthorityLifecycleProvider';
import { AuthProvider } from '@repo/core/providers/AuthProvider';
import type React from 'react';
import type { ReactNode } from 'react';

interface GlobalProviderProps {
  children: ReactNode;
}

/**
 * GlobalProvider component that wraps the application with all necessary core providers.
 *
 * Hierarchy:
 * 1. AssetsProvider: Standard assets and resources.
 * 2. AuthProvider: Auth session context.
 * 3. AuthorityLifecycleProvider: POA lifecycle orchestration (requires AuthContext).
 */
export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  return (
    <AssetsProvider>
      <AuthProvider>
        <AuthorityLifecycleProvider>{children}</AuthorityLifecycleProvider>
      </AuthProvider>
    </AssetsProvider>
  );
};
