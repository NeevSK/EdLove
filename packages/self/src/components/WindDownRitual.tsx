import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Input,
  InputField,
  Button,
  ButtonText,
  Progress,
  ProgressFilledTrack,
  Theme,
  hapticLight,
  hapticSuccess,
  PositiveInvitation
} from '@repo/ui';
import { Moon, CheckCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

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
  const navigation = useNavigation<any>();
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
      title: t('self.breathe', 'Mindful Breathing'),
      description: t('self.breatheDesc', 'Take a few deep breaths to anchor yourself in the present moment.'),
      duration: 30
    },
    {
      id: 'reflect',
      title: t('self.reflect', 'Daily Reflection'),
      input: true,
      value: wentWell,
      setValue: setWentWell,
      placeholder: t('self.oneThingWentWell', 'One thing that went well today...')
    },
    {
      id: 'release',
      title: t('self.release', 'Letting Go'),
      input: true,
      value: toRelease,
      setValue: setToRelease,
      placeholder: t('self.oneThingRelease', 'One thing I am releasing tonight...')
    },
    {
      id: 'intent',
      title: t('self.tomorrowIntent', 'Tomorrow\'s Intent'),
      input: true,
      value: tomorrowIntent,
      setValue: setTomorrowIntent,
      placeholder: t('self.gentleIntentTomorrow', 'A gentle intention for tomorrow...')
    }
  ];

  const currentStepData = steps[currentStep] || steps[0]!; // Use ! as we know steps has items, or better a proper fallback.
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
    setWentWell('');
    setToRelease('');
    setTomorrowIntent('');
  };

  if (completed) {
    return (
      <VStack space="lg" sx={{ flex: 1, padding: Theme.spacing.md }}>
        <VStack space="xs">
          <HStack space="sm" sx={{ alignItems: 'center' }}>
            <Moon color={Theme.colors.sanctuarySaffron} size={24} />
            <Heading sx={{ color: Theme.colors.sacredWhite, fontSize: 20 }}>
              {t('self.windDown', 'Wind Down Ritual')}
            </Heading>
          </HStack>
          <Text sx={{ color: Theme.colors.mistGray, fontSize: 14 }}>
            {t('self.windDownDesc', 'Restoring balance before sleep.')}
          </Text>
        </VStack>

        <Box
          sx={{
            padding: Theme.spacing.xl,
            backgroundColor: Theme.colors.ink,
            borderRadius: Theme.corners.comfortable,
            alignItems: 'center'
          }}
        >
          <VStack space="lg" sx={{ alignItems: 'center', width: '100%' }}>
            <CheckCircle color={Theme.colors.sanctuarySaffron} size={64} />

            <VStack space="xs" sx={{ alignItems: 'center' }}>
              <Text sx={{ color: Theme.colors.sacredWhite, fontSize: 18, fontWeight: '700', textAlign: 'center' }}>
                {t('self.windDownComplete', 'Ritual Complete')}
              </Text>
              <Text sx={{ color: Theme.colors.mistGray, fontSize: 14, textAlign: 'center' }}>
                {t('self.windDownCompleteDesc', 'May your sleep be peaceful and restorative.')}
              </Text>
            </VStack>

            {/* Summary Section */}
            <VStack space="md" sx={{ width: '100%', marginTop: 16 }}>
              {wentWell.trim() !== '' && (
                <Box
                  sx={{
                    padding: Theme.spacing.md,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: Theme.corners.comfortable,
                    borderLeftWidth: 3,
                    borderLeftColor: Theme.colors.sanctuarySaffron
                  }}
                >
                  <Text sx={{ color: Theme.colors.dimGray, fontSize: 10, marginBottom: 4, fontWeight: '700', textTransform: 'uppercase' }}>
                    {t('self.wentWell', 'Went Well')}
                  </Text>
                  <Text sx={{ color: Theme.colors.sacredWhite, fontSize: 14 }}>
                    {wentWell}
                  </Text>
                </Box>
              )}

              {tomorrowIntent.trim() !== '' && (
                <Box
                  sx={{
                    padding: Theme.spacing.md,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: Theme.corners.comfortable,
                    borderLeftWidth: 3,
                    borderLeftColor: Theme.colors.sanctuarySaffron
                  }}
                >
                  <Text sx={{ color: Theme.colors.dimGray, fontSize: 10, marginBottom: 4, fontWeight: '700', textTransform: 'uppercase' }}>
                    {t('self.tomorrowIntentLabel', 'Intent for Tomorrow')}
                  </Text>
                  <Text sx={{ color: Theme.colors.sacredWhite, fontSize: 14 }}>
                    {tomorrowIntent}
                  </Text>
                </Box>
              )}
            </VStack>

            <Button
              variant="outline"
              onPress={handleReset}
              sx={{
                marginTop: 16,
                borderColor: Theme.colors.dimGray,
                borderRadius: Theme.corners.comfortable,
                width: '100%'
              }}
            >
              <ButtonText sx={{ color: Theme.colors.mistGray }}>
                {t('self.startAnother', 'Start Again')}
              </ButtonText>
            </Button>
          </VStack>
        </Box>
      </VStack>
    );
  }

  if (!userId) {
    return (
      <Box sx={{ flex: 1, padding: Theme.spacing.md }}>
        <PositiveInvitation
          type="guest"
          onAction={() => navigation.navigate('Auth' as never)}
        />
      </Box>
    );
  }

  return (
    <VStack space="lg" sx={{ flex: 1, padding: Theme.spacing.md }}>
      <VStack space="xs">
        <HStack space="sm" sx={{ alignItems: 'center' }}>
          <Moon color={Theme.colors.sanctuarySaffron} size={24} />
          <Heading sx={{ color: Theme.colors.sacredWhite, fontSize: 20 }}>
            {t('self.windDown', 'Wind Down Ritual')}
          </Heading>
        </HStack>
        <Text sx={{ color: Theme.colors.mistGray, fontSize: 14 }}>
          {t('self.windDownDesc', 'Restoring balance before sleep.')}
        </Text>
      </VStack>

      {/* Progress Bar */}
      <VStack space="xs">
        <HStack sx={{ justifyContent: 'space-between' }}>
          <Text sx={{ color: Theme.colors.mistGray, fontSize: 12 }}>
            {t('self.step', 'Step')} {currentStep + 1} {t('self.stepOf', 'of')} {steps.length}
          </Text>
          <Text sx={{ color: Theme.colors.mistGray, fontSize: 12 }}>
            {Math.round(progress)}%
          </Text>
        </HStack>
        <Progress value={progress} sx={{ height: 6, backgroundColor: 'rgba(255,255,255,0.1)' }}>
          <ProgressFilledTrack sx={{ backgroundColor: Theme.colors.sanctuarySaffron }} />
        </Progress>
      </VStack>

      {/* Current Step Content */}
      <Box
        sx={{
          padding: Theme.spacing.xl,
          backgroundColor: Theme.colors.ink,
          borderRadius: Theme.corners.comfortable,
          minHeight: 300,
          justifyContent: 'center'
        }}
      >
        <VStack space="xl">
          <VStack space="xs">
            <Text sx={{ color: Theme.colors.sanctuarySaffron, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>
              Step {currentStep + 1}
            </Text>
            <Heading sx={{ color: Theme.colors.sacredWhite, fontSize: 22 }}>
              {currentStepData.title}
            </Heading>
            {currentStepData.description && (
              <Text sx={{ color: Theme.colors.mistGray, fontSize: 16, lineHeight: 24 }}>
                {currentStepData.description}
              </Text>
            )}
          </VStack>

          {currentStepData.input && (
            <Box sx={{ marginTop: 8 }}>
              <Input
                variant="outline"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: Theme.corners.comfortable,
                  minHeight: 120,
                  padding: 8
                }}
              >
                <InputField
                  placeholder={currentStepData.placeholder}
                  value={currentStepData.value}
                  onChangeText={(text: string) => currentStepData.setValue?.(text)}
                  multiline
                  sx={{ 
                    color: Theme.colors.sacredWhite,
                    textAlignVertical: 'top',
                    fontSize: 15
                  }}
                  placeholderTextColor={Theme.colors.dimGray}
                />
              </Input>
            </Box>
          )}

          {currentStepData.id === 'breathe' && (
            <VStack space="md" sx={{ alignItems: 'center', marginTop: 16 }}>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: Theme.colors.sanctuarySaffron + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: Theme.colors.sanctuarySaffron + '40'
                }}
              >
                <Moon color={Theme.colors.sanctuarySaffron} size={40} />
              </Box>
              <Text sx={{ color: Theme.colors.mistGray, fontSize: 14, textAlign: 'center', maxWidth: 200 }}>
                {t('self.breatheInstructions', 'Breathe in slowly through your nose, and out through your mouth.')}
              </Text>
            </VStack>
          )}
        </VStack>
      </Box>

      {/* Navigation Controls */}
      <HStack space="md" sx={{ justifyContent: 'space-between', marginTop: 'auto', paddingBottom: Theme.spacing.lg }}>
        <Button
          variant="outline"
          onPress={handleBack}
          isDisabled={currentStep === 0}
          sx={{
            borderColor: 'rgba(255,255,255,0.1)',
            borderRadius: Theme.corners.comfortable,
            flex: 1
          }}
        >
          <ButtonText sx={{ color: Theme.colors.mistGray }}>
            {t('common.back', 'Back')}
          </ButtonText>
        </Button>
        <Button
          onPress={handleNext}
          isDisabled={!!currentStepData.input && (!currentStepData.value || currentStepData.value.trim() === '')}
          sx={{
            backgroundColor: Theme.colors.sanctuarySaffron,
            borderRadius: Theme.corners.comfortable,
            flex: 1
          }}
        >
          <ButtonText sx={{ color: Theme.colors.black, fontWeight: '700' }}>
            {currentStep === steps.length - 1 ? t('common.complete', 'Complete') : t('common.next', 'Next')}
          </ButtonText>
        </Button>
      </HStack>
    </VStack>
  );
}
