/**
 * GRADING SETTINGS COMPONENT
 * 
 * Modal/Bottom Sheet for configuring classroom grading preferences.
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
    Theme
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
    const [gradingMode, setGradingMode] = useState<'marks' | 'gpa' | 'both'>(
        currentSettings.grading_mode
    );
    const [showRanks, setShowRanks] = useState(currentSettings.show_ranks);

    const handleSave = () => {
        onSave({
            grading_mode: gradingMode,
            show_ranks: showRanks,
        });
    };

    return (
        <Box
            sx={{
                flex: 1,
                backgroundColor: Theme.colors.voidIndigo,
                padding: Theme.spacing.lg,
                borderTopLeftRadius: Theme.corners.generous,
                borderTopRightRadius: Theme.corners.generous,
            }}
        >
            <VStack sx={{ gap: Theme.spacing.lg }}>
                {/* Header */}
                <Heading
                    sx={{
                        fontSize: Theme.typography.fontSize.xl,
                        color: Theme.colors.sanctuarySaffron,
                        marginBottom: Theme.spacing.md,
                        fontWeight: '700' as any
                    }}
                >
                    {t('grading.settings.title') || 'Grading Settings'}
                </Heading>

                {/* Grading Mode Selection */}
                <VStack sx={{ gap: Theme.spacing.md }}>
                    <Text
                        sx={{
                            fontSize: Theme.typography.fontSize.lg,
                            color: Theme.colors.sacredWhite,
                            fontWeight: '600' as any
                        }}
                    >
                        {t('grading.settings.modeLabel') || 'Grading Mode'}
                    </Text>


                    <RadioGroup
                        value={gradingMode}
                        onChange={(value: string) => setGradingMode(value as 'marks' | 'gpa' | 'both')}
                    >
                        <VStack sx={{ gap: Theme.spacing.sm }}>
                            {/* Marks Only */}
                            <HStack
                                sx={{
                                    gap: Theme.spacing.md,
                                    padding: Theme.spacing.md,
                                    backgroundColor: Theme.colors.deepIndigo,
                                    borderRadius: Theme.corners.comfortable,
                                    alignItems: 'center'
                                }}
                            >

                                <Radio value="marks">
                                    <RadioIndicator>
                                        <RadioIcon />
                                    </RadioIndicator>
                                    <RadioLabel>
                                        <VStack>
                                            <Text
                                                sx={{
                                                    color: Theme.colors.sacredWhite,
                                                    fontWeight: '600' as any
                                                }}
                                            >
                                                {t('grading.settings.marksOnly') || 'Marks Only'}
                                            </Text>
                                            <Text
                                                sx={{
                                                    fontSize: Theme.typography.fontSize.sm,
                                                    color: Theme.colors.mistGray
                                                }}
                                            >
                                                {t('grading.settings.marksOnlyDesc') || 'Display marks out of 100'}
                                            </Text>
                                        </VStack>
                                    </RadioLabel>
                                </Radio>
                            </HStack>

                            {/* GPA Only */}
                            <HStack
                                sx={{
                                    gap: Theme.spacing.md,
                                    padding: Theme.spacing.md,
                                    backgroundColor: Theme.colors.deepIndigo,
                                    borderRadius: Theme.corners.comfortable,
                                    alignItems: 'center'
                                }}
                            >

                                <Radio value="gpa">
                                    <RadioIndicator>
                                        <RadioIcon />
                                    </RadioIndicator>
                                    <RadioLabel>
                                        <VStack>
                                            <Text
                                                sx={{
                                                    color: Theme.colors.sacredWhite,
                                                    fontWeight: '600' as any
                                                }}
                                            >
                                                {t('grading.settings.gpaOnly') || 'GPA Only'}
                                            </Text>
                                            <Text
                                                sx={{
                                                    fontSize: Theme.typography.fontSize.sm,
                                                    color: Theme.colors.mistGray
                                                }}
                                            >
                                                {t('grading.settings.gpaOnlyDesc') || 'Display letter grades (A-F) and GPA'}
                                            </Text>
                                        </VStack>
                                    </RadioLabel>
                                </Radio>
                            </HStack>

                            {/* Both */}
                            <HStack
                                sx={{
                                    gap: Theme.spacing.md,
                                    padding: Theme.spacing.md,
                                    backgroundColor: Theme.colors.deepIndigo,
                                    borderRadius: Theme.corners.comfortable,
                                    alignItems: 'center'
                                }}
                            >

                                <Radio value="both">
                                    <RadioIndicator>
                                        <RadioIcon />
                                    </RadioIndicator>
                                    <RadioLabel>
                                        <VStack>
                                            <Text
                                                sx={{
                                                    color: Theme.colors.sacredWhite,
                                                    fontWeight: '600' as any
                                                }}
                                            >
                                                {t('grading.settings.both') || 'Both'}
                                            </Text>
                                            <Text
                                                sx={{
                                                    fontSize: Theme.typography.fontSize.sm,
                                                    color: Theme.colors.mistGray
                                                }}
                                            >
                                                {t('grading.settings.bothDesc') || 'Display marks and GPA together'}
                                            </Text>
                                        </VStack>
                                    </RadioLabel>
                                </Radio>
                            </HStack>
                        </VStack>
                    </RadioGroup>
                </VStack>

                {/* Show Ranks Toggle */}
                <HStack
                    sx={{
                        gap: Theme.spacing.md,
                        padding: Theme.spacing.md,
                        backgroundColor: Theme.colors.deepIndigo,
                        borderRadius: Theme.corners.comfortable,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <VStack sx={{ flex: 1 }}>
                        <Text
                            sx={{
                                color: Theme.colors.sacredWhite,
                                fontWeight: '600' as any
                            }}
                        >
                            {t('grading.settings.showRanks') || 'Show Student Ranks'}
                        </Text>
                        <Text
                            sx={{
                                fontSize: Theme.typography.fontSize.sm,
                                color: Theme.colors.mistGray
                            }}
                        >
                            {t('grading.settings.showRanksDesc') || 'Display rankings based on grades'}
                        </Text>
                    </VStack>
                    <Switch
                        value={showRanks}
                        onValueChange={setShowRanks}
                        sx={{
                            props: {
                                trackColor: {
                                    false: Theme.colors.mistGray,
                                    true: Theme.colors.sanctuarySaffron,
                                },
                            },
                        }}
                    />
                </HStack>

                {/* Action Buttons */}
                <HStack
                    sx={{ gap: Theme.spacing.md, marginTop: Theme.spacing.md }}
                >
                    <Button
                        sx={{
                            flex: 1,
                            borderColor: Theme.colors.mistGray,
                            borderWidth: 1,
                            backgroundColor: 'transparent',
                        }}
                        onPress={onCancel}
                    >
                        <ButtonText sx={{ color: Theme.colors.sacredWhite }}>
                            {t('common.cancel') || 'Cancel'}
                        </ButtonText>
                    </Button>

                    <Button
                        sx={{
                            flex: 1,
                            backgroundColor: Theme.colors.sanctuarySaffron,
                        }}
                        onPress={handleSave}
                    >
                        <ButtonText color={Theme.colors.sacredWhite}>
                            {t('common.save') || 'Save'}
                        </ButtonText>
                    </Button>
                </HStack>
            </VStack>
        </Box>
    );
}
