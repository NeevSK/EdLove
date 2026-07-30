import { getDrizzleDB } from '@repo/core/adapters/powersync/database';
import { cedarPolicies } from '@repo/core/adapters/powersync/schema';
import { evaluateShape1, evaluateShape2 } from '@repo/core/logic/permissions/cedarClientEvaluator';
import { getLocalResourceAttributes } from '@repo/core/logic/permissions/localEvaluator';
import type {
  AuthorizationDecision,
  AuthorizationRequest,
  CapabilityToken,
  IAuthorizationPort,
  TokenContext,
} from '@repo/core/logic/ports/authz.port';

const CAPABILITY_TOKEN_TTL_MS = 60_000; // 60 seconds

export class CedarAuthorizationAdapter implements IAuthorizationPort {
  async isAuthorized(request: AuthorizationRequest): Promise<AuthorizationDecision> {
    try {
      const db = getDrizzleDB();
      const localPolicies = await db.select().from(cedarPolicies);

      if (localPolicies.length === 0) {
        return { permitted: false, reason: 'NoLocalPolicies' };
      }

      const policyString = localPolicies.map((p) => p.content).join('\n\n');
      const resourceAttrs = await getLocalResourceAttributes(
        request.resourceType,
        request.resourceId,
      );

      const permitted = await evaluateShape2(policyString, {
        user: {
          id: request.principalId,
          attrs: {
            school_id: (request.context?.school_id as string) || '',
            capacity: (request.context?.capacity as string) || 'member',
            classroom_ids: (request.context?.classroom_ids as string[]) || [],
          },
        },
        action: request.action,
        resourceType: request.resourceType,
        resourceId: request.resourceId,
        resourceAttrs,
      });

      return {
        permitted,
        reason: permitted ? 'CedarPolicyEvaluation' : 'CedarDeny',
      };
    } catch (error) {
      return {
        permitted: false,
        reason: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async issueCapabilityToken(context: TokenContext): Promise<CapabilityToken> {
    const db = getDrizzleDB();

    // Read current policy version for token binding
    const versionRecord = await db.query.policyVersion.findFirst();
    const policyVersionHash = versionRecord?.hash ?? 'no_policy_version';

    // Read policies for evaluation
    const localPolicies = await db.select().from(cedarPolicies);
    if (localPolicies.length === 0) {
      throw new Error('Cannot issue capability token: no local Cedar policies');
    }

    const policyString = localPolicies.map((p) => p.content).join('\n\n');

    // Use evaluateShape1 for context-level evaluation (no specific resource)
    const permitted = await evaluateShape1(policyString, {
      user: {
        id: context.principalId,
        attrs: {
          school_id: context.tenantId,
          capacity: 'member',
          classroom_ids: [],
        },
      },
      action: 'perform_operation',
      resourceType: context.operationContext,
    });

    if (!permitted) {
      throw new Error(`Capability token denied: ${context.operationContext}`);
    }

    const now = Date.now();

    return {
      tokenId: crypto.randomUUID(),
      principalId: context.principalId,
      tenantId: context.tenantId,
      operationContext: context.operationContext,
      deviceId: context.deviceId ?? 'unknown',
      issuedAt: now,
      expiresAt: now + CAPABILITY_TOKEN_TTL_MS,
      policyVersionHash,
    };
  }
}
