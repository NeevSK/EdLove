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
    ButtonText
} from '@/ui';
import {
    Users,
    BookOpen,
    FileText,
    ClipboardCheck,
    GraduationCap,
    LayoutGrid,
    Plus
} from 'lucide-react-native';
import Theme from '../constants/Theme';
import { useTranslation } from 'react-i18next';
import { hapticLight } from '../utils/haptics';
import { api, Classroom } from '../lib/api';
import { supabase } from '../lib/supabase';
import GlobalHeader from '../components/shared/GlobalHeader';
import { StudentList } from '../components/classroom';
import { useThemedColors } from '../hooks/useThemedColors';
import ScreenWrapper from '../components/shared/ScreenWrapper';
import { LessonFeed } from './classroom';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClassroomStackParamList } from '../types/navigation';
import GradebookView from '../components/classroom/GradebookView';
import AttendanceView from '../components/classroom/AttendanceView';
import InventoryView from '../components/classroom/InventoryView';
import ResourcesView from '../components/classroom/ResourcesView';

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
        // In local/demo mode, we might want to override this
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
                return <AttendanceView classroomId={classroomId} />;
            case 'gradebook':
                return <GradebookView classroomId={classroomId} />;
            case 'lessons':
                return (
                    <LessonFeed
                        classroomId={classroomId}
                        isTeacher={true}
                        refreshTrigger={0}
                        onOpenLesson={(id) => console.log('Open Lesson', id)}
                        onOpenAssignment={(id) => console.log('Open Assignment', id)}
                        onAddMaterial={() => { }} // TODO: Connect modals
                        onAddAssignment={() => { }}
                    />
                );
            case 'inventory':
                return <InventoryView classroomId={classroomId} />;
            case 'resources':
                return <ResourcesView classroomId={classroomId} isTeacher={isClassTeacher} />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <GlobalHeader title={classroomName} showBack onBack={() => navigation.goBack()} />
                <VStack flex={1} justifyContent="center" alignItems="center">
                    <Spinner size="large" color={Theme.colors.sanctuarySaffron} />
                </VStack>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <GlobalHeader
                title={classroomName}
                subtitle={classroom?.subject || 'Classroom'}
                showBack
                onBack={() => navigation.goBack()}
            />

            <ScrollView stickyHeaderIndices={[1]} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* 1. Header Area */}
                <Box p="$4" bg={colors.secondary}>
                    <HStack justifyContent="space-between" alignItems="center">
                        <VStack>
                            <Text size="sm" color={colors.textTertiary} fontWeight="$bold" textTransform="uppercase">
                                {isClassTeacher ? 'Class Sanctuary' : 'Subject Sanctuary'}
                            </Text>
                            <Heading size="xl" color={Theme.colors.sanctuarySaffron}>
                                {classroomName}
                            </Heading>
                        </VStack>
                        {classroom?.subject && (
                            <Box bg={colors.tertiary} px="$3" py="$1" borderRadius="$full">
                                <Text size="xs" bold color={Theme.colors.sanctuarySaffron}>{classroom.subject}</Text>
                            </Box>
                        )}
                    </HStack>
                </Box>

                {/* 2. Horizontal Carousel (Sticky) */}
                <Box bg={colors.secondary} pb="$4" pt="$2">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: Theme.spacing.md, gap: 12 }}
                    >
                        {filteredFeatures.map((feature) => (
                            <Pressable
                                key={feature.id}
                                onPress={() => {
                                    hapticLight();
                                    setActiveFeature(feature.id);
                                }}
                            >
                                <VStack
                                    alignItems="center"
                                    justifyContent="center"
                                    space="xs"
                                    sx={{
                                        width: 100,
                                        height: 80,
                                        borderRadius: Theme.corners.generous,
                                        backgroundColor: activeFeature === feature.id
                                            ? Theme.colors.sanctuarySaffron
                                            : colors.tertiary,
                                        borderWidth: 1,
                                        borderColor: activeFeature === feature.id
                                            ? Theme.colors.sanctuarySaffron
                                            : 'transparent',
                                    }}
                                >
                                    <feature.icon
                                        color={activeFeature === feature.id ? Theme.colors.white : colors.textSecondary}
                                        size={24}
                                    />
                                    <Text
                                        size="xs"
                                        bold={activeFeature === feature.id}
                                        color={activeFeature === feature.id ? Theme.colors.white : colors.text}
                                        textAlign="center"
                                    >
                                        {feature.label}
                                    </Text>
                                </VStack>
                            </Pressable>
                        ))}
                    </ScrollView>
                </Box>

                {/* 3. Dynamic Content Area */}
                <Box sx={{ flex: 1, minHeight: 400 }}>
                    {renderFeatureContent()}
                </Box>
            </ScrollView>
        </ScreenWrapper>
    );
}
