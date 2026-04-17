import React from 'react';
import {
    VStack,
    Text,
    HStack,
    Pressable,
    useThemedColors,
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    SanctuaryInput
} from '@repo/ui';
import { STUDENT_TYPES, RELIGIOUS_AFFILIATIONS } from '@repo/core';
import { Users } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface StepDemographicsProps {
    data: {
        studentType: 'mixed' | 'boys' | 'girls' | '';
        religiousAffiliation: string;
        studentCount: string;
    };
    onUpdate: (demo: Partial<{
        studentType: 'mixed' | 'boys' | 'girls' | '';
        religiousAffiliation: string;
        studentCount: string;
    }>) => void;
}

export default function StepDemographics({ data, onUpdate }: StepDemographicsProps) {
    const theme = useThemedColors();
    const { t, i18n } = useTranslation();
    const lang = (i18n.resolvedLanguage ?? 'en') as 'en' | 'si' | 'ta';

    return (
        <VStack style={{ gap: theme.spacing.lg }}>
            <FormControl>
                <FormControlLabel style={{ marginBottom: theme.spacing.xs }}>
                    <FormControlLabelText style={{ color: theme.text.secondary, fontSize: 14 }}>
                        {t('schoolSetup.studentBodyType')}
                    </FormControlLabelText>
                </FormControlLabel>
                <HStack style={{ gap: theme.spacing.sm, flexWrap: 'wrap' }}>
                    {STUDENT_TYPES.map((type) => (
                        <Pressable
                            key={type.id}
                            accessibilityRole="button"
                            onPress={() => onUpdate({ studentType: type.id as any })}
                            style={{
                                flex: 1,
                                minWidth: '30%',
                                padding: theme.spacing.md,
                                borderRadius: theme.corners.md,
                                borderWidth: 2,
                                borderColor: data.studentType === type.id ? theme.status.warning : theme.scene.border,
                                backgroundColor: data.studentType === type.id ? theme.status.warning + '10' : theme.scene.backgroundPrimary,
                                alignItems: 'center'
                            }}>
                            <Text
                                style={{
                                    color: data.studentType === type.id ? theme.status.warning : theme.text.primary,
                                    fontWeight: data.studentType === type.id ? '700' : '400',
                                    fontSize: 14
                                }}>
                                {(type[lang] ?? type.en).split(' ')[0]}
                            </Text>
                        </Pressable>
                    ))}
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
                <FormControlLabel style={{ marginBottom: theme.spacing.xs }}>
                    <FormControlLabelText style={{ color: theme.text.secondary, fontSize: 14 }}>
                        {t('schoolSetup.religiousContext')}
                    </FormControlLabelText>
                </FormControlLabel>
                <VStack style={{ gap: theme.spacing.xs }}>
                    <HStack style={{ gap: theme.spacing.xs, flexWrap: 'wrap' }}>
                        {RELIGIOUS_AFFILIATIONS.map((rel) => (
                            <Pressable
                                key={rel.id}
                                accessibilityRole="button"
                                onPress={() => onUpdate({ religiousAffiliation: rel.id })}
                                style={{
                                    paddingHorizontal: theme.spacing.md,
                                    paddingVertical: theme.spacing.xs,
                                    borderRadius: theme.corners.full,
                                    borderWidth: 1,
                                    borderColor: data.religiousAffiliation === rel.id ? theme.status.warning : theme.scene.border,
                                    backgroundColor: data.religiousAffiliation === rel.id ? theme.status.warning : 'transparent'
                                }}>
                                <Text
                                    style={{
                                        color: data.religiousAffiliation === rel.id ? '#FFFFFF' : theme.text.secondary,
                                        fontSize: 12
                                    }}>
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
