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
} from '@/ui';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ClassroomGradingSettings } from '../../types/Grade';
import { useGradebook } from '../../hooks/grading/useGradebook';
import GradebookTable from '../../components/grading/GradebookTable';
import GradingSettings from '../../components/grading/GradingSettings';
import Theme from '../../constants/Theme';

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
        <VStack space="lg" sx={{ flex: 1 }}>
            {/* Header Stats & Controls */}
            <VStack space="md">
                {/* Stats Summary */}
                <HStack
                    space="md"
                    sx={{
                        padding: Theme.spacing.md,
                        backgroundColor: Theme.colors.backgroundLight, // Use standardized background
                        borderRadius: Theme.corners.comfortable,
                        borderWidth: 1,
                        borderColor: Theme.colors.border,
                    }}
                >
                    <VStack sx={{ flex: 1 }}>
                        <Text size="sm" color={Theme.colors.textSecondary}>
                            {t('grading.gradebook.totalStudents') || 'Total Students'}
                        </Text>
                        <Text size="2xl" color={Theme.colors.text} sx={{ fontWeight: '700' }}>
                            {grades.length}
                        </Text>
                    </VStack>

                    <VStack sx={{ flex: 1 }}>
                        <Text size="sm" color={Theme.colors.textSecondary}>
                            {t('grading.gradebook.averageMarks') || 'Average'}
                        </Text>
                        <Text size="2xl" color={Theme.colors.text} sx={{ fontWeight: '700' }}>
                            {stats.averageMarks}
                        </Text>
                    </VStack>

                    <Button
                        variant="outline"
                        size="sm"
                        action="secondary"
                        onPress={() => setShowSettings(true)}
                        sx={{ alignSelf: 'center' }}
                    >
                        <ButtonText size="xs">
                            {t('grading.settings.button') || 'Settings'}
                        </ButtonText>
                    </Button>
                </HStack>

                {/* Sort Options */}
                <HStack space="sm" sx={{ flexWrap: 'wrap' }}>
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
                                    size="sm"
                                    bold={sortBy === option}
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
                    <Text size="lg" color={Theme.colors.textSecondary} textAlign="center">
                        {t('grading.gradebook.noGrades') || 'No grades recorded yet'}
                    </Text>
                </Box>
            )}
        </VStack>
    );
}
