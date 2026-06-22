import { useFeatureRegistry } from '@repo/core/hooks/useFeatureRegistry';
import type { ClassroomWorkspaceSurface, PrincipalInsight } from '@repo/core/types/Workspace';
import { useRouter } from 'expo-router';
import { PrincipalOnboardingView } from '../components';
import { ADMIN_REGISTRY } from '../constants/adminRegistry';
import GradeHeadDashboard from '../screens/GradeHeadDashboard';
import PrincipalDashboard from '../screens/PrincipalDashboard';
import SectionHeadDashboard from '../screens/SectionHeadDashboard';

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

  const adminGated = useFeatureRegistry(ADMIN_REGISTRY, {
    citizenship: citizenshipLevel,
    isPro,
    capabilities: userCapabilities,
    can,
  });

  // --- Principal Dashboard ---
  const principalGate = adminGated.principal_dashboard;
  if (principalGate?.visible) {
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
      ...principalGate.feature,
      title: principalGate.feature.label,
      subtitle: principalGate.feature.description,
      summary:
        surfaceInsights?.principal?.summary ??
        'Institutional pulse, observations, approvals, and published academic oversight.',
      temporalLabel: surfaceInsights?.principal?.temporalLabel ?? 'Official',
      metadata: surfaceInsights?.principal?.metadata ?? ['Admin-owned', 'Governance'],
      content: principalContent,
    } as ClassroomWorkspaceSurface);
  }

  // --- Section Head Dashboard ---
  const sectionHeadGate = adminGated.section_head;
  if (sectionHeadGate?.visible) {
    surfaces.push({
      ...sectionHeadGate.feature,
      title: sectionHeadGate.feature.label,
      subtitle: sectionHeadGate.feature.description,
      summary: 'Mixed teaching and coordination capability within the classroom holon.',
      temporalLabel: 'Work',
      metadata: ['Academic', 'Mixed-role'],
      content: (
        <SectionHeadDashboard schoolId={schoolIdToUse || undefined} userId={classroomData.userId} />
      ),
    } as ClassroomWorkspaceSurface);
  }

  // --- Grade Head Dashboard ---
  const gradeHeadGate = adminGated.grade_head;
  if (gradeHeadGate?.visible) {
    surfaces.push({
      ...gradeHeadGate.feature,
      title: gradeHeadGate.feature.label,
      subtitle: gradeHeadGate.feature.description,
      summary: 'Cross-class coordination for grade-wide rhythms, issues, and academic flow.',
      temporalLabel: 'Work',
      metadata: ['Academic', 'Mixed-role'],
      content: (
        <GradeHeadDashboard schoolId={schoolIdToUse || undefined} userId={classroomData.userId} />
      ),
    } as ClassroomWorkspaceSurface);
  }
}
