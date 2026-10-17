import { MobileFormStudio } from '@repo/form-builder/studio';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { Box } from '@repo/ui/primitives';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function FormBuilderScreen() {
  const { t } = useTranslation();

  return (
    <ScreenWrapper>
      <Box className="flex-1 w-full bg-slate-100">
        <MobileFormStudio title={t('forms.mobileStudio') || 'Sovereign Form & Quiz Studio'} />
      </Box>
    </ScreenWrapper>
  );
}
