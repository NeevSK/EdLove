'use client';

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { type BrowserAuthRuntime, type BrowserSession, browserAuthRuntime } from './browserAuth';
import { sanctuarySignOut } from '@/lib/sanctuary/signOut';

type AuthState = Readonly<{
  status: 'loading' | 'authenticated' | 'signed-out' | 'unavailable';
  session: BrowserSession | null;
  error: Error | null;
}>;

const AuthContext = createContext<Readonly<{
  state: AuthState;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}> | null>(null);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [state, setState] = useState<AuthState>({ status: 'loading', session: null, error: null });
  const [runtime, setRuntime] = useState<BrowserAuthRuntime | null>(null);

  useEffect(() => {
    const rt = browserAuthRuntime();
    setRuntime(rt);
    if (!rt) {
      setState({ status: 'unavailable', session: null, error: new Error('Auth not configured') });
      return;
    }
    rt.bootstrapIdentity().then((result) => {
      if (result.status === 'authenticated') {
        setState({ status: 'authenticated', session: result.session, error: null });
      } else if (result.status === 'signed-out') {
        setState({ status: 'signed-out', session: null, error: null });
      } else {
        setState({ status: 'unavailable', session: null, error: result.error });
      }
    });
  }, []);

  const refresh = async () => {
    if (!runtime) return;
    const result = await runtime.bootstrapIdentity();
    if (result.status === 'authenticated') {
      setState({ status: 'authenticated', session: result.session, error: null });
    } else if (result.status === 'signed-out') {
      setState({ status: 'signed-out', session: null, error: null });
    } else {
      setState({ status: 'unavailable', session: null, error: result.error });
    }
  };

  const signOut = async () => {
    try {
      await sanctuarySignOut();
    } catch {
      if (runtime) {
        await runtime.client.auth.signOut({ scope: 'local' }).catch(() => {});
      }
    }
    setState({ status: 'signed-out', session: null, error: null });
  };

  return (
    <AuthContext.Provider value={{ state, refresh, signOut }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
