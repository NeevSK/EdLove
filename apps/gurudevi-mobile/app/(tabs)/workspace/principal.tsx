import PrincipalDashboard from '@repo/admin/screens/PrincipalDashboard';
import { useIsGuest } from '@repo/core/hooks';
import { useExperienceState } from '@repo/core/lib/experienceState';
import { usePermissions } from '@repo/core/logic';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { Center } from '@repo/ui/primitives';
import { Redirect } from 'expo-router';

export default function PrincipalRoute() {
  const { context, can } = usePermissions();
  const loading = useCedarDecisionStore((state: any) => state.isLoading);
  const isDemoMode = useExperienceState((state) => state.isDemoMode);
  const isGuest = useIsGuest();

  if (loading) {
    return (
      <Center className="flex-1 bg-phase-canvas">
        <BrandPulse size={32} accessibilityLabel="Loading workspace" />
      </Center>
    );
  }

  const capacity = context.activeBond?.capacity ?? context.primaryCapacity;
  const isPrincipalAuthorized =
    isDemoMode ||
    isGuest ||
    capacity === 'principal' ||
    capacity === 'assistantPrincipal' ||
    capacity === 'admin' ||
    capacity === 'gradeHead' ||
    capacity === 'sectionHead' ||
    capacity === 'founder' ||
    capacity === 'developer' ||
    can('read', 'PrincipalDashboard');

  if (!isPrincipalAuthorized) {
    return <Redirect href="/workspace" />;
  }

  const schoolId = context.schoolId || (isDemoMode || isGuest ? 'demo-school' : '');
  const userId = context.userId || '';

  return <PrincipalDashboard schoolId={schoolId} userId={userId} />;
}
