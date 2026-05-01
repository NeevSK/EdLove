import { useRoute } from '@react-navigation/native';
import { FormHydrator } from '@repo/core/logic';
import { FormTemplate } from '@repo/core/types';
import { api } from '@repo/core/api';

import LotusLoader from '@repo/ui/components/LotusLoader';
import { useThemedColors } from '@repo/ui/hooks';
import { Box } from '@repo/ui/primitives';
import { Heading, Text, VStack } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';

import { useEffect, useState } from 'react';
import NativeForm from '../NativeForm';

export default function PublicFormScreenWeb() {
  const route = useRoute<any>();
  const { slug } = route.params || {};
  const colors = useThemedColors();
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (slug) {
      loadTemplate();
    } else {
      setError('Form slug is missing.');
      setLoading(false);
    }
  }, [slug, loadTemplate]);

  async function loadTemplate() {
    try {
      const data = await api.forms.getBySlug(slug);
      setTemplate(data);
    } catch (err: any) {
      console.error('Failed to load form:', err);
      setError(err.message || 'Form not found or is no longer active.');
    } finally {
      setLoading(false);
    }
  }

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
        <Text sx={{ textAlign: 'center', marginTop: 12, color: colors.textSecondary }}>
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
        <Text sx={{ textAlign: 'center', marginTop: 12, color: colors.textSecondary }}>
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

  const manager = FormHydrator.hydrate(formSchema, async (values) => {
    try {
      await api.forms.submitResponse({
        template_id: template.id,
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
            <Text sx={{ textAlign: 'center', marginTop: 8, color: colors.textSecondary }}>
              {template.description}
            </Text>
          )}
        </VStack>
        <NativeForm manager={manager} submitLabel="Submit Response" />
      </Box>
    </VStack>
  );
}
