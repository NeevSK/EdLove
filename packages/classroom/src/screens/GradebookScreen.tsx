/**
 * GRADEBOOK SCREEN
 */

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
    Theme
} from '@repo/ui';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StudentGrade, ClassroomGradingSettings } from '@repo/core';
import { useGradebook } from '../hooks/useGradebook';
import GradebookTable from '../components/grading/GradebookTable';
import GradingSettings from '../components/grading/GradingSettings';

interface GradebookScreenProps {
    classroomId: string;
    onEditGrade?: (studentId: string) => void;
}

export default function GradebookScreen({
    classroomId,
    onEditGrade,
}: GradebookScreenProps) {
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
        <Box
            sx={{
                flex: 1,
                backgroundColor: Theme.colors.voidIndigo,
            }}
        >
            <ScrollView>
                <VStack
                    sx={{ padding: Theme.spacing.lg, gap: 24 }}
                >
                    {/* Header */}
                    <HStack
                        sx={{
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Heading
                            color={Theme.colors.sanctuarySaffron}
                            sx={{ fontSize: 32 }}
                        >
                            {t('grading.gradebook.title') || 'Gradebook'}
                        </Heading>

                        <Button
                            variant="outline"
                            size="sm"
                            sx={{
                                borderColor: Theme.colors.sanctuarySaffron,
                            }}
                            onPress={() => setShowSettings(true)}
                        >
                            <ButtonText color={Theme.colors.sanctuarySaffron}>
                                {t('grading.settings.button') || 'Settings'}
                            </ButtonText>
                        </Button>
                    </HStack>

                    {/* Stats Summary */}
                    <HStack
                        sx={{
                            padding: Theme.spacing.md,
                            backgroundColor: Theme.colors.deepIndigo,
                            borderRadius: Theme.corners.comfortable,
                            gap: 16
                        }}
                    >
                        <VStack sx={{ flex: 1 }}>
                            <Text
                                color={Theme.colors.mistGray}
                                sx={{ fontSize: 14 }}
                            >
                                {t('grading.gradebook.totalStudents') || 'Total Students'}
                            </Text>
                            <Text
                                color={Theme.colors.sacredWhite}
                                sx={{ fontWeight: '700', fontSize: 20 }}
                            >
                                {grades.length}
                            </Text>
                        </VStack>

                        <VStack sx={{ flex: 1 }}>
                            <Text
                                color={Theme.colors.mistGray}
                                sx={{ fontSize: 14 }}
                            >
                                {t('grading.gradebook.averageMarks') || 'Average'}
                            </Text>
                            <Text
                                color={Theme.colors.sacredWhite}
                                sx={{ fontWeight: '700', fontSize: 20 }}
                            >
                                {stats.averageMarks}
                            </Text>
                        </VStack>
                    </HStack>

                    {/* Sort Options */}
                    <HStack
                        sx={{ flexWrap: 'wrap', gap: 8 }}
                    >
                        <Text
                            color={Theme.colors.pearlGray}
                            sx={{ marginRight: Theme.spacing.sm }}
                        >
                            {t('grading.gradebook.sortBy') || 'Sort by:'}
                        </Text>

                        <TouchableOpacity onPress={() => setSortBy('rank')}>
                            <Box
                                sx={{
                                    padding: Theme.spacing.sm,
                                    paddingHorizontal: Theme.spacing.md,
                                    backgroundColor:
                                        sortBy === 'rank'
                                            ? Theme.colors.sanctuarySaffron
                                            : Theme.colors.deepIndigo,
                                    borderRadius: Theme.corners.tight,
                                }}
                            >
                                <Text
                                    color={Theme.colors.sacredWhite}
                                    sx={{ fontSize: 14 }}
                                >
                                    {t('grading.gradebook.sortRank') || 'Rank'}
                                </Text>
                            </Box>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setSortBy('marks')}>
                            <Box
                                sx={{
                                    padding: Theme.spacing.sm,
                                    paddingHorizontal: Theme.spacing.md,
                                    backgroundColor:
                                        sortBy === 'marks'
                                            ? Theme.colors.sanctuarySaffron
                                            : Theme.colors.deepIndigo,
                                    borderRadius: Theme.corners.tight,
                                }}
                            >
                                <Text
                                    color={Theme.colors.sacredWhite}
                                    sx={{ fontSize: 14 }}
                                >
                                    {t('grading.gradebook.sortMarks') || 'Marks'}
                                </Text>
                            </Box>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setSortBy('name')}>
                            <Box
                                sx={{
                                    padding: Theme.spacing.sm,
                                    paddingHorizontal: Theme.spacing.md,
                                    backgroundColor:
                                        sortBy === 'name'
                                            ? Theme.colors.sanctuarySaffron
                                            : Theme.colors.deepIndigo,
                                    borderRadius: Theme.corners.tight,
                                }}
                            >
                                <Text
                                    color={Theme.colors.sacredWhite}
                                    sx={{ fontSize: 14 }}
                                >
                                    {t('grading.gradebook.sortName') || 'Name'}
                                </Text>
                            </Box>
                        </TouchableOpacity>
                    </HStack>

                    {/* Loading State */}
                    {isLoading && (
                        <Box
                            sx={{
                                padding: Theme.spacing.xl,
                                alignItems: 'center',
                            }}
                        >
                            <Spinner color={Theme.colors.sanctuarySaffron} />
                            <Text
                                color={Theme.colors.pearlGray}
                                sx={{ marginTop: Theme.spacing.md }}
                            >
                                {t('common.loading') || 'Loading...'}
                            </Text>
                        </Box>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <Box
                            sx={{
                                padding: Theme.spacing.md,
                                backgroundColor: Theme.colors.emberRed,
                                borderRadius: Theme.corners.comfortable,
                            }}
                        >
                            <Text color={Theme.colors.sacredWhite}>
                                {error}
                            </Text>
                        </Box>
                    )}

                    {/* Gradebook Table */}
                    {!isLoading && !error && grades.length > 0 && gradingSettings && (
                        <GradebookTable
                            grades={sortedGrades}
                            gradingSettings={gradingSettings}
                            studentNames={studentNames}
                        />
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && grades.length === 0 && (
                        <Box
                            sx={{
                                padding: Theme.spacing.xl,
                                alignItems: 'center',
                            }}
                        >
                            <Text
                                color={Theme.colors.pearlGray}
                                sx={{ textAlign: 'center', fontSize: 18 }}
                            >
                                {t('grading.gradebook.noGrades') ||
                                    'No grades recorded yet'}
                            </Text>
                        </Box>
                    )}
                </VStack>
            </ScrollView>
        </Box>
    );
}
