import SectionHeadDashboard from '@repo/admin/screens/SectionHeadDashboard';
import { useIsGuest } from '@repo/core/hooks';
import { useExperienceState } from '@repo/core/lib/experienceState';
import { usePermissions } from '@repo/core/logic';
import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { Center } from '@repo/ui/primitives';
import { Redirect } from 'expo-router';

export default function SectionHeadRoute() {
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
  const isAuthorized =
    isDemoMode ||
    isGuest ||
    capacity === 'sectionHead' ||
    capacity === 'principal' ||
    capacity === 'assistantPrincipal' ||
    capacity === 'founder' ||
    capacity === 'developer' ||
    can('read', 'PrincipalDashboard');

  if (!isAuthorized) {
    return <Redirect href="/workspace" />;
  }

  const schoolId = context.schoolId || (isDemoMode || isGuest ? 'demo-school' : '');
  const userId = context.userId || '';

  return <SectionHeadDashboard schoolId={schoolId} userId={userId} />;
}
