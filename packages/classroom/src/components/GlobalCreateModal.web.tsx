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
    SanctuaryModal,
    useThemedColors,
    Theme,
    Actionsheet,
    ActionsheetBackdrop,
    ActionsheetContent,
    ActionsheetDragIndicatorWrapper,
    ActionsheetDragIndicator,
    ActionsheetItem,
    ActionsheetItemText,
    Icon,
    Textarea
} from '@repo/ui';
import {
    api,
    supabase,
    School,
    handleAPIError,
    growthSignalsAPI,
} from '@repo/core';
import { communityAPI } from '@repo/community';
import { useTranslation } from 'react-i18next';
import {
    School as SchoolIcon,
    LayoutGrid,
    Users,
    Plus,
    ChevronDown,
    Activity,
    Globe
} from 'lucide-react-native';

interface GlobalCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (type: 'school' | 'classroom' | 'group', data: any) => void;
    availableSchools: School[];
}

type CreateType = 'school' | 'classroom' | 'group';

/**
 * GlobalCreateModal.web
 * 
 * Optimized web version of the Global Creation Modal.
 * Uses wider layout and web-native interactions where appropriate.
 */
export default function GlobalCreateModal({
    isOpen,
    onClose,
    onSuccess,
    availableSchools
}: GlobalCreateModalProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();

    const [type, setType] = useState<CreateType>('school');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
    const [schoolType, setSchoolType] = useState<'primary' | 'secondary' | 'mixed'>('mixed');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSchoolPicker, setShowSchoolPicker] = useState(false);

    const resetForm = () => {
        setName('');
        setDescription('');
        setSelectedSchoolId('');
        setSchoolType('mixed');
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        if (type !== 'school' && !selectedSchoolId) {
            setError('Please select a target school');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            let result;
            if (type === 'school') {
                // 1. Create the school
                result = await api.founder.createSchool({
                    name: name.trim(),
                    type: schoolType,
                    created_by: user.id
                });

                // 2. Create the Primary Sanctuary Group for this school
                if (result) {
                    await communityAPI.createGroupWithOwner({
                        name: `${name.trim()} Sanctuary`,
                        description: `The primary sanctuary for ${name.trim()} members to share and resonate.`,
                        group_type: 'school',
                        join_policy: 'open',
                        school_id: result.id
                    }, user.id);
                }
            } else if (type === 'classroom') {
                // 1. Create the classroom
                result = await api.founder.createClassroom({
                    school_id: selectedSchoolId,
                    name: name.trim(),
                    grade_number: 1, // Default to 1
                    created_by: user.id
                });

                // 2. Create the Class Sanctuary Group
                if (result) {
                    await communityAPI.createGroupWithOwner({
                        name: `${name.trim()} Sanctuary`,
                        description: `A sacred space for the ${name.trim()} classroom discussions and heart-sharing.`,
                        group_type: 'class',
                        join_policy: 'restricted',
                        school_id: selectedSchoolId,
                        classroom_id: result.id
                    }, user.id);
                }
            } else if (type === 'group') {
                // Use standard community logic to ensure owner assignment
                result = await communityAPI.createGroupWithOwner({
                    name: name.trim(),
                    description: description.trim(),
                    school_id: selectedSchoolId,
                    group_type: 'general',
                    join_policy: 'open'
                }, user.id);
            }

            // Growth signals — fire-and-forget
            if (type === 'classroom' && result) {
                void growthSignalsAPI.emitSignal(user.id, 'classroom_created', {
                    classroom_id: result.id,
                    school_id: selectedSchoolId,
                }).catch(() => {});
            }
            onSuccess(type, result);
            handleClose();
        } catch (err: any) {
            const apiError = handleAPIError(err, true);
            setError(apiError.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedSchool = availableSchools.find(s => s.id === selectedSchoolId);

    return (
        <>
            <SanctuaryModal
                isOpen={isOpen}
                onClose={handleClose}
                title="Ecosystem Creation"
                width={500} // Slightly wider for web
                footer={
                    <HStack sx={{ gap: Theme.spacing.md, width: '100%' }}>
                        <Button
                            variant="outline"
                            action="secondary"
                            onPress={handleClose}
                            sx={{
                                flex: 1,
                                borderColor: colors.border,
                                '&:hover': { backgroundColor: colors.tertiary }
                            }}
                            isDisabled={isSubmitting}
                        >
                            <ButtonText color={colors.textSecondary}>Cancel</ButtonText>
                        </Button>
                        <Button
                            action="primary"
                            onPress={handleSubmit}
                            sx={{
                                flex: 2, // Larger primary button
                                backgroundColor: Theme.colors.sanctuarySaffron,
                                '&:hover': { opacity: 0.9 }
                            }}
                            isDisabled={isSubmitting || !name.trim()}
                        >
                            {isSubmitting ? (
                                <Spinner color={Theme.colors.sacredWhite} size="small" />
                            ) : (
                                <ButtonText color={Theme.colors.sacredWhite}>Initialize Entity</ButtonText>
                            )}
                        </Button>
                    </HStack>
                }
            >
                <VStack sx={{ gap: Theme.spacing.xl }}>
                    {/* Entity Type Selector - Web Grid Style */}
                    <HStack sx={{ gap: Theme.spacing.sm }}>
                        <TypeButton
                            active={type === 'school'}
                            onPress={() => setType('school')}
                            label="New Institution"
                            icon={<SchoolIcon size={18} />}
                        />
                        <TypeButton
                            active={type === 'classroom'}
                            onPress={() => setType('classroom')}
                            label="New Classroom"
                            icon={<LayoutGrid size={18} />}
                        />
                        <TypeButton
                            active={type === 'group'}
                            onPress={() => setType('group')}
                            label="New Sanctuary"
                            icon={<Users size={18} />}
                        />
                    </HStack>

                    {error && (
                        <Box sx={{
                            padding: 12,
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: '#ef4444'
                        }}>
                            <HStack sx={{ gap: 8, alignItems: 'center' }}>
                                <Activity size={14} color="#ef4444" />
                                <Text sx={{ color: '#ef4444', fontSize: 13, fontWeight: '600' }}>{error}</Text>
                            </HStack>
                        </Box>
                    )}

                    <VStack sx={{ gap: Theme.spacing.lg }}>
                        {/* Target School Picker for non-school entities */}
                        {type !== 'school' && (
                            <FormControl isRequired>
                                <FormControlLabel>
                                    <FormControlLabelText color={colors.textSecondary}>Associated Institution</FormControlLabelText>
                                </FormControlLabel>
                                <Button
                                    variant="outline"
                                    onPress={() => setShowSchoolPicker(true)}
                                    sx={{
                                        justifyContent: 'space-between',
                                        borderColor: colors.border,
                                        backgroundColor: colors.tertiary,
                                        height: 52,
                                        borderRadius: 12,
                                        '&:hover': { borderColor: Theme.colors.sanctuarySaffron }
                                    }}
                                >
                                    <HStack sx={{ gap: 8, alignItems: 'center' }}>
                                        <Globe size={16} color={colors.textTertiary} />
                                        <ButtonText color={selectedSchoolId ? colors.text : colors.textTertiary}>
                                            {selectedSchool ? selectedSchool.name : "Select Target Institution..."}
                                        </ButtonText>
                                    </HStack>
                                    <ChevronDown size={18} color={colors.textSecondary} />
                                </Button>
                            </FormControl>
                        )}

                        <FormControl isRequired>
                            <FormControlLabel>
                                <FormControlLabelText color={colors.textSecondary}>
                                    {type === 'school' ? 'Institution Name' : type === 'classroom' ? 'Classroom Display Name' : 'Community Name'}
                                </FormControlLabelText>
                            </FormControlLabel>
                            <Input sx={{
                                height: 52,
                                backgroundColor: colors.tertiary,
                                borderColor: colors.border,
                                borderRadius: 12,
                                '&:focus': { borderColor: Theme.colors.sanctuarySaffron }
                            }}>
                                <InputField
                                    value={name}
                                    onChangeText={setName}
                                    color={colors.text}
                                    placeholder={type === 'school' ? "e.g., Royal Gurudevi Academy" : "Enter name..."}
                                    // @ts-ignore
                                    style={{ outline: 'none' }}
                                />
                            </Input>
                        </FormControl>

                        {type === 'school' && (
                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText color={colors.textSecondary}>Institutional Category</FormControlLabelText>
                                </FormControlLabel>
                                <HStack sx={{ gap: 12 }}>
                                    {(['primary', 'secondary', 'mixed'] as const).map(t => (
                                        <Button
                                            key={t}
                                            variant={schoolType === t ? 'solid' : 'outline'}
                                            onPress={() => setSchoolType(t)}
                                            sx={{
                                                flex: 1,
                                                height: 44,
                                                borderRadius: 22,
                                                backgroundColor: schoolType === t ? Theme.colors.sanctuarySaffron : 'transparent',
                                                borderColor: schoolType === t ? Theme.colors.sanctuarySaffron : colors.border,
                                                '&:hover': { opacity: 0.9 }
                                            }}
                                        >
                                            <ButtonText color={schoolType === t ? '#fff' : colors.textSecondary} sx={{ fontSize: 13 }}>
                                                {t.charAt(0).toUpperCase() + t.slice(1)}
                                            </ButtonText>
                                        </Button>
                                    ))}
                                </HStack>
                            </FormControl>
                        )}

                        {type === 'group' && (
                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText color={colors.textSecondary}>Intent & Purpose</FormControlLabelText>
                                </FormControlLabel>
                                <Textarea
                                    value={description}
                                    onChangeText={setDescription}
                                    color={colors.text}
                                    placeholder="Describe the heart and intent of this sanctuary space..."
                                    sx={{
                                        minHeight: 120,
                                        backgroundColor: colors.tertiary,
                                        borderColor: colors.border,
                                        borderRadius: 16,
                                        padding: 12
                                    }}
                                />
                            </FormControl>
                        )}
                    </VStack>
                </VStack>
            </SanctuaryModal>

            {/* School Picker Sheet - Responsive Actionsheet */}
            <Actionsheet isOpen={showSchoolPicker} onClose={() => setShowSchoolPicker(false)}>
                <ActionsheetBackdrop />
                <ActionsheetContent sx={{
                    backgroundColor: colors.secondary,
                    maxWidth: 500, // Keep it centered/compact on web
                    alignSelf: 'center'
                }}>
                    <ActionsheetDragIndicatorWrapper>
                        <ActionsheetDragIndicator />
                    </ActionsheetDragIndicatorWrapper>
                    <VStack sx={{ padding: 24, gap: 12 }}>
                        <Text sx={{ fontSize: 18, fontWeight: '800', marginBottom: 8 }}>Select Institution</Text>
                        {availableSchools.map(school => (
                            <ActionsheetItem
                                key={school.id}
                                onPress={() => {
                                    setSelectedSchoolId(school.id);
                                    setShowSchoolPicker(false);
                                }}
                                sx={{
                                    borderRadius: 12,
                                    marginVertical: 4,
                                    '&:hover': { backgroundColor: colors.tertiary }
                                }}
                            >
                                <HStack sx={{ gap: 12, alignItems: 'center' }}>
                                    <SchoolIcon size={18} color={Theme.colors.sanctuarySaffron} />
                                    <ActionsheetItemText color={colors.text}>{school.name}</ActionsheetItemText>
                                </HStack>
                            </ActionsheetItem>
                        ))}
                    </VStack>
                </ActionsheetContent>
            </Actionsheet>
        </>
    );
}

function TypeButton({ active, onPress, label, icon }: { active: boolean, onPress: () => void, label: string, icon: any }) {
    const colors = useThemedColors();
    return (
        <Button
            variant={active ? 'solid' : 'outline'}
            onPress={onPress}
            sx={{
                flex: 1,
                flexDirection: 'column',
                height: 80,
                gap: 8,
                borderRadius: 16,
                backgroundColor: active ? Theme.colors.sanctuarySaffron : 'transparent',
                borderColor: active ? Theme.colors.sanctuarySaffron : colors.border,
                '&:hover': { backgroundColor: active ? Theme.colors.sanctuarySaffron : colors.tertiary }
            }}
        >
            <Box sx={{ marginBottom: 4 }}>
                {React.cloneElement(icon, { color: active ? '#fff' : colors.textSecondary })}
            </Box>
            <ButtonText color={active ? '#fff' : colors.textSecondary} sx={{ fontSize: 12, fontWeight: '700' }}>
                {label}
            </ButtonText>
        </Button>
    );
}
