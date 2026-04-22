import React, { useState, useEffect } from 'react';
import {
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
    SanctuaryModal,
    Heading,
    Icon,
    hapticLight,
    hapticSuccess,
    useTheme,
} from '@repo/ui';
import GuestConversionPrompt from '../shared/GuestConversionPrompt';
import { useNavigation } from '@react-navigation/native';
import { ScannerModal, resolveQR } from '@repo/scanner-kit';
import { ScanLine, Globe } from 'lucide-react-native';
import { 
    useEntity, 
    api, 
    identityAPI, 
    communityAPI, 
    handleAPIError,
    useStore
} from '@repo/core';
import { useTranslation } from 'react-i18next';

// Constants for Classroom logic
const CLASSROOM_THEMES = [
    { id: 'classic', name: 'Classic Saffron', color: '#F6BF8C' },
    { id: 'forest', name: 'Deep Forest', color: '#2D4B3D' },
    { id: 'ocean', name: 'Calm Ocean', color: '#3B5998' },
    { id: 'earth', name: 'Sacred Earth', color: '#8B4513' },
];

const SRI_LANKAN_SUBJECTS_BY_LEVEL = {
    primary: [
        { id: 'environmental', en: 'Environmental Studies', si: '\u0DB4\u0DBB\u0DD2\u0DC3\u0DBB\u0DBA' },
        { id: 'mathematics', en: 'Mathematics', si: '\u0D9C\u0DAB\u0DD2\u0DAD\u0DBA' },
        { id: 'language', en: 'Language', si: '\u0DB7\u0DCF\u0DC2\u0DCF\u0DC0' },
    ],
    junior: [
        { id: 'science', en: 'Science', si: '\u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF\u0DC0' },
        { id: 'history', en: 'History', si: '\u0D89\u0DAD\u0DD2\u0DC4\u0DCF\u0DC3\u0DBA' },
        { id: 'geography', en: 'Geography', si: '\u0DB7\u0DD6\u0D9C\u0DDD\u0DBD \u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF\u0DC0' },
    ],
    ordinary_level: [
        { id: 'mathematics', en: 'Mathematics', si: '\u0D9C\u0DAB\u0DD2\u0DAD\u0DBA' },
        { id: 'science', en: 'Science', si: '\u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF\u0DC0' },
        { id: 'history', en: 'History', si: '\u0D89\u0DAD\u0DD2\u0DC4\u0DCF\u0DC3\u0DBA' },
    ],
    advanced_level: [
        { id: 'physics', en: 'Physics', si: '\u0DB7\u0DDE\u0DAD\u0DD2\u0D9A \u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF\u0DC0' },
        { id: 'chemistry', en: 'Chemistry', si: '\u0DBB\u0DC3\u0DCF\u0DBA\u0DB1 \u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF\u0DC0' },
        { id: 'biology', en: 'Biology', si: '\u0DA2\u0DD3\u0DC0 \u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF\u0DC0' },
    ],
};

interface CreateClassroomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newClass: any) => void;
    mode?: 'create' | 'join' | 'edit';
    schoolId?: string;
    initialData?: {
        id: string;
        name: string;
        subject?: string;
        handle?: string;
        description?: string;
        themeId?: string;
        syllabusId?: string;
    };
}

export default function CreateClassroomModal({
    isOpen,
    onClose,
    onSuccess,
    mode = 'create',
    schoolId,
    initialData
}: CreateClassroomModalProps) {
    const navigation = useNavigation();
    const { user, setUser } = useStore();
    const { t } = useTranslation();
    const { accent } = useTheme();

    // useEntity for core logic
    const { create, updateInstance } = useEntity({
        type: 'classroom',
        mode: mode === 'edit' ? 'edit' : 'create',
        id: initialData?.id
    });

    // Local UI State (preserving existing multi-step flow)
    const [state, setState] = useState({
        step: 1,
        details: {
            name: initialData?.name || '',
            handle: initialData?.handle || '',
            description: initialData?.description || '',
        },
        academic: {
            sectionId: '',
            gradeId: '',
            subject: initialData?.subject || '',
            syllabusId: initialData?.syllabusId || '',
        },
        aesthetics: {
            themeId: initialData?.themeId || 'classic',
            classType: 'subject' as 'own' | 'subject'
        }
    });

    const [sections, setSections] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]);
    const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
    const [availableClassrooms, setAvailableClassrooms] = useState<any[]>([]);
    const [selectedClassroomId, setSelectedClassroomId] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [showGuestPrompt, setShowGuestPrompt] = useState(false);
    const [createdIds, setCreatedIds] = useState<{ classroomId: string; groupId?: string } | null>(null);

    const isGuest = false; // Placeholder for actual guest check
    const canCreateClassroom = true; // Placeholder for permissions

    // Fetch school sections if schoolId exists
    useEffect(() => {
        if (isOpen && schoolId) {
            fetchSections();
        }
    }, [isOpen, schoolId]);

    const fetchSections = async () => {
        try {
            const fetchedSections = await api.school.getSections(schoolId!);
            setSections(fetchedSections);
        } catch (err) {
            console.error('Error fetching sections:', err);
        }
    };

    const updateDetails = (updates: Partial<typeof state.details>) => {
        setState(prev => ({ ...prev, details: { ...prev.details, ...updates } }));
    };

    const updateAcademic = (updates: Partial<typeof state.academic>) => {
        setState(prev => ({ ...prev, academic: { ...prev.academic, ...updates } }));
    };

    const updateAesthetics = (updates: Partial<typeof state.aesthetics>) => {
        setState(prev => ({ ...prev, aesthetics: { ...prev.aesthetics, ...updates } }));
    };

    const updateStep = (step: number) => {
        setState(prev => ({ ...prev, step }));
        hapticLight();
    };

    const resetProgress = () => {
        setState({
            step: 1,
            details: { name: '', handle: '', description: '' },
            academic: { sectionId: '', gradeId: '', subject: '', syllabusId: '' },
            aesthetics: { themeId: 'classic', classType: 'subject' }
        });
        setCreatedIds(null);
    };

    const handleSectionChange = async (sectionId: string) => {
        updateAcademic({ sectionId, gradeId: '', subject: '' });
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
        const grade = grades.find(g => g.id === gradeId);
        updateAcademic({ gradeId, subject: '' });
        setAvailableClassrooms([]);
        setSelectedClassroomId('');

        if (grade) {
            const num = parseInt(grade.number);
            let subjects: any[] = [];
            if (num >= 1 && num <= 5) subjects = SRI_LANKAN_SUBJECTS_BY_LEVEL.primary;
            else if (num >= 6 && num <= 9) subjects = SRI_LANKAN_SUBJECTS_BY_LEVEL.junior;
            else if (num === 10 || num === 11) subjects = SRI_LANKAN_SUBJECTS_BY_LEVEL.ordinary_level;
            else if (num === 12 || num === 13) subjects = SRI_LANKAN_SUBJECTS_BY_LEVEL.advanced_level;
            setAvailableSubjects(subjects);
        } else {
            setAvailableSubjects([]);
        }

        try {
            const classrooms = await api.classrooms.getAvailableByGrade(gradeId);
            setAvailableClassrooms(classrooms);
        } catch (err) {
            console.error('Error fetching available classrooms:', err);
        }
    };

    const handleSubmit = async () => {
        if (isGuest || !canCreateClassroom) {
            setShowGuestPrompt(true);
            return;
        }

        const { details, academic, aesthetics } = state;

        if (mode === 'create' && !details.name.trim()) {
            setError(t('classroom.errorNameRequired') || 'Class name is required');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        hapticLight();

        try {
            const userId = await identityAPI.getMyInternalId();
            if (!userId) throw new Error('Not authenticated');

            let result;
            if (mode === 'join') {
                if (!selectedClassroomId) {
                    setError('Please select a classroom to join');
                    setIsSubmitting(false);
                    return;
                }
                const updatedGroup = await api.classrooms.update(selectedClassroomId, {
                    teacher_id: userId
                });
                result = updatedGroup;
            } else if (mode === 'edit') {
                if (!initialData?.id) throw new Error('Classroom ID missing for edit');
                result = await updateInstance({
                    name: details.name.trim(),
                    subject: academic.subject.trim(),
                    handle: details.handle.trim() || undefined,
                    description: details.description.trim(),
                    color_theme: aesthetics.themeId,
                    syllabus_version: academic.syllabusId,
                });
            } else {
                result = await create({
                    name: details.name.trim(),
                    subject: academic.subject.trim(),
                    school_id: schoolId,
                    teacher_id: userId,
                    grade_id: academic.gradeId || null,
                    section_id: academic.sectionId || null,
                    color_theme: aesthetics.themeId,
                    description: details.description.trim(),
                    syllabus_version: academic.syllabusId,
                    handle: details.handle.trim() || undefined,
                });

                // Create linked sanctuary group
                try {
                    const group = await communityAPI.createGroupWithOwner({
                        name: `${details.name.trim()} Sanctuary`,
                        description: `A sacred space for the ${details.name.trim()} classroom discussions.`,
                        type: 'class',
                        visibility: 'school',
                        join_policy: 'approval_required',
                        is_public: false,
                        school_id: schoolId ?? undefined,
                        classroom_id: result.id,
                        handle: details.handle.trim() || undefined
                    } as any, userId);
                    setCreatedIds({ classroomId: result.id, groupId: group.id });
                } catch (groupErr) {
                    console.warn('Failed to create linked group:', groupErr);
                    setCreatedIds({ classroomId: result.id });
                }
            }

            // Sync school_id to Supabase profile and local store if a school context exists
            // EXCEPTION: Personal classrooms (no schoolId in create mode) do not update the user's school association.
            const targetSchoolId = result?.school_id || (mode === 'create' ? schoolId : undefined);
            if (targetSchoolId && userId && (mode === 'create' || mode === 'join')) {
                await identityAPI.updateProfile(userId, { school_id: targetSchoolId });
                if (user) {
                    setUser({ ...user, school_id: targetSchoolId } as any);
                }
            }

            hapticSuccess();
            if (mode === 'create') {
                updateStep(3);
                onSuccess(result);
            } else {
                onSuccess(result);
                handleClose();
            }
        } catch (err: any) {
            const apiError = handleAPIError(err, true);
            setError(apiError.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEnterClassroom = () => {
        if (!createdIds?.classroomId) return;
        const cId = createdIds.classroomId;
        handleClose();
        (navigation as any).navigate('TeacherClassroomDashboard', {
            classroomId: cId,
            classroomName: state.details.name.trim() || 'Classroom',
        });
    };

    const handleScan = async (qrData: string) => {
        setIsScannerOpen(false);
        try {
            const resolved = resolveQR(qrData);
            if (resolved.ok && 'type' in resolved.payload && resolved.payload.type === 'classroom') {
                const classroomId = (resolved.payload as any).id;
                setSelectedClassroomId(classroomId);
                const userId = await identityAPI.getMyInternalId();
                if (userId) {
                    const result = await api.classrooms.update(classroomId, {
                        teacher_id: userId
                    });

                    // Sync school_id if joining via scan
                    if (result?.school_id) {
                        await identityAPI.updateProfile(userId, { school_id: result.school_id });
                        if (user) {
                            setUser({ ...user, school_id: result.school_id } as any);
                        }
                    }

                    onSuccess(result);
                    handleClose();
                    hapticSuccess();
                }
            } else {
                setError('Invalid classroom QR code');
            }
        } catch (err) {
            setError('Failed to resolve QR code');
            console.error(err);
        }
    };

    const handleClose = () => {
        resetProgress();
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
            <SanctuaryModal
                isOpen={isOpen}
                onClose={handleClose}
                title={mode === 'join'
                    ? (t('classroom.joinTitle') || 'Join Existing Class')
                    : (t('classroom.createTitle') || 'Create New Class')
                }
                footer={
                    <HStack className="gap-4 w-full">
                        {state.step === 1 && (
                            <>
                                <Button
                                    variant="outline"
                                    action="secondary"
                                    onPress={handleClose}
                                    className="flex-1 border-sanctuary-border rounded-full"
                                    isDisabled={isSubmitting}
                                >
                                    <ButtonText className="text-sanctuary-text-secondary">
                                        {t('common.cancel') || 'Cancel'}
                                    </ButtonText>
                                </Button>
                                <Button
                                    action="primary"
                                    onPress={() => updateStep(2)}
                                    className="flex-[2] bg-sanctuarySaffron rounded-full"
                                    isDisabled={!state.details.name.trim() || !state.details.handle.trim()}
                                >
                                    <ButtonText className="text-white">
                                        {'Next \u2014 Academic Focus'}
                                    </ButtonText>
                                </Button>
                            </>
                        )}
                        {state.step === 2 && (
                            <>
                                <Button
                                    variant="outline"
                                    action="secondary"
                                    onPress={() => updateStep(1)}
                                    className="flex-1 border-sanctuary-border rounded-full"
                                    isDisabled={isSubmitting}
                                >
                                    <ButtonText className="text-sanctuary-text-secondary">
                                        {'Back'}
                                    </ButtonText>
                                </Button>
                                <Button
                                    action="primary"
                                    onPress={handleSubmit}
                                    className="flex-[2] bg-sanctuarySaffron rounded-full"
                                    isDisabled={isSubmitting || (state.aesthetics.classType === 'subject' && !state.academic.subject.trim())}
                                >
                                    {isSubmitting ? (
                                        <Spinner size="small" className="text-white" />
                                    ) : (
                                        <ButtonText className="text-white">
                                            {mode === 'edit' ? 'Save Changes' : 'Establish Sanctuary'}
                                        </ButtonText>
                                    )}
                                </Button>
                            </>
                        )}
                        {state.step === 3 && (
                            <Button
                                action="primary"
                                onPress={handleEnterClassroom}
                                className="flex-1 bg-sanctuarySaffron rounded-full h-14"
                            >
                                <ButtonText className="text-white text-lg font-bold">
                                    {'Enter Classroom Dashboard'}
                                </ButtonText>
                            </Button>
                        )}
                    </HStack>
                }
            >
                <VStack className="gap-8">
                    {error && (
                        <Box
                            className="p-4 bg-sanctuary-error-transparent rounded-2xl border border-sanctuary-error"
                        >
                            <Text className="text-sanctuary-error text-sm font-medium">
                                {error}
                            </Text>
                        </Box>
                    )}

                    {state.step === 1 && (
                        <VStack className="gap-6">
                            {(mode === 'create' || mode === 'edit') && (
                                <FormControl isRequired isInvalid={!!error}>
                                    <FormControlLabel>
                                        <FormControlLabelText className="text-sanctuary-text-tertiary uppercase text-[10px] font-bold tracking-widest">
                                            {t('classroom.labelClassName') || 'Name of Sanctuary'}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        className="bg-sanctuary-surface-secondary border-sanctuary-border h-16 rounded-[24px]"
                                    >
                                        <InputField
                                            placeholder={t('classroom.placeholderClassName') || "e.g., 10-A Maths"}
                                            value={state.details.name}
                                            onChangeText={(textValue: string) => {
                                                updateDetails({ 
                                                    name: textValue,
                                                    handle: textValue.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '')
                                                });
                                                if (error) setError(null);
                                            }}
                                            className="text-xl font-bold text-sanctuary-text"
                                        />
                                    </Input>
                                </FormControl>
                            )}

                            {(mode === 'create' || mode === 'edit') && (
                                <FormControl>
                                    <FormControlLabel>
                                        <FormControlLabelText className="text-sanctuary-text-tertiary uppercase text-[10px] font-bold tracking-widest">
                                            Classroom Handle
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        className="bg-sanctuary-surface-secondary border-sanctuary-border h-14 rounded-2xl"
                                    >
                                        <InputField
                                            placeholder="e.g. grade-10-maths"
                                            value={state.details.handle}
                                            onChangeText={(textValue: string) =>
                                                updateDetails({ handle: textValue.toLowerCase().replace(/[^a-z0-9_-]/g, '') })
                                            }
                                            className="text-sanctuary-text font-medium"
                                        />
                                    </Input>
                                    <Text className="text-[10px] text-sanctuary-text-tertiary mt-2 italic px-1">
                                        Unique ID used for QR generation and deep linking.
                                    </Text>
                                </FormControl>
                            )}

                            {(mode === 'create' || mode === 'edit') && (
                                <FormControl>
                                    <FormControlLabel>
                                        <FormControlLabelText className="text-sanctuary-text-tertiary uppercase text-[10px] font-bold tracking-widest">
                                            {t('classroom.description') || 'Vision Statement'}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        className="min-h-[120px] bg-sanctuary-surface-secondary border-sanctuary-border rounded-[24px] p-2"
                                    >
                                        <InputField
                                            placeholder={t('classroom.descPlaceholder') || "Describe the learning journey and goals..."}
                                            value={state.details.description}
                                            onChangeText={(text: string) => updateDetails({ description: text })}
                                            multiline
                                            numberOfLines={4}
                                            className="text-sanctuary-text"
                                        />
                                    </Input>
                                </FormControl>
                            )}

                             {mode === 'join' && (
                                <Box className="mb-4">
                                    <Button
                                        variant="outline"
                                        onPress={() => setIsScannerOpen(true)}
                                        className="border-sanctuarySaffron h-14 rounded-full"
                                    >
                                        <HStack className="gap-2 items-center">
                                            <Icon as={ScanLine} className="text-sanctuarySaffron" size={20} />
                                            <ButtonText className="text-sanctuarySaffron font-bold">
                                                {t('classroom.scanQrToJoin') || 'Scan QR to Join'}
                                            </ButtonText>
                                        </HStack>
                                    </Button>
                                    {schoolId && (
                                        <HStack className="items-center my-8">
                                            <Box className="flex-1 h-[1px] bg-sanctuary-border" />
                                            <Text className="text-sanctuary-text-tertiary px-6 text-xs uppercase font-bold tracking-widest">
                                                {t('common.or') || 'OR'}
                                            </Text>
                                            <Box className="flex-1 h-[1px] bg-sanctuary-border" />
                                        </HStack>
                                    )}

                                    {schoolId && (
                                        <VStack className="gap-4">
                                            <FormControl isRequired>
                                                <FormControlLabel>
                                                    <FormControlLabelText className="text-sanctuary-text-tertiary uppercase text-[10px] font-bold tracking-widest mb-2">
                                                        {t('classroom.selectSection') || 'Select Institutional Section'}
                                                    </FormControlLabelText>
                                                </FormControlLabel>
                                                <Box className="flex-row flex-wrap gap-3">
                                                    {sections.map((section) => (
                                                         <Button
                                                            key={section.id}
                                                            variant={state.academic.sectionId === section.id ? 'solid' : 'outline'}
                                                            size="sm"
                                                            onPress={() => handleSectionChange(section.id)}
                                                            className={`rounded-full px-5 ${state.academic.sectionId === section.id ? 'bg-sanctuarySaffron border-sanctuarySaffron' : 'bg-transparent border-sanctuary-border'}`}
                                                        >
                                                            <ButtonText className={state.academic.sectionId === section.id ? 'text-white font-bold' : 'text-sanctuary-text-secondary'}>
                                                                {section.name}
                                                            </ButtonText>
                                                        </Button>
                                                    ))}
                                                </Box>
                                            </FormControl>
                                        </VStack>
                                    )}
                                </Box>
                            )}
                        </VStack>
                    )}

                    {state.step === 2 && (
                        <VStack className="gap-Containers-lg">
                            {schoolId && (
                                <VStack className="gap-4">
                                    <FormControl isRequired>
                                        <FormControlLabel>
                                            <FormControlLabelText className="text-sanctuary-text-tertiary uppercase text-[10px] font-bold tracking-widest mb-2">
                                                {t('classroom.selectGrade') || 'Target Grade Level'}
                                            </FormControlLabelText>
                                        </FormControlLabel>
                                        <Box className="flex-row flex-wrap gap-2">
                                            {grades.map((grade) => (
                                                 <Button
                                                    key={grade.id}
                                                    variant={state.academic.gradeId === grade.id ? 'solid' : 'outline'}
                                                    size="sm"
                                                    onPress={() => handleGradeChange(grade.id)}
                                                    className={`px-4 rounded-full h-10 ${state.academic.gradeId === grade.id ? 'bg-sanctuarySaffron border-sanctuarySaffron' : 'bg-transparent border-sanctuary-border'}`}
                                                >
                                                    <ButtonText className={state.academic.gradeId === grade.id ? 'text-white font-bold' : 'text-sanctuary-text-secondary'}>
                                                        {grade.number}
                                                    </ButtonText>
                                                </Button>
                                            ))}
                                        </Box>
                                    </FormControl>
                                </VStack>
                            )}

                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText className="text-sanctuary-text-tertiary uppercase text-[10px] font-bold tracking-widest mb-2">
                                        {t('classroom.labelSubject') || 'Academic Core'}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <HStack className="flex-wrap gap-2">
                                    {availableSubjects.map((sub: any) => (
                                         <Button
                                            key={sub.id}
                                            variant={state.academic.subject === sub.id ? 'solid' : 'outline'}
                                            size="sm"
                                            onPress={() => updateAcademic({ subject: sub.id })}
                                            className={`rounded-full px-5 ${state.academic.subject === sub.id ? 'bg-sanctuarySaffron border-sanctuarySaffron' : 'bg-transparent border-sanctuary-border'}`}
                                        >
                                            <ButtonText className={state.academic.subject === sub.id ? 'text-white font-bold' : 'text-sanctuary-text-secondary'}>
                                                {sub.en}
                                            </ButtonText>
                                        </Button>
                                    ))}
                                </HStack>
                            </FormControl>

                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText className="text-sanctuary-text-tertiary uppercase text-[10px] font-bold tracking-widest mb-2">
                                        {t('classroom.theme') || 'Aesthetic Archetype'}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <HStack className="flex-wrap gap-5 py-2 px-1">
                                    {CLASSROOM_THEMES.map((theme) => (
                                         <Pressable key={theme.id} onPress={() => updateAesthetics({ themeId: theme.id })}>
                                            <Box
                                                className={`w-12 h-12 rounded-full justify-center items-center shadow-sm ${state.aesthetics.themeId === theme.id ? 'border-2 border-sanctuarySaffron scale-110' : 'border border-sanctuary-border/20'}`}
                                                style={{
                                                    backgroundColor: theme.color
                                                }}
                                            >
                                                {state.aesthetics.themeId === theme.id && (
                                                    <Box className="w-2.5 h-2.5 rounded-full bg-white shadow-inner" />
                                                )}
                                            </Box>
                                        </Pressable>
                                    ))}
                                </HStack>
                            </FormControl>

                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText className="text-sanctuary-text-tertiary uppercase text-[10px] font-bold tracking-widest mb-3">
                                        {t('classroom.labelType') || 'Institutional Role'}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <HStack className="gap-4">
                                    {(['own', 'subject'] as const).map((type) => (
                                         <Button
                                            key={type}
                                            variant={state.aesthetics.classType === type ? 'solid' : 'outline'}
                                            onPress={() => updateAesthetics({ classType: type })}
                                            className={`flex-1 h-14 rounded-2xl ${state.aesthetics.classType === type ? 'bg-sanctuarySaffron border-sanctuarySaffron' : 'bg-transparent border-sanctuary-border'}`}
                                        >
                                            <ButtonText className={state.aesthetics.classType === type ? 'text-white font-bold' : 'text-sanctuary-text-secondary'}>
                                                {type === 'own' ? (t('classroom.roleClassTeacher') || 'Class Principal') : (t('classroom.roleSubjectTeacher') || 'Faculty Mentor')}
                                            </ButtonText>
                                        </Button>
                                    ))}
                                </HStack>
                            </FormControl>
                        </VStack>
                    )}

                     {state.step === 3 && (
                        <VStack className="gap-8 items-center py-10">
                            <Box className="bg-sanctuarySaffron/10 p-8 rounded-[60px] border border-sanctuarySaffron/20 shadow-xl">
                                <Icon as={Globe} className="text-sanctuarySaffron" size={80} />
                            </Box>
                            
                            <VStack className="gap-3 items-center">
                                <Heading className="text-sanctuary-text text-center text-2xl font-bold tracking-tight">
                                    Sanctuary Established!
                                </Heading>
                                <Text className="text-center text-sanctuary-text-secondary text-base px-4 leading-relaxed">
                                    Your classroom <Text className="font-bold text-sanctuarySaffron">{state.details.name}</Text> is now woven into the digital fabric of Gurudevi.
                                </Text>
                            </VStack>

                            <Box className="bg-sanctuary-surface-secondary p-8 rounded-[32px] w-full border border-sanctuary-border shadow-sm">
                                <VStack className="gap-5">
                                    <HStack className="gap-4 items-center">
                                        <Box className="w-3 h-3 rounded-full bg-sanctuary-success shadow-sm" />
                                        <Text className="text-sm font-bold text-sanctuary-text">Classroom Hub Initialized</Text>
                                    </HStack>
                                    <HStack className="gap-4 items-center">
                                        <Box className="w-3 h-3 rounded-full bg-sanctuary-success shadow-sm" />
                                        <Text className="text-sm font-bold text-sanctuary-text">Linked Sanctuary Group Active</Text>
                                    </HStack>
                                    <HStack className="gap-4 items-center">
                                        <Box className="w-3 h-3 rounded-full bg-sanctuary-success shadow-sm" />
                                        <Text className="text-sm font-bold text-sanctuary-text">Aesthetic Archetype Synchronized</Text>
                                    </HStack>
                                </VStack>
                            </Box>
                        </VStack>
                    )}
                </VStack>
            </SanctuaryModal>
            <ScannerModal
                visible={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={handleScan}
                title="Scan Class QR"
                accentColor={accent.action}
            />
        </>
    );
}
