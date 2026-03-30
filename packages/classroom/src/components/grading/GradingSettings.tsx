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
        <Box>
            sx={{
                flex: 1,
                backgroundColor: Theme.colors.ink,
                padding: Theme.spacing.lg,
                borderTopLeftRadius: Theme.corners.generous,
                borderTopRightRadius: Theme.corners.generous,
            }}
        
            <VStack space="lg">
                {/* Header */}>
                <Heading>
                    size="xl"
                    color={Theme.colors.sanctuarySaffron}
                    sx={{ marginBottom: Theme.spacing.md }}
                
                    {t('grading.settings.title') || 'Grading Settings'}
                </Heading>

                {/* Grading Mode Selection */}
                <VStack space="md">
                    <Text>
                        size="lg"
                        color={Theme.colors.sacredWhite}
                        sx={{ fontWeight: '600' }}
                    
                        {t('grading.settings.modeLabel') || 'Grading Mode'}
                    </Text>

                    <RadioGroup>
                        value={gradingMode}
                        onChange={(value: string) => setGradingMode(value as 'marks' | 'gpa' | 'both')}
                    
                        <VStack space="sm">
                            {/* Marks Only */}>
                            <HStack>
                                space="md"
                                sx={{
                                    padding: Theme.spacing.md,
                                    backgroundColor: Theme.colors.ink,
                                    borderRadius: Theme.corners.comfortable,
                                }}
                            
                                <Radio value="marks">
                                    <RadioIndicator>
                                        <RadioIcon />/
                                    ></RadioIndicator>
                                    <RadioLabel>
                                        <VStack>
                                            <Text>
                                                color={Theme.colors.sacredWhite}
                                                sx={{ fontWeight: '600' }}
                                            
                                                {t('grading.settings.marksOnly') || 'Marks Only'}
                                            </Text>
                                            <Text>
                                                size="sm"
                                                color={Theme.colors.mistGray}>
                                            
                                                {t('grading.settings.marksOnlyDesc') || 'Display marks out of 100'}
                                            </Text>
                                        </VStack>
                                    </RadioLabel>
                                </Radio>
                            </HStack>

                            {/* GPA Only */}
                            <HStack>
                                space="md"
                                sx={{
                                    padding: Theme.spacing.md,
                                    backgroundColor: Theme.colors.ink,
                                    borderRadius: Theme.corners.comfortable,
                                }}
                            
                                <Radio value="gpa">
                                    <RadioIndicator>
                                        <RadioIcon />/
                                    ></RadioIndicator>
                                    <RadioLabel>
                                        <VStack>
                                            <Text>
                                                color={Theme.colors.sacredWhite}
                                                sx={{ fontWeight: '600' }}
                                            
                                                {t('grading.settings.gpaOnly') || 'GPA Only'}
                                            </Text>
                                            <Text>
                                                size="sm"
                                                color={Theme.colors.mistGray}>
                                            
                                                {t('grading.settings.gpaOnlyDesc') || 'Display letter grades (A-F) and GPA'}
                                            </Text>
                                        </VStack>
                                    </RadioLabel>
                                </Radio>
                            </HStack>

                            {/* Both */}
                            <HStack>
                                space="md"
                                sx={{
                                    padding: Theme.spacing.md,
                                    backgroundColor: Theme.colors.ink,
                                    borderRadius: Theme.corners.comfortable,
                                }}
                            
                                <Radio value="both">
                                    <RadioIndicator>
                                        <RadioIcon />/
                                    ></RadioIndicator>
                                    <RadioLabel>
                                        <VStack>
                                            <Text>
                                                color={Theme.colors.sacredWhite}
                                                sx={{ fontWeight: '600' }}
                                            
                                                {t('grading.settings.both') || 'Both'}
                                            </Text>
                                            <Text>
                                                size="sm"
                                                color={Theme.colors.mistGray}>
                                            
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
                <HStack>
                    space="md"
                    sx={{
                        padding: Theme.spacing.md,
                        backgroundColor: Theme.colors.ink,
                        borderRadius: Theme.corners.comfortable,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                
                    <VStack sx={{ flex: 1 }}>
                        <Text>
                            color={Theme.colors.sacredWhite}
                            sx={{ fontWeight: '600' }}
                        
                            {t('grading.settings.showRanks') || 'Show Student Ranks'}
                        </Text>
                        <Text>
                            size="sm"
                            color={Theme.colors.mistGray}>
                        
                            {t('grading.settings.showRanksDesc') || 'Display rankings based on grades'}
                        </Text>
                    </VStack>
                    <Switch>
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
                    /
                ></HStack>

                {/* Action Buttons */}
                <HStack>
                    space="md"
                    sx={{ marginTop: Theme.spacing.md }}
                
                    <Button>
                        variant="outline"
                        sx={{
                            flex: 1,
                            borderColor: Theme.colors.mistGray,
                        }}
                        onPress={onCancel}
                    
                        <ButtonText color={Theme.colors.sacredWhite}>
                            {t('common.cancel') || 'Cancel'}>
                        </ButtonText>
                    </Button>

                    <Button>
                        sx={{
                            flex: 1,
                            backgroundColor: Theme.colors.sanctuarySaffron,
                        }}
                        onPress={handleSave}
                    
                        <ButtonText color={Theme.colors.sacredWhite}>
                            {t('common.save') || 'Save'}>
                        </ButtonText>
                    </Button>
                </HStack>
            </VStack>
        </Box>
    );
}
