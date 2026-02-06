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
    Button,
    ButtonText,
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    InputField,
} from '@gluestack-ui/themed';
import {
    Users,
    BookOpen,
    FileText,
    Plus,
} from 'lucide-react-native';
import Theme from '../constants/Theme';
import { useTranslation } from 'react-i18next';
import { hapticLight } from '../utils/haptics';
import { api, Classroom, ClassroomStudent } from '../lib/api';
import GlobalHeader from '../components/shared/GlobalHeader';
import { StudentList } from '../components/classroom';
import { LessonFeed, ContentLibrary } from './classroom';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClassroomStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<ClassroomStackParamList, 'ClassroomDetails'>;

export default function ClassroomDetailsScreen({ route, navigation }: Props) {
    const { classroomId, classroomName } = route.params;
    const { t } = useTranslation();
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [students, setStudents] = useState<ClassroomStudent[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'students' | 'lessons' | 'resources'>('students');
    const [showAddMonthModal, setShowAddMonthModal] = useState(false);
    const [newMonthTitle, setNewMonthTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAddContentModal, setShowAddContentModal] = useState(false);
    const [contentType, setContentType] = useState<'material' | 'assignment'>('material');
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formType, setFormType] = useState<'pdf' | 'link' | 'note'>('note');
    const [formUrl, setFormUrl] = useState('');
    const [formDueDate, setFormDueDate] = useState('');

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

    const handleAddMonth = async () => {
        if (!newMonthTitle.trim()) return;
        setIsSubmitting(true);
        try {
            const lessons = await api.lessons.getAll(classroomId);
            const maxOrder = lessons.reduce((max, l) => Math.max(max, l.order_index), 0);

            await api.lessons.create({
                classroom_id: classroomId,
                title: newMonthTitle,
                order_index: maxOrder + 1,
            });
            setShowAddMonthModal(false);
            setNewMonthTitle('');
            setRefreshTrigger(prev => prev + 1);
            await fetchClassroomDetails();
        } catch (error) {
            console.error('Failed to add month:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddContent = async () => {
        if (!formTitle.trim() || !activeLessonId) return;
        setIsSubmitting(true);
        try {
            if (contentType === 'material') {
                await api.lessonMaterials.create({
                    classroom_id: classroomId,
                    lesson_id: activeLessonId,
                    title: formTitle,
                    type: formType,
                    url: (formType === 'pdf' || formType === 'link') ? formUrl : undefined,
                    content: formType === 'note' ? formDescription : undefined,
                    is_pinned: false,
                });
            } else {
                await api.assignments.create({
                    classroom_id: classroomId,
                    lesson_id: activeLessonId,
                    title: formTitle,
                    description: formDescription,
                    due_date: formDueDate || undefined,
                });
            }
            setShowAddContentModal(false);
            resetForm();
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Failed to add content:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormTitle('');
        setFormDescription('');
        setFormType('note');
        setFormUrl('');
        setFormDueDate('');
        setActiveLessonId(null);
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
                    fontWeight={activeTab === id ? "$bold" : "$normal"}
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
                        <Text size="xs" color={Theme.colors.mistGray} fontWeight="$bold" sx={{ textTransform: 'uppercase' }}>Students</Text>
                        <Text size="2xl" color={Theme.colors.sacredWhite} fontWeight="$bold">{students.length}</Text>
                    </VStack>
                    <VStack>
                        <Text size="xs" color={Theme.colors.mistGray} fontWeight="$bold" sx={{ textTransform: 'uppercase' }}>Subject</Text>
                        <Text size="lg" color={Theme.colors.sanctuarySaffron} fontWeight="$bold">{classroom?.subject || 'N/A'}</Text>
                    </VStack>
                    <Box sx={{ flex: 1 }} />
                    {activeTab === 'lessons' && (
                        <Button
                            size="sm"
                            action="primary"
                            onPress={() => setShowAddMonthModal(true)}
                            sx={{
                                backgroundColor: Theme.colors.sanctuarySaffron,
                                borderRadius: Theme.corners.comfortable,
                                height: 36,
                            }}
                        >
                            <HStack space="xs" alignItems="center">
                                <Plus size={16} color={Theme.colors.white} />
                                <ButtonText color={Theme.colors.white}>Module</ButtonText>
                            </HStack>
                        </Button>
                    )}
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
                    <LessonFeed
                        classroomId={classroomId}
                        isTeacher={true}
                        refreshTrigger={refreshTrigger}
                        onOpenLesson={(id) => console.log('Open Lesson', id)}
                        onOpenAssignment={(id) => console.log('Open Assignment', id)}
                        onAddMaterial={(lessonId) => {
                            setActiveLessonId(lessonId);
                            setContentType('material');
                            setShowAddContentModal(true);
                        }}
                        onAddAssignment={(lessonId) => {
                            setActiveLessonId(lessonId);
                            setContentType('assignment');
                            setShowAddContentModal(true);
                        }}
                    />
                )}
                {activeTab === 'resources' && (
                    <Center sx={{ flex: 1, padding: 40 }}>
                        <Box sx={{
                            padding: Theme.spacing.xl,
                            backgroundColor: Theme.colors.midnightBlue,
                            borderRadius: Theme.corners.generous,
                            alignItems: 'center',
                            width: '100%'
                        }}>
                            <Box sx={{
                                width: 64,
                                height: 64,
                                borderRadius: 32,
                                backgroundColor: Theme.colors.deepIndigo,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16
                            }}>
                                <Plus size={32} color={Theme.colors.mistGray} />
                            </Box>
                            <Heading color={Theme.colors.sacredWhite} size="lg" mb="$2">Equipment Resources</Heading>
                            <Text color={Theme.colors.mistGray} textAlign="center">
                                Physical equipment and classroom resource management is coming soon.
                            </Text>
                        </Box>
                    </Center>
                )}
            </Box>

            {/* Modals */}
            <Modal isOpen={showAddMonthModal} onClose={() => setShowAddMonthModal(false)}>
                <ModalBackdrop />
                <ModalContent sx={{ backgroundColor: Theme.colors.midnightBlue }}>
                    <ModalHeader>
                        <Heading color={Theme.colors.sacredWhite} size="lg">Add Monthly Module</Heading>
                    </ModalHeader>
                    <ModalBody>
                        <VStack space="md">
                            <Text color={Theme.colors.mistGray} size="sm">Give this month a title (e.g., "September 2026")</Text>
                            <Input variant="outline" sx={{ backgroundColor: Theme.colors.deepIndigo, borderColor: Theme.colors.transparent }}>
                                <InputField
                                    placeholder="Enter title..."
                                    value={newMonthTitle}
                                    onChangeText={setNewMonthTitle}
                                    color={Theme.colors.sacredWhite}
                                />
                            </Input>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <HStack space="sm">
                            <Button variant="outline" action="secondary" onPress={() => setShowAddMonthModal(false)}>
                                <ButtonText color={Theme.colors.mistGray}>Cancel</ButtonText>
                            </Button>
                            <Button action="primary" onPress={handleAddMonth} isDisabled={!newMonthTitle.trim() || isSubmitting}>
                                {isSubmitting ? <Spinner color={Theme.colors.white} /> : <ButtonText color={Theme.colors.white}>Create</ButtonText>}
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Add Content Modal (Material or Assignment) */}
            <Modal isOpen={showAddContentModal} onClose={() => setShowAddContentModal(false)}>
                <ModalBackdrop />
                <ModalContent sx={{ backgroundColor: Theme.colors.midnightBlue, maxWidth: 500 }}>
                    <ModalHeader>
                        <Heading color={Theme.colors.sacredWhite} size="lg">
                            {contentType === 'material' ? 'Add Academic Material' : 'Create Assignment'}
                        </Heading>
                    </ModalHeader>
                    <ModalBody>
                        <VStack space="md">
                            {contentType === 'material' && (
                                <VStack space="xs">
                                    <Text color={Theme.colors.mistGray} size="sm">Type</Text>
                                    <HStack space="sm">
                                        {(['note', 'link', 'pdf'] as const).map((type) => (
                                            <Pressable key={type} onPress={() => setFormType(type)} style={{ flex: 1 }}>
                                                <Box sx={{
                                                    padding: Theme.spacing.sm,
                                                    borderRadius: Theme.corners.tight,
                                                    backgroundColor: formType === type ? Theme.colors.sanctuarySaffron : Theme.colors.deepIndigo,
                                                    alignItems: 'center'
                                                }}>
                                                    <Text color={formType === type ? Theme.colors.white : Theme.colors.mistGray} size="xs" bold>{type.toUpperCase()}</Text>
                                                </Box>
                                            </Pressable>
                                        ))}
                                    </HStack>
                                </VStack>
                            )}

                            <VStack space="xs">
                                <Text color={Theme.colors.mistGray} size="sm">Title</Text>
                                <Input variant="outline" sx={{ backgroundColor: Theme.colors.deepIndigo, borderColor: Theme.colors.transparent }}>
                                    <InputField
                                        placeholder="Enter title..."
                                        value={formTitle}
                                        onChangeText={setFormTitle}
                                        color={Theme.colors.sacredWhite}
                                    />
                                </Input>
                            </VStack>

                            {(contentType === 'assignment' || formType === 'note') && (
                                <VStack space="xs">
                                    <Text color={Theme.colors.mistGray} size="sm">Description / Content</Text>
                                    <Input variant="outline" sx={{ backgroundColor: Theme.colors.deepIndigo, borderColor: Theme.colors.transparent, minHeight: 80 }}>
                                        <InputField
                                            placeholder="Enter details..."
                                            value={formDescription}
                                            onChangeText={setFormDescription}
                                            color={Theme.colors.sacredWhite}
                                            multiline
                                        />
                                    </Input>
                                </VStack>
                            )}

                            {contentType === 'material' && (formType === 'pdf' || formType === 'link') && (
                                <VStack space="xs">
                                    <Text color={Theme.colors.mistGray} size="sm">URL</Text>
                                    <Input variant="outline" sx={{ backgroundColor: Theme.colors.deepIndigo, borderColor: Theme.colors.transparent }}>
                                        <InputField
                                            placeholder="https://..."
                                            value={formUrl}
                                            onChangeText={setFormUrl}
                                            color={Theme.colors.sacredWhite}
                                            autoCapitalize="none"
                                        />
                                    </Input>
                                </VStack>
                            )}

                            {contentType === 'assignment' && (
                                <VStack space="xs">
                                    <Text color={Theme.colors.mistGray} size="sm">Due Date (Optional)</Text>
                                    <Input variant="outline" sx={{ backgroundColor: Theme.colors.deepIndigo, borderColor: Theme.colors.transparent }}>
                                        <InputField
                                            placeholder="YYYY-MM-DD"
                                            value={formDueDate}
                                            onChangeText={setFormDueDate}
                                            color={Theme.colors.sacredWhite}
                                        />
                                    </Input>
                                </VStack>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <HStack space="sm">
                            <Button variant="outline" action="secondary" onPress={() => setShowAddContentModal(false)}>
                                <ButtonText color={Theme.colors.mistGray}>Cancel</ButtonText>
                            </Button>
                            <Button action="primary" onPress={handleAddContent} isDisabled={!formTitle.trim() || isSubmitting}>
                                {isSubmitting ? <Spinner color={Theme.colors.white} /> : <ButtonText color={Theme.colors.white}>Add</ButtonText>}
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </VStack>
    );
}
