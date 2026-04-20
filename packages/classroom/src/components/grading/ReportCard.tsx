/**
 * REPORT CARD COMPONENT
 * 
 * Displays a student's report card with all their grades.
 */

import React, { useMemo } from 'react';
import {
    VStack,
    HStack,
    Text,
    Heading,
    Box,
    ScrollView,
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { StudentGrade, marksToGPA, calculateRanks } from '@repo/analytics';

interface ReportCardProps {
    studentName: string;
    grades: StudentGrade[];
    assignmentNames: { [assignmentId: string]: string };
    showGPA?: boolean;
    showRanks?: boolean;
}

export default function ReportCard({
    studentName,
    grades,
    assignmentNames,
    showGPA = true,
    showRanks = false,
}: ReportCardProps) {
    const { t } = useTranslation();

    // Calculate overall GPA
    const overallGPA = useMemo(() => {
        if (grades.length === 0) return 0;
        const totalGPA = grades.reduce((sum, grade) => {
            const { gpa } = marksToGPA(grade.marks);
            return sum + gpa;
        }, 0);
        return totalGPA / grades.length;
    }, [grades]);

    // Calculate average marks
    const averageMarks = useMemo(() => {
        if (grades.length === 0) return 0;
        const totalMarks = grades.reduce((sum, grade) => sum + grade.marks, 0);
        return totalMarks / grades.length;
    }, [grades]);

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-sanctuary-surface">
            <VStack className="gap-10 p-6">
                {/* Student Info Header */}
                <Box className="p-10 bg-sanctuarySaffron rounded-[40px] shadow-xl shadow-sanctuarySaffron/30 relative overflow-hidden">
                    <VStack className="gap-8 relative z-10">
                        <VStack className="gap-2">
                            <Text className="text-[10px] font-black text-sanctuary-ink opacity-40 uppercase tracking-[0.25em]">
                                {t('grades.reportCard') || 'Report Card'}
                            </Text>
                            <Heading className="text-5xl font-black text-sanctuary-ink -ml-1">
                                {studentName}
                            </Heading>
                        </VStack>
                        {grades.length > 0 && (
                            <HStack className="gap-12 mt-2">
                                <VStack className="gap-1.5">
                                    <Text className="text-[10px] font-black text-sanctuary-ink opacity-40 uppercase tracking-[0.15em]">
                                        {t('grades.averageMarks') || 'Avg Marks'}
                                    </Text>
                                    <Text className="text-4xl font-black text-sanctuary-ink">
                                        {averageMarks.toFixed(1)}
                                    </Text>
                                </VStack>
                                {showGPA && (
                                    <VStack className="gap-1.5">
                                        <Text className="text-[10px] font-black text-sanctuary-ink opacity-40 uppercase tracking-[0.15em]">
                                            {t('grades.overallGPA') || 'Overall GPA'}
                                        </Text>
                                        <Text className="text-4xl font-black text-sanctuary-ink">
                                            {overallGPA.toFixed(2)}
                                        </Text>
                                    </VStack>
                                )}
                            </HStack>
                        )}
                    </VStack>
                    <Box className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-sanctuary-ink opacity-5" />
                </Box>

                {/* Assignments List */}
                <VStack className="gap-6">
                    <VStack className="gap-1 ml-1 mb-2">
                        <Text className="text-[10px] font-black text-sanctuary-text-tertiary uppercase tracking-[0.25em]">
                            {t('grades.academicPerformance') || 'Academic Performance'}
                        </Text>
                        <Heading className="text-2xl font-black text-sanctuary-text">
                            {t('grades.assignments') || 'Assignments'}
                        </Heading>
                    </VStack>

                    {grades.length === 0 ? (
                        <Box className="p-16 bg-sanctuary-surface-secondary/50 rounded-[32px] items-center border border-sanctuary-border justify-center">
                            <Text className="text-sanctuary-text-tertiary font-black uppercase text-[10px] tracking-[0.2em] text-center">
                                {t('grades.noAssignments') || 'No assignments recorded.'}
                            </Text>
                        </Box>
                    ) : (
                        grades.map((grade) => {
                            const { grade: letterGrade, gpa } = marksToGPA(grade.marks);
                            const assignmentName = grade.assignment_id
                                ? (assignmentNames[grade.assignment_id] || t('grades.assignment') || 'Assignment')
                                : t('grades.assignment') || 'Assignment';

                            return (
                                <Box
                                    key={grade.id}
                                    className="p-7 bg-sanctuary-surface-secondary/30 rounded-[32px] border border-sanctuary-border shadow-sm overflow-hidden"
                                    style={{
                                        borderLeftWidth: 10,
                                        borderLeftColor: '#F4B400', // sanctuarySaffron
                                    }}
                                >
                                    <VStack className="gap-8">
                                        {/* Assignment Header */}
                                        <HStack className="justify-between items-start">
                                            <VStack className="gap-2 flex-1 pr-6">
                                                <Text className="text-xl font-black text-sanctuary-text line-clamp-1">
                                                    {assignmentName}
                                                </Text>
                                                <Text className="text-[10px] font-black text-sanctuary-text-secondary uppercase tracking-[0.15em] opacity-50">
                                                    {new Date(grade.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </Text>
                                            </VStack>

                                            {/* Grade Display */}
                                            <VStack className="gap-2.5 items-end">
                                                <HStack className="gap-1 items-end">
                                                    <Text className="text-4xl font-black text-sanctuary-text leading-none -mb-1">
                                                        {grade.marks}
                                                    </Text>
                                                    <Text className="text-xs font-black text-sanctuary-text-tertiary mb-1 opacity-40">
                                                        /100
                                                    </Text>
                                                </HStack>
                                                {showGPA && (
                                                    <HStack className="gap-3 items-center">
                                                        <Box className="px-3 py-1 bg-sanctuarySaffron shadow-sm shadow-sanctuarySaffron/10 rounded-full">
                                                            <Text className="text-[11px] font-black text-sanctuary-ink uppercase">
                                                                {letterGrade}
                                                            </Text>
                                                        </Box>
                                                        <Text className="text-[10px] font-black text-sanctuary-text-secondary uppercase tracking-widest opacity-60">
                                                            {gpa.toFixed(1)} {t('grades.gpa') || 'GPA'}
                                                        </Text>
                                                    </HStack>
                                                )}
                                            </VStack>
                                        </HStack>

                                        {/* Rank & Feedback */}
                                        <HStack className="gap-4 flex-wrap">
                                            {showRanks && grade.rank && (
                                                <Box className="px-5 py-2.5 bg-sanctuary-ink rounded-full shadow-sm shadow-black/20 self-start">
                                                    <HStack className="items-center gap-2">
                                                        <Box className="w-1.5 h-1.5 rounded-full bg-sanctuarySaffron" />
                                                        <Text className="text-[10px] font-black text-sanctuarySaffron uppercase tracking-[0.15em]">
                                                            {t('grades.rankInClass', { rank: grade.rank }) || `Rank: #${grade.rank}`}
                                                        </Text>
                                                    </HStack>
                                                </Box>
                                            )}
                                        </HStack>

                                        {/* Feedback Area */}
                                        {grade.feedback && (
                                            <VStack className="gap-3 p-5 bg-sanctuary-surface rounded-[24px] border border-dashed border-sanctuary-border/60 shadow-inner">
                                                <Text className="text-[10px] font-black text-sanctuary-text-tertiary uppercase tracking-[0.2em] opacity-60">
                                                    {t('grades.teacherFeedback') || 'Teacher Feedback'}
                                                </Text>
                                                <Text className="text-base font-black italic text-sanctuary-text leading-relaxed opacity-90">
                                                    "{grade.feedback}"
                                                </Text>
                                            </VStack>
                                        )}
                                    </VStack>
                                </Box>
                            );
                        })
                    )}
                </VStack>
            </VStack>
        </ScrollView>
    );
}
