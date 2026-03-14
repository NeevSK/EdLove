import React from 'react';
import {
    VStack,
    Text,
    HStack,
    Pressable,
    useThemedColors,
    Theme,
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    SanctuaryInput
} from '@repo/ui';
import { STUDENT_TYPES, RELIGIOUS_AFFILIATIONS } from '@repo/core';
import { Users, Book } from 'lucide-react-native';
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
    const colors = useThemedColors();
    const { t, i18n } = useTranslation();
    const lang = (i18n.resolvedLanguage ?? 'en') as 'en' | 'si' | 'ta';

    return (
        <VStack sx={{ gap: '$lg' as any }}>
            <FormControl>
                <FormControlLabel sx={{ marginBottom: '$2' as any }}>
                    <FormControlLabelText color={colors.textSecondary} sx={{ fontSize: '$sm' as any }}>
                        {t('schoolSetup.studentBodyType')}
                    </FormControlLabelText>
                </FormControlLabel>
                <HStack sx={{ gap: '$sm' as any, flexWrap: 'wrap' }}>
                    {STUDENT_TYPES.map(type => (
                        <Pressable accessibilityRole="button"
                            key={type.id}
                            onPress={() => onUpdate({ studentType: type.id as any })}
                            sx={{
                                flex: 1,
                                minWidth: '30%',
                                padding: '$3' as any,
                                borderRadius: Theme.corners.comfortable,
                                borderWidth: 2,
                                borderColor: data.studentType === type.id ? Theme.colors.sanctuarySaffron : colors.border,
                                backgroundColor: data.studentType === type.id ? `${Theme.colors.sanctuarySaffron}10` : colors.secondary,
                                alignItems: 'center'
                            }}
                        >
                            <Text
                                color={data.studentType === type.id ? Theme.colors.sanctuarySaffron : colors.text}
                                bold={data.studentType === type.id}
                                sx={{ fontSize: '$sm' as any }}
                            >
                                {(type[lang] ?? type.en).split(' ')[0]}
                            </Text>
                        </Pressable>
                    ))}
                </HStack>
            </FormControl>

            {/* Religious Affiliation might use a similar selection style or dropdown */}
            <SanctuaryInput
                label={t('schoolSetup.studentCount')}
                placeholder={t('schoolSetup.studentCountPlaceholder')}
                value={data.studentCount}
                onChangeText={(text) => onUpdate({ studentCount: text })}
                leftIcon={Users}
                {...({ keyboardType: 'numeric' } as any)}
            />

            <FormControl>
                <FormControlLabel sx={{ marginBottom: '$2' as any }}>
                    <FormControlLabelText color={colors.textSecondary} sx={{ fontSize: '$sm' as any }}>
                        {t('schoolSetup.religiousContext')}
                    </FormControlLabelText>
                </FormControlLabel>
                <VStack sx={{ gap: '$xs' as any }}>
                    <HStack sx={{ gap: '$xs' as any, flexWrap: 'wrap' }}>
                        {RELIGIOUS_AFFILIATIONS.map(rel => (
                            <Pressable accessibilityRole="button"
                                key={rel.id}
                                onPress={() => onUpdate({ religiousAffiliation: rel.id })}
                                sx={{
                                    paddingHorizontal: '$3' as any,
                                    paddingVertical: '$2' as any,
                                    borderRadius: Theme.corners.full,
                                    borderWidth: 1,
                                    borderColor: data.religiousAffiliation === rel.id ? Theme.colors.sanctuarySaffron : colors.border,
                                    backgroundColor: data.religiousAffiliation === rel.id ? Theme.colors.sanctuarySaffron : 'transparent',
                                }}
                            >
                                <Text
                                    color={data.religiousAffiliation === rel.id ? Theme.colors.sacredWhite : colors.textSecondary}
                                    sx={{ fontSize: '$xs' as any }}
                                >
                                    {rel[lang] ?? rel.en}
                                </Text>
                            </Pressable>
                        ))}
                    </HStack>
                </VStack>
            </FormControl>
        </VStack>
    );
}
