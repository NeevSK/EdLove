import { executeDatabaseCommand, queryDatabaseRows } from '@repo/database/client';
import { generateSnapshot, type PermissionSnapshot } from '@repo/policies';

type SnapshotDb = {
  bond: {
    findFirst(args: unknown): Promise<any>;
  };
  user: {
    findUnique(args: unknown): Promise<any>;
  };
};

type SnapshotInput = {
  db: SnapshotDb | null | undefined;
  userId: string;
  activeBondId: string | null;
  secret: string | undefined;
};

/**
 * Builds and persists the only offline authorization artifact the client may
 * consume. All identity, capacity, school, and policy-version inputs come
 * from authoritative server sources.
 */
export async function refreshPermissionSnapshot({
  db,
  userId,
  activeBondId,
  secret,
}: SnapshotInput): Promise<PermissionSnapshot> {
  if (!db || !userId || userId === 'anonymous') {
    throw new Error('PermissionSnapshotRequiresAuthenticatedUser');
  }
  if (!activeBondId) {
    throw new Error('PermissionSnapshotRequiresActiveBond');
  }
  if (!secret) {
    throw new Error('SnapshotSigningKeyNotConfigured');
  }

  const [user, activeBond, policyRows] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        grade_id: true,
        section_id: true,
        child_student_ids: true,
      },
    }),
    db.bond.findFirst({
      where: { id: activeBondId, user_id: userId },
      select: { id: true, capacity: true, entity_id: true, entity_type: true },
    }),
    queryDatabaseRows<{ hash: string }>(
      'SELECT hash FROM public.policy_version ORDER BY updated_at DESC LIMIT 1',
    ),
  ]);

  if (!user || !activeBond || !activeBond.entity_id) {
    throw new Error('PermissionSnapshotScopeNotFound');
  }
  const policyVersion = policyRows[0]?.hash;
  if (!policyVersion) {
    throw new Error('PolicyVersionNotConfigured');
  }

  const schoolId = activeBond.entity_type === 'SCHOOL' ? activeBond.entity_id : undefined;
  const snapshot = generateSnapshot(
    {
      id: userId,
      school_id: schoolId,
      capacity: activeBond.capacity,
      active_bond_id: activeBond.id,
      active_entity_id: activeBond.entity_id,
      active_entity_type: activeBond.entity_type,
      policy_version: policyVersion,
      grade_id: user?.grade_id ?? undefined,
      section_id: user?.section_id ?? undefined,
      child_student_ids: Array.isArray(user?.child_student_ids) ? user.child_student_ids : [],
    },
    secret,
  );

  await executeDatabaseCommand(
    `INSERT INTO public.permission_snapshots
      (id, user_id, active_bond_id, active_entity_id, active_entity_type, school_id, policy_version, generated_at,
       expires_at, permissions, temporal_hints, signature)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12)
     ON CONFLICT (id) DO UPDATE SET
       active_entity_id = EXCLUDED.active_entity_id,
       active_entity_type = EXCLUDED.active_entity_type,
       school_id = EXCLUDED.school_id,
       policy_version = EXCLUDED.policy_version,
       generated_at = EXCLUDED.generated_at,
       expires_at = EXCLUDED.expires_at,
       permissions = EXCLUDED.permissions,
       temporal_hints = EXCLUDED.temporal_hints,
       signature = EXCLUDED.signature`,
    [
      `${snapshot.userId}:${snapshot.activeBondId}`,
      snapshot.userId,
      snapshot.activeBondId,
      snapshot.activeEntityId,
      snapshot.activeEntityType,
      snapshot.schoolId,
      snapshot.policyVersion,
      snapshot.generatedAt,
      snapshot.expiresAt,
      JSON.stringify(snapshot.permissions),
      JSON.stringify(snapshot.temporalHints),
      snapshot.signature,
    ],
  );

  return snapshot;
}
