import React from 'react';
import { TeacherOnboardingView, StudentOnboardingView } from '@repo/classroom/components';
import TeacherDashboard from '@repo/classroom/screens/TeacherDashboard';
import StudentDashboard from '@repo/classroom/screens/StudentDashboard';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import SandboxBanner from '@repo/ui/components/SandboxBanner';
import { Box } from '@repo/ui/primitives';
import { useRouter } from 'expo-router';

export type ClassroomSurfaceProps = {
  isGuest: boolean;
  classroomData: {
    userId: string;
    schoolId: string | null;
    profileCompleted: boolean;
    realClassCount: number;
  };
  schoolIdToUse: string | null | undefined;
  isDemoModeTriggered: boolean;
  setIsDemoModeTriggered: (val: boolean) => void;
  setIsCreateClassroomOpen: (val: boolean) => void;
  setIsClaimInviteOpen: (val: boolean) => void;
  fetchRoleData: () => void | Promise<void>;
  renderNudge: () => React.ReactNode;
  t: (key: string) => string;
};

export const TeacherDashboardSurface: React.FC<ClassroomSurfaceProps> = ({
  isGuest,
  classroomData,
  schoolIdToUse,
  isDemoModeTriggered,
  setIsDemoModeTriggered,
  setIsCreateClassroomOpen,
  fetchRoleData,
  renderNudge,
}) => {
  const router = useRouter();
  if (classroomData.realClassCount === 0 && !isDemoModeTriggered) {
    return (
      <TeacherOnboardingView
        isGuest={isGuest}
        onTryDemo={() => setIsDemoModeTriggered(true)}
        onCreateClassroom={() => setIsCreateClassroomOpen(true)}
        onJoinSchool={() => router.push('/welcome')}
      />
    );
  }
  return (
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
};

export const StudentDashboardSurface: React.FC<ClassroomSurfaceProps> = ({
  isGuest,
  classroomData,
  schoolIdToUse,
  isDemoModeTriggered,
  setIsDemoModeTriggered,
  setIsClaimInviteOpen,
  fetchRoleData,
  renderNudge,
  t,
}) => {
  const router = useRouter();
  if (classroomData.realClassCount === 0 && !isDemoModeTriggered) {
    return (
      <StudentOnboardingView
        isGuest={isGuest}
        onTryDemo={() => setIsDemoModeTriggered(true)}
        onJoinClass={() => setIsClaimInviteOpen(true)}
        onFindSchool={() => router.push('/welcome')}
      />
    );
  }
  return (
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
};

export const CLASSROOM_SURFACE_REGISTRY: Record<
  string,
  React.ComponentType<ClassroomSurfaceProps>
> = {
  teacher: TeacherDashboardSurface,
  student: StudentDashboardSurface,
};
