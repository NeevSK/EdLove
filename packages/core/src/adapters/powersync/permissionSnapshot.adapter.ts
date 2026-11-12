import { getDrizzleDB } from '@repo/core/adapters/powersync/database';
import { permissionSnapshots } from '@repo/core/adapters/powersync/schema';
import { verifySnapshotSignature } from '@repo/core/logic/permissions/signature.adapter';
import type {
  IPermissionSnapshotPort,
  PermissionSnapshotRead,
} from '@repo/core/logic/ports/permissionSnapshot.port';
import type { AppContractClient } from '@repo/core/api/v1/contract';
import { and, eq, sql } from 'drizzle-orm';

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

export type IssuedSnapshot = Awaited<ReturnType<AppContractClient['authority']['refreshSnapshot']>>;

/** Keeps the signed row on the device, so permissions survive a restart with no network. */
export async function storePermissionSnapshot(issued: IssuedSnapshot): Promise<void> {
  const db = getDrizzleDB();
  const id = `${issued.userId}:${issued.activeBondId}`;
  await db.transaction(async (tx) => {
    await tx.run(sql`delete from permission_snapshots where id = ${id}`);
    await tx.run(sql`insert into permission_snapshots
      (id, user_id, active_bond_id, active_entity_id, active_entity_type, school_id, policy_version,
       generated_at, expires_at, permissions, temporal_hints, signature)
      values (${id}, ${issued.userId}, ${issued.activeBondId}, ${issued.activeEntityId},
       ${issued.activeEntityType}, ${issued.schoolId}, ${issued.policyVersion}, ${issued.generatedAt},
       ${issued.expiresAt}, ${JSON.stringify(issued.permissions)}, ${JSON.stringify(issued.temporalHints)},
       ${issued.signature})`);
    await tx.run(sql`delete from policy_version where id = 'cedar'`);
    await tx.run(sql`insert into policy_version (id, hash, updated_at)
      values ('cedar', ${issued.policyVersion}, ${issued.generatedAt})`);
  });
}
