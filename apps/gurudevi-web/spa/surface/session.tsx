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
  /** The capacity the person acts in now: the one a visitor chose to try, or the selected bond's. */
  readonly capacity: string;
  /** The capacity chosen at onboarding, anchored to the personal bond. */
  readonly primaryCapacity: string;
  /** How that capacity reads in the interface, e.g. "Teacher & Educator". */
  readonly roleLabel: string;
  /** The credential subject behind the account; on Explore and in a preview, the visitor's own id. */
  readonly authSubjectId: string;
  /** The bond the person is working in (a school, a class); none on Explore. */
  readonly activeScope?: Readonly<{
    bondId: string;
    entityId: string;
    entityType: string;
    roles: readonly string[];
  }>;
  /**
   * Other roles this person can switch to here. A visitor to Explore can try any of them; an account
   * changes role by changing bond, which is not offered from inside a page.
   */
  readonly roles?: Roles;
}

/** Roles a person can switch between without leaving the page. */
export type Roles = Readonly<{
  choices: readonly Readonly<{ capacity: string; label: string }>[];
  choose: (capacity: string) => void;
}>;

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
