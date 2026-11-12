import { createContext, type ReactNode, useContext } from 'react';

/**
 * Who is here, as every screen sees it. Explore and sanctuary run the same screens; they differ in
 * where this comes from (a visitor's chosen persona on the device, or a signed-in account) and in
 * where data is stored and sent.
 */
export interface Session {
  readonly surface: 'explore' | 'sanctuary';
  readonly accountId: string;
  readonly displayName: string;
  /** The capacity the person acts in: the one a visitor chose to try, or the account's own. */
  readonly capacity: string;
  /** How that capacity reads in the interface, e.g. "Teacher & Educator". */
  readonly roleLabel: string;
}

const SessionContext = createContext<Session | null>(null);

export function SessionScope({
  session,
  children,
}: {
  readonly session: Session;
  readonly children: ReactNode;
}) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession needs a session provider above it');
  return session;
}
