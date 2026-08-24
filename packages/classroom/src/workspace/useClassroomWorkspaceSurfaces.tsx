import { appendAdminWorkspaceSurfaces } from '@repo/admin';
import { StudentOnboardingView, TeacherOnboardingView } from '@repo/classroom/components';
import { CLASSROOM_REGISTRY } from '@repo/classroom/constants/classroomRegistry';
import StudentDashboard from '@repo/classroom/screens/StudentDashboard';
import TeacherDashboard from '@repo/classroom/screens/TeacherDashboard';
import { useFeatureRegistry } from '@repo/core/hooks/useFeatureRegistry';
import {} from '@repo/core/logic';
import type {
  ClassroomWorkspaceSurface,
  ClassroomWorkspaceSurfaceId,
} from '@repo/core/types/Workspace';
import { SanctuaryGuard } from '@repo/ui';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import { SanctuaryNudge } from '@repo/ui/components/SanctuaryNudge';
import SandboxBanner from '@repo/ui/components/SandboxBanner';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { Wind } from '@repo/ui/icons';
import { Box } from '@repo/ui/primitives';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';

type UseClassroomWorkspaceSurfacesArgs = {
  can: (action: string, subject: string, field?: string) => boolean;
  t: (key: string) => string;
  isGuest: boolean;
  classroomData: {
    userId: string;
    schoolId: string | null;
    profileCompleted: boolean;
    realClassCount: number;
  } | null;
  schoolIdToUse?: string | null;
  isDemoModeTriggered: boolean;
  setIsDemoModeTriggered: (value: boolean) => void;
  setIsCreateSchoolOpen: (value: boolean) => void;
  setIsCreateClassroomOpen: (value: boolean) => void;
  setIsClaimInviteOpen: (value: boolean) => void;
  setBreathingOpen: (value: boolean) => void;
  fetchRoleData: () => void | Promise<void>;
  surfaceInsights?: Partial<
    Record<
      ClassroomWorkspaceSurfaceId,
      {
        summary?: string;
        temporalLabel?: string;
        metadata?: string[];
      }
    >
  >;
  citizenship: string; // 'WANDERER' | 'SECOND_CLASS' | 'FIRST_CLASS'
  isPro: boolean;
  userCapabilities: string[];
};

const CITIZENSHIP_MAP: Record<string, number> = {
  WANDERER: 0,
  SECOND_CLASS: 1,
  FIRST_CLASS: 2,
};

export function useClassroomWorkspaceSurfaces({
  can,
  t,
  isGuest,
  classroomData,
  schoolIdToUse,
  isDemoModeTriggered,
  setIsDemoModeTriggered,
  setIsCreateSchoolOpen,
  setIsCreateClassroomOpen,
  setIsClaimInviteOpen,
  setBreathingOpen,
  fetchRoleData,
  surfaceInsights,
  citizenship,
  isPro,
  userCapabilities,
}: UseClassroomWorkspaceSurfacesArgs) {
  const router = useRouter();
  const citizenshipLevel = CITIZENSHIP_MAP[citizenship] ?? 0;

  const classroomGated = useFeatureRegistry(CLASSROOM_REGISTRY);
  const renderNudge = () => {
    if (classroomData && !classroomData.profileCompleted && !isGuest) {
      return (
        <SanctuaryNudge
          title="Sanctuary Entry"
          description="Complete your profile to unlock full school features."
          actionLabel="Finish"
          onAction={() => router.push('/profile')}
          icon="profile"
        />
      );
    }

    return (
      <>
        <SanctuaryGuard
          action="read"
          subject="TeacherPulse"
          requirement={{ citizenshipRequired: 3 }}
        >
          <SanctuaryNudge
            title={t('classroom.nudges.breathing.title') || 'Feeling Overwhelmed?'}
            description={
              t('classroom.nudges.breathing.message') ||
              'Take a 60-second breathing reset to center yourself before your next session.'
            }
            actionLabel={t('classroom.nudges.breathing.action') || 'Start Reset'}
            onAction={() => setBreathingOpen(true)}
            icon={Wind}
          />
        </SanctuaryGuard>
        <SanctuaryGuard
          action="read"
          subject="PrincipalPulse"
          requirement={{ citizenshipRequired: 3 }}
        >
          <SanctuaryNudge
            title={t('principal.nudges.breathing.title') || 'Leadership Clarity'}
            description={
              t('principal.nudges.breathing.message') ||
              'Principals carry the weight of the institution. A minute of breathing restores focus.'
            }
            actionLabel={t('principal.nudges.breathing.action') || 'Pause & Breathe'}
            onAction={() => setBreathingOpen(true)}
            icon={Wind}
          />
        </SanctuaryGuard>
        <SanctuaryGuard
          action="read"
          subject="FounderPulse"
          requirement={{ citizenshipRequired: 3 }}
        >
          <SanctuaryNudge
            title={t('founder.nudges.breathing.title') || 'Visionary Pulse'}
            description={
              t('founder.nudges.breathing.message') ||
              'Taking a moment for yourself is the best way to lead by example for your ecosystem.'
            }
            actionLabel={t('founder.nudges.breathing.action') || 'Mindful Reset'}
            onAction={() => setBreathingOpen(true)}
            icon={Wind}
          />
        </SanctuaryGuard>
        <SanctuaryGuard
          action="read"
          subject="StudentPulse"
          requirement={{ citizenshipRequired: 3 }}
        >
          <SanctuaryNudge
            title={t('student.nudges.breathing.title') || 'Learning Fuel'}
            description={
              t('student.nudges.breathing.message') ||
              'Studies are easier when your mind is calm. Reset your breath to improve focus.'
            }
            actionLabel={t('student.nudges.breathing.action') || 'Breathe Now'}
            onAction={() => setBreathingOpen(true)}
            icon={Wind}
          />
        </SanctuaryGuard>
      </>
    );
  };

  return useMemo<ClassroomWorkspaceSurface[]>(() => {
    if (!classroomData) return [];

    const surfaces: ClassroomWorkspaceSurface[] = [];

    appendAdminWorkspaceSurfaces(surfaces, {
      can,
      isGuest,
      isDemoModeTriggered,
      classroomData,
      schoolIdToUse,
      fetchRoleData,
      // Keep the legacy admin adapter connected to the declared Expo Router
      // source; the classroom screen itself does not own a navigation object.
      navigation: {
        navigate: (screen, params) =>
          router.push({ pathname: screen as never, params: params as never }),
      },
      surfaceInsights,
      onTryDemo: () => setIsDemoModeTriggered(true),
      onCreateSchool: () => setIsCreateSchoolOpen(true),
      citizenship,
      isPro,
      userCapabilities,
    });

    const teacherGate = classroomGated.teacher;
    if (teacherGate?.visible) {
      const teacherContent =
        classroomData.realClassCount === 0 && !isDemoModeTriggered ? (
          <TeacherOnboardingView
            isGuest={isGuest}
            onTryDemo={() => setIsDemoModeTriggered(true)}
            onCreateClassroom={() => setIsCreateClassroomOpen(true)}
            onJoinSchool={() => router.push('/welcome')}
          />
        ) : (
          <ScreenWrapper scroll={false} noTopInset={true}>
            <Box className="flex-1">
              <GlobalHeader title="Classroom" subtitle={undefined} />
              {renderNudge()}
              {isDemoModeTriggered && <SandboxBanner />}
              <TeacherDashboard
                schoolId={schoolIdToUse || undefined}
                userId={classroomData.userId}
                onRefresh={fetchRoleData}
              />
            </Box>
          </ScreenWrapper>
        );

      surfaces.push({
        ...CLASSROOM_REGISTRY.teacher!,
        title: CLASSROOM_REGISTRY.teacher!.label,
        subtitle: CLASSROOM_REGISTRY.teacher!.description,
        summary:
          surfaceInsights?.teacher?.summary ??
          'Assignments, lessons, attendance, grading, and teacher-owned pedagogical signals.',
        temporalLabel: surfaceInsights?.teacher?.temporalLabel ?? 'Daily Work',
        metadata: surfaceInsights?.teacher?.metadata ?? ['Academic', 'Write owner'],
        content: teacherContent,
      } as any as ClassroomWorkspaceSurface);
    }

    const studentGate = classroomGated.student;
    if (studentGate?.visible) {
      const studentContent =
        classroomData.realClassCount === 0 && !isDemoModeTriggered ? (
          <StudentOnboardingView
            isGuest={isGuest}
            onTryDemo={() => setIsDemoModeTriggered(true)}
            onJoinClass={() => setIsClaimInviteOpen(true)}
            onFindSchool={() => router.push('/welcome')}
          />
        ) : (
          <ScreenWrapper scroll={false} noTopInset={true}>
            <Box className="flex-1">
              <GlobalHeader
                title={t('classroom.mySanctuaries') || 'My Sanctuaries'}
                subtitle={undefined}
              />
              {renderNudge()}
              {isDemoModeTriggered && <SandboxBanner />}
              <StudentDashboard
                schoolId={schoolIdToUse || undefined}
                userId={classroomData.userId}
                onRefresh={fetchRoleData}
              />
            </Box>
          </ScreenWrapper>
        );

      surfaces.push({
        ...CLASSROOM_REGISTRY.student!,
        title: CLASSROOM_REGISTRY.student!.label,
        subtitle: CLASSROOM_REGISTRY.student!.description,
        summary:
          surfaceInsights?.student?.summary ??
          'Student-facing classroom flow across lessons, assignments, notes, and longitudinal story.',
        temporalLabel: surfaceInsights?.student?.temporalLabel ?? 'Journey',
        metadata: surfaceInsights?.student?.metadata ?? ['Academic', 'Student-owned'],
        content: studentContent,
      } as any as ClassroomWorkspaceSurface);
    }

    return surfaces;
  }, [
    can,
    t,
    isGuest,
    classroomData,
    schoolIdToUse,
    isDemoModeTriggered,
    setIsDemoModeTriggered,
    setIsCreateSchoolOpen,
    setIsCreateClassroomOpen,
    setIsClaimInviteOpen,
    fetchRoleData,
    renderNudge,
    surfaceInsights,
    isPro,
    userCapabilities,
    classroomGated.student,
    classroomGated.teacher,
    citizenship,
  ]);
}
