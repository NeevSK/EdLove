import { View } from 'react-native';
import type { FormSchema } from '@intuitui-labs/form-builder-engine/schema';
import { MobileFormStudio } from '@repo/form-builder/studio';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView className="flex-1 bg-phase-canvas">
      <View className="flex-1 w-full bg-slate-100">
        <MobileFormStudio
          initialSchema={initialSchema}
          onSave={onSave}
          onPublish={onPublish}
          title={title || t('forms.mobileStudio') || 'Sovereign Form & Quiz Studio'}
        />
      </View>
    </SafeAreaView>
  );
}
