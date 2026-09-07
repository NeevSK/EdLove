import { communityAPI } from '@repo/community';
import { schoolAPI } from '@repo/core/api/client';
import { useSchoolCreation } from '@repo/core/hooks';
import { useStore } from '@repo/core/logic';
import { KeyboardAwareForm } from '@repo/core/hooks/useKeyboard';

import { QRBuilder, QRCodeGenerator } from '@repo/scanner-kit';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import StepIndicator from '@repo/ui/components/StepIndicator';
import { Check } from '@repo/ui/icons';
import { Box, Heading, HStack, Icon, ScrollView, Spinner, Text, VStack } from '@repo/ui/primitives';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Step Components
import StepBasicInfo from '@repo/admin/components/school/StepBasicInfo';
import StepDemographics from '@repo/admin/components/school/StepDemographics';
import StepHierarchy from '@repo/admin/components/school/StepHierarchy';
import StepLocation from '@repo/admin/components/school/StepLocation';

const TOTAL_STEPS = 4;
const STEP_LABELS = [
  'Basic Information',
  'Location & Area',
  'Students & Identity',
  'Hierarchy & Levels',
];

export default function SchoolCreationScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const setDemoMode = useStore((s) => s.setDemoMode);
  const { showToast } = useSanctuaryToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{
    schoolId: string;
    groupId: string;
    schoolName: string;
  } | null>(null);

  const {
    state,
    updateStep,
    updateBasicInfo,
    updateLocation,
    updateDemographics,
    updateHierarchy,
    resetProgress,
  } = useSchoolCreation();

  const handleNext = () => {
    if (state.step < TOTAL_STEPS) {
      updateStep(state.step + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleBack = () => {
    if (state.step > 1) {
      updateStep(state.step - 1);
    }
  };

  const handleFinalSubmit = async () => {
    if (!user) return;

    try {
      setIsSubmitting(true);

      const hasPrimary = state.hierarchy.levels.some((l) => l.toLowerCase().includes('primary'));
      const hasSecondary = state.hierarchy.levels.some((l) =>
        l.toLowerCase().includes('secondary'),
      );
      const typeValue = hasPrimary && hasSecondary ? 'mixed' : hasPrimary ? 'primary' : 'secondary';

      // 1. Create School
      const school = await schoolAPI.create({
        name: state.basicInfo.name || 'My Sanctuary',
        handle: state.basicInfo.handle,
        type: typeValue,
        created_by: user.id,
      });

      // 2. Create Community Group
      const group = await communityAPI.createGroupWithOwner(
        {
          name: `${school.name} HQ`,
          handle: `${state.basicInfo.handle}-hq`,
          description: `Official community portal for ${school.name}`,
          group_type: 'general',
          join_policy: 'open',
          school_id: school.id,
        },
        user.id,
      );

      // 3. Update Global Store & Disable Demo Mode
      setUser({
        ...user,
        school_id: school.id,
      });
      setDemoMode(false);

      // Set Success Data and Reset local cache
      setSuccessData({
        schoolId: school.id,
        groupId: group.id,
        schoolName: school.name,
      });
      await resetProgress();
    } catch (error) {
      console.error('Failed to establish school', error);
      showToast({
        message: 'We could not establish the school yet. Your form is still here—please try again.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (state.step) {
      case 1:
        return <StepBasicInfo data={state.basicInfo} onUpdate={updateBasicInfo} />;
      case 2:
        return <StepLocation data={state.location} onUpdate={updateLocation} />;
      case 3:
        return <StepDemographics data={state.demographics} onUpdate={updateDemographics} />;
      case 4:
        return <StepHierarchy data={state.hierarchy} onUpdate={updateHierarchy} />;
      default:
        return null;
    }
  };

  if (isSubmitting) {
    return (
      <ScreenWrapper noTopInset={true}>
        <GlobalHeader title="Establishing Sanctuary..." />
        <Box className="flex-1 bg-phase-canvas items-center justify-center p-8">
          <Spinner size="large" />
          <Text className="mt-6 text-phaseText-secondary text-center font-black uppercase tracking-widest text-xs">
            Constructing digital foundations...
          </Text>
        </Box>
      </ScreenWrapper>
    );
  }

  if (successData) {
    return (
      <ScreenWrapper noTopInset={true}>
        <GlobalHeader title="Sanctuary Established!" />
        <ScrollView
          className="bg-phase-canvas"
          contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
        >
          <VStack className="gap-8 items-center mt-8">
            <Box className="w-24 h-24 rounded-full bg-phase-interactive items-center justify-center shadow-lg">
              <Icon as={Check} size={48} className="text-white" strokeWidth={3} />
            </Box>

            <VStack className="gap-1 items-center">
              <Heading className="text-2xl text-center text-phase-interactive font-black">
                {successData.schoolName} is Live
              </Heading>
              <Text className="text-phaseText-secondary text-center font-bold">
                Your digital foundations are successfully established.
              </Text>
            </VStack>

            <Box className="w-full items-center bg-phase-interactive/5 p-8 rounded-3xl border border-phase-border">
              <Text className="text-xs font-black text-phase-interactive mb-4 text-center uppercase tracking-widest">
                Share this QR to invite others
              </Text>
              <QRCodeGenerator
                value={QRBuilder.school(successData.schoolId, successData.groupId)}
                size={180}
                label={successData.schoolName}
                errorCorrectionLevel="H"
              />
              <Text className="text-xs text-phaseText-secondary mt-4 text-center font-bold">
                Scanning joins {successData.schoolName} and its Community HQ group
              </Text>
            </Box>

            <Box className="w-full mt-6 gap-4">
              <SanctuaryButton
                onPress={() => router.push('/workspace')}
                size="lg"
                className="w-full"
              >
                Set Up School Structure
              </SanctuaryButton>
              <Text className="text-[11px] text-phaseText-muted text-center opacity-60">
                Add grades, sections and grade heads. Teachers join via the QR above, then create
                their own classrooms.
              </Text>
            </Box>
          </VStack>
        </ScrollView>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper noTopInset={true}>
      <GlobalHeader title="Establish School" subtitle="Bring your sanctuary to life" showBack />

      <StepIndicator currentStep={state.step} totalSteps={TOTAL_STEPS} stepLabels={STEP_LABELS} />

      <KeyboardAwareForm>
        <ScrollView
          className="bg-phase-canvas"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
        >
          <Box className="p-4">{renderStep()}</Box>
        </ScrollView>
      </KeyboardAwareForm>

      {/* Footer Navigation */}
      <Box className="absolute bottom-0 left-0 right-0 bg-phase-surface border-t border-phase-border p-5 pb-10">
        <HStack className="gap-4">
          {state.step > 1 && (
            <Box className="flex-1">
              <SanctuaryButton variant="outline" onPress={handleBack}>
                Back
              </SanctuaryButton>
            </Box>
          )}
          <Box className="flex-2">
            <SanctuaryButton onPress={handleNext}>
              {state.step === TOTAL_STEPS ? 'Complete Setup' : 'Continue'}
            </SanctuaryButton>
          </Box>
        </HStack>
      </Box>
    </ScreenWrapper>
  );
}
