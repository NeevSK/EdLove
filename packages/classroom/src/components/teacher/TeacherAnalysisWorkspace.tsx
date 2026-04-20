import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    ButtonText,
    HStack,
    Heading,
    Spinner,
    Text,
    VStack,
    Icon,
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
        <Box className="flex-1">
            <VStack className="gap-8 p-6">
                <Box
                    className="bg-sanctuary-surface-secondary/40 rounded-[32px] border border-sanctuary-border p-8"
                >
                    <VStack className="gap-8">
                        <VStack className="gap-3">
                            <Text className="text-sanctuary-text-tertiary text-[10px] font-black uppercase tracking-[0.3em]">
                                Analysis
                            </Text>
                            <Heading className="text-3xl text-sanctuary-text font-black tracking-tight leading-tight">
                                Read the classroom before reacting
                            </Heading>
                            <Text className="text-sanctuary-text text-sm leading-relaxed font-medium opacity-70 max-w-xl">
                                Academic signals, attendance rhythm, and observation patterns live together here so the teacher can decide with context.
                            </Text>
                        </VStack>
                        <HStack className="gap-4 flex-wrap">
                            <StatCard
                                label="Average GPA"
                                value={stats.averageGpa}
                                icon={<Icon as={TrendingUp} size="sm" className="text-sanctuarySaffron" />}
                            />
                            <StatCard
                                label="Attendance"
                                value={`${stats.attendanceRate}%`}
                                icon={<Icon as={Activity} size="sm" className="text-sanctuary-info" />}
                            />
                            <StatCard
                                label="Concerns"
                                value={String(stats.concernCount)}
                                icon={<Icon as={TriangleAlert} size="sm" className="text-sanctuary-error" />}
                            />
                        </HStack>
                    </VStack>
                </Box>

                {isLoading ? (
                    <Box className="items-center py-20">
                        <Spinner className="text-sanctuarySaffron" />
                    </Box>
                ) : (
                    <Box
                        className="bg-sanctuary-surface rounded-[32px] border border-sanctuary-border p-8"
                    >
                        <VStack className="gap-8">
                            <Heading className="text-sm text-sanctuary-text-tertiary font-black uppercase tracking-[0.25em]">
                                Student analysis queue
                            </Heading>
                            {studentSignals.length === 0 ? (
                                <Text className="text-sanctuary-text-tertiary font-medium">
                                    No students available for analysis yet.
                                </Text>
                            ) : (
                                studentSignals.map((student, index) => (
                                    <HStack
                                        key={student.id}
                                        className={`items-center justify-between gap-6 py-5 ${
                                            index === studentSignals.length - 1 ? '' : 'border-b border-sanctuary-border/60'
                                        }`}
                                    >
                                        <VStack className="flex-1 gap-1">
                                            <Text className="text-lg text-sanctuary-text font-black tracking-tight">
                                                {student.full_name}
                                            </Text>
                                            <Text className="text-sanctuary-text-tertiary text-xs font-medium">
                                                {student.observationCount} observations • {student.concernCount} concern signals
                                            </Text>
                                        </VStack>
                                        <HStack className="gap-4 items-center">
                                            {student.concernCount > 0 ? (
                                                <SignalBadge
                                                    label={`${student.concernCount} concern`}
                                                    tone="warning"
                                                />
                                            ) : (
                                                <SignalBadge
                                                    label="steady"
                                                    tone="positive"
                                                />
                                            )}
                                            <Button
                                                action="primary"
                                                onPress={() => setSelectedStudent({ id: student.id, full_name: student.full_name })}
                                                className="bg-sanctuarySaffron rounded-full px-6 h-11"
                                            >
                                                <HStack className="items-center gap-2.5">
                                                    <Icon as={Sparkles} size="xs" className="text-sacredWhite" />
                                                    <ButtonText className="text-sacredWhite font-black uppercase text-[10px] tracking-widest">Open</ButtonText>
                                                </HStack>
                                            </Button>
                                        </HStack>
                                    </HStack>
                                ))
                            )}
                        </VStack>
                    </Box>
                )}
            </VStack>
            {selectedStudent && (
                <StudentAnalysisModal
                    visible={!!selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                    studentId={selectedStudent.id}
                    studentName={selectedStudent.full_name}
                    classroomId={classroomId}
                />
            )}
        </Box>
    );
}

function StatCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <Box
            className="flex-1 bg-sanctuary-surface border border-sanctuary-border rounded-[24px] p-6 shadow-sm"
        >
            <VStack className="gap-3">
                <HStack className="items-center gap-2">
                    <Box className="w-8 h-8 rounded-lg bg-sanctuary-surface-secondary items-center justify-center border border-sanctuary-border/40">
                        {icon}
                    </Box>
                    <Text className="text-sanctuary-text-tertiary text-[10px] font-black uppercase tracking-[0.25em]">
                        {label}
                    </Text>
                </HStack>
                <Heading className="text-2xl text-sanctuary-text font-black tracking-tighter">
                    {value}
                </Heading>
            </VStack>
        </Box>
    );
}

function SignalBadge({
    label,
    tone,
}: {
    label: string;
    tone: 'positive' | 'warning';
}) {
    const isPositive = tone === 'positive';

    return (
        <Box
            className={`px-3.5 py-1.5 rounded-xl border ${isPositive ? 'bg-sanctuary-success/10 border-sanctuary-success/20' : 'bg-sanctuary-warning/10 border-sanctuary-warning/20'}`}
        >
            <Text className={`text-[10px] font-black uppercase tracking-[0.15em] ${isPositive ? 'text-sanctuary-success' : 'text-sanctuary-warning'}`}>
                {label}
            </Text>
        </Box>
    );
}
