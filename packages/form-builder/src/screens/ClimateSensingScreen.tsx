import { FormManager } from '@intuitui-labs/form-builder-engine/core';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import { CircleCheck, Share2 } from '@repo/ui/icons';
import { Box, Center, ScrollView, Text, View } from '@repo/ui/primitives';
import { useCallback, useMemo, useState } from 'react';
import {
  type ClimateSensingData,
  createClimateSensingSchema,
} from '../apps/resilience-sensing-schema';
import NativeForm from '../NativeForm';

interface ClimateSensingScreenProps {
  schoolId: string;
  schoolName: string;
  onCompleted?: () => void;
}

export const ClimateSensingScreen = ({
  schoolId,
  schoolName,
  onCompleted,
}: ClimateSensingScreenProps) => {
  const [isFinished, setIsFinished] = useState(false);

  const handleSubmit = useCallback(
    async (values: ClimateSensingData) => {
      console.log(`Submitting Pulse for School ${schoolId}:`, values);

      // Simulating the Persistence Adapter call
      // In reality, this would be a Supabase mutation to EduSchoolPulseLog
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsFinished(true);
      onCompleted?.();
    },
    [schoolId, onCompleted],
  );

  const manager = useMemo(
    () => new FormManager(createClimateSensingSchema(handleSubmit)),
    [handleSubmit],
  );

  if (isFinished) {
    return (
      <Center className="flex-1 p-8 bg-phase-canvas">
        <Box className="w-full max-w-md items-center text-center">
          <Box className="bg-phase-success/10 p-6 rounded-full mb-6">
            <CircleCheck size={64} className="text-phase-success" />
          </Box>
          <Text className="text-3xl font-bold text-phaseText-primary mb-2 text-center">
            Resonance Registered
          </Text>
          <Text className="text-phaseText-secondary text-lg text-center mb-10">
            Thank you for contributing to the living history of {schoolName}. Your signal has been
            integrated into the national sensing map.
          </Text>

          <View className="w-full space-y-4">
            <SanctuaryButton className="bg-phase-accent py-4" fullWidth>
              <Text className="text-white font-bold">View Climate Insights</Text>
            </SanctuaryButton>

            <SanctuaryButton variant="outline" className="border-phase-interactive/10" fullWidth>
              <Share2 size={20} className="text-phaseText-secondary mr-2" />
              <Text className="text-phaseText-primary">Invite a Colleague</Text>
            </SanctuaryButton>
          </View>
        </Box>
      </Center>
    );
  }

  return (
    <ScrollView className="flex-1 bg-phase-surface">
      <Box className="p-6 bg-phase-accent pt-12 pb-16">
        <Text className="text-white/60 text-sm font-medium uppercase tracking-widest mb-1">
          Climate Sensing Layer
        </Text>
        <Text className="text-white text-3xl font-bold mb-2">{schoolName}</Text>
        <Text className="text-white/80 text-base leading-relaxed">
          Help us bridge the material and human dimensions of your school environment.
        </Text>
      </Box>

      <Box className="flex-1 px-6 -mt-8 bg-phase-canvas rounded-t-[40px] shadow-xl pt-10">
        <NativeForm manager={manager} submitLabel="Broadcast Pulse" />
      </Box>
    </ScrollView>
  );
};
