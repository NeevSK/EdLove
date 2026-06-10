import type { NavigationContainerRef } from '@react-navigation/native';
import { useEffect } from 'react';
import { useAuth } from '../../../providers/AuthProvider';

/**
 * useGuardedNavigation
 *
 * Enforces "No Trust" barriers and ensures users are routed based
 * on their capacity and onboarding status.
 *
 * @param onboardingCompleted - Current onboarding status
 * @param navigationRef - The React Navigation reference object (from the app)
 */
export function useNavigationAuthGuard(
  onboardingCompleted: boolean,
  navigationRef: NavigationContainerRef<Record<string, unknown>> | null,
) {
  const { session, isProfileLoading } = useAuth();

  useEffect(() => {
    if (isProfileLoading || !navigationRef || !navigationRef.isReady()) return;

    const rootState = navigationRef.getRootState();
    const currentRoute = rootState?.routes?.[rootState?.index ?? -1]?.name || 'unknown';
    const hasValidSession = !!session;

    if (__DEV__) {
      console.log('=O Auth: Navigation Guard Check', {
        currentRoute,
        hasValidSession,
        onboardingCompleted,
        isReady: navigationRef.isReady(),
      });
    }

    const allowedRootRoutes = ['Welcome', 'Auth', 'InvitationWelcome', 'PublicForm'];
    const onboardingRoutes = ['Onboarding', 'QRHandler'];

    // 1. Initialization Guard: Wait until the route is settled
    if (!currentRoute) return;

    // 2. Terminal State Guard: If we are already at an initial route, don't redirect
    if (allowedRootRoutes.includes(currentRoute)) return;

    // 3. Onboarding Protection: If onboarding not completed
    if (!onboardingCompleted) {
      // Only allow onboarding routes if we have a valid session (anonymous or authenticated user)
      if (onboardingRoutes.includes(currentRoute)) {
        if (!hasValidSession) {
          navigationRef.reset({
            index: 0,
            routes: [{ name: 'Welcome' as never }],
          });
        }
        return;
      }

      // If we are anywhere else (e.g. Main) but not onboarded, go to Welcome
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'Welcome' as never }],
      });
      return;
    }

    // 4. Auth Protection: If no session and not in allowed root routes
    if (!hasValidSession) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
      return;
    }
  }, [session, onboardingCompleted, isProfileLoading, navigationRef]);
}
