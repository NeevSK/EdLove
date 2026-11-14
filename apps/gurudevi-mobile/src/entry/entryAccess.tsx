import { admitsAppRoutes, type RouteDecision } from '@repo/core/logic/auth/bootstrapRoutes';
import { checkInternalHref } from '@repo/core/routing/internalHref';
import { createContext, useContext } from 'react';

/** What the router may render, decided by the entry gate and enforced by `Stack.Protected`. */
export type EntryAccess = {
  /** The tabs and their modals may render. */
  readonly appRoutes: boolean;
  /** Where a refused app route goes instead: a checked in-app path. */
  readonly redirectTo: string;
};

// Until the gate decides, nothing is refused: it covers the screen while booting.
const EntryAccessContext = createContext<EntryAccess>({ appRoutes: true, redirectTo: '/welcome' });

export const EntryAccessProvider = EntryAccessContext.Provider;
export const useEntryAccess = () => useContext(EntryAccessContext);

/**
 * The access a route decision grants. A refused app route goes where the gate is already sending
 * the person, when that is a real in-app screen; otherwise to the entry step for the decision.
 */
export function entryAccessFor(decision: RouteDecision, redirectTo: string | null): EntryAccess {
  const fallback = decision === 'onboarding' ? '/onboarding' : '/welcome';
  const checked = redirectTo ? checkInternalHref(redirectTo, 'mobile') : null;
  return {
    appRoutes: admitsAppRoutes(decision),
    redirectTo: checked?.ok ? checked.href : fallback,
  };
}
