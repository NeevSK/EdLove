import React, { useState, useEffect } from 'react';
import {
    VStack,
    HStack,
    Box,
    Text,
    Heading,
    ScrollView,
    Pressable,
    Icon,
} from '@/ui';
import {
    Plus,
    ClipboardCheck,
    BookOpen,
    Users,
    School
} from 'lucide-react-native';
import { Theme } from '../../constants/Theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClassroomStackParamList } from '../../types/navigation';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/useStore';
import { hapticLight } from '../../utils/haptics';
import ClassroomList from './ClassroomList';
import CreateClassroomModal from './CreateClassroomModal';
import { useThemedColors } from '../../hooks/useThemedColors';
import { Zap } from 'lucide-react-native';
import SandboxBanner from '../shared/SandboxBanner';

export default function TeacherDashboard() {
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<ClassroomStackParamList>>();
    const { teacherName, isDemoMode, setDemoMode } = useStore();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const colors = useThemedColors();
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [stats, setStats] = useState({
        activeClasses: 0,
        totalStudents: 0
    });

    // We'll update stats whenever the classroom list changes
    const handleClassroomsLoaded = (loadedClassrooms: any[]) => {
        setClassrooms(loadedClassrooms);
        setStats({
            activeClasses: loadedClassrooms.length,
            totalStudents: loadedClassrooms.reduce((acc, curr) => acc + (curr.student_count || 0), 0)
        });
    };

    const QuickAction = ({ icon: LucideIcon, label, onPress, color }: any) => (
        <Pressable
            onPress={() => {
                hapticLight();
                onPress();
            }}
            sx={{
                flex: 1,
                alignItems: 'center',
                backgroundColor: colors.secondary,
                padding: Theme.spacing.md,
                borderRadius: Theme.corners.generous,
                borderWidth: 1,
                borderColor: colors.border,
            }}
        >
            <Box
                sx={{
                    padding: Theme.spacing.md,
                    borderRadius: Theme.corners.comfortable,
                    backgroundColor: colors.tertiary,
                    marginBottom: Theme.spacing.sm
                }}
            >
                <LucideIcon color={color || Theme.colors.sanctuarySaffron} size={24} />
            </Box>
            <Text color={colors.text} size="xs" bold textAlign="center">
                {isDemoMode ? `⚡ (${t('demoMode.simulationAlert')}) ${label}` : label}
            </Text>
        </Pressable>
    );

    const StatCard = ({ icon: LucideIcon, label, value, color }: any) => (
        <Box
            sx={{
                flex: 1,
                backgroundColor: colors.secondary,
                padding: Theme.spacing.lg,
                borderRadius: Theme.corners.generous,
                borderWidth: 1,
                borderColor: colors.border,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <VStack space="xs">
                <Text color={colors.textSecondary} size="xs" bold>
                    {label}
                </Text>
                <Text color={colors.text} size="3xl" bold>
                    {value}{isDemoMode && '*'}
                </Text>
            </VStack>
            {isDemoMode && (
                <Box sx={{ position: 'absolute', top: 5, right: 5 }}>
                    <Zap size={12} color={Theme.colors.sanctuarySaffron} fill={Theme.colors.sanctuarySaffron} />
                </Box>
            )}
            <Box
                sx={{
                    position: 'absolute',
                    right: -10,
                    bottom: -10,
                    opacity: 0.1
                }}
            >
                <LucideIcon color={colors.text} size={80} />
            </Box>
        </Box>
    );

    return (
        <VStack space="xl" sx={{ flex: 1, backgroundColor: colors.primary }}>
            {isDemoMode && <SandboxBanner />}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Theme.spacing.lg }}>

                {/* Greeting */}
                <VStack space="xs" mb="$4">
                    <Heading color={colors.text} size="2xl">
                        {t('common.greeting', { name: teacherName }) || `Ayubowan, ${teacherName}!`}
                    </Heading>
                    <Text color={colors.textSecondary} size="sm">
                        {t('classroom.dashboardIntro') || 'Your sanctuary awaits. Manage your classes efficiently.'}
                    </Text>
                </VStack>

                {/* Quick Actions */}
                <HStack space="md" mb="$6">
                    <QuickAction
                        icon={Plus}
                        label={t('classroom.createClass') || 'Create Class'}
                        onPress={() => setIsCreateModalOpen(true)}
                    />
                    <QuickAction
                        icon={ClipboardCheck}
                        label={t('classroom.attendance') || 'Attendance'}
                        onPress={() => {
                            // For now, if there are classrooms, pick the first one to demo the navigation.
                            // Ideally this opens a selector.
                            if (classrooms.length > 0) {
                                // We need navigation prop here.
                                // TeacherDashboard is a component, so we use useNavigation.
                                navigation.navigate('Attendance', {
                                    classroomId: classrooms[0].id,
                                    classroomName: classrooms[0].name
                                });
                            } else {
                                alert("No active classrooms found.");
                            }
                        }}
                        color={Theme.colors.sageGreen}
                    />
                    <QuickAction
                        icon={BookOpen}
                        label={t('classroom.library') || 'Library'}
                        onPress={() => {/* TODO: Open Library */ }}
                        color={Theme.colors.amberGlow}
                    />
                </HStack>

                {/* Statistics */}
                <HStack space="md" mb="$8">
                    <StatCard
                        icon={School}
                        label={t('classroom.statActiveClasses') || 'Active Classes'}
                        value={stats.activeClasses}
                    />
                    <StatCard
                        icon={Users}
                        label={t('classroom.statTotalStudents') || 'Total Students'}
                        value={stats.totalStudents}
                    />
                </HStack>

                {/* Classroom List Section */}
                <VStack space="md">
                    <HStack justifyContent="space-between" alignItems="center">
                        <Heading color={colors.text} size="lg">
                            {t('classroom.yourClassrooms') || 'Your Classrooms'} 🍃
                        </Heading>
                    </HStack>

                    <ClassroomList
                        onClassroomPress={(classroom) => {
                            hapticLight();
                            navigation.navigate('Classroom' as any, {
                                screen: 'ClassroomDetails',
                                params: {
                                    classroomId: classroom.id,
                                    classroomName: classroom.name
                                }
                            });
                        }}
                        onDataLoaded={handleClassroomsLoaded}
                        isNested={true}
                        refreshTrigger={refreshTrigger}
                    />
                </VStack>
            </ScrollView>

            <CreateClassroomModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    setRefreshTrigger(prev => prev + 1);
                }}
            />
        </VStack>
    );
}
