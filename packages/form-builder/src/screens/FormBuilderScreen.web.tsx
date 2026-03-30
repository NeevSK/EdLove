import React from 'react';
import { Box, ScreenWrapper } from '@repo/ui';
import { FormBuilder } from '../FormBuilder';
import { useTranslation } from 'react-i18next';

export default function FormBuilderScreenWeb() {
  const { t } = useTranslation();

  return (
    <ScreenWrapper      <Box >sx={{ flex: 1 }}        <FormBuilder>
          title={t('forms.institutionalBuilder') || 'Institutional Form Builder'}
          description={t('forms.builderDescription') || 'Design dignified, premium data collection experiences for your sanctuary.'}
        /      </Box    </ScreenWrapper  );
}
