import { FormHydrator } from '@intuitui-labs/form-builder-engine/hydration';
import { useLocalSearchParams } from 'expo-router';

import LotusLoader from '@repo/ui/components/LotusLoader';
import { useThemedColors } from '@repo/ui/hooks';
import { Box, Heading, Text, VStack } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';

import { useEffect, useMemo, useState } from 'react';
import NativeForm from '../NativeForm';

interface FormTemplateField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
}

interface FormTemplate {
  id: string;
  title: string;
  description?: string;
  config: FormTemplateField[];
}

interface PublicFormScreenServices {
  loadFormBySlug?: (slug: string) => Promise<FormTemplate>;
  submitResponse?: (input: { templateId: string; data: Record<string, unknown> }) => Promise<void>;
}

interface PublicFormScreenWebProps {
  services?: PublicFormScreenServices;
}

export default function PublicFormScreenWeb({ services }: PublicFormScreenWebProps) {
  const { slug } = useLocalSearchParams<{ slug?: string | string[] }>();
  const normalizedSlug = Array.isArray(slug) ? slug[0] : slug;
  const colors = useThemedColors();
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const loadTemplate = useMemo(
    () => async () => {
      if (!normalizedSlug) {
        setError('Form slug is missing.');
        setLoading(false);
        return;
      }

      try {
        if (!services?.loadFormBySlug) {
          throw new Error('Public form host service is not configured.');
        }

        const data = await services.loadFormBySlug(normalizedSlug);
        setTemplate(data);
      } catch (err: any) {
        console.error('Failed to load form:', err);
        setError(err.message || 'Form not found or is no longer active.');
      } finally {
        setLoading(false);
      }
    },
    [services, normalizedSlug],
  );

  useEffect(() => {
    void loadTemplate();
  }, [loadTemplate]);

  if (loading) {
    return (
      <VStack
        sx={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.backgroundDark,
        }}
      >
        <LotusLoader />
        <Text sx={{ marginTop: 16, color: colors.textSecondary }}>
          Preparing your dignified experience...
        </Text>
      </VStack>
    );
  }

  if (error || !template) {
    return (
      <VStack
        sx={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.backgroundDark,
          padding: 40,
        }}
      >
        <Heading size="lg" sx={{ color: Theme.colors.emberRed }}>
          Access Denied
        </Heading>
        <Text
          sx={{
            textAlign: 'center',
            marginTop: 12,
            color: colors.textSecondary,
          }}
        >
          {error}
        </Text>
      </VStack>
    );
  }

  if (submitted) {
    return (
      <VStack
        sx={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.backgroundDark,
          padding: 40,
        }}
      >
        <Heading size="xl" sx={{ color: Theme.colors.sageGreen }}>
          Thank You
        </Heading>
        <Text
          sx={{
            textAlign: 'center',
            marginTop: 12,
            color: colors.textSecondary,
          }}
        >
          Your response has been securely recorded in the Gurudevi ecosystem.
        </Text>
      </VStack>
    );
  }

  const formSchema: any = { fields: {} };
  template.config.forEach((field) => {
    formSchema.fields[field.name] = {
      label: field.label,
      type: field.type,
      placeholder: field.placeholder,
      required: field.required,
    };
  });

  const manager = FormHydrator.hydrate(formSchema, async (values: Record<string, any>) => {
    try {
      if (!services?.submitResponse) {
        throw new Error('Public form host service is not configured.');
      }

      await services.submitResponse({
        templateId: template.id,
        data: values,
      });
      setSubmitted(true);
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    }
  });

  return (
    <VStack
      sx={{
        flex: 1,
        backgroundColor: colors.backgroundDark,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          backgroundColor: 'white',
          borderRadius: 32,
          padding: 40,
          borderWidth: 1,
          borderColor: colors.border,
          ...Theme.shadows.lg,
          maxWidth: 600,
          width: '100%',
        }}
      >
        <VStack sx={{ marginBottom: 32, alignItems: 'center' }}>
          <Heading size="xl" sx={{ textAlign: 'center' }}>
            {template.title}
          </Heading>
          {template.description && (
            <Text
              sx={{
                textAlign: 'center',
                marginTop: 8,
                color: colors.textSecondary,
              }}
            >
              {template.description}
            </Text>
          )}
        </VStack>
        <NativeForm manager={manager} submitLabel="Submit Response" />
      </Box>
    </VStack>
  );
}
