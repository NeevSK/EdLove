import { View, Text, ScrollView } from 'react-native';
import { FormManager } from '@intuitui-labs/form-builder-engine/core';
import {
  type ClimateSurveyTheme,
  createSchoolClimateSurveySchema,
} from '@intuitui-labs/form-builder-engine/templates';
import NativeForm from '@repo/form-builder/NativeForm';
import { Button } from '@repo/ui/components/native';
import { CircleCheck, Share2 } from '@repo/ui/icons';
import { useCallback, useMemo, useState } from 'react';

interface ClimateSensingScreenProps {
  schoolId: string;
  schoolName: string;
  theme?: ClimateSurveyTheme;
  onSubmitted?: (responses: Record<string, unknown>) => void;
}

export function ClimateSensingScreen({
  schoolId,
  schoolName,
  theme = 'general',
  onSubmitted,
}: ClimateSensingScreenProps) {
  const [submitted, setSubmitted] = useState(false);

  const schema = useMemo(() => {
    return createSchoolClimateSurveySchema(schoolName, theme);
  }, [schoolName, theme]);

  const manager = useMemo(() => {
    const mgr = new FormManager();
    mgr.loadSchema(schema);
    return mgr;
  }, [schema]);

  const handleSubmit = useCallback(
    (values: Record<string, unknown>) => {
      onSubmitted?.(values);
      setSubmitted(true);
    },
    [onSubmitted],
  );

  manager.onSubmit = handleSubmit;

  if (submitted) {
    return (
      <View className="flex-1 p-8 bg-phase-canvas items-center justify-center">
        <View className="w-full max-w-md items-center text-center">
          <View className="bg-phase-success/10 p-6 rounded-full mb-6">
            <CircleCheck size={64} className="text-phase-success" />
          </View>
          <Text className="text-3xl font-bold text-phaseText-primary mb-2 text-center">
            Resonance Registered
          </Text>
          <Text className="text-phaseText-secondary text-lg text-center mb-10">
            Thank you for contributing to the living history of {schoolName}. Your signal has been
            integrated into the national sensing map.
          </Text>

          <View className="w-full gap-4">
            <Button
              label="View Climate Insights"
              variant="primary"
              size="lg"
              fullWidth
            />

            <Button
              label="Invite a Colleague"
              icon={Share2}
              variant="secondary"
              size="lg"
              fullWidth
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-phase-surface">
      <View className="p-6 bg-phase-accent pt-12 pb-16">
        <Text className="text-white/60 text-sm font-medium uppercase tracking-widest mb-1">
          Climate Sensing Layer
        </Text>
        <Text className="text-white text-3xl font-bold mb-2">{schoolName}</Text>
        <Text className="text-white/80 text-base leading-relaxed">
          Your feedback is anonymous and helps our institution weave a responsive, calm sanctuary
          for everyone.
        </Text>
      </View>

      <View className="-mt-8 p-6 bg-phase-surface rounded-t-3xl shadow-xl flex-1">
        <NativeForm manager={manager} submitLabel="Submit Reflection" />
      </View>
    </ScrollView>
  );
}
