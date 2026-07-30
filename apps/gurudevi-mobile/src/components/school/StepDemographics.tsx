import { RELIGIOUS_AFFILIATIONS, STUDENT_TYPES } from '@repo/core/constants';
import SanctuaryInput from '@repo/ui/components/SanctuaryInput';
import { Users } from '@repo/ui/icons';
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  HStack,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { useTranslation } from 'react-i18next';

interface StepDemographicsProps {
  data: {
    studentType: 'mixed' | 'boys' | 'girls' | '';
    religiousAffiliation: string;
    studentCount: string;
  };
  onUpdate: (demo: Partial<StepDemographicsProps['data']>) => void;
}

export default function StepDemographics({ data, onUpdate }: StepDemographicsProps) {
  const { t, i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage ?? 'en') as 'en' | 'si' | 'ta';

  return (
    <VStack className="gap-6">
      <FormControl>
        <FormControlLabel className="mb-2">
          <FormControlLabelText className="text-secondary-400 text-sm">
            {t('schoolSetup.studentBodyType')}
          </FormControlLabelText>
        </FormControlLabel>
        <HStack className="gap-2 flex-wrap">
          {STUDENT_TYPES.map((type) => {
            const isSelected = data.studentType === type.id;
            return (
              <Pressable
                accessibilityRole="button"
                key={type.id}
                onPress={() =>
                  onUpdate({
                    studentType: type.id as StepDemographicsProps['data']['studentType'],
                  })
                }
                className={`flex-1 min-w-[30%] p-3 rounded-xl border-2 items-center ${isSelected ? 'border-primary-500 bg-primary-500/10' : 'border-white/10 bg-secondary-900'}`}
              >
                <Text
                  className={`text-sm ${isSelected ? 'text-primary-500 font-bold' : 'text-white'}`}
                >
                  {(type[lang] ?? type.en).split(' ')[0]}
                </Text>
              </Pressable>
            );
          })}
        </HStack>
      </FormControl>

      <SanctuaryInput
        label={t('schoolSetup.studentCount')}
        placeholder={t('schoolSetup.studentCountPlaceholder')}
        value={data.studentCount}
        onChangeText={(text) => onUpdate({ studentCount: text })}
        leftIcon={Users}
        keyboardType="numeric"
      />

      <FormControl>
        <FormControlLabel className="mb-2">
          <FormControlLabelText className="text-secondary-400 text-sm">
            {t('schoolSetup.religiousContext')}
          </FormControlLabelText>
        </FormControlLabel>
        <VStack className="gap-1">
          <HStack className="gap-1 flex-wrap">
            {RELIGIOUS_AFFILIATIONS.map((rel) => {
              const isSelected = data.religiousAffiliation === rel.id;
              return (
                <Pressable
                  accessibilityRole="button"
                  key={rel.id}
                  onPress={() => onUpdate({ religiousAffiliation: rel.id })}
                  className={`px-3 py-2 rounded-full border ${isSelected ? 'border-primary-500 bg-primary-500' : 'border-white/10 bg-transparent'}`}
                >
                  <Text className={`text-xs ${isSelected ? 'text-white' : 'text-secondary-400'}`}>
                    {rel[lang] ?? rel.en}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>
        </VStack>
      </FormControl>
    </VStack>
  );
}
