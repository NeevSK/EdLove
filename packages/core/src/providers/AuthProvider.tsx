import React, { createContext, useContext, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { useAuthorityLifecycle } from '../hooks/useAuthorityLifecycle';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  isProfileLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { session, loading, isProfileLoading, refreshProfile } = useAuthorityLifecycle();

  return (
    <AuthContext.Provider value={{ session, loading, isProfileLoading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
