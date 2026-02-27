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
  ProgressFilledTrack
} from '@repo/ui';
import { Moon, CheckCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '@repo/ui';
import { hapticLight, hapticSuccess } from '@repo/ui';
import { SkeletonCard } from '@repo/ui';
import { PositiveInvitation } from '@repo/ui';

interface WindDownRitualProps {
  userId?: string;
}

export default function WindDownRitual({ userId }: WindDownRitualProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Wind-down steps
  const [wentWell, setWentWell] = useState('');
  const [toRelease, setToRelease] = useState('');
  const [tomorrowIntent, setTomorrowIntent] = useState('');

  const steps = [
    {
      id: 'breathe',
      title: t('self.breathe'),
      description: t('self.breatheDesc'),
      duration: 30
    },
    {
      id: 'reflect',
      title: t('self.reflect'),
      input: true,
      value: wentWell,
      setValue: setWentWell,
      placeholder: t('self.oneThingWentWell')
    },
    {
      id: 'release',
      title: t('self.release'),
      input: true,
      value: toRelease,
      setValue: setToRelease,
      placeholder: t('self.oneThingRelease')
    },
    {
      id: 'intent',
      title: t('self.tomorrowIntent'),
      input: true,
      value: tomorrowIntent,
      setValue: setTomorrowIntent,
      placeholder: t('self.gentleIntentTomorrow')
    }
  ];

  const currentStepData = steps[currentStep];
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
      <VStack space="lg" sx={{ flex: 1 }}>
        <VStack space="xs">
          <HStack space="sm" alignItems="center">
            <Moon color={Theme.colors.sanctuarySaffron} size={24} />
            <Heading color={Theme.colors.sacredWhite} size="lg">
              {t('self.windDown')}
            </Heading>
          </HStack>
          <Text color={Theme.colors.mistGray} size="sm">
            {t('self.windDownDesc')}
          </Text>
        </VStack>

        <Box
          p={Theme.spacing.xl}
          sx={{
            backgroundColor: Theme.colors.ink,
            borderRadius: Theme.corners.comfortable
          }}
        >
          <VStack space="lg" alignItems="center">
            <CheckCircle color={Theme.colors.sanctuarySaffron} size={64} />

            <VStack space="xs" alignItems="center">
              <Text
                color={Theme.colors.sacredWhite}
                size="xl"
                bold
                textAlign="center"
              >
                {t('self.windDownComplete')}
              </Text>
              <Text
                color={Theme.colors.mistGray}
                size="md"
                textAlign="center"
              >
                {t('self.windDownCompleteDesc')}
              </Text>
            </VStack>

            {/* Summary */}
            <VStack space="md" w="$full" mt="$4">
              {wentWell && (
                <Box
                  p="$3"
                  sx={{
                    backgroundColor: Theme.colors.ink,
                    borderRadius: Theme.corners.comfortable,
                    borderLeftWidth: 3,
                    borderLeftColor: Theme.colors.sanctuarySaffron
                  }}
                >
                  <Text color={Theme.colors.dimGray} size="xs" mb="$1">
                    {t('self.wentWell')}
                  </Text>
                  <Text color={Theme.colors.sacredWhite} size="sm">
                    {wentWell}
                  </Text>
                </Box>
              )}

              {tomorrowIntent && (
                <Box
                  p="$3"
                  sx={{
                    backgroundColor: Theme.colors.ink,
                    borderRadius: Theme.corners.comfortable,
                    borderLeftWidth: 3,
                    borderLeftColor: Theme.colors.sanctuarySaffron
                  }}
                >
                  <Text color={Theme.colors.dimGray} size="xs" mb="$1">
                    {t('self.tomorrowIntentLabel')}
                  </Text>
                  <Text color={Theme.colors.sacredWhite} size="sm">
                    {tomorrowIntent}
                  </Text>
                </Box>
              )}
            </VStack>

            <Button
              size="md"
              variant="outline"
              onPress={handleReset}
              mt="$4"
              sx={{
                borderColor: Theme.colors.dimGray,
                borderRadius: Theme.corners.comfortable
              }}
            >
              <ButtonText color={Theme.colors.mistGray}>
                {t('self.startAnother')}
              </ButtonText>
            </Button>
          </VStack>
        </Box>
      </VStack>
    );
  }

  if (!userId) {
    return (
      <PositiveInvitation
        type="guest"
        onAction={() => { }} // TODO: Navigate to Auth
      />
    );
  }

  return (
    <VStack space="lg" sx={{ flex: 1 }}>
      <VStack space="xs">
        <HStack space="sm" alignItems="center">
          <Moon color={Theme.colors.sanctuarySaffron} size={24} />
          <Heading color={Theme.colors.sacredWhite} size="lg">
            {t('self.windDown')}
          </Heading>
        </HStack>
        <Text color={Theme.colors.mistGray} size="sm">
          {t('self.windDownDesc')}
        </Text>
      </VStack>

      {/* Progress Bar */}
      <VStack space="xs">
        <HStack justifyContent="space-between">
          <Text color={Theme.colors.mistGray} size="xs">
            {t('self.step')} {currentStep + 1} {t('self.stepOf')} {steps.length}
          </Text>
          <Text color={Theme.colors.mistGray} size="xs">
            {Math.round(progress)}%
          </Text>
        </HStack>
        <Progress value={progress} size="sm">
          <ProgressFilledTrack
            sx={{ backgroundColor: Theme.colors.sanctuarySaffron }}
          />
        </Progress>
      </VStack>

      {/* Current Step */}
      <Box
        p={Theme.spacing.xl}
        sx={{
          backgroundColor: Theme.colors.ink,
          borderRadius: Theme.corners.comfortable,
          minHeight: 250
        }}
      >
        <VStack space="lg" sx={{ flex: 1 }}>
          <VStack space="xs">
            <Text
              color={Theme.colors.sanctuarySaffron}
              size="sm"
              bold
            >
              {currentStepData.id === 'breathe' ? '🌙' : '✍️'} Step {currentStep + 1}
            </Text>
            <Heading color={Theme.colors.sacredWhite} size="md">
              {currentStepData.title}
            </Heading>
            {currentStepData.description && (
              <Text color={Theme.colors.mistGray} size="md">
                {currentStepData.description}
              </Text>
            )}
          </VStack>

          {currentStepData.input && (
            <Box>
              <Input
                variant="outline"
                size="md"
                sx={{
                  backgroundColor: Theme.colors.ink,
                  borderWidth: 1,
                  borderColor: Theme.colors.transparent,
                  minHeight: 100
                }}
              >
                <InputField
                  placeholder={currentStepData.placeholder}
                  value={currentStepData.value}
                  onChangeText={currentStepData.setValue}
                  multiline
                  color={Theme.colors.sacredWhite}
                  placeholderTextColor={Theme.colors.dimGray}
                  sx={{ textAlignVertical: 'top' }}
                />
              </Input>
            </Box>
          )}

          {currentStepData.id === 'breathe' && (
            <VStack space="md" alignItems="center" mt="$4">
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: Theme.colors.sanctuarySaffron + '20',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Text fontSize="$4xl">🌙</Text>
              </Box>
              <Text color={Theme.colors.mistGray} size="sm" textAlign="center">
                {t('self.breatheInstructions')}
              </Text>
            </VStack>
          )}
        </VStack>
      </Box>

      {/* Navigation */}
      <HStack space="md" justifyContent="space-between">
        <Button
          size="md"
          variant="outline"
          onPress={handleBack}
          isDisabled={currentStep === 0}
          sx={{
            borderColor: Theme.colors.ink,
            borderRadius: Theme.corners.comfortable,
            flex: 1
          }}
        >
          <ButtonText color={Theme.colors.mistGray}>
            {t('common.back')}
          </ButtonText>
        </Button>
        <Button
          size="md"
          action="primary"
          onPress={handleNext}
          isDisabled={
            currentStepData.input && !currentStepData.value?.trim()
          }
          sx={{
            backgroundColor: Theme.colors.sanctuarySaffron,
            borderRadius: Theme.corners.comfortable,
            flex: 1
          }}
        >
          <ButtonText>
            {currentStep === steps.length - 1 ? t('common.complete') : t('common.next')}
          </ButtonText>
        </Button>
      </HStack>
    </VStack>
  );
}
