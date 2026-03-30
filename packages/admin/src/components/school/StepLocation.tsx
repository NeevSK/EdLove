import React, { useMemo } from 'react';
import {
    VStack,
    SanctuaryInput,
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicatorWrapper,
    SelectDragIndicator,
    SelectItem,
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    useThemedColors,
    Theme
} from '@repo/ui';
import { MapPin, ChevronDown, Flag } from 'lucide-react-native';
import { SRI_LANKAN_PROVINCES, SRI_LANKAN_DISTRICTS } from '@repo/core';
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
    const colors = useThemedColors();
    const { t, i18n } = useTranslation();
    const lang = (i18n.resolvedLanguage ?? 'en') as 'en' | 'si' | 'ta';

    const filteredDistricts = useMemo(() => {
        if (!data.provinceId) return [];
        return SRI_LANKAN_DISTRICTS.filter(d => d.provinceId === data.provinceId);
    }, [data.provinceId]);

    return (
        <VStack space="lg"            {/* Province Select */}
            <FormControl                <FormControlLabel >sx={{ marginBottom: '$2' }}                    <FormControlLabelText color={colors.textSecondary} sx={{ fontSize: '$sm' }}                        {t('schoolSetup.province')}>
                    </FormControlLabelText                </FormControlLabel                <Select
                    selectedValue={data.provinceId}
                    onValueChange={(value: string) => onUpdate({ provinceId: value, districtId: '' })}
                                    <SelectTrigger variant="outline" sx={{ height: 48, borderRadius: Theme.corners.comfortable, backgroundColor: colors.secondary }}                        <SelectInput placeholder={t('schoolSetup.selectProvince')} color={colors.text} sx={{ flex: 1 }} /                        ><SelectIcon mr="$3" as={ChevronDown} color={Theme.colors.sanctuarySaffron} /                    ></SelectTrigger                    <SelectPortal                        <SelectBackdrop /                        <SelectContent sx={{ backgroundColor: colors.secondary }}                            <SelectDragIndicatorWrapper                                <SelectDragIndicator >/                            ></SelectDragIndicatorWrapper                            {SRI_LANKAN_PROVINCES.map(province => (
                                <SelectItem key={province.id} label={province[lang] ?? province.en} value={province.id} /                            >))}
                        </SelectContent                    </SelectPortal                </Select            </FormControl>
            {/* District Select */}
            <FormControl isDisabled={!data.provinceId}                <FormControlLabel sx={{ marginBottom: '$2' }}                    <FormControlLabelText color={colors.textSecondary} sx={{ fontSize: '$sm' }}                        {t('schoolSetup.district')}
                    </FormControlLabelText                </FormControlLabel                <Select
                    selectedValue={data.districtId}
                    onValueChange={(value: string) => onUpdate({ districtId: value })}
                                    <SelectTrigger variant="outline" sx={{ height: 48, borderRadius: Theme.corners.comfortable, backgroundColor: colors.secondary }}                        <SelectInput placeholder={data.provinceId ? t('schoolSetup.selectDistrict') : t('schoolSetup.selectProvinceFirst')} color={colors.text} sx={{ flex: 1 }} /                        ><SelectIcon mr="$3" as={ChevronDown} color={Theme.colors.sanctuarySaffron} /                    ></SelectTrigger                    <SelectPortal                        <SelectBackdrop /                        <SelectContent sx={{ backgroundColor: colors.secondary }}                            <SelectDragIndicatorWrapper                                <SelectDragIndicator >/                            ></SelectDragIndicatorWrapper                            {filteredDistricts.map(district => (
                                <SelectItem key={district.id} label={district[lang] ?? district.en} value={district.id} /                            >))}
                        </SelectContent                    </SelectPortal                </Select            </FormControl>
            <SanctuaryInput
                label={t('schoolSetup.city')}
                placeholder={t('schoolSetup.cityPlaceholder')}
                value={data.city}
                onChangeText={(text) => onUpdate({ city: text })}
                leftIcon={Flag}
            /
            <SanctuaryInput
                label={t('schoolSetup.postalAddress')}
                placeholder={t('schoolSetup.postalAddressPlaceholder')}
                value={data.address}
                onChangeText={(text) => onUpdate({ address: text })}
                leftIcon={MapPin}
                multiline
                numberOfLines={3}
            /        ></VStack    );
}
