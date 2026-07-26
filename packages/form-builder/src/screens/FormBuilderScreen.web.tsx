import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { Box } from '@repo/ui/primitives';
import { useTranslation } from 'react-i18next';
import { FormBuilder } from '@/FormBuilder';

export default function FormBuilderScreenWeb() {
  const { t } = useTranslation();

  return (
    <ScreenWrapper>
      <Box sx={{ flex: 1 }}>
        <FormBuilder
          title={t('forms.institutionalBuilder') || 'Institutional Form Builder'}
          description={
            t('forms.builderDescription') ||
            'Design dignified, premium data collection experiences for your sanctuary.'
          }
        />
      </Box>
    </ScreenWrapper>
  );
}
