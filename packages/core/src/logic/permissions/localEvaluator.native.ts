import { eq } from 'drizzle-orm';
import { getDrizzleDB, registerPermissionValidator } from '../../adapters/powersync/database';
import { cedarPolicies, permissionSnapshots } from '../../adapters/powersync/schema';
import type { UserContext } from '../schemas/user.schema';
import type { Action, Subject } from '../../types/authorization';
import { getLocalResourceAttributes } from './localEvaluator';
import { evaluateShape2 } from './cedarClientEvaluator';
import { verifySnapshotSignature } from './signature';

/**
 * checkLocalPermission (.native implementation)
 *
 * Production-grade mobile permission evaluator.
 * From React Native 0.84+, Hermes supports native WebAssembly.
 * This evaluator:
 *   1. Attempts dynamic Cedar WASM evaluation using local SQLite attributes.
 *   2. Falls back to static cryptographically signed PermissionSnapshots on failure/unsupported Hermes configurations.
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

  // --- Step A: Attempt Cedar WASM Evaluation via Singleton (ADR-005) ---
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
        const classroomId = params.userContext.classroomId || legacyContext.classroom_id || null;

        const permitted = await evaluateShape2(rawPolicyString, {
          user: {
            id: params.userContext.userId || (legacyContext.user_id as string) || '',
            attrs: {
              school_id:
                params.userContext.schoolId ||
                (legacyContext.school_id as string | undefined) ||
                '',
              capacity: params.userContext.capacity || '',
              classroom_ids: classroomId ? [classroomId] : [],
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

  // --- Step B: Fallback to Cryptographically Signed Snapshot Evaluation ---
  try {
    const db = getDrizzleDB();
    const snapshotRecord = await db.query.permissionSnapshots.findFirst({
      where: eq(
        permissionSnapshots.userId as any,
        params.userContext.userId || legacyContext.user_id || '',
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

    const isSignatureValid = await verifySnapshotSignature(snapshotRecord);
    if (!isSignatureValid) {
      console.error(
        '[LocalEvaluator.native] Cryptographic Tamper Detected on mobile permission snapshot!',
      );
      return false;
    }

    const expiresAt = new Date(snapshotRecord.expiresAt);
    if (expiresAt < new Date()) {
      console.warn(
        '[LocalEvaluator.native] Mobile permission snapshot has expired. Access denied.',
      );
      return false;
    }

    const permissions = JSON.parse(snapshotRecord.permissions) as Record<
      string,
      Record<string, boolean>
    >;
    const isAllowed = permissions[params.resourceType as string]?.[params.action as string];

    if (isAllowed !== undefined) {
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
