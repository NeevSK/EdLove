import { useEffect, useState } from 'react';
import type { Actions, SubjectType } from '../logic/permissions/abilities/base';
import { usePermissions } from '../logic/permissions/hooks/usePermissions';
import { checkLocalPermission } from '../logic/permissions/localEvaluator';

/**
 * useLocalPermission
 *
 * Reactive React hook to perform live offline-first authorization checks.
 * The snapshot evaluator is the local source of truth. The hook no longer
 * uses a CASL-style synchronous fallback.
 *
 * @param action - The action (e.g. 'read', 'create', 'update', 'delete')
 * @param resourceType - The resource category (e.g. 'Classroom', 'School', 'Grade')
 * @param resourceId - The unique ID of the target resource
 * @param trigger - Optional value to trigger a recheck (e.g. local record state)
 */
export function useLocalPermission(
  action: Actions,
  resourceType: SubjectType,
  resourceId: string,
  _trigger?: any,
) {
  const { context } = usePermissions();
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    async function evaluateLocalPDP() {
      const allowed = await checkLocalPermission({
        action,
        resourceType,
        resourceId,
        userContext: context,
      });

      if (active) {
        setIsAllowed(allowed);
      }
    }

    void evaluateLocalPDP();

    return () => {
      active = false;
    };
  }, [action, resourceType, resourceId, context]);

  return {
    isLoading: isAllowed === null,
    isAllowed: isAllowed ?? false,
  };
}
