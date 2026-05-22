import { eq } from 'drizzle-orm';
import { getDrizzleDB, registerPermissionValidator } from '../../adapters/powersync/database';
import { permissionSnapshots } from '../../adapters/powersync/schema';
import type { UserContext } from '../schemas/user.schema';
import type { Actions, SubjectType } from './abilities/base';
import { verifySnapshotSignature } from './signature';

/**
 * checkLocalPermission (.native implementation)
 *
 * Production-grade mobile permission evaluator.
 * It bypasses WASM/Cedar completely, reading the cryptographically signed
 * PermissionSnapshot from the local SQLite (PowerSync) database instead.
 *
 * Yields O(1) lightning-fast checks with zero memory overhead or Metro static WASM bundle crashes!
 */
export async function checkLocalPermission(params: {
  action: Actions;
  resourceType: SubjectType;
  resourceId: string;
  userContext: Partial<UserContext>;
}): Promise<boolean> {
  try {
    const legacyContext = params.userContext as Record<string, unknown>;
    const db = getDrizzleDB();

    // 2. Fetch the latest cryptographically signed capability snapshot from SQLite
    const snapshotRecord = await db.query.permissionSnapshots.findFirst({
      where: eq(
        permissionSnapshots.userId as any,
        params.userContext.userId || legacyContext.user_id || '',
      ),
    });

    if (!snapshotRecord) {
      // Invariant 2: Defensive Default-Deny Fallback (No CASL fallback allowed!)
      return false;
    }

    // 3. Cryptographic signature verification check
    // If the snapshot has expired or has a broken signature, fail secure.
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

    // 4. Extract permission map and evaluate
    const permissions = JSON.parse(snapshotRecord.permissions) as Record<
      string,
      Record<string, boolean>
    >;
    const isAllowed = permissions[params.resourceType as string]?.[params.action as string];

    if (isAllowed !== undefined) {
      return isAllowed;
    }

    // Default deny if action is not explicitly permitted in the snapshot
    return false;
  } catch (error) {
    console.error('[LocalEvaluator.native] Error evaluating native permission snapshot:', error);
    return false; // Default deny on any error
  }
}

// Register native permission validator with database singleton
registerPermissionValidator(checkLocalPermission);
