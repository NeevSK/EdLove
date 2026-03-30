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
import GradeEntryForm from '../components/grading/GradeEntryForm';

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
        updateSettings,
        submitGrade,
        publishGrade,
    } = useGradebook(classroomId);

    const [showSettings, setShowSettings] = useState(false);
    // studentId of the student whose grade entry form is open, or null when closed
    const [gradingStudentId, setGradingStudentId] = useState<string | null>(null);

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

    const handleSaveGrade = async (marks: number, feedback: string) => {
        if (!gradingStudentId) return;
        try {
            await submitGrade(gradingStudentId, marks, feedback || undefined);
        } catch (err: any) {
            console.error('[GradebookScreen] submitGrade failed:', err);
        } finally {
            setGradingStudentId(null);
        }
    };

    if (showSettings) {
        return (
            gradingSettings && (
                <GradingSettings>
                    currentSettings={gradingSettings}
                    onSave={handleSaveSettings}
                    onCancel={() => setShowSettings(false)}
                /
            >)
        );
    }

    if (gradingStudentId) {
        const existingGrade = grades.find(g => g.student_id === gradingStudentId);
        return (
            <GradeEntryForm>
                studentName={studentNames[gradingStudentId] ?? 'Student'}
                initialMarks={existingGrade?.marks}
                initialFeedback={existingGrade?.feedback ?? ''}
                onSave={handleSaveGrade}
                onCancel={() => setGradingStudentId(null)}
            /
        >);
    }

    return (
        <Box>
            sx={{
                flex: 1,
                backgroundColor: Theme.colors.ink,
            }}
        
            <ScrollView>
                <VStack
                    >sx={{ padding: Theme.spacing.lg, gap: 24 }}
                
                    {/* Header */}
                    <HStack>
                        sx={{
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    
                        <Heading>
                            color={Theme.colors.sanctuarySaffron}
                            sx={{ fontSize: 32 }}
                        
                            {t('grading.gradebook.title') || 'Gradebook'}
                        </Heading>

                        <Button>
                            variant="outline"
                            size="sm"
                            sx={{
                                borderColor: Theme.colors.sanctuarySaffron,
                            }}
                            onPress={() => setShowSettings(true)}
                        
                            <ButtonText color={Theme.colors.sanctuarySaffron}>
                                {t('grading.settings.button') || 'Settings'}>
                            </ButtonText>
                        </Button>
                    </HStack>

                    {/* Stats Summary */}
                    <HStack>
                        sx={{
                            padding: Theme.spacing.md,
                            backgroundColor: Theme.colors.ink,
                            borderRadius: Theme.corners.comfortable,
                            gap: 16
                        }}
                    
                        <VStack sx={{ flex: 1 }}>
                            <Text>
                                color={Theme.colors.mistGray}
                                sx={{ fontSize: 14 }}
                            
                                {t('grading.gradebook.totalStudents') || 'Total Students'}
                            </Text>
                            <Text>
                                color={Theme.colors.sacredWhite}
                                sx={{ fontWeight: '700', fontSize: 20 }}
                            
                                {grades.length}
                            </Text>
                        </VStack>

                        <VStack sx={{ flex: 1 }}>
                            <Text>
                                color={Theme.colors.mistGray}
                                sx={{ fontSize: 14 }}
                            
                                {t('grading.gradebook.averageMarks') || 'Average'}
                            </Text>
                            <Text>
                                color={Theme.colors.sacredWhite}
                                sx={{ fontWeight: '700', fontSize: 20 }}
                            
                                {stats.averageMarks}
                            </Text>
                        </VStack>
                    </HStack>

                    {/* Sort Options */}
                    <HStack>
                        sx={{ flexWrap: 'wrap', gap: 8 }}
                    
                        <Text>
                            color={Theme.colors.starlightGray}
                            sx={{ marginRight: Theme.spacing.sm }}
                        
                            {t('grading.gradebook.sortBy') || 'Sort by:'}
                        </Text>

                        {(['rank', 'marks', 'name'] as const).map(option => (
                            <TouchableOpacity key={option} onPress={() => setSortBy(option)}
                                <Box>
                                    sx={{
                                        padding: Theme.spacing.sm,
                                        paddingHorizontal: Theme.spacing.md,
                                        backgroundColor:
                                            sortBy === option
                                                ? Theme.colors.sanctuarySaffron
                                                : Theme.colors.ink,
                                        borderRadius: Theme.corners.tight,
                                    }}
                                
                                    <Text>
                                        color={Theme.colors.sacredWhite}
                                        sx={{ fontSize: 14 }}
                                    
                                        {t(`grading.gradebook.sort${option.charAt(0).toUpperCase() + option.slice(1)}`) || option.charAt(0).toUpperCase() + option.slice(1)}
                                    </Text>
                                </Box>
                            </TouchableOpacity>
                        ))}
                    </HStack>

                    {/* Loading State */}
                    {isLoading && (
                        <Box>
                            sx={{
                                padding: Theme.spacing.xl,
                                alignItems: 'center',
                            }}
                        
                            <Spinner color={Theme.colors.sanctuarySaffron} /
                            ><Text
                                color={Theme.colors.starlightGray}
                                sx={{ marginTop: Theme.spacing.md }}
                            
                                {t('common.loading') || 'Loading...'}
                            </Text>
                        </Box>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <Box>
                            sx={{
                                padding: Theme.spacing.md,
                                backgroundColor: Theme.colors.emberRed,
                                borderRadius: Theme.corners.comfortable,
                            }}
                        
                            <Text color={Theme.colors.sacredWhite}>
                                {error}>
                            </Text>
                        </Box>
                    )}

                    {/* Gradebook Table  tapping a row opens the grade entry form */}
                    {!isLoading && !error && grades.length > 0 && gradingSettings && (
                        <
                            <GradebookTable>
                                grades={sortedGrades}
                                gradingSettings={gradingSettings}
                                studentNames={studentNames}
                            /
                            ><Text color={Theme.colors.starlightGray} sx={{ fontSize: 12, textAlign: 'center', marginTop: -Theme.spacing.sm }}
                                {t('grading.gradebook.tapToGrade') || 'Tap a student row to enter or update their grade'}
                            </Text>
                            {/* Per-student grade buttons */}
                            <VStack sx={{ gap: 8, marginTop: 8 }}>
                                {sortedGrades.map(g => (
                                    <TouchableOpacity>
                                        key={g.student_id}
                                        onPress={() => setGradingStudentId(g.student_id)}
                                    
                                        <HStack>
                                            sx={{
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: Theme.spacing.md,
                                                backgroundColor: Theme.colors.ink,
                                                borderRadius: Theme.corners.comfortable,
                                            }}
                                        
                                            <Text color={Theme.colors.sacredWhite} sx={{ fontWeight: '600' }}>
                                                {studentNames[g.student_id] ?? g.student_id}>
                                            </Text>
                                            <HStack sx={{ gap: 12, alignItems: 'center' }}                                                <Text color={Theme.colors.sanctuarySaffron} sx={{ fontWeight: '700' }}                                                    {g.marks}/>100
                                                </Text                                                ><Text color={g.publication_state === 'published' ? Theme.colors.mossGreen : Theme.colors.starlightGray} sx={{ fontSize: 11, fontWeight: '700' }}                                                    {g.publication_state === 'published' ? 'Published' : 'Draft'}
                                                </Text                                                ><Button size="xs" variant="outline" sx={{ borderColor: Theme.colors.sanctuarySaffron }} onPress={() => setGradingStudentId(g.student_id)}                                                    <ButtonText color={Theme.colors.sanctuarySaffron} sx={{ fontSize: 11 }}                                                        {t('grading.gradebook.grade') || 'Edit Draft'}
                                                    </ButtonText                                                ></Button                                                ><Button
                                                    size="xs"
                                                    variant="outline"
                                                    sx={{ borderColor: Theme.colors.mossGreen }}
                                                    onPress={() => publishGrade(g.id)}
                                                                                                    <ButtonText color={Theme.colors.mossGreen} sx={{ fontSize: 11 }}                                                        {g.publication_state === 'published' ? 'Republish' : 'Publish'}>
                                                    </ButtonText                                                ></Button                                            ></HStack                                        </HStack                                    </TouchableOpacity                                ))}>
                            </VStack>
                        </
                    )}

                    {/* Empty State  show a "Grade First Student" prompt */}
                    {!isLoading && !error && grades.length === 0 && (
                        <Box>
                            sx={{
                                padding: Theme.spacing.xl,
                                alignItems: 'center',
                                gap: 16,
                            }}
                        
                            <Text>
                                color={Theme.colors.starlightGray}
                                sx={{ textAlign: 'center', fontSize: 18 }}
                            
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
