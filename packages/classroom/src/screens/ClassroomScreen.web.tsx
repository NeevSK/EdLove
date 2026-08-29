import CreateClassroomModal from '@repo/classroom/components/CreateClassroomModal';
import PrincipalOnboardingView from '@repo/classroom/components/onboarding/PrincipalOnboardingView.web';
import PrincipalDashboardWebSurface from '@repo/classroom/screens/PrincipalDashboard.web';
// Direct imports for sub-views
import StudentDashboardWeb from '@repo/classroom/screens/StudentDashboard.web';
import TeacherDashboardWeb from '@repo/classroom/screens/TeacherDashboard.web';
import { usePermissions } from '@repo/core/logic';
import { useAuthStore } from '@repo/core/store';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { WebScreenHeader } from '@repo/ui/components/WebScreenHeader.web';
import { ArrowRight, School } from '@repo/ui/icons';
import { Box, Heading, Icon, Pressable, Text } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { useRouter } from 'expo-router';

/**
 * ClassroomScreen.web.tsx (POA 100% Realized)
 *
 * Purged of Intent system. Uses direct component resolution
 * driven by usePermissions hook.
 */
export default function ClassroomScreenWeb() {
  const { can, context } = usePermissions();
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const hasSchoolId = !!user?.school_id && user.school_id !== 'mock-school';
  const isWanderer = !!context.isAnonymous || !hasSchoolId;
  const _hasContext = true; // Simplified for restoration context

  const isTeacherLike = can('manage', 'TeacherDashboard');
  const isPrincipalLike = can('manage', 'PrincipalDashboard');
  const isStudentLike = can('manage', 'StudentDashboard');

  const isCitizenReady =
    !isWanderer && !!user && (isTeacherLike || isPrincipalLike || isStudentLike) && hasSchoolId;

  const hasBonds = context.bonds.length > 0;

  if (!hasBonds) {
    return (
      <ScreenWrapper>
        <Box className="flex-1 items-center justify-center gap-5 text-center">
          <School
            aria-hidden
            size={48}
            color={tokens.semantic.status.info}
            style={{ marginBottom: 16 }}
          />
          <Heading size="2xl" className="font-black text-phase-text-primary">
            Welcome to Gurudevi
          </Heading>
          <Text className="text-phase-text-secondary max-w-[400px]">
            {!hasBonds
              ? "Let's get you set up. Choose your capacity to get started."
              : 'Welcome! To access your classroom workspace, please join your school first.'}
          </Text>
          <Pressable
            className="bg-sanctuarySaffron px-6 py-4 rounded-[24px] flex-row items-center gap-3 mt-4"
            onPress={() => router.push('/auth')}
          >
            <Text className="text-white font-black">
              {!hasBonds ? 'Get started' : 'Join School'}
            </Text>
            <Icon as={ArrowRight} size={18} className="text-white" />
          </Pressable>
        </Box>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Box className="max-w-[1200px] mx-auto p-5">
        <WebScreenHeader
          title="The Academy"
          note={isPrincipalLike ? 'Institutional Oversight' : 'Growth & Mastery'}
          showPersonalizedGreeting={true}
        />

        <Box className="mt-6">
          {/* 2026 Sovereign Pattern: Enable Guest Exploration via forceDemo */}
          {(isCitizenReady || isWanderer) && (
            <>
              {isPrincipalLike && (
                <PrincipalDashboardWebSurface
                  PrincipalOnboardingViewComponent={PrincipalOnboardingView}
                  CreateClassroomModalComponent={CreateClassroomModal as any}
                />
              )}
              {isTeacherLike && !isPrincipalLike && <TeacherDashboardWeb />}
              {(isStudentLike || isWanderer) && !isTeacherLike && !isPrincipalLike && (
                <StudentDashboardWeb forceDemo={isWanderer} />
              )}
            </>
          )}
        </Box>
      </Box>
    </ScreenWrapper>
  );
}
