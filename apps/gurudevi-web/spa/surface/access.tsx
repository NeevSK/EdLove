import { createContext, type ReactNode, useContext } from 'react';
import type { Session } from './session';

/** Whether the person may enter the app, and as whom. Explore is always ready. */
export type Access =
  | Readonly<{ kind: 'loading' }>
  | Readonly<{ kind: 'ready'; session: Session }>
  | Readonly<{ kind: 'signed-out' }>
  | Readonly<{ kind: 'onboarding-required' }>
  | Readonly<{ kind: 'inactive'; message: string }>
  | Readonly<{ kind: 'unavailable'; message: string }>;

const AccessContext = createContext<Access | null>(null);

export function AccessScope({
  access,
  children,
}: {
  readonly access: Access;
  readonly children: ReactNode;
}) {
  return <AccessContext.Provider value={access}>{children}</AccessContext.Provider>;
}

export function useAccess(): Access {
  const access = useContext(AccessContext);
  if (!access) throw new Error('useAccess needs a surface above it');
  return access;
}
