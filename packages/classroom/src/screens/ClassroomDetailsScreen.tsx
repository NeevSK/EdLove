import React, { useState, useEffect } from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
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
} from '@repo/ui';
import {
    Plus,
    ClipboardCheck,
    GraduationCap,
    Edit3,
    Users,
    BookOpen,
    FileText,
    QrCode
} from 'lucide-react-native';
import { Theme, useThemedColors, hapticLight, GlobalHeader, ScreenWrapper, PositiveInvitation, useTheme } from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { api, Classroom, ClassroomStudent, ClassroomStackParamList } from '@repo/core';
import { StudentList, CreateClassroomModal } from '../components';
import LessonFeed from './LessonFeed';
import ContentLibrary from './ContentLibrary';
import { QRCodeGenerator, QRBuilder } from '@repo/scanner-kit';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

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
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const colors = useThemedColors();
    const { glass, text } = useTheme();

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
            let targetLessonId = activeLessonId;

            // If activeLessonId is actually the month title (virtual lesson)
            // we need to create the lesson record first
            if (!targetLessonId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                const newLesson = await api.lessons.create({
                    classroom_id: classroomId,
                    title: targetLessonId,
                    content: `Materials for ${targetLessonId}`,
                    order_index: 0, // Should be calculated but 0 is fine for now
                });
                targetLessonId = newLesson.id;
            }

            if (contentType === 'material') {
                await api.lessonMaterials.create({
                    classroom_id: classroomId,
                    lesson_id: targetLessonId,
                    title: formTitle,
                    type: formType,
                    url: (formType === 'pdf' || formType === 'link') ? formUrl : undefined,
                    content: formType === 'note' ? formDescription : undefined,
                    is_pinned: false,
                });
            } else {
                await api.assignments.create({
                    classroom_id: classroomId,
                    lesson_id: targetLessonId,
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
            <ScreenWrapper>
                <Center sx={{ flex: 1 }}>
                    <Spinner size="large" color={Theme.colors.sanctuarySaffron} />
                </Center>
            </ScreenWrapper>
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
            <VStack alignItems="center" sx={{ gap: 4 }}>
                <IconComponent
                    size={20}
                    color={activeTab === id ? Theme.colors.sanctuarySaffron : Theme.colors.mistGray}
                />
                <Text
                    sx={{ fontSize: 12, fontWeight: activeTab === id ? 'bold' : 'normal' }}
                    color={activeTab === id ? colors.text : colors.textSecondary}
                >
                    {label}
                </Text>
            </VStack>
        </Pressable>
    );

    return (
        <ScreenWrapper>
            <GlobalHeader
                title={classroomName}
                subtitle={classroom?.subject || 'Classroom'}
                showBack
                onBack={() => navigation.goBack()}
                rightAction={
                    <HStack sx={{ gap: 8 }}>
                        <TouchableOpacity onPress={() => {
                            hapticLight();
                            setIsQrModalOpen(true);
                        }}>
                            <Box sx={{ padding: 8, borderRadius: 12, backgroundColor: glass.interact.bg }}>
                                <QrCode size={20} color={text.primary} />
                            </Box>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            hapticLight();
                            setIsEditModalOpen(true);
                        }}>
                            <Box sx={{ padding: 8, borderRadius: 12, backgroundColor: glass.interact.bg }}>
                                <Edit3 size={20} color={text.primary} />
                            </Box>
                        </TouchableOpacity>
                    </HStack>
                }
            />

            {/* Header Stats */}
            <Box sx={{ padding: Theme.spacing.lg, backgroundColor: colors.secondary }}>
                <HStack sx={{ gap: 32 }}>
                    <VStack>
                        <Text color={colors.textTertiary} sx={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' }}>Students</Text>
                        <Text color={colors.text} sx={{ fontSize: 24, fontWeight: 'bold' }}>{students.length}</Text>
                    </VStack>
                    <VStack>
                        <Text color={colors.textTertiary} sx={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' }}>Subject</Text>
                        <Text color={Theme.colors.sanctuarySaffron} sx={{ fontSize: 18, fontWeight: 'bold' }}>{classroom?.subject || 'N/A'}</Text>
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
                            <HStack alignItems="center" sx={{ gap: 4 }}>
                                <Plus size={16} color={Theme.colors.white} />
                                <ButtonText color={Theme.colors.white}>Module</ButtonText>
                            </HStack>
                        </Button>
                    )}
                </HStack>
            </Box>

            {/* Tabs */}
            <HStack sx={{ backgroundColor: colors.secondary, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <TabButton id="students" label="Students" icon={Users} />
                <TabButton id="lessons" label="Lessons" icon={BookOpen} />
                <TabButton id="resources" label="Resources" icon={FileText} />
            </HStack>

            {/* Tab Content */}
            <Box sx={{ flex: 1 }}>
                {activeTab === 'students' && (
                    <VStack sx={{ flex: 1 }}>
                        {/* Teacher Tooblar */}
                        <HStack sx={{ gap: 16, paddingHorizontal: 16, paddingVertical: 16, backgroundColor: colors.secondary, borderBottomWidth: 1, borderColor: colors.border }}>
                            <Button
                                size="sm"
                                variant="outline"
                                action="primary"
                                onPress={() => navigation.navigate('Attendance', { classroomId, classroomName })}
                                sx={{ flex: 1, borderColor: Theme.colors.sageGreen }}
                            >
                                <HStack alignItems="center" sx={{ gap: 4 }}>
                                    <ClipboardCheck size={16} color={Theme.colors.sageGreen} />
                                    <ButtonText color={Theme.colors.sageGreen}>{t('classroom.attendance') || 'Attendance'}</ButtonText>
                                </HStack>
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                action="primary"
                                onPress={() => navigation.navigate('Gradebook', { classroomId, classroomName })}
                                sx={{ flex: 1, borderColor: Theme.colors.sanctuarySaffron }}
                            >
                                <HStack alignItems="center" sx={{ gap: 4 }}>
                                    <GraduationCap size={16} color={Theme.colors.sanctuarySaffron} />
                                    <ButtonText color={Theme.colors.sanctuarySaffron}>{t('grades.gradebook') || 'Gradebook'}</ButtonText>
                                </HStack>
                            </Button>
                        </HStack>

                        <StudentList
                            classroomId={classroomId}
                            students={students}
                            onRefresh={fetchClassroomDetails}
                        />
                    </VStack>
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
                            backgroundColor: colors.secondary,
                            borderRadius: Theme.corners.generous,
                            alignItems: 'center',
                            width: '100%'
                        }}>
                            <Box sx={{
                                width: 64,
                                height: 64,
                                borderRadius: 32,
                                backgroundColor: colors.tertiary,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16
                            }}>
                                <Plus size={32} color={colors.textTertiary} />
                            </Box>
                            <Heading color={colors.text} sx={{ fontSize: 18, marginBottom: 8 }}>Equipment Resources</Heading>
                            <Text color={colors.textSecondary} textAlign="center" sx={{ textAlign: 'center' }}>
                                {t('common.comingSoon')}
                            </Text>
                        </Box>
                    </Center>
                )}
            </Box>

            {/* Modals */}
            <Modal isOpen={showAddMonthModal} onClose={() => setShowAddMonthModal(false)}>
                <ModalBackdrop />
                <ModalContent sx={{ backgroundColor: colors.secondary }}>
                    <ModalHeader>
                        <Heading color={colors.text} sx={{ fontSize: 18 }}>Add Monthly Module</Heading>
                    </ModalHeader>
                    <ModalBody>
                        <VStack sx={{ gap: 16 }}>
                            <Text color={colors.textSecondary} sx={{ fontSize: 14 }}>Give this month a title (e.g., "September 2026")</Text>
                            <Input sx={{ backgroundColor: colors.tertiary, borderColor: 'transparent' }}>
                                <InputField
                                    placeholder="Enter title..."
                                    value={newMonthTitle}
                                    onChangeText={setNewMonthTitle}
                                    color={colors.text}
                                />
                            </Input>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <HStack sx={{ gap: 8 }}>
                            <Button variant="outline" action="secondary" onPress={() => setShowAddMonthModal(false)}>
                                <ButtonText color={colors.textTertiary}>Cancel</ButtonText>
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
                <ModalContent sx={{ backgroundColor: colors.secondary, maxWidth: 500 }}>
                    <ModalHeader>
                        <Heading color={colors.text} sx={{ fontSize: 18 }}>
                            {contentType === 'material' ? 'Add Academic Material' : 'Create Assignment'}
                        </Heading>
                    </ModalHeader>
                    <ModalBody>
                        <VStack sx={{ gap: 16 }}>
                            {contentType === 'material' && (
                                <VStack sx={{ gap: 4 }}>
                                    <Text color={Theme.colors.mistGray} sx={{ fontSize: 14 }}>Type</Text>
                                    <HStack sx={{ gap: 8 }}>
                                        {(['note', 'link', 'pdf'] as const).map((type) => (
                                            <Pressable key={type} onPress={() => setFormType(type)} style={{ flex: 1 }}>
                                                <Box sx={{
                                                    padding: Theme.spacing.sm,
                                                    borderRadius: Theme.corners.tight,
                                                    backgroundColor: formType === type ? Theme.colors.sanctuarySaffron : colors.tertiary,
                                                    alignItems: 'center'
                                                }}>
                                                    <Text color={formType === type ? Theme.colors.white : colors.textSecondary} sx={{ fontSize: 12, fontWeight: 'bold' }}>{type.toUpperCase()}</Text>
                                                </Box>
                                            </Pressable>
                                        ))}
                                    </HStack>
                                </VStack>
                            )}

                            <VStack sx={{ gap: 4 }}>
                                <Text color={colors.textSecondary} sx={{ fontSize: 14 }}>Title</Text>
                                <Input sx={{ backgroundColor: colors.tertiary, borderColor: 'transparent' }}>
                                    <InputField
                                        placeholder="Enter title..."
                                        value={formTitle}
                                        onChangeText={setFormTitle}
                                        color={colors.text}
                                    />
                                </Input>
                            </VStack>

                            {(contentType === 'assignment' || formType === 'note') && (
                                <VStack sx={{ gap: 4 }}>
                                    <Text color={colors.textSecondary} sx={{ fontSize: 14 }}>Description / Content</Text>
                                    <Input sx={{ backgroundColor: colors.tertiary, borderColor: 'transparent', minHeight: 80 }}>
                                        <InputField
                                            placeholder="Enter details..."
                                            value={formDescription}
                                            onChangeText={setFormDescription}
                                            color={colors.text}
                                            multiline
                                        />
                                    </Input>
                                </VStack>
                            )}

                            {contentType === 'material' && (formType === 'pdf' || formType === 'link') && (
                                <VStack sx={{ gap: 4 }}>
                                    <Text color={colors.textSecondary} sx={{ fontSize: 14 }}>URL</Text>
                                    <Input sx={{ backgroundColor: colors.tertiary, borderColor: 'transparent' }}>
                                        <InputField
                                            placeholder="https://..."
                                            value={formUrl}
                                            onChangeText={setFormUrl}
                                            color={colors.text}
                                            autoCapitalize="none"
                                        />
                                    </Input>
                                </VStack>
                            )}

                            {contentType === 'assignment' && (
                                <VStack sx={{ gap: 4 }}>
                                    <Text color={colors.textSecondary} sx={{ fontSize: 14 }}>Due Date (Optional)</Text>
                                    <Input sx={{ backgroundColor: colors.tertiary, borderColor: 'transparent' }}>
                                        <InputField
                                            placeholder="YYYY-MM-DD"
                                            value={formDueDate}
                                            onChangeText={setFormDueDate}
                                            color={colors.text}
                                        />
                                    </Input>
                                </VStack>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <HStack sx={{ gap: 8 }}>
                            <Button variant="outline" action="secondary" onPress={() => setShowAddContentModal(false)}>
                                <ButtonText color={colors.textTertiary}>Cancel</ButtonText>
                            </Button>
                            <Button action="primary" onPress={handleAddContent} isDisabled={!formTitle.trim() || isSubmitting}>
                                {isSubmitting ? <Spinner color={Theme.colors.white} /> : <ButtonText color={Theme.colors.white}>Add</ButtonText>}
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <CreateClassroomModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                mode="edit"
                initialData={classroom ? {
                    id: classroom.id,
                    name: classroom.name,
                    handle: classroom.handle || undefined,
                    description: classroom.description || undefined,
                    themeId: classroom.color_theme || undefined,
                    syllabusId: classroom.syllabus_version || undefined,
                    subject: classroom.subject || undefined
                } : {
                    id: classroomId,
                    name: classroomName
                }}
                onSuccess={(updatedClass) => {
                    fetchClassroomDetails();
                }}
            />

            {/* QR Code Modal */}
            <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)}>
                <ModalBackdrop />
                <ModalContent sx={{ backgroundColor: colors.secondary, borderRadius: Theme.corners.generous }}>
                    <ModalHeader>
                        <Heading color={colors.text} sx={{ fontSize: 18 }}>Classroom QR Code</Heading>
                    </ModalHeader>
                    <ModalBody sx={{ alignItems: 'center', paddingVertical: 20 }}>
                        <Box sx={{ padding: 16, backgroundColor: 'white', borderRadius: 16 }}>
                            <QRCodeGenerator
                                value={QRBuilder.classroom(classroomId, classroom?.handle || undefined)}
                                size={220}
                            />
                        </Box>
                        <Text color={colors.textSecondary} sx={{ marginTop: 20, textAlign: 'center' }}>
                            Scan this code to join the <Text color={colors.text} sx={{ fontWeight: 'bold' }}>{classroomName}</Text> sanctuary.
                        </Text>
                        {classroom?.handle && (
                            <Text color={colors.textTertiary} sx={{ marginTop: 8, fontSize: 12 }}>
                                @{classroom.handle}
                            </Text>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button action="primary" onPress={() => setIsQrModalOpen(false)} sx={{ width: '100%', backgroundColor: Theme.colors.sanctuarySaffron }}>
                            <ButtonText color="white">Close</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </ScreenWrapper>
    );
}
