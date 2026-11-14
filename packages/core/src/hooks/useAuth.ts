import type { IdentityAvailability } from '@repo/core/logic/auth/identityState';
import type { AccountLifecycleStatus } from '@repo/core/logic/ports/auth.port';
import type { AuthSession } from '@repo/core/types/authSession';
import { createContext, useContext } from 'react';

export interface AuthContextType {
  session: AuthSession | null;
  loading: boolean;
  isProfileLoading: boolean;
  isProfileResolving: boolean;
  profileError: string | null;
  identityAvailability: IdentityAvailability;
  resolvedAuthSubjectId: string | null;
  accountLifecycleStatus: AccountLifecycleStatus | null;
  refreshProfile: () => Promise<void>;
}

/** Filled by AuthProvider with the auth lifecycle; read with useAuth. */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** The session and profile state that AuthProvider exposes. */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
