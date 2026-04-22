import type React from 'react';
import { type ReactNode, useEffect } from 'react';
import { useAuth } from './AuthProvider';

/**
 * AuthorityLifecycleProvider: Orchestrates the high-level transitions
 * between Auth, Onboarding, and Main application states.
 */
export const AuthorityLifecycleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { session } = useAuth();

  useEffect(() => {
    // Safely log session state in development
    if (__DEV__ && session?.user?.id) {
      console.log('Authority lifecycle resolved for user:', session.user.id);
    }
  }, [session?.user?.id]);

  return <>{children}</>;
};
