import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import { AssetsProvider } from './AssetsProvider';
import { AuthorityLifecycleProvider } from './AuthorityLifecycleProvider';

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
        <AuthorityLifecycleProvider>
          {children}
        </AuthorityLifecycleProvider>
      </AuthProvider>
    </AssetsProvider>
  );
};
