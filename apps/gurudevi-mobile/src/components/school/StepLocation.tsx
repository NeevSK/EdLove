import { SRI_LANKAN_DISTRICTS, SRI_LANKAN_PROVINCES } from '@repo/core/constants';
import SanctuaryInput from '@repo/ui/components/SanctuaryInput';
import { FormControl, FormControlLabel, FormControlLabelText, Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectTrigger, VStack } from '@repo/ui/primitives';
import { ChevronDown, Flag, MapPin } from 'lucide-react-native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface StepLocationProps {
  data: {
    provinceId: string;
    districtId: string;
    city: string;
    address: string;
  };
  onUpdate: (loc: Partial<StepLocationProps['data']>) => void;
}

export default function StepLocation({ data, onUpdate }: StepLocationProps) {
  const { t, i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage ?? 'en') as 'en' | 'si' | 'ta';

  const filteredDistricts = useMemo(() => {
    if (!data.provinceId) return [];
    return SRI_LANKAN_DISTRICTS.filter((d) => d.provinceId === data.provinceId);
  }, [data.provinceId]);

  return (
    <VStack className="gap-6">
      {/* Province Select */}
      <FormControl>
        <FormControlLabel className="mb-2">
          <FormControlLabelText className="text-secondary-400 text-sm">
            {t('schoolSetup.province')}
          </FormControlLabelText>
        </FormControlLabel>
        <Select
          selectedValue={data.provinceId}
          onValueChange={(value: string) => onUpdate({ provinceId: value, districtId: '' })}
        >
          <SelectTrigger className="h-12 rounded-2xl bg-secondary-900 border-white/10">
            <SelectInput
              placeholder={t('schoolSetup.selectProvince')}
              value={SRI_LANKAN_PROVINCES.find((p) => p.id === data.provinceId)?.[lang]}
              className="flex-1"
            />
            <SelectIcon className="mr-3" as={ChevronDown} />
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent className="bg-secondary-900 border-t border-white/10">
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              {SRI_LANKAN_PROVINCES.map((province) => (
                <SelectItem
                  key={province.id}
                  label={province[lang] ?? province.en}
                  value={province.id}
                />
              ))}
            </SelectContent>
          </SelectPortal>
        </Select>
      </FormControl>

      {/* District Select */}
      <FormControl isDisabled={!data.provinceId}>
        <FormControlLabel className="mb-2">
          <FormControlLabelText className="text-secondary-400 text-sm">
            {t('schoolSetup.district')}
          </FormControlLabelText>
        </FormControlLabel>
        <Select
          selectedValue={data.districtId}
          onValueChange={(value: string) => onUpdate({ districtId: value })}
        >
          <SelectTrigger className="h-12 rounded-2xl bg-secondary-900 border-white/10">
            <SelectInput
              placeholder={
                data.provinceId
                  ? t('schoolSetup.selectDistrict')
                  : t('schoolSetup.selectProvinceFirst')
              }
              value={SRI_LANKAN_DISTRICTS.find((d) => d.id === data.districtId)?.[lang]}
              className="flex-1"
            />
            <SelectIcon className="mr-3" as={ChevronDown} />
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent className="bg-secondary-900 border-t border-white/10">
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              {filteredDistricts.map((district) => (
                <SelectItem
                  key={district.id}
                  label={district[lang] ?? district.en}
                  value={district.id}
                />
              ))}
            </SelectContent>
          </SelectPortal>
        </Select>
      </FormControl>

      <SanctuaryInput
        label={t('schoolSetup.city')}
        placeholder={t('schoolSetup.cityPlaceholder')}
        value={data.city}
        onChangeText={(text) => onUpdate({ city: text })}
        leftIcon={Flag}
      />

      <SanctuaryInput
        label={t('schoolSetup.postalAddress')}
        placeholder={t('schoolSetup.postalAddressPlaceholder')}
        value={data.address}
        onChangeText={(text) => onUpdate({ address: text })}
        leftIcon={MapPin}
        multiline
        numberOfLines={3}
      />
    </VStack>
  );
}
