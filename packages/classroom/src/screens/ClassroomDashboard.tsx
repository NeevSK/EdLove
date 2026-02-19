import React, { useState, useEffect, useMemo } from 'react';
import {
    VStack,
    HStack,
    Box,
    Text,
    ScrollView,
    Pressable,
    Heading,
    Spinner,
    Button,
    ButtonText,
    Theme,
    useThemedColors,
    hapticLight,
    GlobalHeader,
    ScreenWrapper,
    SkeletonCard
} from '@repo/ui';
import {
    Users,
    BookOpen,
    FileText,
    ClipboardCheck,
    GraduationCap,
    LayoutGrid,
    Plus
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { api, supabase } from '@repo/core';
import type { Classroom } from '@repo/core';
import { StudentList, GradebookTable, AttendanceView, InventoryView, ResourcesView } from '../components';
import LessonFeed from './LessonFeed';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClassroomStackParamList } from '@repo/core';

type Props = NativeStackScreenProps<ClassroomStackParamList, 'ClassroomDetails'>;

type FeatureId = 'students' | 'attendance' | 'gradebook' | 'lessons' | 'resources' | 'inventory';

const ALL_FEATURES: { id: FeatureId; label: string; icon: any }[] = [
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'gradebook', label: 'Gradebook', icon: GraduationCap },
    { id: 'lessons', label: 'Lessons', icon: BookOpen },
    { id: 'resources', label: 'Library', icon: FileText },
    { id: 'inventory', label: 'Inventory', icon: LayoutGrid },
];

export default function ClassroomDashboard({ route, navigation }: Props) {
    const { classroomId, classroomName } = route.params;
    const { t } = useTranslation();
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [activeFeature, setActiveFeature] = useState<FeatureId>('students');
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [students, setStudents] = useState<any[]>([]);
    const colors = useThemedColors();

    useEffect(() => {
        fetchInitialData();
    }, [classroomId]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [classData, { data: authData }] = await Promise.all([
                api.classrooms.getById(classroomId),
                supabase.auth.getUser()
            ]);
            setClassroom(classData);
            setCurrentUserId(authData?.user?.id || null);
        } catch (error) {
            console.error('Error fetching classroom details:', error);
        } finally {
            setLoading(false);
        }
    };

    const isClassTeacher = useMemo(() => {
        if (!classroom || !currentUserId) return false;
        if (classroom.id.startsWith('sample-') || (classroom as any).is_sample) return true;
        return classroom.teacher_id === currentUserId;
    }, [classroom, currentUserId]);

    const filteredFeatures = useMemo(() => {
        return ALL_FEATURES.filter(f => {
            if (f.id === 'inventory') return isClassTeacher;
            return true;
        });
    }, [isClassTeacher]);

    useEffect(() => {
        if (activeFeature === 'students' && students.length === 0 && classroomId) {
            api.classroomStudents.getAll(classroomId).then(setStudents).catch(console.error);
        }
    }, [activeFeature, classroomId]);

    const renderFeatureContent = () => {
        switch (activeFeature) {
            case 'students':
                return (
                    <StudentList
                        classroomId={classroomId}
                        students={students}
                        onRefresh={() => api.classroomStudents.getAll(classroomId).then(setStudents)}
                    />
                );
            case 'attendance':
                return <AttendanceView classroomId={classroomId} />
            case 'gradebook':
                // Using GradebookTable directly or could navigate to GradebookScreen
                // For simple view in dashboard, we keep it as is or show a summary
                return <Box sx={{ padding: Theme.spacing.md }}><Text sx={{ color: colors.textTertiary }}>Gradebook Summary View</Text></Box>
            case 'lessons':
                return (
                    <LessonFeed
                        classroomId={classroomId}
                        isTeacher={true}
                        refreshTrigger={0}
                        onOpenLesson={(id: string) => console.log('Open Lesson', id)}
                        onOpenAssignment={(id: string) => console.log('Open Assignment', id)}
                        onAddMaterial={() => { }} // TODO: Connect modals
                        onAddAssignment={() => { }}
                    />
                );
            case 'inventory':
                return <InventoryView classroomId={classroomId} />
            case 'resources':
                return <ResourcesView classroomId={classroomId} isTeacher={isClassTeacher} />
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <GlobalHeader title={classroomName} showBack onBack={() => navigation.goBack()} />
                <VStack sx={{ gap: '$md' as any, padding: '$4' as any }}>
                    <SkeletonCard height={100} />
                    <HStack sx={{ gap: '$md' as any, marginTop: '$4' as any }}>
                        <SkeletonCard width={90} height={70} />
                        <SkeletonCard width={90} height={70} />
                        <SkeletonCard width={90} height={70} />
                    </HStack>
                    <VStack sx={{ gap: '$md' as any, marginTop: '$4' as any }}>
                        <SkeletonCard height={60} />
                        <SkeletonCard height={60} />
                        <SkeletonCard height={60} />
                        <SkeletonCard height={60} />
                    </VStack>
                </VStack>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper scroll={false}>
            <GlobalHeader
                title={classroomName}
                subtitle={classroom?.subject || 'Classroom'}
                showBack
                onBack={() => navigation.goBack()}
            />

            <ScrollView stickyHeaderIndices={[1]} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* 1. Header Area */}
                <Box sx={{ padding: Theme.spacing.md, backgroundColor: colors.secondary }}>
                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <VStack>
                            <Text sx={{ fontSize: Theme.typography.fontSize.sm, color: colors.textTertiary, fontWeight: '700' as any, textTransform: 'uppercase' }}>
                                {isClassTeacher ? 'Class Sanctuary' : 'Subject Sanctuary'}
                            </Text>
                            <Heading sx={{ fontSize: Theme.typography.fontSize.xl, color: Theme.colors.sanctuarySaffron }}>
                                {classroomName}
                            </Heading>
                        </VStack>
                        {classroom?.subject && (
                            <Box sx={{ backgroundColor: colors.tertiary, paddingHorizontal: Theme.spacing.sm, paddingVertical: Theme.spacing.xs, borderRadius: Theme.corners.full }}>
                                <Text sx={{ fontSize: Theme.typography.fontSize.xs, fontWeight: '700' as any, color: Theme.colors.sanctuarySaffron }}>{classroom.subject}</Text>
                            </Box>
                        )}
                    </HStack>
                </Box>

                {/* 2. Horizontal Carousel (Sticky) */}
                <Box sx={{ backgroundColor: colors.secondary, paddingBottom: Theme.spacing.md, paddingTop: Theme.spacing.sm }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16 }}
                    >
                        <HStack sx={{ gap: 12 }}>
                            {filteredFeatures.map((f) => {
                                const Icon = f.icon;
                                const isActive = activeFeature === f.id;
                                return (
                                    <Pressable
                                        key={f.id}
                                        onPress={() => {
                                            hapticLight();
                                            setActiveFeature(f.id);
                                        }}
                                    >
                                        <VStack
                                            sx={{
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                paddingHorizontal: Theme.spacing.md,
                                                paddingVertical: Theme.spacing.sm,
                                                borderRadius: Theme.corners.comfortable,
                                                backgroundColor: isActive ? Theme.colors.sanctuarySaffron : colors.tertiary,
                                                minWidth: 90,
                                                gap: Theme.spacing.xs
                                            }}
                                        >
                                            <Icon
                                                size={20}
                                                color={isActive ? 'white' : colors.textSecondary}
                                            />
                                            <Text
                                                sx={{
                                                    fontSize: Theme.typography.fontSize.xs,
                                                    fontWeight: (isActive ? '700' : '400') as any,
                                                    color: isActive ? 'white' : colors.textSecondary
                                                }}
                                            >
                                                {f.label}
                                            </Text>
                                        </VStack>
                                    </Pressable>
                                );
                            })}
                        </HStack>
                    </ScrollView>
                </Box>

                {/* 3. Feature Content */}
                <Box flex={1}>
                    {renderFeatureContent()}
                </Box>
            </ScrollView>
        </ScreenWrapper>
    );
}
