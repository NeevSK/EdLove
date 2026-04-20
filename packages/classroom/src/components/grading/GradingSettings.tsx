/**
 * GRADING SETTINGS COMPONENT
 * 
 * Modal/Bottom Sheet for configuring classroom grading preferences.
 * Allows teachers to:
 * - Select grading mode (Marks Only, GPA Only, or Both)
 * - Toggle rank display
 */

import React, { useState } from 'react';
import {
    VStack,
    HStack,
    Text,
    Heading,
    Box,
    Button,
    ButtonText,
    Radio,
    RadioGroup,
    RadioIndicator,
    RadioIcon,
    RadioLabel,
    Switch,
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { ClassroomGradingSettings } from '@repo/core';

interface GradingSettingsProps {
    currentSettings: ClassroomGradingSettings;
    onSave: (settings: Omit<ClassroomGradingSettings, 'classroom_id'>) => void;
    onCancel: () => void;
}

export default function GradingSettings({
    currentSettings,
    onSave,
    onCancel,
}: GradingSettingsProps) {
    const { t } = useTranslation();
    const [gradingMode, setGradingMode] = useState<'marks' | 'gpa' | 'both' | 'grade'>(
        currentSettings.grading_mode as any
    );
    const [showRanks, setShowRanks] = useState(currentSettings.show_ranks);

    const handleSave = () => {
        onSave({
            grading_mode: gradingMode as any,
            show_ranks: showRanks,
        });
    };

    return (
        <Box className="flex-1 bg-sanctuary-ink p-10 rounded-t-[40px]">
            <VStack className="gap-10">
                {/* Header */}
                <VStack className="gap-2">
                    <Text className="text-[10px] font-black text-sanctuarySaffron uppercase tracking-[0.25em]">
                        {t('grading.settings.admin') || 'Administration'}
                    </Text>
                    <Heading className="text-4xl font-black text-sacredWhite">
                        {t('grading.settings.title') || 'Grading Settings'}
                    </Heading>
                </VStack>

                {/* Grading Mode Selection */}
                <VStack className="gap-4">
                    <Text className="text-[11px] font-black text-sacredWhite/40 uppercase tracking-[0.15em] ml-1">
                        {t('grading.settings.modeLabel') || 'Grading Mode'}
                    </Text>

                    <RadioGroup
                        value={gradingMode}
                        onChange={(value: string) => setGradingMode(value as any)}
                    >
                        <VStack className="gap-3.5">
                            {[
                                { value: 'grade', label: t('grading.settings.gradeOnly') || 'Grade Only', desc: t('grading.settings.gradeOnlyDesc') || 'Display letter grades (A-F)' },
                                { value: 'marks', label: t('grading.settings.marksOnly') || 'Marks Only', desc: t('grading.settings.marksOnlyDesc') || 'Display marks out of 100' },
                                { value: 'gpa', label: t('grading.settings.gpaOnly') || 'GPA Only', desc: t('grading.settings.gpaOnlyDesc') || 'Display letter grades (A-F) and GPA' },
                                { value: 'both', label: t('grading.settings.both') || 'Both', desc: t('grading.settings.bothDesc') || 'Display marks and GPA together' }
                            ].map((item) => (
                                <HStack
                                    key={item.value}
                                    className={`p-5 rounded-[28px] border ${gradingMode === item.value ? 'bg-sanctuarySaffron/10 border-sanctuarySaffron/40' : 'bg-sacredWhite/5 border-sacredWhite/10'}`}
                                >
                                    <Radio value={item.value} size="md">
                                        <RadioIndicator className="border-2 mr-5 border-sacredWhite/20">
                                            <RadioIcon className="bg-sanctuarySaffron" />
                                        </RadioIndicator>
                                        <RadioLabel className="flex-1">
                                            <VStack className="gap-0.5">
                                                <Text className={`text-xl font-black ${gradingMode === item.value ? 'text-sanctuarySaffron' : 'text-sacredWhite'}`}>
                                                    {item.label}
                                                </Text>
                                                <Text className="text-[13px] font-black text-sacredWhite/40 leading-snug">
                                                    {item.desc}
                                                </Text>
                                            </VStack>
                                        </RadioLabel>
                                    </Radio>
                                </HStack>
                            ))}
                        </VStack>
                    </RadioGroup>
                </VStack>

                {/* Show Ranks Toggle */}
                <HStack className="justify-between items-center bg-sacredWhite/5 p-7 rounded-[28px] border border-sacredWhite/10">
                    <VStack className="flex-1 gap-1">
                        <Text className="text-xl font-black text-sacredWhite">
                            {t('grading.settings.showRanks') || 'Show Student Ranks'}
                        </Text>
                        <Text className="text-[13px] font-black text-sacredWhite/40">
                            {t('grading.settings.showRanksDesc') || 'Display rankings based on grades'}
                        </Text>
                    </VStack>
                    <Switch
                        value={showRanks}
                        onValueChange={setShowRanks}
                        trackColor={{
                            false: '#2A2A2A',
                            true: '#F4B400',
                        }}
                        thumbColor="#FFF"
                    />
                </HStack>

                {/* Action Buttons */}
                <HStack className="gap-4 mt-2">
                    <Button
                        variant="outline"
                        className="flex-1 h-16 rounded-full border-sacredWhite/20 bg-transparent active:bg-sacredWhite/5"
                        onPress={onCancel}
                    >
                        <ButtonText className="text-sacredWhite font-black uppercase text-[11px] tracking-[0.2em]">
                            {t('common.cancel') || 'Cancel'}
                        </ButtonText>
                    </Button>

                    <Button
                        className="flex-1 h-16 bg-sanctuarySaffron rounded-full shadow-lg shadow-sanctuarySaffron/20 active:opacity-85"
                        onPress={handleSave}
                    >
                        <ButtonText className="text-sanctuary-ink font-black uppercase text-[11px] tracking-[0.2em]">
                            {t('common.save') || 'Save'}
                        </ButtonText>
                    </Button>
                </HStack>
            </VStack>
        </Box>
    );
}
