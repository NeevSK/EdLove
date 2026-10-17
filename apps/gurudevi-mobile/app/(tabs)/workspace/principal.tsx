import { useIsGuest } from '@repo/core/hooks';
import { useStore } from '@repo/core/logic';
import PrincipalDashboard from '@repo/admin/screens/PrincipalDashboard';
import { usePermissions } from '@repo/core/logic';
import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { Center } from '@repo/ui/primitives';

export default function PrincipalRoute() {
  const { context } = usePermissions();
  const loading = useCedarDecisionStore((state: any) => state.isLoading);
  const isDemoMode = useStore((state) => state.isDemoMode);
  const isGuest = useIsGuest();

  if (loading) {
    return (
      <Center className="flex-1 bg-phase-canvas">
        <BrandPulse size={32} accessibilityLabel="Loading workspace" />
      </Center>
    );
  }

  const schoolId = context.schoolId || (isDemoMode || isGuest ? 'demo-school' : '');
  const userId = context.userId || '';

  return <PrincipalDashboard schoolId={schoolId} userId={userId} />;
}
