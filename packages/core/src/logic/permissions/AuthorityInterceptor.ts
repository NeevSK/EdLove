import type { POAMetadata } from '../../api/contract';
import type { AppAbility } from './abilities/base';
import { SovereignError, ErrorCategory } from '../../types/Errors';

/**
 * AuthorityInterceptor (BFF Layer - L4)
 *
 * In 2026, the BFF uses this pattern to automatically enforce POA based on Hono metadata.
 * This ensures that even if a route handler is exposed, it cannot be executed without authority.
 */
export class AuthorityInterceptor {
  /**
   * Enforce authority for a given route and user ability.
   * @throws ForbiddenError if authority check fails.
   */
  static async enforce(ability: AppAbility, metadata: unknown) {
    if (!metadata || typeof metadata !== 'object' || !('authority' in metadata)) {
      // Default to deny if no authority is defined (Safe by default)
      console.warn('Endpoint missing POA metadata. Access denied.');
      throw new SovereignError({
        title: 'Protocol Violation',
        detail: 'No authority defined for this protocol.',
        status: 403,
        category: ErrorCategory.AUTHORIZATION,
        code: 'MISSING_POA_METADATA',
      });
    }

    const { action, subject } = (metadata as { authority: POAMetadata['authority'] }).authority;

    // API-surface POA is intentionally coarse: if the user has any matching rule for the
    // action/subject pair, we allow the request to proceed to deeper data-policy checks
    // in ZenStack/RLS. This avoids coupling fail-fast surface checks to row-level CASL
    // conditions, which are evaluated later with concrete resource instances.
    const rawRules = ((ability as any).rules ?? []) as Array<{
      action?: string | string[];
      subject?: string | string[];
      inverted?: boolean;
    }>;

    const matchesAction = (ruleAction?: string | string[]) => {
      if (!ruleAction) return false;
      const actions = Array.isArray(ruleAction) ? ruleAction : [ruleAction];
      return actions.includes(action) || actions.includes('manage');
    };

    const matchesSubject = (ruleSubject?: string | string[]) => {
      if (!ruleSubject) return false;
      const subjects = Array.isArray(ruleSubject) ? ruleSubject : [ruleSubject];
      return subjects.includes(subject) || subjects.includes('all');
    };

    const isAllowed = rawRules.some(
      (rule) => !rule.inverted && matchesAction(rule.action) && matchesSubject(rule.subject),
    );

    if (!isAllowed) {
      throw SovereignError.unauthorized(action, subject);
    }

    return true;
  }
}
