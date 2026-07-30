import { v7 as uuidv7 } from 'uuid';
import { useStore } from '@repo/core/store/useStore';
import { generateIdempotencyKey } from '@repo/core/lib/sync/idempotency';
import { useMutationAuditLog } from '@repo/core/lib/sync/MutationAuditLog';
import type { QueuedMutation } from '@repo/core/lib/sync/types';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';

export const DEVICE_SECURITY_SCOPE = 'device_security';

export const DEVICE_SECURITY_MUTATIONS = {
  auditEvent: 'logDeviceAuditEvent',
  unlinkDevice: 'unlinkDevice',
  revokeSession: 'revokeSecuritySession',
  revokeOtherSessions: 'revokeOtherSecuritySessions',
  revokeCurrentInstallSessions: 'revokeCurrentInstallSecuritySessions',
} as const;

export type DeviceSecurityMutationName =
  (typeof DEVICE_SECURITY_MUTATIONS)[keyof typeof DEVICE_SECURITY_MUTATIONS];

function getUserIdSalt() {
  return useStore.getState().user?.id;
}

export async function queueDeviceSecurityIntent(
  name: DeviceSecurityMutationName,
  variables: QueuedMutation['variables'],
) {
  const mutationId = uuidv7();
  const idempotencyKey = await generateIdempotencyKey(
    DEVICE_SECURITY_SCOPE,
    name,
    variables,
    getUserIdSalt(),
  );

  useMutationAuditLog.getState().logEntry({
    id: mutationId,
    idempotencyKey,
    scope: DEVICE_SECURITY_SCOPE,
    name,
    status: 'queued',
    attempts: 0,
    queuedAt: Date.now(),
  });

  await useMutationQueue.getState().addToQueue({
    name,
    scope: DEVICE_SECURITY_SCOPE,
    variables: {
      ...variables,
      idempotencyKey,
    },
    type: 'CUSTOM',
  });

  return {
    mutationId,
    idempotencyKey,
  };
}

export function isOfflineLikeError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return (
    message.includes('OFFLINE_QUEUE') ||
    message.includes('Network request failed') ||
    message.includes('Failed to fetch')
  );
}

export function isQueuedDeviceSecurityMutation(mutation: QueuedMutation) {
  return mutation.scope === DEVICE_SECURITY_SCOPE;
}
