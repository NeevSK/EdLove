import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FormBuilder } from '@repo/form-builder/FormBuilder';

export default function FormBuilderScreenWeb() {
  const { t } = useTranslation();

  return (
    <div className="flex-1 min-h-screen">
      <View style={{ flex: 1 }}>
        <FormBuilder
          title={t('forms.institutionalBuilder') || 'Institutional Form Builder'}
          description={
            t('forms.builderDescription') ||
            'Design dignified, premium data collection experiences for your sanctuary.'
          }
        />
      </View>
    </div>
  );
}
