import React, { useState } from 'react';
import {
    VStack,
    HStack,
    Text,
    Heading,
    Box,
    ScrollView,
    Button,
    ButtonText,
    Spinner,
    useThemedColors,
    hapticLight,
} from '@repo/ui';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ClassroomGradingSettings } from '@repo/core';
import { useGradebook } from '../hooks/useGradebook';
import GradebookTable from './grading/GradebookTable';
import GradingSettings from './grading/GradingSettings';
import { Theme } from '@repo/ui';

interface GradebookViewProps {
    classroomId: string;
}

export default function GradebookView({ classroomId }: GradebookViewProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const {
        grades,
        studentNames,
        gradingSettings,
        isLoading,
        error,
        sortBy,
        setSortBy,
        sortedGrades,
        stats,
        updateSettings
    } = useGradebook(classroomId);

    const [showSettings, setShowSettings] = useState(false);

    const handleSaveSettings = async (
        settings: Omit<ClassroomGradingSettings, 'classroom_id'
    >) => {
        try {
            await updateSettings(settings);
            setShowSettings(false);
        } catch (err: any) {
            console.error('Failed to save settings in UI:', err);
        }
    };

    if (showSettings) {
        return (
            gradingSettings && (
                <GradingSettings
                    currentSettings={gradingSettings}
                    onSave={handleSaveSettings}
                    onCancel={() => setShowSettings(false)}
                /
            >)
        );
    }

    return (
        <VStack sx={{ flex: 1, backgroundColor: colors.primary }}
            <ScrollView contentContainerStyle={{ padding: Theme.spacing.md }}>
                <VStack sx={{ gap: Theme.spacing.lg }}
                    {/* Header Stats & Controls */}>
                    <VStack sx={{ gap: Theme.spacing.md }}
                        {/* Stats Summary */}>
                        <HStack
                            sx={{
                                gap: Theme.spacing.md,
                                padding: Theme.spacing.md,
                                backgroundColor: colors.secondary,
                                borderRadius: Theme.corners.comfortable,
                                borderWidth: 1,
                                borderColor: colors.border,
                                ...Theme.shadows.sm,>
                            }}
                        
                            <VStack sx={{ flex: 1 }}
                                <Text color={colors.textSecondary} sx={{ fontSize: Theme.typography.fontSize.xs }}>
                                    {t('grading.gradebook.totalStudents') || 'Total Students'}
                                </Text>
                                <Text color={colors.text} sx={{ fontWeight: '700', fontSize: Theme.typography.fontSize.xl }}
                                    {grades.length}>
                                </Text>
                            </VStack>

                            <VStack sx={{ flex: 1 }}
                                <Text color={colors.textSecondary} sx={{ fontSize: Theme.typography.fontSize.xs }}>
                                    {t('grading.gradebook.averageMarks') || 'Average'}
                                </Text>
                                <Text color={colors.text} sx={{ fontWeight: '700', fontSize: Theme.typography.fontSize.xl }}
                                    {stats.averageMarks}>
                                </Text>
                            </VStack>

                            <Button
                                variant="outline"
                                action="secondary"
                                onPress={() => {
                                    hapticLight();
                                    setShowSettings(true);
                                }}
                                sx={{ alignSelf: 'center', height: 36, borderRadius: Theme.corners.full }}
                            
                                <ButtonText sx={{ fontSize: Theme.typography.fontSize.xs, color: colors.textSecondary }}
                                    {t('grading.settings.button') || 'Settings'}>
                                </ButtonText>
                            </Button>
                        </HStack>

                        {/* Sort Options */}
                        <HStack sx={{ flexWrap: 'wrap', gap: Theme.spacing.sm, alignItems: 'center' }}
                            <Text color={colors.textSecondary} sx={{ fontSize: Theme.typography.fontSize.sm }}>
                                {t('grading.gradebook.sortBy') || 'Sort by:'}
                            </Text>

                            {(['rank', 'marks', 'name'] as const).map((option) => (
                                <TouchableOpacity key={option} onPress={() => {
                                    hapticLight();
                                    setSortBy(option);
                                }}
                                    <Box
                                        sx={{
                                            paddingVertical: Theme.spacing.xs,
                                            paddingHorizontal: Theme.spacing.md,
                                            backgroundColor: sortBy === option ? Theme.colors.sanctuarySaffron : colors.tertiary,
                                            borderRadius: Theme.corners.full,
                                            borderWidth: 1,
                                            borderColor: sortBy === option ? Theme.colors.sanctuarySaffron : colors.border,>
                                        }}
                                    
                                        <Text
                                            color={sortBy === option ? Theme.colors.sacredWhite : colors.textSecondary}
                                            sx={{ fontSize: Theme.typography.fontSize.xs, fontWeight: sortBy === option ? '700' : '400' }}>
                                        
                                            {t(`grading.gradebook.sort${option.charAt(0).toUpperCase() + option.slice(1)}`) || option.charAt(0).toUpperCase() + option.slice(1)}
                                        </Text>
                                    </Box>
                                </TouchableOpacity>
                            ))}
                        </HStack>
                    </VStack>

                    {/* Content Area */}
                    <Box sx={{ flex: 1 }}
                        {isLoading && (>
                            <Box sx={{ padding: Theme.spacing.xl, alignItems: 'center' }}
                                <Spinner color={Theme.colors.sanctuarySaffron} />
                            ></Box>
                        )}

                        {error && !isLoading && (
                            <Box sx={{ padding: Theme.spacing.md, backgroundColor: Theme.colors.errorBackground, borderRadius: Theme.corners.comfortable }}
                                <Text color={Theme.colors.errorText} sx={{ fontSize: Theme.typography.fontSize.sm }}>{error}</Text
                            ></Box>
                        )}

                        {!isLoading && !error && grades.length > 0 && gradingSettings && (
                            <GradebookTable
                                grades={sortedGrades}
                                gradingSettings={gradingSettings}
                                studentNames={studentNames}
                            />
                        >)}

                        {!isLoading && !error && grades.length === 0 && (
                            <Box sx={{ padding: Theme.spacing['2xl'], alignItems: 'center', marginTop: 40 }}
                                <Text color={colors.textSecondary} sx={{ fontSize: Theme.typography.fontSize.md, textAlign: 'center' }}>
                                    {t('grading.gradebook.noGrades') || 'No grades recorded yet'}
                                </Text>
                            </Box>
                        )}
                    </Box>
                </VStack>
            </ScrollView>
        </VStack>
    );
}

