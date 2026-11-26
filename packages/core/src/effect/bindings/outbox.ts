import { isReplayPrincipalCurrent } from '@repo/core/lib/sync/replayIdentity.adapter';
import { leaveBreadcrumb } from '@repo/core/monitoring/breadcrumbs';

/**
 * Platform pieces the outbox drain (lib/sync/useOutboxReplay.ts) needs: whether the queued
 * command's account is still the signed-in one, and the breadcrumb trail for telemetry.
 */
export const outboxPlatform = {
  isReplayPrincipalCurrent: (principalId: string): Promise<boolean> => isReplayPrincipalCurrent(principalId),
  leaveBreadcrumb: (...args: Parameters<typeof leaveBreadcrumb>): void => leaveBreadcrumb(...args),
};
