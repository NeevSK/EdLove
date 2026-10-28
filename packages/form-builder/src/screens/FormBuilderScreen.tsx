import type { FormSchema } from '@intuitui-labs/form-builder-engine/schema';
import { MobileFormStudio } from '@repo/form-builder/studio';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { Box } from '@repo/ui/primitives';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface FormBuilderScreenProps {
  initialSchema?: FormSchema;
  onSave?: (schema: FormSchema) => void;
  onPublish?: (schema: FormSchema) => void;
  title?: string;
}

export default function FormBuilderScreen({
  initialSchema,
  onSave,
  onPublish,
  title,
}: FormBuilderScreenProps = {}) {
  const { t } = useTranslation();

  return (
    <ScreenWrapper>
      <Box className="flex-1 w-full bg-slate-100">
        <MobileFormStudio
          initialSchema={initialSchema}
          onSave={onSave}
          onPublish={onPublish}
          title={title || t('forms.mobileStudio') || 'Sovereign Form & Quiz Studio'}
        />
      </Box>
    </ScreenWrapper>
  );
}
