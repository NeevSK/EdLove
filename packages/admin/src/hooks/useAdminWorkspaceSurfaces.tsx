import { useFeatureRegistry } from '@repo/core/hooks/useFeatureRegistry';
import type { ClassroomWorkspaceSurface, PrincipalInsight } from '@repo/core/types/Workspace';
import { useRouter } from 'expo-router';
import { PrincipalOnboardingView } from '@repo/admin/components';
import { ADMIN_REGISTRY } from '@repo/admin/constants/adminRegistry';
import GradeHeadDashboard from '@repo/admin/screens/GradeHeadDashboard';
import PrincipalDashboard from '@repo/admin/screens/PrincipalDashboard';
import SectionHeadDashboard from '@repo/admin/screens/SectionHeadDashboard';

export function appendAdminWorkspaceSurfaces(
  surfaces: ClassroomWorkspaceSurface[],
  {
    can,
    isGuest,
    isDemoModeTriggered,
    classroomData,
    schoolIdToUse,
    fetchRoleData,
    navigation,
    surfaceInsights,
    onTryDemo,
    onCreateSchool,
    citizenship,
    isPro,
    userCapabilities,
  }: {
    can: (action: string, subject: string, field?: string) => boolean;
    isGuest: boolean;
    isDemoModeTriggered: boolean;
    classroomData: { userId: string };
    schoolIdToUse?: string | null;
    fetchRoleData: () => void | Promise<void>;
    navigation: { navigate: (screen: string, params?: any) => void };
    surfaceInsights?: PrincipalInsight;
    onTryDemo: () => void;
    onCreateSchool: () => void;
    citizenship: string;
    isPro: boolean;
    userCapabilities: string[];
  },
) {
  const router = useRouter();
  const citizenshipLevel =
    citizenship === 'FIRST_CLASS' ? 2 : citizenship === 'SECOND_CLASS' ? 1 : 0;

  const adminGated = useFeatureRegistry(ADMIN_REGISTRY);

  // --- Principal Dashboard ---
  const principalGate = adminGated.principal;
  if (principalGate?.visible) {
    const principalFeature = ADMIN_REGISTRY.principal!;
    const principalContent =
      !schoolIdToUse && !isDemoModeTriggered ? (
        <PrincipalOnboardingView
          isGuest={isGuest}
          onTryDemo={onTryDemo}
          onCreateSchool={onCreateSchool}
          onJoinSchool={() => router.push('/welcome')}
        />
      ) : (
        <PrincipalDashboard
          schoolId={schoolIdToUse || 'demo-school'}
          userId={classroomData.userId}
          onRefresh={fetchRoleData}
        />
      );

    surfaces.push({
      ...principalFeature,
      title: principalFeature.label,
      subtitle: principalFeature.description,
      summary:
        surfaceInsights?.principal?.summary ??
        'Institutional pulse, observations, approvals, and published academic oversight.',
      temporalLabel: surfaceInsights?.principal?.temporalLabel ?? 'Official',
      metadata: surfaceInsights?.principal?.metadata ?? ['Admin-owned', 'Governance'],
      content: principalContent,
    } as unknown as ClassroomWorkspaceSurface);
  }

  // --- Section Head Dashboard ---
  const sectionHeadGate = adminGated['section-head'];
  if (sectionHeadGate?.visible) {
    const sectionHeadFeature = ADMIN_REGISTRY['section-head']!;
    surfaces.push({
      ...sectionHeadFeature,
      title: sectionHeadFeature.label,
      subtitle: sectionHeadFeature.description,
      summary: 'Mixed teaching and coordination capability within the classroom holon.',
      temporalLabel: 'Work',
      metadata: ['Academic', 'Mixed-role'],
      content: (
        <SectionHeadDashboard schoolId={schoolIdToUse || undefined} userId={classroomData.userId} />
      ),
    } as unknown as ClassroomWorkspaceSurface);
  }

  // --- Grade Head Dashboard ---
  const gradeHeadGate = adminGated['grade-head'];
  if (gradeHeadGate?.visible) {
    const gradeHeadFeature = ADMIN_REGISTRY['grade-head']!;
    surfaces.push({
      ...gradeHeadFeature,
      title: gradeHeadFeature.label,
      subtitle: gradeHeadFeature.description,
      summary: 'Cross-class coordination for grade-wide rhythms, issues, and academic flow.',
      temporalLabel: 'Work',
      metadata: ['Academic', 'Mixed-role'],
      content: (
        <GradeHeadDashboard schoolId={schoolIdToUse || undefined} userId={classroomData.userId} />
      ),
    } as unknown as ClassroomWorkspaceSurface);
  }
}
