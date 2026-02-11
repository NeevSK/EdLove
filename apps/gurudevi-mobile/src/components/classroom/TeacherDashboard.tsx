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
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/useStore';
import { hapticLight } from '../../utils/haptics';
import ClassroomList from './ClassroomList';
import CreateClassroomModal from './CreateClassroomModal';
import { useNavigation } from '@react-navigation/native';

export default function TeacherDashboard() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { teacherName } = useStore();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [stats, setStats] = useState({
        activeClasses: 0,
        totalStudents: 0
    });

    // We'll update stats whenever the classroom list changes
    const handleClassroomsLoaded = (classrooms: any[]) => {
        setStats({
            activeClasses: classrooms.length,
            totalStudents: classrooms.reduce((acc, curr) => acc + (curr.student_count || 0), 0)
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
                backgroundColor: Theme.colors.midnightBlue,
                padding: Theme.spacing.md,
                borderRadius: Theme.corners.generous,
                borderWidth: 1,
                borderColor: Theme.colors.deepIndigo,
            }}
        >
            <Box
                sx={{
                    padding: Theme.spacing.md,
                    borderRadius: Theme.corners.comfortable,
                    backgroundColor: Theme.colors.deepIndigo,
                    marginBottom: Theme.spacing.sm
                }}
            >
                <LucideIcon color={color || Theme.colors.sanctuarySaffron} size={24} />
            </Box>
            <Text color={Theme.colors.sacredWhite} size="xs" bold textAlign="center">
                {label}
            </Text>
        </Pressable>
    );

    const StatCard = ({ icon: LucideIcon, label, value, color }: any) => (
        <Box
            sx={{
                flex: 1,
                backgroundColor: Theme.colors.midnightBlue,
                padding: Theme.spacing.lg,
                borderRadius: Theme.corners.generous,
                borderWidth: 1,
                borderColor: Theme.colors.deepIndigo,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <VStack space="xs">
                <Text color={Theme.colors.mistGray} size="xs" bold>
                    {label}
                </Text>
                <Text color={Theme.colors.sacredWhite} size="3xl" bold>
                    {value}
                </Text>
            </VStack>
            <Box
                sx={{
                    position: 'absolute',
                    right: -10,
                    bottom: -10,
                    opacity: 0.1
                }}
            >
                <LucideIcon color={Theme.colors.sacredWhite} size={80} />
            </Box>
        </Box>
    );

    return (
        <VStack space="xl" sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Theme.spacing.lg }}>

                {/* Greeting */}
                <VStack space="xs" mb="$4">
                    <Heading color={Theme.colors.sacredWhite} size="2xl">
                        {t('common.greeting', { name: teacherName }) || `Ayubowan, ${teacherName}!`}
                    </Heading>
                    <Text color={Theme.colors.mistGray} size="sm">
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
                        onPress={() => {/* TODO: Open Attendance selection */ }}
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
                        <Heading color={Theme.colors.sacredWhite} size="lg">
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
