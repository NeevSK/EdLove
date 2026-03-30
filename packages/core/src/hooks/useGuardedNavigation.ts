import { useNavigation, NavigationProp } from '@react-navigation/native';
import { usePermissions } from '../permissions/hooks/usePermissions';
import { useStore } from '../store/useStore';
import { useCallback } from 'react';
import { Actions, Subjects } from '../permissions/abilities/base';

/**
 * useGuardedNavigation: A capability-aware navigation hook.
 * Wraps standard navigation to check permissions before transitions.
 */
export const useGuardedNavigation = () => {
  const navigation = useNavigation<NavigationProp<Record<string, unknown>>>();
  const { can } = usePermissions();
  const showToast = useStore((state) => state.showToast);

  /**
   * guardedNavigate: Navigates to a route ONLY if the user has the required capability.
   * 
   * @param route Target route name
   * @param action Required CASL action (e.g., 'read', 'manage')
   * @param subject Required CASL subject (e.g., 'School', 'Classroom')
   * @param params Optional navigation parameters
   */
  const guardedNavigate = useCallback((
    route: string,
    action: Actions,
    subject: Subjects,
    params?: Record<string, unknown>
) => {
    if (can(action, subject)) {
      (navigation.navigate as (r: never, p?: never) => void)(route as never, params as never);
    } else {
      showToast(`Access Denied: You do not have permission to access ${route}.`, 'error');
    }
  }, [navigation, can, showToast]);

  return {
    ...navigation,
    guardedNavigate,
  };
};

