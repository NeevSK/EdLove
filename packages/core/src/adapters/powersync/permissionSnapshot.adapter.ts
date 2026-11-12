import { getDrizzleDB } from '@repo/core/adapters/powersync/database';
import { permissionSnapshots } from '@repo/core/adapters/powersync/schema';
import { verifySnapshotSignature } from '@repo/core/logic/permissions/signature.adapter';
import type {
  IPermissionSnapshotPort,
  PermissionSnapshotRead,
} from '@repo/core/logic/ports/permissionSnapshot.port';
import { and, eq } from 'drizzle-orm';

/** Reads and checks the signed permission snapshot from the local PowerSync database. */
export const powerSyncPermissionSnapshots: IPermissionSnapshotPort = {
  async read(userId, scopeId): Promise<PermissionSnapshotRead> {
    const db = getDrizzleDB();
    const record = await db.query.permissionSnapshots.findFirst({
      where: scopeId
        ? and(eq(permissionSnapshots.userId, userId), eq(permissionSnapshots.activeBondId, scopeId))
        : eq(permissionSnapshots.userId, userId),
    });
    if (!record) return { kind: 'missing' };
    if (record.userId !== userId) {
      return { kind: 'rejected', reason: 'Permission snapshot principal mismatch' };
    }
    if (scopeId && record.activeBondId !== scopeId) {
      return { kind: 'rejected', reason: 'Permission snapshot scope mismatch' };
    }

    const currentPolicyVersion = await db.query.policyVersion?.findFirst?.();
    const stale = scopeId
      ? !currentPolicyVersion?.hash ||
        !record.policyVersion ||
        record.policyVersion !== currentPolicyVersion.hash
      : Boolean(currentPolicyVersion?.hash) && record.policyVersion !== currentPolicyVersion?.hash;
    if (stale) return { kind: 'rejected', reason: 'Permission snapshot policy version is stale' };

    if (!(await verifySnapshotSignature(record))) {
      console.error('[PermissionSnapshot] Cryptographic tamper detected on permission snapshot');
      return { kind: 'rejected', reason: 'Cryptographic tamper detected on permission snapshot' };
    }

    const expiresAt = new Date(record.expiresAt).getTime();
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      return { kind: 'rejected', reason: 'Permission snapshot has expired' };
    }

    return {
      kind: 'valid',
      permissions: JSON.parse(record.permissions) as Record<string, Record<string, unknown>>,
      expiresAt,
      scopeId: scopeId ?? record.activeBondId ?? record.schoolId,
    };
  },
};
