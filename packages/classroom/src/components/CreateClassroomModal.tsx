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
    useTheme,
    useThemedColors,
    Heading,
    Icon,
    hapticLight,
    hapticSuccess,
} from '@repo/ui';
import { Theme } from '@repo/ui';
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
    supabase,
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
        { id: 'environmental', en: 'Environmental Studies', si: 'පරිසරය' },
        { id: 'mathematics', en: 'Mathematics', si: 'ගණිතය' },
        { id: 'language', en: 'Language', si: 'භාෂාව' },
    ],
    junior: [
        { id: 'science', en: 'Science', si: 'විද්‍යාව' },
        { id: 'history', en: 'History', si: 'ඉතිහාසය' },
        { id: 'geography', en: 'Geography', si: 'භූගෝල විද්‍යාව' },
    ],
    ordinary_level: [
        { id: 'mathematics', en: 'Mathematics', si: 'ගණිතය' },
        { id: 'science', en: 'Science', si: 'විද්‍යාව' },
        { id: 'history', en: 'History', si: 'ඉතිහාසය' },
    ],
    advanced_level: [
        { id: 'physics', en: 'Physics', si: 'භෞතික විද්‍යාව' },
        { id: 'chemistry', en: 'Chemistry', si: 'රසායන විද්‍යාව' },
        { id: 'biology', en: 'Biology', si: 'ජීව විද්‍යාව' },
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
    const { t } = useTranslation();
    const navigation = useNavigation();
    const colors = useThemedColors();
    const { glass, text, accent } = useTheme();
    const { user, setUser } = useStore();

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
            const { data } = await supabase
                .from('classrooms')
                .select('*')
                .eq('grade_id', gradeId)
                .is('teacher_id', null);

            if (data) {
                setAvailableClassrooms(data);
            }
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
                        group_type: 'class',
                        join_policy: 'approval_required',
                        school_id: schoolId ?? undefined,
                        classroom_id: result.id,
                        handle: details.handle.trim() || undefined
                    }, userId);
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
        (navigation as any).navigate('ClassroomDetails', { id: cId });
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
                    <HStack sx={{ gap: Theme.spacing.md, width: '100%' }}>
                        {state.step === 1 && (
                            <>
                                <Button
                                    variant="outline"
                                    action="secondary"
                                    onPress={handleClose}
                                    sx={{ flex: 1, borderColor: glass.interact.border }}
                                    isDisabled={isSubmitting}
                                >
                                    <ButtonText {...({ color: text.secondary } as any)}>
                                        {t('common.cancel') || 'Cancel'}
                                    </ButtonText>
                                </Button>
                                <Button
                                    action="primary"
                                    onPress={() => updateStep(2)}
                                    sx={{
                                        flex: 2,
                                        backgroundColor: Theme.colors.sanctuarySaffron,
                                        borderRadius: Theme.corners.comfortable,
                                    }}
                                    isDisabled={!state.details.name.trim() || !state.details.handle.trim()}
                                >
                                    <ButtonText {...({ color: text.inverse } as any)}>
                                        {'Next — Academic Focus'}
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
                                    sx={{ flex: 1, borderColor: glass.interact.border }}
                                    isDisabled={isSubmitting}
                                >
                                    <ButtonText {...({ color: text.secondary } as any)}>
                                        {'Back'}
                                    </ButtonText>
                                </Button>
                                <Button
                                    action="primary"
                                    onPress={handleSubmit}
                                    sx={{
                                        flex: 2,
                                        backgroundColor: Theme.colors.sanctuarySaffron,
                                        borderRadius: Theme.corners.comfortable,
                                    }}
                                    isDisabled={isSubmitting || (state.aesthetics.classType === 'subject' && !state.academic.subject.trim())}
                                >
                                    {isSubmitting ? (
                                        <Spinner {...({ color: text.inverse, size: "small" } as any)} />
                                    ) : (
                                        <ButtonText {...({ color: text.inverse } as any)}>
                                            {mode === 'edit' ? 'Save' : 'Establish Sanctuary'}
                                        </ButtonText>
                                    )}
                                </Button>
                            </>
                        )}
                        {state.step === 3 && (
                            <Button
                                action="primary"
                                onPress={handleEnterClassroom}
                                sx={{
                                    flex: 1,
                                    backgroundColor: Theme.colors.sanctuarySaffron,
                                    borderRadius: Theme.corners.comfortable,
                                }}
                            >
                                <ButtonText {...({ color: text.inverse } as any)}>
                                    {'Enter Classroom Dashboard'}
                                </ButtonText>
                            </Button>
                        )}
                    </HStack>
                }
            >
                <VStack sx={{ gap: Theme.spacing.xl }}>
                    {error && (
                        <Box
                            sx={{
                                padding: Theme.spacing.md,
                                backgroundColor: `${accent.danger}30`,
                                borderRadius: Theme.corners.comfortable,
                                borderWidth: 1,
                                borderColor: accent.danger,
                            }}
                        >
                            <Text sx={{ color: accent.danger, fontSize: Theme.typography.fontSize.sm }}>
                                {error}
                            </Text>
                        </Box>
                    )}

                    {state.step === 1 && (
                        <>
                            {(mode === 'create' || mode === 'edit') && (
                                <FormControl isRequired isInvalid={!!error}>
                                    <FormControlLabel>
                                        <FormControlLabelText sx={{ color: colors.textSecondary }}>
                                            {t('classroom.labelClassName') || 'What shall we call your Sanctuary?'}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        sx={{
                                            backgroundColor: colors.tertiary,
                                            borderColor: colors.border,
                                            height: 56,
                                            borderRadius: Theme.corners.generous
                                        }}
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
                                            color={colors.text}
                                            placeholderTextColor={colors.textTertiary}
                                            sx={{ fontSize: 18, fontWeight: '600' }}
                                        />
                                    </Input>
                                </FormControl>
                            )}

                            {(mode === 'create' || mode === 'edit') && (
                                <FormControl>
                                    <FormControlLabel>
                                        <FormControlLabelText sx={{ color: colors.textSecondary }}>
                                            Classroom Handle (unique ID)
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        sx={{
                                            backgroundColor: colors.tertiary,
                                            borderColor: colors.border,
                                            height: 56,
                                            borderRadius: Theme.corners.generous
                                        }}
                                    >
                                        <InputField
                                            placeholder="e.g. grade-10-maths"
                                            value={state.details.handle}
                                            onChangeText={(textValue: string) =>
                                                updateDetails({ handle: textValue.toLowerCase().replace(/[^a-z0-9_-]/g, '') })
                                            }
                                            color={colors.text}
                                            placeholderTextColor={colors.textTertiary}
                                        />
                                    </Input>
                                    <Text sx={{ color: colors.textTertiary, fontSize: Theme.typography.fontSize.xs, marginTop: Theme.spacing.xs }}>
                                        Used for your classroom&apos;s QR codes and deep links.
                                    </Text>
                                </FormControl>
                            )}

                            {(mode === 'create' || mode === 'edit') && (
                                <FormControl>
                                    <FormControlLabel>
                                        <FormControlLabelText sx={{ color: colors.textSecondary }}>
                                            {t('classroom.description') || 'Brief Description'}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        sx={{
                                            minHeight: 100,
                                            backgroundColor: colors.tertiary,
                                            borderColor: colors.border,
                                            borderRadius: Theme.corners.comfortable
                                        }}
                                    >
                                        <InputField
                                            placeholder={t('classroom.descPlaceholder') || "e.g., Daily announcements and resource sharing."}
                                            value={state.details.description}
                                            onChangeText={(text: string) => updateDetails({ description: text })}
                                            multiline
                                            numberOfLines={4}
                                            color={colors.text}
                                            placeholderTextColor={colors.textTertiary}
                                        />
                                    </Input>
                                </FormControl>
                            )}

                            {mode === 'join' && (
                                <Box sx={{ marginBottom: Theme.spacing.md }}>
                                    <Button
                                        variant="outline"
                                        onPress={() => setIsScannerOpen(true)}
                                        sx={{ borderColor: Theme.colors.sanctuarySaffron }}
                                    >
                                        <HStack sx={{ gap: Theme.spacing.sm }} alignItems="center">
                                            <ScanLine color={Theme.colors.sanctuarySaffron} size={20} />
                                            <ButtonText {...({ color: Theme.colors.sanctuarySaffron } as any)}>
                                                {t('classroom.scanQrToJoin') || 'Scan QR to Join'}
                                            </ButtonText>
                                        </HStack>
                                    </Button>

                                    {schoolId && (
                                        <HStack alignItems="center" sx={{ marginVertical: Theme.spacing.md }}>
                                            <Box sx={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                                            <Text sx={{ color: colors.textTertiary, paddingHorizontal: Theme.spacing.md, fontSize: Theme.typography.fontSize.sm }}>
                                                {t('common.or') || 'OR'}
                                            </Text>
                                            <Box sx={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                                        </HStack>
                                    )}

                                    {schoolId && (
                                        <VStack sx={{ gap: Theme.spacing.md }}>
                                            <FormControl isRequired>
                                                <FormControlLabel>
                                                    <FormControlLabelText sx={{ color: colors.textSecondary }}>
                                                        {t('classroom.selectSection') || 'Select Section'}
                                                    </FormControlLabelText>
                                                </FormControlLabel>
                                                <Box sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                                    {sections.map((section) => (
                                                        <Button
                                                            key={section.id}
                                                            variant={state.academic.sectionId === section.id ? 'solid' : 'outline'}
                                                            size="sm"
                                                            onPress={() => handleSectionChange(section.id)}
                                                            sx={{
                                                                backgroundColor: state.academic.sectionId === section.id ? Theme.colors.sanctuarySaffron : 'transparent',
                                                                borderColor: state.academic.sectionId === section.id ? Theme.colors.sanctuarySaffron : colors.border,
                                                            }}
                                                        >
                                                            <ButtonText color={state.academic.sectionId === section.id ? text.inverse : colors.textSecondary}>
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
                        </>
                    )}

                    {state.step === 2 && (
                        <>
                            {schoolId && (
                                <VStack sx={{ gap: Theme.spacing.md }}>
                                    <FormControl isRequired>
                                        <FormControlLabel>
                                            <FormControlLabelText sx={{ color: colors.textSecondary }}>
                                                {t('classroom.selectGrade') || 'Target Grade'}
                                            </FormControlLabelText>
                                        </FormControlLabel>
                                        <Box sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                            {grades.map((grade) => (
                                                <Button
                                                    key={grade.id}
                                                    variant={state.academic.gradeId === grade.id ? 'solid' : 'outline'}
                                                    size="xs"
                                                    onPress={() => handleGradeChange(grade.id)}
                                                    sx={{
                                                        paddingHorizontal: 8,
                                                        backgroundColor: state.academic.gradeId === grade.id ? Theme.colors.sanctuarySaffron : 'transparent',
                                                        borderColor: state.academic.gradeId === grade.id ? Theme.colors.sanctuarySaffron : colors.border,
                                                    }}
                                                >
                                                    <ButtonText color={state.academic.gradeId === grade.id ? text.inverse : colors.textSecondary}>
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
                                    <FormControlLabelText sx={{ color: colors.textSecondary }}>
                                        {t('classroom.labelSubject') || 'Core Subject'}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <HStack flexWrap="wrap" sx={{ gap: 8 }}>
                                    {availableSubjects.map((sub: any) => (
                                        <Button
                                            key={sub.id}
                                            variant={state.academic.subject === sub.id ? 'solid' : 'outline'}
                                            size="xs"
                                            onPress={() => updateAcademic({ subject: sub.id })}
                                            sx={{
                                                backgroundColor: state.academic.subject === sub.id ? Theme.colors.sanctuarySaffron : 'transparent',
                                                borderColor: state.academic.subject === sub.id ? Theme.colors.sanctuarySaffron : colors.border,
                                            }}
                                        >
                                            <ButtonText color={state.academic.subject === sub.id ? text.inverse : colors.textSecondary}>
                                                {sub.en}
                                            </ButtonText>
                                        </Button>
                                    ))}
                                </HStack>
                            </FormControl>

                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText sx={{ color: colors.textSecondary }}>
                                        {t('classroom.theme') || 'Sanctuary Theme'}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <HStack sx={{ flexWrap: 'wrap', gap: 12, paddingVertical: 4 }}>
                                    {CLASSROOM_THEMES.map((theme) => (
                                        <Pressable key={theme.id} onPress={() => updateAesthetics({ themeId: theme.id })}>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 20,
                                                    backgroundColor: theme.color,
                                                    borderWidth: state.aesthetics.themeId === theme.id ? 3 : 0,
                                                    borderColor: Theme.colors.sanctuarySaffron,
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                {state.aesthetics.themeId === theme.id && <Box sx={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'white' }} />}
                                            </Box>
                                        </Pressable>
                                    ))}
                                </HStack>
                            </FormControl>

                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText sx={{ color: colors.textSecondary }}>
                                        {t('classroom.labelType') || 'Institutional Role'}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <HStack sx={{ gap: Theme.spacing.md }}>
                                    {(['own', 'subject'] as const).map((type) => (
                                        <Button
                                            key={type}
                                            variant={state.aesthetics.classType === type ? 'solid' : 'outline'}
                                            onPress={() => updateAesthetics({ classType: type })}
                                            sx={{
                                                flex: 1,
                                                backgroundColor: state.aesthetics.classType === type ? Theme.colors.sanctuarySaffron : 'transparent',
                                                borderColor: state.aesthetics.classType === type ? Theme.colors.sanctuarySaffron : colors.border,
                                                height: 48
                                            }}
                                        >
                                            <ButtonText color={state.aesthetics.classType === type ? text.inverse : colors.textSecondary}>
                                                {type === 'own' ? (t('classroom.roleClassTeacher') || 'Class Teacher') : (t('classroom.roleSubjectTeacher') || 'Subject Teacher')}
                                            </ButtonText>
                                        </Button>
                                    ))}
                                </HStack>
                            </FormControl>
                        </>
                    )}

                    {state.step === 3 && (
                        <VStack sx={{ gap: Theme.spacing.xl, alignItems: 'center', paddingVertical: Theme.spacing.lg }}>
                            <Box sx={{ backgroundColor: 'rgba(246,191,140,0.1)', padding: 24, borderRadius: 60 }}>
                                <Icon as={Globe} color={Theme.colors.sanctuarySaffron} size={64} />
                            </Box>
                            
                            <VStack sx={{ gap: Theme.spacing.sm, alignItems: 'center' }}>
                                <Heading color={colors.text} size="xl" sx={{ textAlign: 'center' }}>
                                    Sanctuary Established!
                                </Heading>
                                <Text sx={{ textAlign: 'center', color: colors.textSecondary }}>
                                    Your classroom <Text sx={{ fontWeight: 'bold', color: colors.text }}>{state.details.name}</Text> is ready for the breath-like learning journey.
                                </Text>
                            </VStack>

                            <Box sx={{ backgroundColor: colors.tertiary, padding: Theme.spacing.lg, borderRadius: Theme.corners.generous, width: '100%' }}>
                                <VStack sx={{ gap: Theme.spacing.md }}>
                                    <HStack sx={{ gap: Theme.spacing.sm, alignItems: 'center' }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Theme.colors.sanctuarySaffron }} />
                                        <Text sx={{ fontSize: 14, color: colors.text }}>Classroom Hub Initialized</Text>
                                    </HStack>
                                    <HStack sx={{ gap: Theme.spacing.sm, alignItems: 'center' }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Theme.colors.sanctuarySaffron }} />
                                        <Text sx={{ fontSize: 14, color: colors.text }}>Linked Sanctuary Group Active</Text>
                                    </HStack>
                                    <HStack sx={{ gap: Theme.spacing.sm, alignItems: 'center' }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Theme.colors.sanctuarySaffron }} />
                                        <Text sx={{ fontSize: 14, color: colors.text }}>QR Code & Handle Registered</Text>
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
