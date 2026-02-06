import React, { useState, useEffect } from 'react';
import {
    VStack,
    HStack,
    Box,
    Text,
    Heading,
    ScrollView,
    Pressable,
    Center,
    Spinner,
} from '@gluestack-ui/themed';
import {
    Users,
    BookOpen,
    FileText,
} from 'lucide-react-native';
import { Theme } from '../constants/Theme';
import { useTranslation } from 'react-i18next';
import { hapticLight } from '../utils/haptics';
import { api, Classroom, ClassroomStudent } from '../lib/api';
import GlobalHeader from '../components/shared/GlobalHeader';
import StudentList from '../components/classroom/StudentList';

export default function ClassroomDetailsScreen({ route, navigation }: any) {
    const { classroomId, classroomName } = route.params;
    const { t } = useTranslation();
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [students, setStudents] = useState<ClassroomStudent[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'students' | 'lessons' | 'resources'>('students');

    useEffect(() => {
        fetchClassroomDetails();
    }, [classroomId]);

    const fetchClassroomDetails = async () => {
        try {
            setLoading(true);
            const [classData, studentData] = await Promise.all([
                api.classrooms.getById(classroomId),
                api.classroomStudents.getAll(classroomId)
            ]);
            setClassroom(classData);
            setStudents(studentData);
        } catch (error) {
            console.error('Error fetching classroom details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Center sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
                <Spinner size="large" color={Theme.colors.sanctuarySaffron} />
            </Center>
        );
    }

    const TabButton = ({ id, label, icon: IconComponent }: any) => (
        <Pressable
            onPress={() => {
                hapticLight();
                setActiveTab(id);
            }}
            sx={{
                flex: 1,
                paddingVertical: Theme.spacing.md,
                borderBottomWidth: activeTab === id ? 3 : 0,
                borderBottomColor: Theme.colors.sanctuarySaffron,
                alignItems: 'center',
            }}
        >
            <VStack space="xs" alignItems="center">
                <IconComponent
                    size={20}
                    color={activeTab === id ? Theme.colors.sanctuarySaffron : Theme.colors.mistGray}
                />
                <Text
                    size="xs"
                    bold={activeTab === id}
                    color={activeTab === id ? Theme.colors.sacredWhite : Theme.colors.mistGray}
                >
                    {label}
                </Text>
            </VStack>
        </Pressable>
    );

    return (
        <VStack sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
            <GlobalHeader
                title={classroomName}
                subtitle={classroom?.subject || 'Classroom'}
                showBack
                onBack={() => navigation.goBack()}
            />

            {/* Header Stats */}
            <Box sx={{ padding: Theme.spacing.lg, backgroundColor: Theme.colors.midnightBlue }}>
                <HStack space="xl">
                    <VStack>
                        <Text size="xs" color={Theme.colors.mistGray} bold sx={{ textTransform: 'uppercase' }}>Students</Text>
                        <Text size="2xl" color={Theme.colors.sacredWhite} bold>{students.length}</Text>
                    </VStack>
                    <VStack>
                        <Text size="xs" color={Theme.colors.mistGray} bold sx={{ textTransform: 'uppercase' }}>Subject</Text>
                        <Text size="lg" color={Theme.colors.sanctuarySaffron} bold>{classroom?.subject || 'N/A'}</Text>
                    </VStack>
                </HStack>
            </Box>

            {/* Tabs */}
            <HStack sx={{ backgroundColor: Theme.colors.midnightBlue, borderBottomWidth: 1, borderBottomColor: Theme.colors.deepIndigo }}>
                <TabButton id="students" label="Students" icon={Users} />
                <TabButton id="lessons" label="Lessons" icon={BookOpen} />
                <TabButton id="resources" label="Resources" icon={FileText} />
            </HStack>

            {/* Tab Content */}
            <Box sx={{ flex: 1 }}>
                {activeTab === 'students' && (
                    <StudentList
                        classroomId={classroomId}
                        students={students}
                        onRefresh={fetchClassroomDetails}
                    />
                )}
                {activeTab === 'lessons' && (
                    <Center sx={{ flex: 1 }}>
                        <Text color={Theme.colors.mistGray}>Lesson planning coming soon...</Text>
                    </Center>
                )}
                {activeTab === 'resources' && (
                    <Center sx={{ flex: 1 }}>
                        <Text color={Theme.colors.mistGray}>Classroom resources coming soon...</Text>
                    </Center>
                )}
            </Box>
        </VStack>
    );
}
