import React from 'react';
import {
    VStack,
    Text,
    HStack,
    Pressable,
    useTheme,
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
    const { t, i18n } = useTranslation();
    const lang = (i18n.resolvedLanguage ?? 'en') as 'en' | 'si' | 'ta';

    return (
        <VStack className="gap-6">
            <FormControl>
                <FormControlLabel className="mb-2">
                    <FormControlLabelText className="text-sm text-phaseText-secondary">
                        {t('schoolSetup.studentBodyType')}
                    </FormControlLabelText>
                </FormControlLabel>
                <HStack className="gap-3 flex-wrap">
                    {STUDENT_TYPES.map((type) => {
                        const isSelected = data.studentType === type.id;
                        return (
                            <Pressable
                                key={type.id}
                                accessibilityRole="button"
                                onPress={() => onUpdate({ studentType: type.id as any })}
                                className={`flex-1 min-w-[30%] p-4 rounded-xl border-2 items-center ${
                                    isSelected 
                                        ? 'border-phase-interactive bg-phase-interactive/10' 
                                        : 'border-phase-border bg-phase-surface'
                                }`}
                            >
                                <Text
                                    className={`text-sm font-bold ${
                                        isSelected ? 'text-phase-interactive' : 'text-phaseText-primary'
                                    }`}
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
                    <FormControlLabelText className="text-sm text-phaseText-secondary">
                        {t('schoolSetup.religiousContext')}
                    </FormControlLabelText>
                </FormControlLabel>
                <VStack className="gap-2">
                    <HStack className="gap-2 flex-wrap">
                        {RELIGIOUS_AFFILIATIONS.map((rel) => {
                            const isSelected = data.religiousAffiliation === rel.id;
                            return (
                                <Pressable
                                    key={rel.id}
                                    accessibilityRole="button"
                                    onPress={() => onUpdate({ religiousAffiliation: rel.id })}
                                    className={`px-4 py-1.5 rounded-full border ${
                                        isSelected 
                                            ? 'border-phase-interactive bg-phase-interactive' 
                                            : 'border-phase-border bg-transparent'
                                    }`}
                                >
                                    <Text
                                        className={`text-[12px] font-bold ${
                                            isSelected ? 'text-white' : 'text-phaseText-secondary'
                                        }`}
                                    >
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
