import React, { useState } from 'react';
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
    Heading,
    Icon,
} from '@repo/ui';
import { Theme } from '@repo/ui';
import { 
    api, 
    supabase, 
    SRI_LANKAN_SUBJECTS_BY_LEVEL, 
    SYLLABUS_VERSIONS, 
    CLASSROOM_THEMES, 
    identityAPI, 
    useClassroomCreation 
} from '@repo/core';
import { communityAPI } from '@repo/community';
import { useTranslation } from 'react-i18next';
import { hapticLight, hapticSuccess, Textarea, SanctuaryInput } from '@repo/ui';
import { useThemedColors } from '@repo/ui';
import { useFeatureAccess, handleAPIError } from '@repo/core';
import GuestConversionPrompt from '../shared/GuestConversionPrompt';
import { useNavigation } from '@react-navigation/native';
import { ScannerModal, resolveQR } from '@repo/scanner-kit';
import { ScanLine, Globe } from 'lucide-react-native';

interface CreateClassroomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newClass: any) => void;
    mode?: 'create' | 'join' | 'edit';
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
    initialData,
}: CreateClassroomModalProps) {
    const { 
        state, 
        updateStep, 
        updateDetails, 
        updateAcademic, 
        updateAesthetics,
        resetProgress 
    } = useClassroomCreation();
    
    const { t } = useTranslation();
    const colors = useThemedColors();
    const { text, glass, accent } = useTheme();
    const navigation = useNavigation();
    
    // Guest support
    const { isGuest, canCreateClassroom } = useFeatureAccess();
    const [showGuestPrompt, setShowGuestPrompt] = useState(false);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sections, setSections] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]);
    const [schoolId, setSchoolId] = useState<string | null>(null);
    const [availableSubjects, setAvailableSubjects] = useState<readonly any[]>([]);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
    const [availableClassrooms, setAvailableClassrooms] = useState<any[]>([]);
    const [createdIds, setCreatedIds] = useState<{ classroomId: string; groupId?: string } | null>(null);

    const isEdit = mode === 'edit';
    const isJoin = mode === 'join';

    const fetchInitialData = async () => {
        try {
            const userId = await identityAPI.getMyInternalId();
            if (!userId) return;

            const { data: userData } = await supabase
                .from('users')
                .select('school_id')
                .eq('id', userId)
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

    React.useEffect(() => {
        if (isOpen) {
            fetchInitialData();
            if (initialData && isEdit) {
                updateDetails({
                    name: initialData.name,
                    handle: initialData.handle || '',
                    description: initialData.description || '',
                });
                updateAcademic({
                    subject: initialData.subject || '',
                    syllabusId: initialData.syllabusId || 'legacy',
                });
                updateAesthetics({
                    themeId: initialData.themeId || 'saffron',
                });
            }
        }
    }, [isOpen, initialData, mode]);

    const handleSectionChange = async (sectionId: string) => {
        updateAcademic({ sectionId, gradeId: '' });
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

        // Update available subjects contextually
        if (grade) {
            const num = parseInt(grade.number);
            let subjects: any[] = [];
            if (num >= 1 && num <= 5) subjects = SRI_LANKAN_SUBJECTS_BY_LEVEL.primary as any;
            else if (num >= 6 && num <= 9) subjects = SRI_LANKAN_SUBJECTS_BY_LEVEL.junior as any;
            else if (num === 10 || num === 11) subjects = SRI_LANKAN_SUBJECTS_BY_LEVEL.ordinary_level as any;
            else if (num === 12 || num === 13) subjects = SRI_LANKAN_SUBJECTS_BY_LEVEL.advanced_level as any;
            setAvailableSubjects(subjects);
        } else {
            setAvailableSubjects([]);
        }

        try {
            // Fetch classrooms for this grade
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
                result = await api.classrooms.update(selectedClassroomId, {
                    teacher_id: userId
                });
            } else if (mode === 'edit') {
                if (!initialData?.id) throw new Error('Classroom ID missing for edit');
                result = await api.classrooms.update(initialData.id, {
                    name: details.name.trim(),
                    subject: academic.subject.trim(),
                    handle: details.handle.trim() || undefined,
                    description: details.description.trim(),
                    color_theme: aesthetics.themeId,
                    syllabus_version: academic.syllabusId,
                });
            } else {
                result = await api.classrooms.create({
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
                // Directly join if it's a join mode scan
                const userId = await identityAPI.getMyInternalId();
                if (userId) {
                    const result = await api.classrooms.update(classroomId, {
                        teacher_id: userId
                    });
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
                                <SanctuaryInput
                                    label="Classroom Handle (unique ID)"
                                    placeholder="e.g. grade-10-maths"
                                    value={state.details.handle}
                                    onChangeText={(text: string) => updateDetails({ handle: text.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                                    helperText="Used for your classroom's QR codes and deep links."
                                    leftIcon={Globe}
                                />
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

