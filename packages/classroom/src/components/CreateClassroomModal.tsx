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
} from '@repo/ui';
import { Theme } from '@repo/ui';
import { api, supabase, SRI_LANKAN_SUBJECTS_BY_LEVEL, SYLLABUS_VERSIONS, CLASSROOM_THEMES, identityAPI } from '@repo/core';
import { communityAPI } from '@repo/community';
import { useTranslation } from 'react-i18next';
import { hapticLight, hapticSuccess, Textarea } from '@repo/ui';
import { useThemedColors } from '@repo/ui';
import { useFeatureAccess, handleAPIError } from '@repo/core';
import GuestConversionPrompt from '../shared/GuestConversionPrompt';
import { useNavigation } from '@react-navigation/native';
import { ScannerModal, resolveQR } from '@repo/scanner-kit';
import { ScanLine } from 'lucide-react-native';

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
    const { text, accent, glass } = useTheme();

    const [sections, setSections] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]);
    const [selectedSectionId, setSelectedSectionId] = useState<string>('');
    const [selectedGradeId, setSelectedGradeId] = useState<string>('');
    const [availableClassrooms, setAvailableClassrooms] = useState<any[]>([]);
    const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
    const [isJoining, setIsJoining] = useState(false);
    const [schoolId, setSchoolId] = useState<string | null>(null);

    // New enhancement fields
    const [description, setDescription] = useState('');
    const [themeId, setThemeId] = useState('saffron');
    const [syllabusId, setSyllabusId] = useState('legacy');
    const [availableSubjects, setAvailableSubjects] = useState<readonly any[]>([]);

    // Scanner state
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    // Guest support
    const { isGuest, canCreateClassroom } = useFeatureAccess();
    const [showGuestPrompt, setShowGuestPrompt] = useState(false);
    const navigation = useNavigation();

    const handleScan = (data: string) => {
        const result = resolveQR(data);
        if (!result.ok || result.payload.action !== 'join_class') {
            // Fallback: treat raw string as classroom ID for unknown formats
            setSelectedClassroomId(data);
            return;
        }
        setSelectedClassroomId(result.payload.classroom_id);
        // We could auto-submit here, but letting the user see what they selected and click join is safer
    };

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
        const grade = grades.find(g => g.id === gradeId);
        setSelectedGradeId(gradeId);
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
            const { data, error } = await supabase
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
            } else {
                result = await api.classrooms.create({
                    name: name.trim(),
                    subject: subject.trim(),
                    school_id: schoolId,
                    teacher_id: userId,
                    grade_id: selectedGradeId || null,
                    section_id: selectedSectionId || null,
                    color_theme: themeId,
                    description: description.trim(),
                    syllabus_version: syllabusId,
                });

                // Create linked sanctuary group — creator auto-added as owner
                if (result && schoolId) {
                    await communityAPI.createGroupWithOwner({
                        name: `${name.trim()} Sanctuary`,
                        description: `A sacred space for the ${name.trim()} classroom ${subject ? `(${subject}) ` : ''}discussions and heart-sharing.`,
                        group_type: 'class',
                        join_policy: 'approval_required',
                        school_id: schoolId,
                        classroom_id: result.id
                    }, userId);
                }
            }

            hapticSuccess();
            onSuccess(result);
            handleClose();
        } catch (err: any) {
            const apiError = handleAPIError(err, true);
            setError(apiError.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setName('');
        setSubject('');
        setDescription('');
        setThemeId('saffron');
        setSyllabusId('legacy');
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
            <SanctuaryModal
                isOpen={isOpen}
                onClose={handleClose}
                title={mode === 'join'
                    ? (t('classroom.joinTitle') || 'Join Existing Class')
                    : (t('classroom.createTitle') || 'Create New Class')
                }
                footer={
                    <HStack sx={{ gap: Theme.spacing.md, width: '100%' }}>
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
                            onPress={handleSubmit}
                            sx={{
                                flex: 1,
                                backgroundColor: accent.action,
                                borderRadius: Theme.corners.comfortable,
                            }}
                            isDisabled={
                                isSubmitting ||
                                (mode === 'create' && (!name.trim() || (classType === 'subject' && !subject.trim()))) ||
                                (mode === 'join' && !selectedClassroomId)
                            }
                        >
                            {isSubmitting ? (
                                <Spinner {...({ color: text.inverse, size: "small" } as any)} />
                            ) : (
                                <ButtonText {...({ color: text.inverse } as any)}>
                                    {mode === 'join'
                                        ? (t('common.join') || 'Join')
                                        : (t('common.create') || 'Create')
                                    }
                                </ButtonText>
                            )}
                        </Button>
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

                    {mode === 'create' && (
                        <FormControl isRequired isInvalid={!!error}>
                            <FormControlLabel>
                                <FormControlLabelText sx={{ color: colors.textSecondary }}>
                                    {t('classroom.labelClassName') || 'Class Name'}
                                </FormControlLabelText>
                            </FormControlLabel>
                            <Input
                                sx={{
                                    backgroundColor: colors.tertiary,
                                    borderColor: colors.border,
                                    height: 48,
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

                    {mode === 'join' && (
                        <Box sx={{ marginBottom: Theme.spacing.md }}>
                            <Button
                                variant="outline"
                                onPress={() => setIsScannerOpen(true)}
                                sx={{ borderColor: accent.action }}
                            >
                                <HStack sx={{ gap: Theme.spacing.sm }} alignItems="center">
                                    <ScanLine color={accent.action} size={20} />
                                    <ButtonText {...({ color: accent.action } as any)}>
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
                        </Box>
                    )}

                    {/* Grade & Section Selection (if in school) */}
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
                                            variant={selectedSectionId === section.id ? 'solid' : 'outline'}
                                            size="sm"
                                            onPress={() => handleSectionChange(section.id)}
                                            sx={{
                                                backgroundColor: selectedSectionId === section.id ? accent.action : 'transparent',
                                                borderColor: selectedSectionId === section.id ? accent.action : colors.border,
                                            }}
                                        >
                                            <ButtonText color={selectedSectionId === section.id ? text.inverse : colors.textSecondary}>
                                                {section.name}
                                            </ButtonText>
                                        </Button>
                                    ))}
                                </Box>
                            </FormControl>

                            {selectedSectionId && grades.length > 0 && (
                                <FormControl isRequired>
                                    <FormControlLabel>
                                        <FormControlLabelText sx={{ color: colors.textSecondary }}>
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
                                                    backgroundColor: selectedGradeId === grade.id ? accent.action : 'transparent',
                                                    borderColor: selectedGradeId === grade.id ? accent.action : colors.border,
                                                }}
                                            >
                                                <ButtonText color={selectedGradeId === grade.id ? text.inverse : colors.textSecondary}>
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
                                        <FormControlLabelText sx={{ color: colors.textSecondary }}>
                                            {t('classroom.selectClassToJoin') || 'Select Classroom to Join'}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <VStack sx={{ gap: Theme.spacing.sm }}>
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
                                                        borderColor: selectedClassroomId === cls.id ? accent.action : colors.border,
                                                    }}
                                                >
                                                    <HStack justifyContent="space-between" alignItems="center">
                                                        <VStack>
                                                            <Text sx={{ color: colors.text, fontWeight: 'bold' }}>{cls.name}</Text>
                                                            <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.xs }}>{cls.subject || t('classroom.noSubject') || 'No subject'}</Text>
                                                        </VStack>
                                                        {selectedClassroomId === cls.id && (
                                                            <Box sx={{ backgroundColor: accent.action, borderRadius: 10, padding: 2 }}>
                                                                <Text {...({ color: text.inverse } as any)} sx={{ fontSize: Theme.typography.fontSize.xs, fontWeight: 'bold', paddingHorizontal: 4 }}>{t('common.selected') || 'SELECTED'}</Text>
                                                            </Box>
                                                        )}
                                                    </HStack>
                                                </Box>
                                            </Pressable>
                                        ))}
                                    </VStack>
                                </FormControl>
                            )}

                            {mode === 'join' && selectedClassroomId && !availableClassrooms.find(c => c.id === selectedClassroomId) && (
                                <Box sx={{
                                    padding: Theme.spacing.md,
                                    borderRadius: Theme.corners.comfortable,
                                    backgroundColor: colors.tertiary,
                                    borderWidth: 1,
                                    borderColor: accent.action,
                                    marginTop: Theme.spacing.sm
                                }}>
                                    <HStack sx={{ gap: Theme.spacing.sm }} alignItems="center">
                                        <ScanLine color={accent.action} size={20} />
                                        <Text sx={{ color: colors.text, fontWeight: 'bold' }}>
                                            Scanned Classroom Ready
                                        </Text>
                                    </HStack>
                                    <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.xs, marginTop: 4 }}>
                                        Classroom ID: {selectedClassroomId.substring(0, 8)}...
                                    </Text>
                                </Box>
                            )}

                            {mode === 'join' && selectedGradeId && availableClassrooms.length === 0 && !selectedClassroomId && (
                                <Text sx={{ color: colors.textTertiary, fontSize: Theme.typography.fontSize.sm, textAlign: 'center', marginTop: Theme.spacing.md }}>
                                    {t('classroom.noAvailableClasses') || 'No unassigned classrooms found for this grade.'}
                                </Text>
                            )}
                        </VStack>
                    )}

                    {mode === 'create' && (
                        <>
                            {/* Subject Selection - Context Aware */}
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
                                            variant={subject === sub.id ? 'solid' : 'outline'}
                                            size="xs"
                                            onPress={() => setSubject(sub.id)}
                                            sx={{
                                                backgroundColor: subject === sub.id ? accent.action : 'transparent',
                                                borderColor: subject === sub.id ? accent.action : colors.border,
                                            }}
                                        >
                                            <ButtonText color={subject === sub.id ? text.inverse : colors.textSecondary}>
                                                {sub.en}
                                            </ButtonText>
                                        </Button>
                                    ))}
                                    {/* Fallback for "Other" or custom */}
                                    <Input
                                        sx={{
                                            flex: 1,
                                            minWidth: 120,
                                            height: 40,
                                            backgroundColor: colors.tertiary,
                                            borderColor: colors.border,
                                        }}
                                    >
                                        <InputField
                                            placeholder={t('classroom.customSubject') || "Other..."}
                                            value={availableSubjects.find(s => s.id === subject) ? '' : subject}
                                            onChangeText={setSubject}
                                            color={colors.text}
                                            placeholderTextColor={colors.textTertiary}
                                        />
                                    </Input>
                                </HStack>
                            </FormControl>

                            {/* Syllabus Version */}
                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText sx={{ color: colors.textSecondary }}>
                                        {t('classroom.syllabusVersion') || 'Syllabus Version'}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <HStack sx={{ gap: Theme.spacing.md }}>
                                    {SYLLABUS_VERSIONS.map((v) => (
                                        <Button
                                            key={v.id}
                                            variant={syllabusId === v.id ? 'solid' : 'outline'}
                                            size="sm"
                                            onPress={() => setSyllabusId(v.id)}
                                            sx={{
                                                flex: 1,
                                                backgroundColor: syllabusId === v.id ? colors.text : 'transparent',
                                                borderColor: colors.border,
                                            }}
                                        >
                                            <ButtonText color={syllabusId === v.id ? colors.secondary : colors.textSecondary}>
                                                {v.en.split(' ')[0]}
                                            </ButtonText>
                                        </Button>
                                    ))}
                                </HStack>
                            </FormControl>

                            {/* Theme Picker */}
                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText sx={{ color: colors.textSecondary }}>
                                        {t('classroom.theme') || 'Classroom Theme'}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <HStack sx={{ flexWrap: 'wrap', gap: 12, paddingVertical: 4 }}>
                                    {CLASSROOM_THEMES.map((theme) => (
                                        <Pressable
                                            key={theme.id}
                                            onPress={() => setThemeId(theme.id)}
                                        >
                                            <Box
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: 16,
                                                    backgroundColor: theme.color,
                                                    borderWidth: themeId === theme.id ? 3 : 0,
                                                    borderColor: colors.text,
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}
                                            />
                                        </Pressable>
                                    ))}
                                </HStack>
                            </FormControl>

                            {/* Description */}
                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText sx={{ color: colors.textSecondary }}>
                                        {t('classroom.description') || 'Description'}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Input
                                    sx={{
                                        minHeight: 80,
                                        backgroundColor: colors.tertiary,
                                        borderColor: colors.border,
                                    }}
                                >
                                    <InputField
                                        placeholder={t('classroom.descPlaceholder') || "e.g., Daily announcements, resource sharing for 10-A Maths."}
                                        value={description}
                                        onChangeText={setDescription}
                                        multiline
                                        numberOfLines={3}
                                        color={colors.text}
                                        placeholderTextColor={colors.textTertiary}
                                    />
                                </Input>
                            </FormControl>

                            {/* Classroom Type Selection */}
                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText sx={{ color: colors.textSecondary }}>
                                        {t('classroom.labelType') || 'Teacher Role for this Class'}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <HStack sx={{ gap: Theme.spacing.md }}>
                                    <Button
                                        variant={classType === 'own' ? 'solid' : 'outline'}
                                        action={classType === 'own' ? 'primary' : 'secondary'}
                                        onPress={() => setClassType('own')}
                                        sx={{
                                            flex: 1,
                                            backgroundColor: classType === 'own' ? accent.action : 'transparent',
                                            borderColor: classType === 'own' ? accent.action : glass.interact.border,
                                            borderRadius: Theme.corners.comfortable,
                                        }}
                                    >
                                        <ButtonText {...({ color: classType === 'own' ? text.inverse : text.secondary } as any)}>
                                            {t('classroom.roleClassTeacher') || 'Class Teacher'}
                                        </ButtonText>
                                    </Button>
                                    <Button
                                        variant={classType === 'subject' ? 'solid' : 'outline'}
                                        action={classType === 'subject' ? 'primary' : 'secondary'}
                                        onPress={() => setClassType('subject')}
                                        sx={{
                                            flex: 1,
                                            backgroundColor: classType === 'subject' ? accent.action : 'transparent',
                                            borderColor: classType === 'subject' ? accent.action : glass.interact.border,
                                            borderRadius: Theme.corners.comfortable,
                                        }}
                                    >
                                        <ButtonText {...({ color: classType === 'subject' ? text.inverse : text.secondary } as any)}>
                                            {t('classroom.roleSubjectTeacher') || 'Subject Teacher'}
                                        </ButtonText>
                                    </Button>
                                </HStack>
                            </FormControl>
                        </>
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

