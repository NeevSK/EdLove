import { eq } from 'drizzle-orm';
import { getDrizzleDB, registerPermissionValidator } from '../../adapters/powersync/database';
import { cedarPolicies, permissionSnapshots } from '../../adapters/powersync/schema';
import type { UserContext } from '../schemas/user.schema';
import type { Actions, SubjectType } from './abilities/base';
import { getLocalResourceAttributes } from './localEvaluator';
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
  action: Actions;
  resourceType: SubjectType;
  resourceId: string;
  userContext: Partial<UserContext>;
}): Promise<boolean> {
  const legacyContext = params.userContext as Record<string, unknown>;

  // --- Step A: Attempt Dynamic Cedar WASM Evaluation ---
  try {
    const db = getDrizzleDB();
    const localPolicies = await db.select().from(cedarPolicies);

    if (localPolicies.length > 0) {
      const rawPolicyString = localPolicies.map((p) => p.content).join('\n\n');
      const policySizeBytes = Buffer.byteLength(rawPolicyString, 'utf8');

      // Safe Boundary check to protect lower-end Android memory
      const MAX_LOCAL_POLICY_SIZE_BYTES = 100 * 1024;
      if (policySizeBytes <= MAX_LOCAL_POLICY_SIZE_BYTES) {
        // Dynamically import WASM compiler (Hermes native WASM engine)
        // @ts-expect-error - Dynamic Cedar WASM web entrypoint load for browser/React-Native compatibility
        const { evaluate } = await import('@cedar-policy/cedar-wasm/web');

        // Fetch dynamic attributes
        const resourceAttributes = await getLocalResourceAttributes(
          params.resourceType as string,
          params.resourceId,
        );
        const classroomId = params.userContext.classroomId || legacyContext.classroom_id || null;

        const contextPayload = {
          device: {
            is_trusted: true,
            trust_status: 'standard',
          },
        };

        const decision = await evaluate({
          policies: rawPolicyString,
          schema: '',
          request: {
            principal: {
              type: 'User',
              id: params.userContext.userId || legacyContext.user_id || '',
            },
            action: { type: 'Action', id: params.action },
            resource: { type: params.resourceType as string, id: params.resourceId },
            context: contextPayload,
          },
          entities: [
            {
              uid: { type: 'User', id: params.userContext.userId || legacyContext.user_id || '' },
              attrs: {
                school_id:
                  params.userContext.schoolId ||
                  (legacyContext.school_id as string | undefined) ||
                  '',
                capacity: params.userContext.capacity || '',
                classroom_ids: classroomId ? [classroomId] : [],
              },
              parents: [],
            },
            {
              uid: { type: params.resourceType as string, id: params.resourceId },
              attrs: resourceAttributes,
              parents: [],
            },
          ],
        });

        console.log('[LocalEvaluator.native] Dynamic Cedar WASM evaluation succeeded.');
        return decision.decision === 'Allow';
      }
    }
  } catch (wasmError) {
    console.warn(
      '[LocalEvaluator.native] Dynamic WASM evaluation failed/unsupported. Falling back to signed permission snapshot...',
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
