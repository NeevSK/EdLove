import { type QueryScope, scopedQueryKey } from '@repo/core/lib/clientStateFoundation';

/** Device security belongs to an account, never to the active workspace lens. */
export const deviceSecurityQueryKeys = {
  summary: (scope: QueryScope) =>
    scopedQueryKey(scope, ['device-security', 'summary'] as const),
};
