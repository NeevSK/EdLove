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

import React, { useState, useEffect } from 'react';
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
} from '@gluestack-ui/themed';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StudentGrade, ClassroomGradingSettings } from '../../types/Grade';
import { api } from '../../lib/api';
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
    const [grades, setGrades] = useState<StudentGrade[]>([]);
    const [gradingSettings, setGradingSettings] = useState<ClassroomGradingSettings>({
        classroom_id: classroomId,
        grading_mode: 'both',
        show_ranks: true,
    });
    const [studentNames, setStudentNames] = useState<{ [studentId: string]: string }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'marks' | 'rank'>('rank');
    const [error, setError] = useState<string | null>(null);

    // Load grades and settings
    useEffect(() => {
        loadData();
    }, [classroomId]);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Load grades
            const gradesData = await api.grading.getClassroomGrades(classroomId);
            setGrades(gradesData);

            // Load grading settings
            const settingsData = await api.grading.getGradingSettings(classroomId);
            setGradingSettings(settingsData);

            // Load student names (would come from classroom students API)
            // For now, using mock data - in real app, fetch from api.classroomStudents
            const names: { [key: string]: string } = {};
            gradesData.forEach((grade) => {
                names[grade.student_id] = `Student ${grade.student_id.substring(0, 8)}`;
            });
            setStudentNames(names);
        } catch (err: any) {
            console.error('Failed to load gradebook data:', err);
            setError(err.message || 'Failed to load gradebook');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSettings = async (
        settings: Omit<ClassroomGradingSettings, 'classroom_id'>
    ) => {
        try {
            const updated = await api.grading.updateGradingSettings(classroomId, settings);
            setGradingSettings(updated);
            setShowSettings(false);
        } catch (err: any) {
            console.error('Failed to update settings:', err);
            setError(err.message || 'Failed to update settings');
        }
    };

    const handleSort = (newSortBy: 'name' | 'marks' | 'rank') => {
        setSortBy(newSortBy);
    };

    const getSortedGrades = () => {
        const sorted = [...grades];
        switch (sortBy) {
            case 'name':
                return sorted.sort((a, b) =>
                    (studentNames[a.student_id] || '').localeCompare(
                        studentNames[b.student_id] || ''
                    )
                );
            case 'marks':
                return sorted.sort((a, b) => b.marks - a.marks);
            case 'rank':
                return sorted.sort((a, b) => (a.rank || 999) - (b.rank || 999));
            default:
                return sorted;
        }
    };

    if (showSettings) {
        return (
            <GradingSettings
                currentSettings={gradingSettings}
                onSave={handleSaveSettings}
                onCancel={() => setShowSettings(false)}
            />
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
                                {grades.length > 0
                                    ? Math.round(
                                        grades.reduce((sum, g) => sum + g.marks, 0) /
                                        grades.length
                                    )
                                    : 0}
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

                        <TouchableOpacity onPress={() => handleSort('rank')}>
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

                        <TouchableOpacity onPress={() => handleSort('marks')}>
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

                        <TouchableOpacity onPress={() => handleSort('name')}>
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
                    {!isLoading && !error && grades.length > 0 && (
                        <GradebookTable
                            grades={getSortedGrades()}
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
