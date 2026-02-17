import React, { useState } from 'react';
import {
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Heading,
    VStack,
    HStack,
    Box,
    Text,
    Input,
    InputField,
    Button,
    ButtonText,
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    Spinner,
    Pressable,
} from '@/ui';
import { Theme } from '../../constants/Theme';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { hapticLight, hapticSuccess } from '../../utils/haptics';
import { useThemedColors } from '../../hooks/useThemedColors';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';
import GuestConversionPrompt from '../shared/GuestConversionPrompt';
import { useNavigation } from '@react-navigation/native';

interface CreateClassroomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newClass: any) => void;
    mode?: 'create' | 'join';
    initialData?: {
        name: string;
        subject?: string;
    };
}

export default function CreateClassroomModal({
    isOpen,
    onClose,
    onSuccess,
    mode = 'create',
    initialData,
}: CreateClassroomModalProps) {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [classType, setClassType] = useState<'own' | 'subject'>('own');
    const [subject, setSubject] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const colors = useThemedColors();

    const [sections, setSections] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]);
    const [selectedSectionId, setSelectedSectionId] = useState<string>('');
    const [selectedGradeId, setSelectedGradeId] = useState<string>('');
    const [availableClassrooms, setAvailableClassrooms] = useState<any[]>([]);
    const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
    const [isJoining, setIsJoining] = useState(false);
    const [schoolId, setSchoolId] = useState<string | null>(null);

    // Guest support
    const { isGuest, canCreateClassroom } = useFeatureAccess();
    const [showGuestPrompt, setShowGuestPrompt] = useState(false);
    const navigation = useNavigation();

    React.useEffect(() => {
        if (isOpen) {
            fetchInitialData();
            if (initialData) {
                setName(initialData.name);
                setSubject(initialData.subject || '');
                setClassType(initialData.subject ? 'subject' : 'own');
            } else {
                setClassType('own');
                setSubject('');
            }
        }
    }, [isOpen, initialData]);

    const fetchInitialData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: userData } = await supabase
                .from('users')
                .select('school_id')
                .eq('id', user.id)
                .single();

            if (userData?.school_id) {
                setSchoolId(userData.school_id);
                const fetchedSections = await api.school.getSections(userData.school_id);
                setSections(fetchedSections);
            }
        } catch (err) {
            console.error('Error fetching initial modal data:', err);
        }
    };

    const handleSectionChange = async (sectionId: string) => {
        setSelectedSectionId(sectionId);
        setSelectedGradeId('');
        setGrades([]);
        setAvailableClassrooms([]);
        setSelectedClassroomId('');
        try {
            const fetchedGrades = await api.school.getGrades(sectionId);
            setGrades(fetchedGrades);
        } catch (err) {
            console.error('Error fetching grades:', err);
        }
    };

    const handleGradeChange = async (gradeId: string) => {
        setSelectedGradeId(gradeId);
        setAvailableClassrooms([]);
        setSelectedClassroomId('');
        try {
            // Fetch classrooms for this grade
            const { data, error } = await supabase
                .from('classrooms')
                .select('*')
                .eq('grade_id', gradeId)
                .is('teacher_id', null); // Only show classes without a teacher? Or all?

            // Let's show all for now, or maybe filter? The plan said "join existing".
            // Usually teachers "claim" empty ones.
            if (data) {
                setAvailableClassrooms(data);
            }
        } catch (err) {
            console.error('Error fetching available classrooms:', err);
        }
    };

    const handleSubmit = async () => {
        // Check if user is guest - show conversion prompt
        if (isGuest || !canCreateClassroom) {
            setShowGuestPrompt(true);
            return;
        }

        if (mode === 'create' && !name.trim()) {
            setError(t('classroom.errorNameRequired') || 'Class name is required');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        hapticLight();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            let result;
            if (mode === 'join') {
                if (!selectedClassroomId) {
                    setError('Please select a classroom to join');
                    setIsSubmitting(false);
                    return;
                }
                result = await api.classrooms.update(selectedClassroomId, {
                    teacher_id: user.id
                });
            } else {
                result = await api.classrooms.create({
                    name: name.trim(),
                    subject: subject.trim(),
                    school_id: schoolId,
                    teacher_id: user.id,
                    grade_id: selectedGradeId || null,
                    section_id: selectedSectionId || null,
                    color_theme: 'blue',
                });
            }

            hapticSuccess();
            onSuccess(result);
            handleClose();
        } catch (err: any) {
            console.error('Failed to process classroom operation:', err);
            const detailMsg = err.details?.message || err.details?.details || JSON.stringify(err.details);
            setError(`${err.message}${err.code ? ` (${err.code})` : ''}${detailMsg ? `: ${detailMsg}` : ''}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setName('');
        setSubject('');
        setClassType('own');
        setError(null);
        onClose();
    };

    return (
        <>
            <GuestConversionPrompt
                isOpen={showGuestPrompt}
                onClose={() => setShowGuestPrompt(false)}
                onCreateAccount={() => {
                    setShowGuestPrompt(false);
                    handleClose();
                    navigation.navigate('Profile' as never);
                }}
                feature="classroom"
            />
            <Modal isOpen={isOpen} onClose={handleClose}>
                <ModalBackdrop />
                <ModalContent
                    sx={{
                        backgroundColor: colors.secondary,
                        maxWidth: 400,
                        borderColor: colors.border,
                        borderWidth: 1,
                    }}
                >
                    <ModalHeader>
                        <Heading color={colors.text} size="lg">
                            {mode === 'join'
                                ? (t('classroom.joinTitle') || 'Join Existing Class')
                                : (t('classroom.createTitle') || 'Create New Class')
                            }
                        </Heading>
                    </ModalHeader>

                    <ModalBody>
                        <VStack space="xl">
                            {error && (
                                <Box
                                    sx={{
                                        padding: Theme.spacing.md,
                                        backgroundColor: Theme.colors.emberRed + '30',
                                        borderRadius: Theme.corners.comfortable,
                                        borderWidth: 1,
                                        borderColor: Theme.colors.emberRed,
                                    }}
                                >
                                    <Text color={Theme.colors.emberRed} size="sm">
                                        {error}
                                    </Text>
                                </Box>
                            )}

                            {mode === 'create' && (
                                <FormControl isRequired isInvalid={!!error}>
                                    <FormControlLabel>
                                        <FormControlLabelText color={colors.textSecondary}>
                                            {t('classroom.labelClassName') || 'Class Name'}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        variant="outline"
                                        size="md"
                                        sx={{
                                            backgroundColor: colors.tertiary,
                                            borderColor: colors.border,
                                        }}
                                    >
                                        <InputField
                                            placeholder={t('classroom.placeholderClassName') || "e.g., 10-A"}
                                            value={name}
                                            onChangeText={(text: string) => {
                                                setName(text);
                                                if (error) setError(null);
                                            }}
                                            color={colors.text}
                                            placeholderTextColor={colors.textTertiary}
                                        />
                                    </Input>
                                </FormControl>
                            )}

                            {/* Grade & Section Selection (if in school) */}
                            {schoolId && (
                                <VStack space="md">
                                    <FormControl isRequired>
                                        <FormControlLabel>
                                            <FormControlLabelText color={colors.textSecondary}>
                                                {t('classroom.selectSection') || 'Select Section'}
                                            </FormControlLabelText>
                                        </FormControlLabel>
                                        <Box sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                            {sections.map((section) => (
                                                <Button
                                                    key={section.id}
                                                    variant={selectedSectionId === section.id ? 'solid' : 'outline'}
                                                    size="sm"
                                                    onPress={() => handleSectionChange(section.id)}
                                                    sx={{
                                                        backgroundColor: selectedSectionId === section.id ? Theme.colors.sanctuarySaffron : 'transparent',
                                                        borderColor: selectedSectionId === section.id ? Theme.colors.sanctuarySaffron : colors.border,
                                                    }}
                                                >
                                                    <ButtonText color={selectedSectionId === section.id ? Theme.colors.sacredWhite : colors.textSecondary}>
                                                        {section.name}
                                                    </ButtonText>
                                                </Button>
                                            ))}
                                        </Box>
                                    </FormControl>

                                    {selectedSectionId && grades.length > 0 && (
                                        <FormControl isRequired>
                                            <FormControlLabel>
                                                <FormControlLabelText color={colors.textSecondary}>
                                                    {t('classroom.selectGrade') || 'Select Grade'}
                                                </FormControlLabelText>
                                            </FormControlLabel>
                                            <Box sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                                {grades.map((grade) => (
                                                    <Button
                                                        key={grade.id}
                                                        variant={selectedGradeId === grade.id ? 'solid' : 'outline'}
                                                        size="xs"
                                                        onPress={() => handleGradeChange(grade.id)}
                                                        sx={{
                                                            paddingHorizontal: 8,
                                                            backgroundColor: selectedGradeId === grade.id ? Theme.colors.sanctuarySaffron : 'transparent',
                                                            borderColor: selectedGradeId === grade.id ? Theme.colors.sanctuarySaffron : colors.border,
                                                        }}
                                                    >
                                                        <ButtonText color={selectedGradeId === grade.id ? Theme.colors.sacredWhite : colors.textSecondary}>
                                                            {grade.number}
                                                        </ButtonText>
                                                    </Button>
                                                ))}
                                            </Box>
                                        </FormControl>
                                    )}

                                    {mode === 'join' && selectedGradeId && availableClassrooms.length > 0 && (
                                        <FormControl isRequired>
                                            <FormControlLabel>
                                                <FormControlLabelText color={colors.textSecondary}>
                                                    {t('classroom.selectClassToJoin') || 'Select Classroom to Join'}
                                                </FormControlLabelText>
                                            </FormControlLabel>
                                            <VStack space="sm">
                                                {availableClassrooms.map((cls) => (
                                                    <Pressable
                                                        key={cls.id}
                                                        onPress={() => setSelectedClassroomId(cls.id)}
                                                    >
                                                        <Box
                                                            sx={{
                                                                padding: Theme.spacing.md,
                                                                borderRadius: Theme.corners.comfortable,
                                                                backgroundColor: selectedClassroomId === cls.id ? colors.tertiary : 'transparent',
                                                                borderWidth: 1,
                                                                borderColor: selectedClassroomId === cls.id ? Theme.colors.sanctuarySaffron : colors.border,
                                                            }}
                                                        >
                                                            <HStack justifyContent="space-between" alignItems="center">
                                                                <VStack>
                                                                    <Text color={colors.text} bold>{cls.name}</Text>
                                                                    <Text color={colors.textSecondary} size="xs">{cls.subject || 'No subject'}</Text>
                                                                </VStack>
                                                                {selectedClassroomId === cls.id && (
                                                                    <Box sx={{ backgroundColor: Theme.colors.sanctuarySaffron, borderRadius: 10, padding: 2 }}>
                                                                        <Text size="xs" color="white" bold sx={{ paddingHorizontal: 4 }}>SELECTED</Text>
                                                                    </Box>
                                                                )}
                                                            </HStack>
                                                        </Box>
                                                    </Pressable>
                                                ))}
                                            </VStack>
                                        </FormControl>
                                    )}

                                    {mode === 'join' && selectedGradeId && availableClassrooms.length === 0 && (
                                        <Text color={colors.textTertiary} size="sm" textAlign="center" sx={{ marginTop: Theme.spacing.md }}>
                                            {t('classroom.noAvailableClasses') || 'No unassigned classrooms found for this grade.'}
                                        </Text>
                                    )}
                                </VStack>
                            )}

                            {mode === 'create' && (
                                <>
                                    {/* Classroom Type Selection */}
                                    <FormControl>
                                        <FormControlLabel>
                                            <FormControlLabelText color={colors.textSecondary}>
                                                {t('classroom.labelType') || 'Teacher Role for this Class'}
                                            </FormControlLabelText>
                                        </FormControlLabel>
                                        <HStack space="md">
                                            <Button
                                                variant={classType === 'own' ? 'solid' : 'outline'}
                                                action={classType === 'own' ? 'primary' : 'secondary'}
                                                onPress={() => setClassType('own')}
                                                sx={{
                                                    flex: 1,
                                                    backgroundColor: classType === 'own' ? Theme.colors.sanctuarySaffron : 'transparent',
                                                    borderColor: classType === 'own' ? Theme.colors.sanctuarySaffron : colors.border,
                                                }}
                                            >
                                                <ButtonText color={classType === 'own' ? Theme.colors.sacredWhite : colors.textSecondary}>
                                                    {t('classroom.roleClassTeacher') || 'Class Teacher'}
                                                </ButtonText>
                                            </Button>
                                            <Button
                                                variant={classType === 'subject' ? 'solid' : 'outline'}
                                                action={classType === 'subject' ? 'primary' : 'secondary'}
                                                onPress={() => setClassType('subject')}
                                                sx={{
                                                    flex: 1,
                                                    backgroundColor: classType === 'subject' ? Theme.colors.sanctuarySaffron : 'transparent',
                                                    borderColor: classType === 'subject' ? Theme.colors.sanctuarySaffron : colors.border,
                                                }}
                                            >
                                                <ButtonText color={classType === 'subject' ? Theme.colors.sacredWhite : colors.textSecondary}>
                                                    {t('classroom.roleSubjectTeacher') || 'Subject Teacher'}
                                                </ButtonText>
                                            </Button>
                                        </HStack>
                                        <Text size="xs" color={colors.textTertiary} mt="$2">
                                            {classType === 'own'
                                                ? t('classroom.descOwn')
                                                : t('classroom.descSubject')
                                            }
                                        </Text>
                                    </FormControl>

                                    {/* Subject Input - Always visible */}
                                    <FormControl>
                                        <FormControlLabel>
                                            <FormControlLabelText color={colors.textSecondary}>
                                                {t('classroom.labelSubject') || 'Core Subject'} {t('classroom.optional') || '(Optional)'}
                                            </FormControlLabelText>
                                        </FormControlLabel>
                                        <Input
                                            variant="outline"
                                            size="md"
                                            sx={{
                                                backgroundColor: colors.tertiary,
                                                borderColor: colors.border,
                                            }}
                                        >
                                            <InputField
                                                placeholder={t('classroom.placeholderSubject') || "e.g., Mathematics, Science"}
                                                value={subject}
                                                onChangeText={setSubject}
                                                color={colors.text}
                                                placeholderTextColor={colors.textTertiary}
                                            />
                                        </Input>
                                    </FormControl>
                                </>
                            )}
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <HStack space="md" sx={{ width: '100%' }}>
                            <Button
                                variant="outline"
                                action="secondary"
                                onPress={handleClose}
                                sx={{ flex: 1, borderColor: colors.border }}
                                isDisabled={isSubmitting}
                            >
                                <ButtonText color={colors.textSecondary}>
                                    {t('common.cancel') || 'Cancel'}
                                </ButtonText>
                            </Button>
                            <Button
                                action="primary"
                                onPress={handleSubmit}
                                sx={{
                                    flex: 1,
                                    backgroundColor: Theme.colors.sanctuarySaffron,
                                }}
                                isDisabled={
                                    isSubmitting ||
                                    (mode === 'create' && (!name.trim() || (classType === 'subject' && !subject.trim()))) ||
                                    (mode === 'join' && !selectedClassroomId)
                                }
                            >
                                {isSubmitting ? (
                                    <Spinner color={Theme.colors.sacredWhite} size="small" />
                                ) : (
                                    <ButtonText color={Theme.colors.sacredWhite}>
                                        {mode === 'join'
                                            ? (t('common.join') || 'Join')
                                            : (t('common.create') || 'Create')
                                        }
                                    </ButtonText>
                                )}
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}

