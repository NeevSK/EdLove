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
    Theme,
    useThemedColors,
    hapticLight,
    GlobalHeader,
    ScreenWrapper,
    SkeletonCard,
    useBottomTabPadding
} from '@repo/ui';
import {
    Users,
    BookOpen,
    FileText,
    ClipboardCheck,
    GraduationCap,
    TrendingUp,
    MessageSquare,
    NotebookPen
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { api } from '@repo/core';
import type { Classroom } from '@repo/core';
import { AttendanceView, ResourcesView, ClassroomHolisticInsights, ClassroomEchoSection } from '../components';
import ClassroomNotes from '../components/ClassroomNotes';
import LessonFeed from './LessonFeed';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClassroomStackParamList } from '@repo/core';

type Props = NativeStackScreenProps<ClassroomStackParamList, 'StudentClassroomDashboard'>;

type FeatureId = 'insights' | 'notes' | 'attendance' | 'gradebook' | 'lessons' | 'resources' | 'echo';

const STUDENT_FEATURES: { id: FeatureId; label: string; icon: any }[] = [
    { id: 'insights', label: 'My Journey', icon: TrendingUp },
    { id: 'notes', label: 'My Notes', icon: NotebookPen },
    { id: 'lessons', label: 'Study Center', icon: BookOpen },
    { id: 'attendance', label: 'My Attendance', icon: ClipboardCheck },
    { id: 'gradebook', label: 'My Grades', icon: GraduationCap },
    { id: 'resources', label: 'Library', icon: FileText },
    { id: 'echo', label: 'Ask Echo', icon: MessageSquare },
];

export default function StudentClassroomDashboard({ route, navigation }: Props) {
    const { classroomId, classroomName } = route.params;
    const { t } = useTranslation();
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [activeFeature, setActiveFeature] = useState<FeatureId>('insights');
    const [loading, setLoading] = useState(true);
    const colors = useThemedColors();
    const bottomPadding = useBottomTabPadding();

    useEffect(() => {
        fetchInitialData();
    }, [classroomId]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const classData = await api.classrooms.getById(classroomId);
            setClassroom(classData);
        } catch (error) {
            console.error('Error fetching classroom details:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderFeatureContent = () => {
        switch (activeFeature) {
            case 'insights':
                return <ClassroomHolisticInsights classroomId={classroomId} />;
            case 'notes':
                return <ClassroomNotes classroomId={classroomId} isTeacher={false} />;
            case 'attendance':
                return <AttendanceView classroomId={classroomId} />
            case 'gradebook':
                return <Box sx={{ padding: Theme.spacing.md }}><Text sx={{ color: colors.textTertiary }}>My Grade Performance</Text></Box>
            case 'lessons':
                return (
                    <LessonFeed
                        classroomId={classroomId}
                        isTeacher={false}
                        onOpenLesson={(id: string) => console.log('Open Lesson', id)}
                        onOpenAssignment={(id: string) => console.log('Open Assignment', id)}
                    />
                );
            case 'resources':
                return <ResourcesView classroomId={classroomId} isTeacher={false} />
            case 'echo':
                return <ClassroomEchoSection classroomId={classroomId} isTeacher={false} />
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
                </VStack>
            </ScreenWrapper>
        );
    }

    const schoolId = classroom?.school_id || '';

    return (
        <ScreenWrapper scroll={false}>
            <GlobalHeader
                title={classroomName}
                subtitle={classroom?.subject || 'Subject'}
                showBack
                onBack={() => navigation.goBack()}
            />

            <ScrollView stickyHeaderIndices={[1]} contentContainerStyle={{ paddingBottom: bottomPadding }}>
                <Box sx={{ padding: Theme.spacing.md, backgroundColor: colors.secondary }}>
                    <VStack>
                        <Text sx={{ fontSize: Theme.typography.fontSize.sm, color: colors.textTertiary, fontWeight: '700' as any, textTransform: 'uppercase' }}>
                            Subject Sanctuary
                        </Text>
                        <Heading sx={{ fontSize: Theme.typography.fontSize.xl, color: Theme.colors.sanctuarySaffron }}>
                            {classroomName}
                        </Heading>
                    </VStack>
                </Box>

                <Box sx={{ backgroundColor: colors.secondary, paddingBottom: Theme.spacing.md, paddingTop: Theme.spacing.sm }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                        <HStack sx={{ gap: 12 }}>
                            {STUDENT_FEATURES.map((f) => {
                                const Icon = f.icon;
                                const isActive = activeFeature === f.id;
                                return (
                                    <Pressable key={f.id} onPress={() => { hapticLight(); setActiveFeature(f.id); }}>
                                        <VStack sx={{
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            paddingHorizontal: Theme.spacing.md,
                                            paddingVertical: Theme.spacing.sm,
                                            borderRadius: Theme.corners.comfortable,
                                            backgroundColor: isActive ? Theme.colors.sanctuarySaffron : colors.tertiary,
                                            minWidth: 90,
                                            gap: Theme.spacing.xs
                                        }}>
                                            <Icon size={20} color={isActive ? Theme.colors.sacredWhite : colors.textSecondary} />
                                            <Text sx={{
                                                fontSize: Theme.typography.fontSize.xs,
                                                fontWeight: (isActive ? '700' : '400') as any,
                                                color: isActive ? Theme.colors.sacredWhite : colors.textSecondary
                                            }}>{f.label}</Text>
                                        </VStack>
                                    </Pressable>
                                );
                            })}
                        </HStack>
                    </ScrollView>
                </Box>

                <Box flex={1}>
                    {renderFeatureContent()}
                </Box>
            </ScrollView>
        </ScreenWrapper>
    );
}
