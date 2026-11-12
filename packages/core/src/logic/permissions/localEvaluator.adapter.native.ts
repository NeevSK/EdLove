import { getDrizzleDB, registerPermissionValidator } from '@repo/core/adapters/powersync/database';
import {
  cedarPolicies,
  permissionSnapshots,
  policyVersion,
} from '@repo/core/adapters/powersync/schema';
import { evaluateShape2 } from '@repo/core/logic/permissions/cedarClientEvaluator';
import { getLocalResourceAttributes } from '@repo/core/logic/permissions/localResourceAttributes.adapter';
import { verifySnapshotSignature } from '@repo/core/logic/permissions/signature.adapter';
import type { UserContext } from '@repo/core/logic/schemas/user.schema';
import type { Action, Subject } from '@repo/core/types/authorization';
import { cedarActionFor } from '@repo/policies/authorizationRegistry';
import { and, eq } from 'drizzle-orm';

/**
 * checkLocalPermission (.native implementation)
 *
 * Mobile permission evaluator. Dynamic WASM support depends on the actual
 * Hermes build and asset loading, and must be verified on the target device.
 * This evaluator:
 *   1. Uses a scoped, signed PermissionSnapshot by default.
 *   2. Optionally evaluates dynamic Cedar WASM only when explicitly enabled
 *      for a controlled local-only mode.
 *
 * Ensures high fidelity offline capabilities without compromising robustness.
 */
export async function checkLocalPermission(params: {
  action: Action;
  resourceType: Subject;
  resourceId: string;
  userContext: Partial<UserContext>;
}): Promise<boolean> {
  const legacyContext = params.userContext as Record<string, unknown>;

  try {
    const db = getDrizzleDB();
    const activeBondId =
      params.userContext.activeBond?.id || (legacyContext.active_bond_id as string | undefined);
    const activeEntityId =
      params.userContext.activeEntityId || (legacyContext.active_entity_id as string | undefined);
    const activeEntityType =
      params.userContext.activeEntityType ||
      (legacyContext.active_entity_type as string | undefined);
    const schoolId = params.userContext.schoolId || (legacyContext.school_id as string | undefined);
    const snapshotRecord = await db.query.permissionSnapshots.findFirst({
      where: and(
        eq(
          permissionSnapshots.userId as any,
          params.userContext.userId || legacyContext.user_id || '',
        ),
        ...(activeBondId
          ? [eq(permissionSnapshots.activeBondId as any, activeBondId)]
          : schoolId
            ? [eq(permissionSnapshots.schoolId as any, schoolId)]
            : []),
      ),
    });

    if (!snapshotRecord) {
      return false; // Defensive default-deny
    }

    const activeUserId = params.userContext.userId || legacyContext.user_id || '';
    if (snapshotRecord.userId !== activeUserId) {
      console.error('[LocalEvaluator.native] Mismatched userId in permission snapshot record!');
      return false;
    }

    if (activeBondId && snapshotRecord.activeBondId !== activeBondId) {
      console.error('[LocalEvaluator.native] Active bond mismatch in permission snapshot record!');
      return false;
    }

    if (
      !activeEntityId ||
      !activeEntityType ||
      snapshotRecord.activeEntityId !== activeEntityId ||
      snapshotRecord.activeEntityType !== activeEntityType
    ) {
      console.error(
        '[LocalEvaluator.native] Active entity mismatch in permission snapshot record!',
      );
      return false;
    }

    const currentPolicyVersion = await db.query.policyVersion?.findFirst?.();
    if (
      (activeBondId &&
        (!currentPolicyVersion?.hash ||
          !snapshotRecord.policyVersion ||
          snapshotRecord.policyVersion !== currentPolicyVersion.hash)) ||
      (!activeBondId &&
        currentPolicyVersion?.hash &&
        snapshotRecord.policyVersion !== currentPolicyVersion.hash)
    ) {
      console.warn(
        '[LocalEvaluator.native] Permission snapshot policy version is stale or missing.',
      );
      return false;
    }

    const isSignatureValid = await verifySnapshotSignature(snapshotRecord);
    if (!isSignatureValid) {
      console.error(
        '[LocalEvaluator.native] Cryptographic Tamper Detected on mobile permission snapshot!',
      );
      return false;
    }

    const expiresAt = new Date(snapshotRecord.expiresAt);
    if (!Number.isFinite(expiresAt.getTime()) || expiresAt <= new Date()) {
      console.warn(
        '[LocalEvaluator.native] Mobile permission snapshot has expired. Access denied.',
      );
      return false;
    }

    const permissions = JSON.parse(snapshotRecord.permissions) as Record<
      string,
      Record<string, boolean>
    >;
    const resourcePermissions = permissions[params.resourceType as string];
    const isAllowed =
      resourcePermissions && Object.hasOwn(resourcePermissions, params.action)
        ? resourcePermissions[params.action]
        : resourcePermissions?.[cedarActionFor(params.action, params.resourceType)];

    if (typeof isAllowed === 'boolean') {
      if (!isAllowed) return false;
      if (process.env.EXPO_PUBLIC_LOCAL_DYNAMIC_CEDAR === 'true') {
        try {
          const db = getDrizzleDB();
          const localPolicies = await db.select().from(cedarPolicies);

          if (localPolicies.length > 0) {
            const rawPolicyString = localPolicies.map((p) => p.content).join('\n\n');
            const policySizeBytes = Buffer.byteLength(rawPolicyString, 'utf8');

            // Safe Boundary check to protect lower-end Android memory
            const MAX_LOCAL_POLICY_SIZE_BYTES = 100 * 1024;
            if (policySizeBytes <= MAX_LOCAL_POLICY_SIZE_BYTES) {
              const resourceAttributes = await getLocalResourceAttributes(
                params.resourceType as string,
                params.resourceId,
              );
              const classroomId = (params.userContext.classroomId ||
                legacyContext.classroom_id ||
                null) as string | null;
              const classroomIds: string[] = classroomId ? [classroomId] : [];

              const permitted = await evaluateShape2(rawPolicyString, {
                user: {
                  id: params.userContext.userId || (legacyContext.user_id as string) || '',
                  attrs: {
                    school_id:
                      params.userContext.schoolId ||
                      (legacyContext.school_id as string | undefined) ||
                      '',
                    active_entity_id:
                      params.userContext.activeEntityId ||
                      (legacyContext.active_entity_id as string | undefined) ||
                      '',
                    active_entity_type:
                      params.userContext.activeEntityType ||
                      (legacyContext.active_entity_type as string | undefined) ||
                      '',
                    capacity: params.userContext.capacity || '',
                    classroom_ids: classroomIds,
                  },
                },
                action: params.action,
                resourceType: params.resourceType as string,
                resourceId: params.resourceId,
                resourceAttrs: resourceAttributes,
              });

              console.log('[LocalEvaluator.native] Cedar WASM evaluation via singleton succeeded.');
              return permitted;
            }
          }
        } catch (wasmError) {
          console.warn(
            '[LocalEvaluator.native] WASM evaluation failed/unsupported. Falling back to signed permission snapshot...',
            wasmError,
          );
        }
      }
      return isAllowed;
    }

    return false;
  } catch (error) {
    console.error('[LocalEvaluator.native] Local snapshot fallback evaluation failed:', error);
    return false;
  }
}

// Register native permission validator with database singleton
registerPermissionValidator(checkLocalPermission);
