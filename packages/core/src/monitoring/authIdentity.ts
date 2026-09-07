import { identifyUser, resetUser } from './posthog';
import { clearSentryUser, setSentryUser } from './sentry';

export interface AuthMonitoringIdentity {
  id: string;
  email: string | null;
  displayName: string | null;
}

/** Keeps error reporting and product analytics bound to the same account. */
export function identifyAuthSubject({ id, email, displayName }: AuthMonitoringIdentity): void {
  setSentryUser({ id, email, username: displayName });
  identifyUser(id);
}

/** Removes cross-account telemetry identity at the auth boundary. */
export function clearAuthSubject(): void {
  clearSentryUser();
  resetUser();
}
