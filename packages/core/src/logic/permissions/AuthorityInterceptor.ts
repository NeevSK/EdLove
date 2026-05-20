import type { POAMetadata } from '../../api/contract';
import { ErrorCategory, SovereignError } from '../../types/Errors';
import { checkLocalPermission } from './localEvaluator';
import type { UserContext } from '../schemas/user.schema';

/**
 * AuthorityInterceptor (BFF Layer - L4)
 *
 * In 2026, the BFF uses this pattern to automatically enforce POA based on Hono metadata.
 * Decoupled from legacy CASL abilities, utilizing the new PermissionSnapshot/Cedar checkLocalPermission engine.
 */
export class AuthorityInterceptor {
  /**
   * Enforce policy for a given route and user context.
   * @throws ForbiddenError if policy check fails.
   */
  static async enforce(context: Partial<UserContext>, metadata: unknown) {
    if (!metadata || typeof metadata !== 'object') {
      console.warn('Endpoint missing POA metadata. Access denied.');
      throw new SovereignError({
        title: 'Protocol Violation',
        detail: 'No policy defined for this protocol.',
        status: 403,
        category: ErrorCategory.AUTHORIZATION,
        code: 'MISSING_POA_METADATA',
      });
    }

    const policy = (metadata as { policy?: POAMetadata['policy'] }).policy;
    if (!policy || typeof policy.action !== 'string' || typeof policy.subject !== 'string') {
      throw new SovereignError({
        title: 'Protocol Violation',
        detail: 'Invalid policy contract shape.',
        status: 403,
        category: ErrorCategory.AUTHORIZATION,
        code: 'INVALID_POA_METADATA',
      });
    }

    const { action, subject } = policy;

    // Evaluate using the local snapshot evaluator. Server paths should still
    // be checked again by Cedar at the gateway.
    const isAllowed = await checkLocalPermission({
      action: action as any,
      resourceType: subject as any,
      resourceId: 'api-surface-flight-check',
      userContext: context,
    });

    if (!isAllowed) {
      throw SovereignError.unauthorized(action, subject);
    }

    return true;
  }
}
