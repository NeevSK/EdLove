import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import { CircleCheck, Moon } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Icon,
  Input,
  InputField,
  Progress,
  ProgressFilledTrack,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// —————————————————————————————————————————————————————————————————————————————
// TYPES
// —————————————————————————————————————————————————————————————————————————————

interface Step {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  input?: boolean;
  value?: string;
  setValue?: (text: string) => void;
  placeholder?: string;
}

interface WindDownRitualProps {
  userId?: string;
}

// —————————————————————————————————————————————————————————————————————————————
// COMPONENT
// —————————————————————————————————————————————————————————————————————————————

export default function WindDownRitual({ userId }: WindDownRitualProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Wind-down steps state
  const [wentWell, setWentWell] = useState('');
  const [toRelease, setToRelease] = useState('');
  const [tomorrowIntent, setTomorrowIntent] = useState('');

  const steps: Step[] = [
    {
      id: 'breathe',
      title: t('self.breathe') || 'Mindful Breathing',
      description:
        t('self.breatheDesc') ||
        'Take a few deep breaths to anchor yourself in the present moment.',
      duration: 30,
    },
    {
      id: 'reflect',
      title: t('self.reflect') || 'Daily Reflection',
      input: true,
      value: wentWell,
      setValue: setWentWell,
      placeholder: t('self.oneThingWentWell') || 'One thing that went well today...',
    },
    {
      id: 'release',
      title: t('self.release') || 'Letting Go',
      input: true,
      value: toRelease,
      setValue: setToRelease,
      placeholder: t('self.oneThingRelease') || 'One thing I am releasing tonight...',
    },
    {
      id: 'intent',
      title: t('self.tomorrowIntent') || "Tomorrow's Intent",
      input: true,
      value: tomorrowIntent,
      setValue: setTomorrowIntent,
      placeholder: t('self.gentleIntentTomorrow') || 'A gentle intention for tomorrow...',
    },
  ];

  const currentStepData = steps[currentStep] || steps[0]!;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    hapticLight();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      hapticSuccess();
      setCompleted(true);
    }
  };

  const handleBack = () => {
    hapticLight();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    hapticLight();
    setCurrentStep(0);
    setCompleted(false);
  };

  if (completed) {
    return (
      <VStack className="flex-1 p-lg gap-lg">
        <VStack className="gap-1">
          <HStack className="items-center gap-2">
            <Icon as={Moon} className="text-sanctuarySaffron" size={24} />
            <Heading className="text-sacredWhite" size="xl">
              {t('self.windDown') || 'Wind Down Ritual'}
            </Heading>
          </HStack>
          <Text className="text-mistGray text-sm">
            {t('self.windDownDesc') || 'Restoring balance before sleep.'}
          </Text>
        </VStack>

        <Box className="p-xl bg-ink rounded-comfortable items-center">
          <VStack className="items-center w-full gap-lg">
            <Icon as={CircleCheck} className="text-sanctuarySaffron" size={48} />

            <VStack className="items-center gap-1">
              <Text className="text-sacredWhite text-lg font-bold text-center">
                {t('self.windDownComplete') || 'Ritual Complete'}
              </Text>
              <Text className="text-mistGray text-sm text-center">
                {t('self.windDownCompleteDesc') || 'May your sleep be peaceful and restorative.'}
              </Text>
            </VStack>

            {/* Summary Section */}
            <VStack className="w-full gap-4 mt-4">
              {wentWell.trim() !== '' && (
                <Box className="p-md bg-white/5 rounded-comfortable border-l-4 border-sanctuarySaffron">
                  <Text className="text-dimGray text-[10px] font-bold uppercase mb-1">
                    {t('self.wentWell') || 'Went Well'}
                  </Text>
                  <Text className="text-sacredWhite text-sm">{wentWell}</Text>
                </Box>
              )}

              {tomorrowIntent.trim() !== '' && (
                <Box className="p-md bg-white/5 rounded-comfortable border-l-4 border-sanctuarySaffron">
                  <Text className="text-dimGray text-[10px] font-bold uppercase mb-1">
                    {t('self.tomorrowIntentLabel') || 'Intent for Tomorrow'}
                  </Text>
                  <Text className="text-sacredWhite text-sm">{tomorrowIntent}</Text>
                </Box>
              )}
            </VStack>

            <Button
              variant="outline"
              onPress={handleReset}
              className="mt-lg border-dimGray rounded-comfortable w-full"
            >
              <ButtonText className="text-mistGray font-bold">
                {t('self.startAnother') || 'Start Again'}
              </ButtonText>
            </Button>
          </VStack>
        </Box>
      </VStack>
    );
  }

  if (!userId) {
    return (
      <Box className="flex-1 p-lg">
        <PositiveInvitation type="anonymous" onAction={() => router.push('/auth')} />
      </Box>
    );
  }

  return (
    <VStack className="flex-1 p-lg gap-lg">
      <VStack className="gap-1">
        <HStack className="items-center gap-2">
          <Icon as={Moon} className="text-sanctuarySaffron" size={24} />
          <Heading className="text-sacredWhite" size="xl">
            {t('self.windDown') || 'Wind Down Ritual'}
          </Heading>
        </HStack>
        <Text className="text-mistGray text-sm">
          {t('self.windDownDesc') || 'Restoring balance before sleep.'}
        </Text>
      </VStack>

      {/* Progress Bar */}
      <VStack className="gap-1">
        <HStack className="justify-between items-center px-1">
          <Text className="text-mistGray text-xs">
            {t('self.step') || 'Step'} {currentStep + 1} {t('self.stepOf') || 'of'} {steps.length}
          </Text>
          <Text className="text-mistGray text-xs font-bold">{Math.round(progress)}%</Text>
        </HStack>
        <Progress value={progress} className="h-1.5 bg-white/10 rounded-full">
          <ProgressFilledTrack className="bg-sanctuarySaffron" />
        </Progress>
      </VStack>

      {/* Current Step Content */}
      <Box className="p-xl bg-ink rounded-comfortable min-h-[350px] justify-center">
        <VStack className="gap-6">
          <VStack className="gap-2">
            <Text className="text-sanctuarySaffron text-xs font-bold uppercase tracking-wider">
              Step {currentStep + 1}
            </Text>
            <Heading className="text-sacredWhite" size="xl">
              {currentStepData.title}
            </Heading>
            {currentStepData.description && (
              <Text className="text-mistGray text-base leading-relaxed">
                {currentStepData.description}
              </Text>
            )}
          </VStack>

          {currentStepData.input && (
            <Box className="mt-2">
              <Input className="bg-white/5 border-white/10 rounded-comfortable min-h-[140px]">
                <InputField
                  placeholder={currentStepData.placeholder}
                  value={currentStepData.value}
                  onChangeText={(text: string) => currentStepData.setValue?.(text)}
                  multiline
                  className="text-sacredWhite text-sm p-4"
                  placeholderTextColor="#6A6358"
                />
              </Input>
            </Box>
          )}

          {currentStepData.id === 'breathe' && (
            <VStack className="items-center mt-4 gap-4">
              <Box className="w-24 h-24 rounded-full bg-sanctuarySaffron/10 items-center justify-center border-2 border-sanctuarySaffron/20">
                <Icon as={Moon} className="text-sanctuarySaffron" size={40} />
              </Box>
              <Text className="text-mistGray text-sm text-center max-w-[240px] italic">
                {t('self.breatheInstructions') ||
                  'Breathe in slowly through your nose, and out through your mouth.'}
              </Text>
            </VStack>
          )}
        </VStack>
      </Box>

      {/* Navigation Controls */}
      <HStack className="justify-between mt-auto pb-4 gap-4">
        <Button
          variant="outline"
          onPress={handleBack}
          isDisabled={currentStep === 0}
          className="border-white/10 rounded-comfortable flex-1 h-12"
        >
          <ButtonText className="text-mistGray font-bold">{t('common.back') || 'Back'}</ButtonText>
        </Button>
        <Button
          onPress={handleNext}
          isDisabled={
            !!currentStepData.input &&
            (!currentStepData.value || currentStepData.value.trim() === '')
          }
          className="bg-sanctuarySaffron rounded-comfortable flex-1 h-12"
        >
          <ButtonText className="text-black font-bold">
            {currentStep === steps.length - 1
              ? t('common.complete') || 'Complete'
              : t('common.next') || 'Next'}
          </ButtonText>
        </Button>
      </HStack>
    </VStack>
  );
}
