import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    ButtonText,
    HStack,
    Heading,
    Spinner,
    Text,
    Theme,
    VStack,
    useThemedColors,
} from '@repo/ui';
import { api, Student } from '@repo/core';
import { StudentAnalysisModal } from '@repo/library';
import { Activity, Sparkles, TrendingUp, TriangleAlert } from 'lucide-react-native';

interface TeacherAnalysisWorkspaceProps {
    classroomId: string;
    students: Student[];
}

export default function TeacherAnalysisWorkspace({
    classroomId,
    students,
}: TeacherAnalysisWorkspaceProps) {
    const colors = useThemedColors();
    const [isLoading, setIsLoading] = useState(true);
    const [grades, setGrades] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [observations, setObservations] = useState<any[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<{ id: string; full_name: string } | null>(null);

    const loadAnalysis = useCallback(async () => {
        setIsLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const [gradebookSnapshot, attendanceSnapshot, observationData] = await Promise.all([
                api.grading.getGradebookSnapshot(classroomId, today || '').catch(() => ({ grades: [] })),
                api.attendance.getClassroomAttendanceSnapshot(classroomId, today || '').catch(() => ({ records: [] })),
                api.studentObservations.getForClassroom(classroomId).catch(() => []),
            ]);
            setGrades(gradebookSnapshot.grades || []);
            setAttendance(attendanceSnapshot.records || []);
            setObservations(observationData || []);
        } catch (error) {
            console.error('Failed to load analysis', error);
        } finally {
            setIsLoading(false);
        }
    }, [classroomId]);

    useEffect(() => {
        loadAnalysis();
    }, [loadAnalysis]);

    const stats = useMemo(() => {
        const averageGpa = grades.length
            ? (grades.reduce((sum, grade) => sum + (grade.gpa || 0), 0) / grades.length).toFixed(2)
            : '0.00';
        const attendanceRate = attendance.length
            ? Math.round((attendance.filter((record) => record.status === 'present').length / attendance.length) * 100)
            : 0;
        const concernCount = observations.filter((item) => item.observation_type === 'concern').length;
        const positiveCount = observations.filter((item) => item.observation_type === 'positive').length;

        return {
            averageGpa,
            attendanceRate,
            concernCount,
            positiveCount,
        };
    }, [attendance, grades, observations]);

    const studentSignals = useMemo(() => {
        const observationCountByStudent = new Map<string, number>();
        const concernCountByStudent = new Map<string, number>();

        observations.forEach((item) => {
            const studentId = item.student_id;
            if (!studentId) return;
            observationCountByStudent.set(studentId, (observationCountByStudent.get(studentId) || 0) + 1);
            if (item.observation_type === 'concern') {
                concernCountByStudent.set(studentId, (concernCountByStudent.get(studentId) || 0) + 1);
            }
        });

        return students.map((student) => ({
            ...student,
            observationCount: observationCountByStudent.get(student.id) || 0,
            concernCount: concernCountByStudent.get(student.id) || 0,
        }));
    }, [observations, students]);

    return (
        <Box sx={{ flex: 1 }}            <VStack sx={{ gap: Theme.spacing.md, padding: Theme.spacing.md }}                <Box>
                    sx={{
                        backgroundColor: Theme.colors.silk,
                        borderRadius: Theme.corners.generous,
                        borderWidth: 1,
                        borderColor: colors.border,
                        padding: Theme.spacing.lg,
                        shadowColor: Theme.colors.shadowAmbient,
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 1,
                        shadowRadius: 18,
                        elevation: 4,
                    }}
                                    <VStack sx={{ gap: Theme.spacing.md }}                        <VStack sx={{ gap: 4 }}                            <Text sx={{ color: colors.textTertiary, fontSize: 11, fontWeight: '700' as const, textTransform: 'uppercase', letterSpacing: 1 }}                                Analysis>
                            </Text                            ><Heading sx={{ color: colors.text, fontSize: Theme.typography.fontSize.xl }}                                Read the classroom before reacting>
                            </Heading                            ><Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}                                Academic signals, attendance rhythm, and observation patterns live together here so the teacher can decide with context.
                            </Text                        ></VStack
                        <HStack sx={{ gap: Theme.spacing.sm }}                            <StatCard>
                                label="Average GPA"
                                value={stats.averageGpa}
                                icon={<TrendingUp size={16} color={Theme.colors.sanctuarySaffron} />}
                                colors={colors}
                            /                            ><StatCard
                                label="Attendance"
                                value={`${stats.attendanceRate}%`}
                                icon={<Activity size={16} color={Theme.colors.gurudeviBlue} />}
                                colors={colors}
                            /                            ><StatCard
                                label="Concerns"
                                value={String(stats.concernCount)}
                                icon={<TriangleAlert size={16} color={Theme.colors.emberRed} />}
                                colors={colors}
                            /                        ></HStack                    ></VStack                </Box
                {isLoading ? (
                    <Box sx={{ paddingVertical: Theme.spacing.xl, alignItems: 'center' }}                        <Spinner color={Theme.colors.sanctuarySaffron} /                    ></Box                ) : (
                    <Box>
                        sx={{
                            backgroundColor: Theme.colors.silk,
                            borderRadius: Theme.corners.generous,
                            borderWidth: 1,
                            borderColor: colors.border,
                            padding: Theme.spacing.lg,
                        }}
                                            <VStack sx={{ gap: Theme.spacing.md }}                            <Heading sx={{ color: colors.text, fontSize: Theme.typography.fontSize.md }}                                Student analysis queue>
                            </Heading                            >{studentSignals.length === 0 ? (>
                                <Text sx={{ color: colors.textSecondary }}                                    No students available for analysis yet.>
                                </Text                            >) : (
                                studentSignals.map((student, index) => (
                                    <HStack>
                                        key={student.id}
                                        sx={{
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: Theme.spacing.md,
                                            paddingBottom: Theme.spacing.sm,
                                            borderBottomWidth: index === studentSignals.length - 1 ? 0 : 1,
                                            borderBottomColor: colors.border,
                                        }}
                                                                            <VStack sx={{ flex: 1 }}                                            <Text sx={{ color: colors.text, fontWeight: '700' as const }}                                                {student.full_name}>
                                            </Text                                            ><Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.xs }}                                                {student.observationCount} observations " {student.concernCount} concern signals>
                                            </Text                                        ></VStack                                        <HStack sx={{ gap: Theme.spacing.sm, alignItems: 'center' }}                                            {student.concernCount > 0 ? (
                                                <SignalBadge>
                                                    label={`${student.concernCount} concern`}
                                                    tone="warning"
                                                    colors={colors}
                                                /                                            >) : (
                                                <SignalBadge>
                                                    label="steady"
                                                    tone="positive"
                                                    colors={colors}
                                                /                                            >)}>
                                            <Button>
                                                size="sm"
                                                action="primary"
                                                onPress={() => setSelectedStudent({ id: student.id, full_name: student.full_name })}
                                                sx={{ backgroundColor: Theme.colors.sanctuarySaffron, borderRadius: Theme.corners.full }}
                                                                                            <HStack sx={{ alignItems: 'center', gap: 6 }}                                                    <Sparkles size={14} color={Theme.colors.sacredWhite} /                                                    ><ButtonText color={Theme.colors.sacredWhite}>Open</ButtonText                                                ></HStack                                            ></Button                                        ></HStack                                    ></HStack                                ))
                            )}
                        </VStack                    </Box                )}
            </VStack>
            {selectedStudent && (
                <StudentAnalysisModal>
                    visible={!!selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                    studentId={selectedStudent.id}
                    studentName={selectedStudent.full_name}
                    classroomId={classroomId}
                /            >)}
        </Box    >);
}

function StatCard({
    label,
    value,
    icon,
    colors,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
    colors: ReturnType<typeof useThemedColors>;
}) {
    return (
        <Box>
            sx={{
                flex: 1,
                backgroundColor: colors.primary,
                borderRadius: Theme.corners.comfortable,
                borderWidth: 1,
                borderColor: colors.border,
                padding: Theme.spacing.md,
            }}
                    <VStack sx={{ gap: Theme.spacing.xs }}                <HStack sx={{ alignItems: 'center', gap: Theme.spacing.xs }}                    {icon}>
                    <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.xs, textTransform: 'uppercase', fontWeight: '700' as const }}                        {label}>
                    </Text                ></HStack                ><Heading sx={{ color: colors.text, fontSize: Theme.typography.fontSize.xl }}                    {value}
                </Heading            ></VStack        </Box    );
}

function SignalBadge({
    label,
    tone,
    colors,
}: {
    label: string;
    tone: 'positive' | 'warning';
    colors: ReturnType<typeof useThemedColors>;
}) {
    const backgroundColor = tone === 'positive' ? 'rgba(139,191,122,0.16)' : 'rgba(255,184,77,0.16)';
    const color = tone === 'positive' ? Theme.colors.sageGreen : Theme.colors.amberGlow;

    return (
        <Box>
            sx={{
                paddingHorizontal: Theme.spacing.sm,
                paddingVertical: 6,
                borderRadius: Theme.corners.full,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor,>
            }}
                    <Text sx={{ color, fontSize: Theme.typography.fontSize.xs, fontWeight: '700' as const, textTransform: 'uppercase' }}                {label}>
            </Text        ></Box    >);>
}
