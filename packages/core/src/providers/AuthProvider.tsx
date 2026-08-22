import type { Session } from '@supabase/supabase-js';
import type React from 'react';
import { createContext, type ReactNode, useContext } from 'react';
import { useAuthLifecycle } from '@repo/core/hooks/useAuthLifecycle';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  isProfileLoading: boolean;
  isProfileResolving: boolean;
  profileError: string | null;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const authLifecycle = useAuthLifecycle();

  return <AuthContext.Provider value={authLifecycle}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
