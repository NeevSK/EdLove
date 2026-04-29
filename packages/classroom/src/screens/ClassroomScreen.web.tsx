import { useNavigation } from '@react-navigation/native';
import { usePermissions } from '@repo/core';
import { useStore } from '@repo/core/logic';

import {
  ArrowRight,
  Box,
  Heading,
  Icon,
  LogIn,
  School as SchoolIcon,
  ScreenWrapper,
  Text,
} from '@repo/ui';
import { WebScreenHeader } from '@repo/ui/components';
import { Pressable } from '@repo/ui/primitives';

import React from 'react';
import CreateClassroomModal from '../components/CreateClassroomModal';
import PrincipalOnboardingView from '../components/onboarding/PrincipalOnboardingView.web';
import PrincipalDashboardWebSurface from './PrincipalDashboard.web';
// Direct imports for sub-views
import StudentDashboardWeb from './StudentDashboard.web';
import TeacherDashboardWeb from './TeacherDashboard.web';

/**
 * ClassroomScreen.web.tsx (POA 100% Realized)
 *
 * Purged of Intent system. Uses direct component resolution
 * driven by usePermissions hook.
 */
export default function ClassroomScreenWeb() {
  const { can, context } = usePermissions();
  const { user } = useStore();
  const navigation = useNavigation<any>();

  const isWanderer = context.isAnonymous;
  const hasContext = true; // Simplified for restoration context
  const hasSchoolId = !!user?.school_id && user.school_id !== 'mock-school';

  const isTeacherLike = can('manage', 'TeacherDashboard');
  const isPrincipalLike = can('manage', 'PrincipalDashboard');
  const isStudentLike = can('manage', 'StudentDashboard');

  const isCitizenReady =
    !isWanderer && !!user && (isTeacherLike || isPrincipalLike || isStudentLike) && hasSchoolId;

  if (context.roles.length === 0 || (!hasSchoolId && !isWanderer)) {
    return (
      <ScreenWrapper>
        <Box className="flex-1 items-center justify-center gap-5 text-center">
          <Text className="text-5xl font-black mb-4">🏫</Text>
          <Heading size="2xl" className="font-black text-phase-text-primary">
            Welcome to Gurudevi
          </Heading>
          <Text className="text-phase-text-secondary max-w-[400px]">
            {context.roles.length === 0
              ? "Let's get you set up. Choose your role to get started."
              : 'Welcome! To access your classroom workspace, please join your school first.'}
          </Text>
          <Pressable
            className="bg-sanctuarySaffron px-6 py-4 rounded-[24px] flex-row items-center gap-3 mt-4"
            onPress={() => navigation.navigate('Auth')}
          >
            <Text className="text-white font-black">
              {context.roles.length === 0 ? 'Get started' : 'Join School'}
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
          {/* Path 1: Anonymous guest or wanderer */}
          {isWanderer && (
            <Box className="p-10 items-center opacity-80">
              <Text className="text-4xl mb-4 text-phase-text-secondary opacity-50">🔭</Text>
              <Heading size="md" className="font-black text-phase-text-primary">
                Welcome, Wanderer
              </Heading>
              <Text className="text-phase-text-secondary text-center">
                Exploring the public curriculum and library.
              </Text>
            </Box>
          )}

          {/* Path 2: 1st Class Citizen - Direct Component Resolution */}
          {isCitizenReady && (
            <>
              {isPrincipalLike && (
                <PrincipalDashboardWebSurface
                  PrincipalOnboardingViewComponent={PrincipalOnboardingView}
                  CreateClassroomModalComponent={CreateClassroomModal as any}
                />
              )}
              {isTeacherLike && !isPrincipalLike && <TeacherDashboardWeb />}
              {isStudentLike && !isTeacherLike && !isPrincipalLike && <StudentDashboardWeb />}
            </>
          )}
        </Box>
      </Box>
    </ScreenWrapper>
  );
}
