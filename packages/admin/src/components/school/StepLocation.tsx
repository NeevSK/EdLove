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
    useTheme
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
    const theme = useTheme();
    const colors = theme.scene;
    const { t, i18n } = useTranslation();
    const lang = (i18n.resolvedLanguage ?? 'en') as 'en' | 'si' | 'ta';

    const filteredDistricts = useMemo(() => {
        if (!data.provinceId) return [];
        return SRI_LANKAN_DISTRICTS.filter(d => d.provinceId === data.provinceId);
    }, [data.provinceId]);

    const sanctuarySaffron = theme.templeGold;

    return (
        <VStack space="lg">
            <FormControl>
                <FormControlLabel style={{ marginBottom: 8 }}>
                    <FormControlLabelText style={{ color: colors?.textSecondary || '#aaa', fontSize: 14 }}>
                        {t('schoolSetup.province')}
                    </FormControlLabelText>
                </FormControlLabel>
                <Select
                    selectedValue={data.provinceId}
                    onValueChange={(value: string) => onUpdate({ provinceId: value, districtId: '' })}>
                    <SelectTrigger 
                        variant="outline" 
                        style={{ 
                            height: 48, 
                            borderRadius: 12, 
                            backgroundColor: colors?.secondary || '#2A2318' 
                        }}>
                        <SelectInput 
                            placeholder={t('schoolSetup.selectProvince')} 
                            style={{ color: colors?.text || '#fff', flex: 1 }} 
                        />
                        <SelectIcon style={{ marginRight: 12 }}>
                            <ChevronDown size={20} color={sanctuarySaffron} />
                        </SelectIcon>
                    </SelectTrigger>
                    <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent style={{ backgroundColor: colors?.secondary || '#2A2318' }}>
                            <SelectDragIndicatorWrapper>
                                <SelectDragIndicator />
                            </SelectDragIndicatorWrapper>
                            {SRI_LANKAN_PROVINCES.map(province => (
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
                <FormControlLabel style={{ marginBottom: 8 }}>
                    <FormControlLabelText style={{ color: colors?.textSecondary || '#aaa', fontSize: 14 }}>
                        {t('schoolSetup.district')}
                    </FormControlLabelText>
                </FormControlLabel>
                <Select
                    selectedValue={data.districtId}
                    onValueChange={(value: string) => onUpdate({ districtId: value })}>
                    <SelectTrigger 
                        variant="outline" 
                        style={{ 
                            height: 48, 
                            borderRadius: 12, 
                            backgroundColor: colors?.secondary || '#2A2318' 
                        }}>
                        <SelectInput 
                            placeholder={data.provinceId ? t('schoolSetup.selectDistrict') : t('schoolSetup.selectProvinceFirst')} 
                            style={{ color: colors?.text || '#fff', flex: 1 }} 
                        />
                        <SelectIcon style={{ marginRight: 12 }}>
                            <ChevronDown size={20} color={sanctuarySaffron} />
                        </SelectIcon>
                    </SelectTrigger>
                    <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent style={{ backgroundColor: colors?.secondary || '#2A2318' }}>
                            <SelectDragIndicatorWrapper>
                                <SelectDragIndicator />
                            </SelectDragIndicatorWrapper>
                            {filteredDistricts.map(district => (
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
