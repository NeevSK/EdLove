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

    const filteredDistricts = useMemo(() => {
        if (!data.provinceId) return [];
        return SRI_LANKAN_DISTRICTS.filter(d => d.provinceId === data.provinceId);
    }, [data.provinceId]);

    return (
        <VStack sx={{ gap: '$lg' as any }}>
            {/* Province Select */}
            <FormControl>
                <FormControlLabel sx={{ marginBottom: '$2' as any }}>
                    <FormControlLabelText color={colors.textSecondary} sx={{ fontSize: '$sm' as any }}>
                        Province
                    </FormControlLabelText>
                </FormControlLabel>
                <Select
                    selectedValue={data.provinceId}
                    onValueChange={(value) => onUpdate({ provinceId: value, districtId: '' })}
                >
                    <SelectTrigger variant="outline" sx={{ height: 48, borderRadius: Theme.corners.comfortable, backgroundColor: colors.secondary }}>
                        <SelectInput placeholder="Select Province" color={colors.text} sx={{ flex: 1 }} />
                        <SelectIcon mr="$3" as={ChevronDown} color={Theme.colors.sanctuarySaffron} />
                    </SelectTrigger>
                    <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent sx={{ backgroundColor: colors.secondary }}>
                            <SelectDragIndicatorWrapper>
                                <SelectDragIndicator />
                            </SelectDragIndicatorWrapper>
                            {SRI_LANKAN_PROVINCES.map(province => (
                                <SelectItem key={province.id} label={province.en} value={province.id} />
                            ))}
                        </SelectContent>
                    </SelectPortal>
                </Select>
            </FormControl>

            {/* District Select */}
            <FormControl isDisabled={!data.provinceId}>
                <FormControlLabel sx={{ marginBottom: '$2' as any }}>
                    <FormControlLabelText color={colors.textSecondary} sx={{ fontSize: '$sm' as any }}>
                        District
                    </FormControlLabelText>
                </FormControlLabel>
                <Select
                    selectedValue={data.districtId}
                    onValueChange={(value) => onUpdate({ districtId: value })}
                >
                    <SelectTrigger variant="outline" sx={{ height: 48, borderRadius: Theme.corners.comfortable, backgroundColor: colors.secondary }}>
                        <SelectInput placeholder={data.provinceId ? "Select District" : "Select Province first"} color={colors.text} sx={{ flex: 1 }} />
                        <SelectIcon mr="$3" as={ChevronDown} color={Theme.colors.sanctuarySaffron} />
                    </SelectTrigger>
                    <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent sx={{ backgroundColor: colors.secondary }}>
                            <SelectDragIndicatorWrapper>
                                <SelectDragIndicator />
                            </SelectDragIndicatorWrapper>
                            {filteredDistricts.map(district => (
                                <SelectItem key={district.id} label={district.en} value={district.id} />
                            ))}
                        </SelectContent>
                    </SelectPortal>
                </Select>
            </FormControl>

            <SanctuaryInput
                label="City"
                placeholder="e.g. Kandy"
                value={data.city}
                onChangeText={(text) => onUpdate({ city: text })}
                leftIcon={Flag}
            />

            <SanctuaryInput
                label="Postal Address"
                placeholder="No. 123, School Lane..."
                value={data.address}
                onChangeText={(text) => onUpdate({ address: text })}
                leftIcon={MapPin}
                multiline
                numberOfLines={3}
            />
        </VStack>
    );
}
