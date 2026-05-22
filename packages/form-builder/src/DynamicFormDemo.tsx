import { FormHydrator, type HydrationPayload } from '@intuitui-labs/form-builder-engine/hydration';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import { Box, Text, VStack } from '@repo/ui/primitives';

import { useState } from 'react';
import NativeForm from './NativeForm';

/**
 * A demonstration of how to load a form dynamically from JSON.
 * This is the basis for a "Google Forms" style capability.
 */
export default function DynamicFormDemo() {
  const [submittedData, setSubmittedData] = useState<any>(null);

  // This JSON could come from a database (Supabase)
  const userGeneratedSchema: HydrationPayload = {
    fields: [
      {
        name: 'fullName',
        type: 'text',
        label: 'What is your full name?',
        placeholder: 'e.g. John Doe',
        validate: 'nonEmpty',
      },
      {
        name: 'email',
        type: 'email',
        label: 'Your Contact Email',
        placeholder: 'john@example.com',
        validate: 'email',
      },
      {
        name: 'feedback',
        label: 'Share your thoughts with the community',
        type: 'textarea',
        placeholder: 'Write something inspired...',
      },
    ],
  };

  const manager = FormHydrator.hydrate(
    userGeneratedSchema,
    async (values: Record<string, unknown>) => {
      console.log('Dynamic Form Submitted:', values);
      setSubmittedData(values);
    },
  );

  return (
    <VStack space="xl" className="p-4">
      <Box>
        <Text size="xl" className="font-bold">
          Dynamic Form Preview
        </Text>
        <Text size="sm" className="text-phase-text-secondary">
          This form was generated entirely from a JSON object.
        </Text>
      </Box>

      {!submittedData ? (
        <NativeForm manager={manager} submitLabel="Share Resonance" />
      ) : (
        <Box className="rounded-md bg-phase-surface p-4">
          <Text className="font-bold">Thank you for sharing!</Text>
          <Text size="xs" className="mt-2">
            Data received: {JSON.stringify(submittedData, null, 2)}
          </Text>
          <SanctuaryButton
            onPress={() => setSubmittedData(null)}
            variant="outline"
            size="sm"
            style={{ marginTop: 12 }}
          >
            Reset Demo
          </SanctuaryButton>
        </Box>
      )}
    </VStack>
  );
}
