import {
  admitsAppRoutes,
  type AppEntryPath,
  type RouteDecision,
} from '@repo/core/logic/auth/bootstrapRoutes';
import { checkInternalHref } from '@repo/core/routing/internalHref';
import { createContext, useContext } from 'react';

/**
 * Multi-branch declarative access map decided by the entry gate and enforced by
 * Expo Router 58's `<Stack.Protected>` zones in `EntryStack`.
 */
export type EntryAccess = {
  readonly decision: RouteDecision;
  /** Zone 1: Public & Auth routes (`/welcome`, `/auth`). Open for public, booting, and guests upgrading. */
  readonly publicAuthRoutes: boolean;
  /** Zone 2: Account recovery (`/account-recovery`). Open for inactive accounts or public recovery. */
  readonly recoveryRoutes: boolean;
  /** Zone 3: Onboarding (`/onboarding`). Open when onboarding is needed or during guest onboarding. */
  readonly onboardingRoutes: boolean;
  /** Zone 4: Admitted app routes (`(tabs)`, `(modal)`, `APP_SCREENS`). Strictly `decision === 'app'`. */
  readonly appRoutes: boolean;
  /** Checked redirect when a refused app route bounces. */
  readonly redirectTo: string;
  /** Checked redirect when an admitted user is bounced out of public/onboarding/recovery. */
  readonly appEntryHref: string;
};

export type EntryAccessOptions = {
  readonly isGuestSession?: boolean;
  readonly guestOnboardingIntent?: boolean;
  readonly hasRememberedAccounts?: boolean;
  readonly appEntryPath?: AppEntryPath;
};

const EntryAccessContext = createContext<EntryAccess>({
  decision: 'booting',
  publicAuthRoutes: true,
  recoveryRoutes: false,
  onboardingRoutes: false,
  appRoutes: false,
  redirectTo: '/welcome',
  appEntryHref: '/self',
});

export const EntryAccessProvider = EntryAccessContext.Provider;
export const useEntryAccess = () => useContext(EntryAccessContext);

/**
 * Resolves the 5-zone `Stack.Protected` access map from the authoritative route decision.
 */
export function entryAccessFor(
  decision: RouteDecision,
  redirectTo: string | null,
  options: EntryAccessOptions = {},
): EntryAccess {
  const publicFallback = options.hasRememberedAccounts ? '/auth' : '/welcome';
  const fallback =
    decision === 'onboarding'
      ? '/onboarding'
      : decision === 'inactive-account'
        ? '/account-recovery'
        : publicFallback;
  const checked = redirectTo ? checkInternalHref(redirectTo, 'mobile') : null;
  const appEntry = checkInternalHref(options.appEntryPath ?? '/self', 'mobile');
  const appEntryHref = appEntry.ok ? appEntry.href : '/self';

  return {
    decision,
    publicAuthRoutes:
      decision === 'public' ||
      decision === 'booting' ||
      (decision === 'app' && Boolean(options.isGuestSession)),
    recoveryRoutes: decision === 'inactive-account' || decision === 'public',
    // Onboarding is strictly post-auth / post-guest-activation, never a standalone public route.
    onboardingRoutes: decision === 'onboarding',
    appRoutes: admitsAppRoutes(decision),
    redirectTo: checked?.ok ? checked.href : fallback,
    appEntryHref,
  };
}
