import { eq } from 'drizzle-orm';
import { getDrizzleDB, registerPermissionValidator } from '../../adapters/powersync/database';
import { cedarPolicies, classrooms, schools } from '../../adapters/powersync/schema';
import { evaluateShape2 } from './cedarClientEvaluator';
import { deviceTrustAPI } from '../../api/deviceTrust';
import { DeviceTrustEngine } from '../../lib/security/deviceTrust';
import { isAnonymousIdentity } from '../auth/identityState';
import type { UserContext } from '../schemas/user.schema';
import type { Action, Subject } from '../../types/authorization';

const MAX_LOCAL_POLICY_SIZE_BYTES = 100 * 1024;

/**
 * Retrieves dynamic attributes for a resource directly from the local SQLite/PowerSync cache.
 */
export async function getLocalResourceAttributes(
  resourceType: string,
  resourceId: string,
): Promise<Record<string, unknown>> {
  const db = getDrizzleDB();

  try {
    switch (resourceType) {
      case 'Classroom': {
        const record = await db.query.classrooms.findFirst({
          where: eq(classrooms.id, resourceId),
        });
        return {
          school_id: record?.schoolId || '',
          teacher_id: record?.teacherId || '',
          grade_id: record?.gradeId || '',
          section_id: record?.sectionId || '',
        };
      }
      case 'School': {
        const record = await db.query.schools.findFirst({
          where: eq(schools.id, resourceId),
        });
        return {
          subscription_tier: record?.subscriptionTier || 'FREE',
          is_active: record?.isActive ?? true,
        };
      }
      default:
        return {};
    }
  } catch (error) {
    console.warn(
      `[LocalEvaluator] Failed to fetch dynamic attributes for ${resourceType}::${resourceId}:`,
      error,
    );
    return {};
  }
}

/**
 * checkLocalPermission
 *
 * The authoritative entrypoint for offline-first local permission checks.
 */
export async function checkLocalPermission(params: {
  action: Action;
  resourceType: Subject;
  resourceId: string;
  userContext: Partial<UserContext>;
}): Promise<boolean> {
  try {
    const legacyContext = params.userContext as Record<string, unknown>;
    // 2. Fetch current Device Trust details
    const isTrusted = await DeviceTrustEngine.checkDeviceTrustStatus();
    const trustSummary = await deviceTrustAPI.getCurrentDeviceTrust();
    const trustStatus = trustSummary?.trustStatus ?? 'standard';

    // 3. Retrieve policies from SQLite and manage compilation cache / safety bounds
    const db = getDrizzleDB();
    const localPolicies = await db.select().from(cedarPolicies);

    if (localPolicies.length === 0) {
      console.warn(
        '[LocalEvaluator] No local Cedar policies found in SQLite. Denying access by default.',
      );
      return false; // Defensive Default-Deny Fallback
    }

    // Build or fetch cached policies
    const rawPolicyString = localPolicies.map((p) => p.content).join('\n\n');
    const policySizeBytes = Buffer.byteLength(rawPolicyString, 'utf8');

    // Safe Boundary check to protect lower-end Android memory
    if (policySizeBytes > MAX_LOCAL_POLICY_SIZE_BYTES) {
      console.warn(
        `[LocalEvaluator] Local policy size (${policySizeBytes}B) exceeds safety limit (${MAX_LOCAL_POLICY_SIZE_BYTES}B). Denying.`,
      );
      return false; // Fail-secure
    }

    const resourceAttributes = await getLocalResourceAttributes(
      params.resourceType as string,
      params.resourceId,
    );
    const classroomId = params.userContext.classroomId || legacyContext.classroom_id || null;
    const isAnonymous = isAnonymousIdentity({
      email: params.userContext.email ?? (legacyContext.email as string | null | undefined),
      is_anonymous: legacyContext.is_anonymous as boolean | null | undefined,
      identity_state: legacyContext.identity_state as string | null | undefined,
    });

    // Use singleton WASM evaluator (ADR-005) via cedarClientEvaluator
    try {
      const permitted = await evaluateShape2(rawPolicyString, {
        user: {
          id: params.userContext.userId || (legacyContext.user_id as string) || '',
          attrs: {
            school_id:
              params.userContext.schoolId ||
              (legacyContext.school_id as string | undefined) ||
              '',
            capacity: isAnonymous ? 'member' : params.userContext.capacity || '',
            classroom_ids: classroomId ? [classroomId] : [],
          },
        },
        action: params.action,
        resourceType: params.resourceType as string,
        resourceId: params.resourceId,
        resourceAttrs: resourceAttributes,
      });

      return permitted;
    } catch (wasmError) {
      console.error(
        '[LocalEvaluator] WASM Engine failed or not loaded. Denying access by default.',
        wasmError,
      );
      return false; // Fail-secure on WASM errors
    }
  } catch (error) {
    console.error('[LocalEvaluator] Failed executing offline dynamic permission check:', error);
    return false; // Fail-secure on general errors
  }
}

// Register the offline Cedar permission validator with the PowerSync/Drizzle database singleton
registerPermissionValidator(checkLocalPermission);
