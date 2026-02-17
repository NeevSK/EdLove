/**
 * GRADEBOOK SCREEN
 * 
 * Full gradebook view for teachers to see all student grades in a classroom.
 * Features:
 * - Table/List view of all students with grades
 * - Sorting options (by name, grade, rank)
 * - Access to GradingSettings
 * - Tap student to edit grade
 * 
 * Mission 03: Grading System
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
} from '@/ui';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StudentGrade, ClassroomGradingSettings } from '../../types/Grade';
import { useGradebook } from '../../hooks/grading/useGradebook';
import GradebookTable from '../../components/grading/GradebookTable';
import GradingSettings from '../../components/grading/GradingSettings';
import Theme from '../../constants/Theme';

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
            // Error is handled in hook, but we might want to show a toast or something here
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
                    space="lg"
                    sx={{ padding: Theme.spacing.lg }}
                >
                    {/* Header */}
                    <HStack
                        sx={{
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Heading
                            size="2xl"
                            color={Theme.colors.sanctuarySaffron}
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
                        space="md"
                        sx={{
                            padding: Theme.spacing.md,
                            backgroundColor: Theme.colors.deepIndigo,
                            borderRadius: Theme.corners.comfortable,
                        }}
                    >
                        <VStack sx={{ flex: 1 }}>
                            <Text
                                size="sm"
                                color={Theme.colors.mistGray}
                            >
                                {t('grading.gradebook.totalStudents') || 'Total Students'}
                            </Text>
                            <Text
                                size="xl"
                                color={Theme.colors.sacredWhite}
                                sx={{ fontWeight: '700' }}
                            >
                                {grades.length}
                            </Text>
                        </VStack>

                        <VStack sx={{ flex: 1 }}>
                            <Text
                                size="sm"
                                color={Theme.colors.mistGray}
                            >
                                {t('grading.gradebook.averageMarks') || 'Average'}
                            </Text>
                            <Text
                                size="xl"
                                color={Theme.colors.sacredWhite}
                                sx={{ fontWeight: '700' }}
                            >
                                {stats.averageMarks}
                            </Text>
                        </VStack>
                    </HStack>

                    {/* Sort Options */}
                    <HStack
                        space="sm"
                        sx={{ flexWrap: 'wrap' }}
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
                                    size="sm"
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
                                    size="sm"
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
                                    size="sm"
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
                                size="lg"
                                color={Theme.colors.pearlGray}
                                textAlign="center"
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
