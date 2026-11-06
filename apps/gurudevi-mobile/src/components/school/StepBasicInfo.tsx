import { View } from 'react-native';
import { TextField } from '@repo/ui/components/native';
import { Globe, Mail, Phone, School } from '@repo/ui/icons';
import { useTranslation } from 'react-i18next';

interface StepBasicInfoProps {
  data: {
    name: string;
    handle: string;
    contactEmail: string;
    contactPhone: string;
    website?: string;
  };
  onUpdate: (info: Partial<StepBasicInfoProps['data']>) => void;
}

export default function StepBasicInfo({ data, onUpdate }: StepBasicInfoProps) {
  const { t } = useTranslation();
  return (
    <View className="gap-6">
      <TextField
        label={t('schoolSetup.schoolName')}
        placeholder={t('schoolSetup.schoolNamePlaceholder')}
        value={data.name}
        onChangeText={(text) => onUpdate({ name: text })}
        
      />
      <TextField
        label="School Handle (@)"
        placeholder="Unique identifier (e.g. royal-college)"
        value={data.handle}
        onChangeText={(text) =>
          onUpdate({ handle: text.toLowerCase().replace(/[^a-z0-9_-]/g, '') })
        }
        hint="This will be part of your school's unique QR link."
        
      />
      <TextField
        label={t('schoolSetup.contactEmail')}
        placeholder={t('schoolSetup.contactEmailPlaceholder')}
        value={data.contactEmail}
        onChangeText={(text) => onUpdate({ contactEmail: text })}
        
      />
      <TextField
        label={t('schoolSetup.contactPhone')}
        placeholder={t('schoolSetup.contactPhonePlaceholder')}
        value={data.contactPhone}
        onChangeText={(text) => onUpdate({ contactPhone: text })}
        
      />
      <TextField
        label={t('schoolSetup.website')}
        placeholder={t('schoolSetup.websitePlaceholder')}
        value={data.website || ''}
        onChangeText={(text) => onUpdate({ website: text })}
        
      />
    </View>
  );
}
