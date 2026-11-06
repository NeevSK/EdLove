import { View, Text } from 'react-native';
import { FormHydrator, type HydrationPayload } from '@intuitui-labs/form-builder-engine/hydration';
import { Button } from '@repo/ui/components/native';
import { useState } from 'react';
import NativeForm from '@repo/form-builder/NativeForm';

const DEMO_SCHEMA: HydrationPayload = {
  version: '1.0.0',
  title: 'Daily Reflection & Resonance',
  description: 'A simple self-inquiry check-in powered by IntuitUI Form Builder.',
  elements: [
    {
      id: 'mood_slider',
      type: 'slider',
      label: 'Inner Energy Level',
      description: 'How is your reservoir feeling right now? (1 = Depleted, 5 = Radiant)',
      required: true,
      extraProps: {
        min: 1,
        max: 5,
        step: 1,
        defaultValue: 3,
      },
    },
    {
      id: 'focus_area',
      type: 'select',
      label: 'Domain of Attention',
      description: 'Where is your primary mental current anchored today?',
      required: true,
      options: [
        { label: 'Deep Learning & Study', value: 'study' },
        { label: 'Creative Synthesis', value: 'creative' },
        { label: 'Rest & Somatic Restoration', value: 'rest' },
        { label: 'Community & Shared Space', value: 'community' },
      ],
    },
    {
      id: 'reflection_note',
      type: 'textarea',
      label: 'Somatic Observations',
      description: 'Any physical sensations, thoughts, or subtle resistances?',
      required: false,
      extraProps: {
        placeholder: 'Breathe into what is alive for you...',
      },
    },
  ],
};

export function DynamicFormDemo() {
  const [submittedData, setSubmittedData] = useState<Record<string, unknown> | null>(null);
  const [manager] = useState(() =>
    FormHydrator.hydrate(DEMO_SCHEMA, async (data: Record<string, unknown>) => {
      setSubmittedData(data);
    }),
  );

  return (
    <View className="flex-1 p-6">
      <View className="mb-6">
        <Text className="text-xl font-bold text-phase-text-primary">Dynamic Form Hydrator</Text>
        <Text className="text-sm text-phase-text-secondary">
          This form was generated entirely from a JSON object.
        </Text>
      </View>

      {!submittedData ? (
        <NativeForm manager={manager} submitLabel="Share Resonance" />
      ) : (
        <View className="rounded-md bg-phase-surface p-4">
          <Text className="font-bold">Thank you for sharing!</Text>
          <Text className="mt-2 text-xs">
            Data received: {JSON.stringify(submittedData, null, 2)}
          </Text>
          <View className="mt-3">
            <Button
              label="Reset Demo"
              onPress={() => setSubmittedData(null)}
              variant="secondary"
              size="sm"
            />
          </View>
        </View>
      )}
    </View>
  );
}
