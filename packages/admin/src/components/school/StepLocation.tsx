import { SRI_LANKAN_DISTRICTS, SRI_LANKAN_PROVINCES } from '@repo/core';
import SanctuaryInput from '@repo/ui/components/SanctuaryInput';
import { ChevronDown, Flag, MapPin } from '@repo/ui/icons';
import { FormControl, FormControlLabel, FormControlLabelText, Icon, Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectTrigger, VStack } from '@repo/ui/primitives';

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
      <FormControl>
        <FormControlLabel className="mb-2">
          <FormControlLabelText className="text-sm text-phaseText-secondary">
            {t('schoolSetup.province')}
          </FormControlLabelText>
        </FormControlLabel>
        <Select
          value={data.provinceId}
          onValueChange={(value: string) => onUpdate({ provinceId: value, districtId: '' })}
        >
          <SelectTrigger className="h-12 rounded-xl bg-phase-surface border border-phase-border">
            <SelectInput
              placeholder={t('schoolSetup.selectProvince')}
              className="text-phaseText-primary flex-1 font-bold"
            />
            <SelectIcon className="mr-3">
              <Icon as={ChevronDown} size={20} className="text-phase-interactive" />
            </SelectIcon>
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent className="bg-phase-surface">
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              {SRI_LANKAN_PROVINCES.map((province) => (
                <SelectItem
                  key={province.id}
                  label={(province as any)[lang] ?? province.en}
                  value={province.id}
                />
              ))}
            </SelectContent>
          </SelectPortal>
        </Select>
      </FormControl>

      <FormControl isDisabled={!data.provinceId}>
        <FormControlLabel className="mb-2">
          <FormControlLabelText className="text-sm text-phaseText-secondary">
            {t('schoolSetup.district')}
          </FormControlLabelText>
        </FormControlLabel>
        <Select
          value={data.districtId}
          onValueChange={(value: string) => onUpdate({ districtId: value })}
        >
          <SelectTrigger className="h-12 rounded-xl bg-phase-surface border border-phase-border">
            <SelectInput
              placeholder={
                data.provinceId
                  ? t('schoolSetup.selectDistrict')
                  : t('schoolSetup.selectProvinceFirst')
              }
              className="text-phaseText-primary flex-1 font-bold"
            />
            <SelectIcon className="mr-3">
              <Icon as={ChevronDown} size={20} className="text-phase-interactive" />
            </SelectIcon>
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent className="bg-phase-surface">
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              {filteredDistricts.map((district) => (
                <SelectItem
                  key={district.id}
                  label={(district as any)[lang] ?? district.en}
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
