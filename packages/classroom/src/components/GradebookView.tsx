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
} from '@repo/ui';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ClassroomGradingSettings } from '@repo/core';
import { useGradebook } from '../hooks/useGradebook';
import GradebookTable from './GradebookTable';
import GradingSettings from './GradingSettings';
import { Theme } from '@repo/ui';

interface GradebookViewProps {
    classroomId: string;
}

export default function GradebookView({ classroomId }: GradebookViewProps) {
    const { t } = useTranslation();
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
        settings: Omit<ClassroomGradingSettings, 'classroom_id'>
    ) => {
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
                />
            )
        );
    }

    return (
        <VStack sx={{ flex: 1, gap: Theme.spacing.lg }}>
            {/* Header Stats & Controls */}
            <VStack sx={{ gap: Theme.spacing.md }}>
                {/* Stats Summary */}
                <HStack
                    sx={{
                        gap: Theme.spacing.md,
                        padding: Theme.spacing.md,
                        backgroundColor: Theme.colors.backgroundLight, // Use standardized background
                        borderRadius: Theme.corners.comfortable,
                        borderWidth: 1,
                        borderColor: Theme.colors.border,
                    }}
                >
                    <VStack sx={{ flex: 1 }}>
                        <Text color={Theme.colors.textSecondary} sx={{ fontSize: 14 }}>
                            {t('grading.gradebook.totalStudents') || 'Total Students'}
                        </Text>
                        <Text color={Theme.colors.text} sx={{ fontWeight: '700', fontSize: 24 }}>
                            {grades.length}
                        </Text>
                    </VStack>

                    <VStack sx={{ flex: 1 }}>
                        <Text color={Theme.colors.textSecondary} sx={{ fontSize: 14 }}>
                            {t('grading.gradebook.averageMarks') || 'Average'}
                        </Text>
                        <Text color={Theme.colors.text} sx={{ fontWeight: '700', fontSize: 24 }}>
                            {stats.averageMarks}
                        </Text>
                    </VStack>

                    <Button
                        variant="outline"
                        action="secondary"
                        onPress={() => setShowSettings(true)}
                        sx={{ alignSelf: 'center', height: 32 }}
                    >
                        <ButtonText sx={{ fontSize: 12 }}>
                            {t('grading.settings.button') || 'Settings'}
                        </ButtonText>
                    </Button>
                </HStack>

                {/* Sort Options */}
                <HStack sx={{ flexWrap: 'wrap', gap: Theme.spacing.sm }}>
                    <Text color={Theme.colors.textSecondary} sx={{ marginRight: Theme.spacing.sm, alignSelf: 'center' }}>
                        {t('grading.gradebook.sortBy') || 'Sort by:'}
                    </Text>

                    {(['rank', 'marks', 'name'] as const).map((option) => (
                        <TouchableOpacity key={option} onPress={() => setSortBy(option)}>
                            <Box
                                sx={{
                                    padding: Theme.spacing.sm,
                                    paddingHorizontal: Theme.spacing.md,
                                    backgroundColor: sortBy === option ? Theme.colors.sanctuarySaffron : 'transparent',
                                    borderRadius: Theme.corners.full,
                                    borderWidth: 1,
                                    borderColor: sortBy === option ? Theme.colors.sanctuarySaffron : Theme.colors.border,
                                }}
                            >
                                <Text
                                    color={sortBy === option ? Theme.colors.white : Theme.colors.textSecondary}
                                    sx={{ fontSize: 14, fontWeight: sortBy === option ? 'bold' : 'normal' }}
                                >
                                    {t(`grading.gradebook.sort${option.charAt(0).toUpperCase() + option.slice(1)}`) || option.charAt(0).toUpperCase() + option.slice(1)}
                                </Text>
                            </Box>
                        </TouchableOpacity>
                    ))}
                </HStack>
            </VStack>

            {/* Content Area */}
            {isLoading && (
                <Box sx={{ padding: Theme.spacing.xl, alignItems: 'center' }}>
                    <Spinner color={Theme.colors.sanctuarySaffron} />
                </Box>
            )}

            {error && !isLoading && (
                <Box sx={{ padding: Theme.spacing.md, backgroundColor: Theme.colors.errorBackground, borderRadius: Theme.corners.comfortable }}>
                    <Text color={Theme.colors.errorText}>{error}</Text>
                </Box>
            )}

            {!isLoading && !error && grades.length > 0 && gradingSettings && (
                <GradebookTable
                    grades={sortedGrades}
                    gradingSettings={gradingSettings}
                    studentNames={studentNames}
                />
            )}

            {!isLoading && !error && grades.length === 0 && (
                <Box sx={{ padding: Theme.spacing.xl, alignItems: 'center' }}>
                    <Text color={Theme.colors.textSecondary} sx={{ fontSize: 18, textAlign: 'center' }}>
                        {t('grading.gradebook.noGrades') || 'No grades recorded yet'}
                    </Text>
                </Box>
            )}
        </VStack>
    );
}
