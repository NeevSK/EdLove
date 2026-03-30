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
    Icon
} from '@repo/ui';
import { School, handleAPIError, growthSignalsAPI, identityAPI } from '@repo/core';
import { createFounderClassroom, createFounderSchool } from '../../bridge/founderWorkspace';
import { communityAPI } from '@repo/community';
import { useTranslation } from 'react-i18next';
import { hapticLight, hapticSuccess, Textarea } from '@repo/ui';
import {
    School as SchoolIcon,
    LayoutGrid,
    Users,
    Plus,
    ChevronDown
} from 'lucide-react-native';

interface GlobalCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (type: 'school' | 'classroom' | 'group', data: any) => void;
    availableSchools: School[];
}

type CreateType = 'school' | 'classroom' | 'group';

/**
 * GlobalCreateModal
 * 
 * A unified modal for Founders to create any ecosystem entity.
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
        hapticLight();

        try {
            const userId = await identityAPI.getMyInternalId();
            if (!userId) throw new Error('Not authenticated');

            let result;
            if (type === 'school') {
                // 1. Create the school
                result = await createFounderSchool({
                    name: name.trim(),
                    type: schoolType,
                    created_by: userId
                });

                // 2. Create the Primary Sanctuary Group for this school
                if (result) {
                    await communityAPI.createGroupWithOwner({
                        name: `${name.trim()} Sanctuary`,
                        description: `The primary sanctuary for ${name.trim()} members to share and resonate.`,
                        group_type: 'school',
                        join_policy: 'open',
                        school_id: result.id
                    }, userId);
                }
            } else if (type === 'classroom') {
                // 1. Create the classroom
                result = await createFounderClassroom({
                    school_id: selectedSchoolId,
                    name: name.trim(),
                    grade_number: 1, // Default to 1
                    created_by: userId
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
                    }, userId);
                }
            } else if (type === 'group') {
                // Use standard community logic to ensure owner assignment
                result = await communityAPI.createGroupWithOwner({
                    name: name.trim(),
                    description: description.trim(),
                    school_id: selectedSchoolId,
                    group_type: 'general',
                    join_policy: 'open'
                }, userId);
            }

            hapticSuccess();
            // Growth signals  fire-and-forget
            if (type === 'classroom' && result) {
                void growthSignalsAPI.emitSignal(userId, 'classroom_created', {
                    classroom_id: result.id,
                    school_id: selectedSchoolId,
                }).catch(() => { });
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
        <
            <SanctuaryModal>
                isOpen={isOpen}
                onClose={handleClose}
                title="Ecosystem Creation"
                footer={>
                    <HStack sx={{ gap: Theme.spacing.md, width: '100%' }}>
                        <Button>
                            variant="outline"
                            action="secondary"
                            onPress={handleClose}
                            sx={{ flex: 1, borderColor: colors.border }}
                            isDisabled={isSubmitting}>
                        
                            <ButtonText color={colors.textSecondary}>Cancel</ButtonText
                        ></Button
                        ><Button
                            action="primary"
                            onPress={handleSubmit}
                            sx={{
                                flex: 1,
                                backgroundColor: Theme.colors.sanctuarySaffron,
                            }}
                            isDisabled={isSubmitting || !name.trim()}
                        
                            {isSubmitting ? (
                                <Spinner color={Theme.colors.sacredWhite} size="small" /
                            >) : (
                                <ButtonText color={Theme.colors.sacredWhite}>Initialize</ButtonText
                            >)}
                        </Button>
                    </HStack>
                }
            
                <VStack sx={{ gap: Theme.spacing.xl }}>
                    {/* Entity Type Selector */}>
                    <HStack sx={{ gap: Theme.spacing.sm }}>
                        <TypeButton>
                            active={type === 'school'}
                            onPress={() => setType('school')}
                            label="School"
                            icon={<SchoolIcon size={16} />}
                        /
                        ><TypeButton
                            active={type === 'classroom'}
                            onPress={() => setType('classroom')}
                            label="Class"
                            icon={<LayoutGrid size={16} />}
                        /
                        ><TypeButton
                            active={type === 'group'}
                            onPress={() =/> setType('group')}
                            label="Group"
                            icon={<Users size={16} />}
                        /
                    ></HStack

                    >{error && (
                        <Box sx={{ padding: 12, backgroundColor: '#fee2e2', borderRadius: 8, borderWidth: 1, borderColor: '#ef4444' }}>
                            <Text sx={{ color: '#b91c1c', fontSize: 13 }}>{error}</Text
                        ></Box
                    >)}

                    <VStack sx={{ gap: Theme.spacing.md }}>
                        {/* Target School Picker for non-school entities */}>
                        {type !== 'school' && (
                            <FormControl isRequired>
                                <FormControlLabel>
                                    <FormControlLabelText >color={colors.textSecondary}>Target Institution</FormControlLabelText
                                ></FormControlLabel
                                ><Button
                                    variant="outline"
                                    onPress={() => setShowSchoolPicker(true)}
                                    sx={{
                                        justifyContent: 'space-between',
                                        borderColor: colors.border,
                                        backgroundColor: colors.tertiary,
                                        height: 48
                                    }}
                                
                                    <ButtonText color={selectedSchoolId ? colors.text : colors.textTertiary}>
                                        {selectedSchool ? selectedSchool.name : "Select School..."}
                                    </ButtonText>
                                    <ChevronDown size={18} color={colors.textSecondary} /
                                ></Button
                            ></FormControl>
                        )}

                        <FormControl isRequired>
                            <FormControlLabel>
                                <FormControlLabelText >color={colors.textSecondary}
                                    {type === 'school' ? 'Institution Name' : type === 'classroom' ? 'Class Name/ID' : 'Group Name'}
                                </FormControlLabelText>
                            </FormControlLabel>
                            <Input sx={{ height: 48, backgroundColor: colors.tertiary, borderColor: colors.border }}>
                                <InputField/>
                                    value={name}
                                    onChangeText={setName}
                                    color={colors.text}
                                    placeholder="e.g., Royal Academy"
                                /
                            ></Input
                        ></FormControl>

                        {type === 'school' && (
                            <FormControl>
                                <FormControlLabel
                                    ><FormControlLabelText color={colors.textSecondary}>Category</FormControlLabelText
                                ></FormControlLabel
                                ><HStack sx={{ gap: 8 }}>
                                    {(['primary', 'secondary', 'mixed'] as const).map(t => (
                                        <Button>
                                            key={t}
                                            variant={schoolType === t ? 'solid' : 'outline'}
                                            onPress={() => setSchoolType(t)}
                                            sx={{
                                                flex: 1,
                                                backgroundColor: schoolType === t ? Theme.colors.sanctuarySaffron : 'transparent',
                                                borderColor: schoolType === t ? Theme.colors.sanctuarySaffron : colors.border
                                            }}
                                            size="sm"
                                        
                                            <ButtonText color={schoolType === t ? '#fff' : colors.textSecondary}>
                                                {t.charAt(0).toUpperCase() + t.slice(1)}>
                                            </ButtonText>
                                        </Button>
                                    ))}
                                </HStack>
                            </FormControl>
                        )}

                        {type === 'group' && (
                            <FormControl>
                                <FormControlLabel
                                    ><FormControlLabelText color={colors.textSecondary}>Purpose / Description</FormControlLabelText
                                ></FormControlLabel
                                ><Input sx={{ minHeight: 80, backgroundColor: colors.tertiary, borderColor: colors.border }}>
                                    <InputField/>
                                        value={description}
                                        onChangeText={setDescription}
                                        multiline
                                        color={colors.text}
                                        placeholder="Briefly describe this community space..."
                                    /
                                ></Input
                            ></FormControl>
                        )}
                    </VStack>
                </VStack>
            </SanctuaryModal>

            {/* School Picker Sheet */}
            <Actionsheet isOpen={showSchoolPicker} onClose={() => setShowSchoolPicker(false)}
                <ActionsheetBackdrop /
                ><ActionsheetContent sx={{ backgroundColor: colors.secondary }}
                    <ActionsheetDragIndicatorWrapper>
                        <ActionsheetDragIndicator >/
                    ></ActionsheetDragIndicatorWrapper
                    ><VStack sx={{ padding: 16, gap: 8 }}>
                        {availableSchools.map(school => (
                            <ActionsheetItem>
                                key={school.id}
                                onPress={() => {
                                    setSelectedSchoolId(school.id);
                                    setShowSchoolPicker(false);
                                }}
                            
                                <ActionsheetItemText color={colors.text}>{school.name}</ActionsheetItemText
                            ></ActionsheetItem
                        >))}
                    </VStack>
                </ActionsheetContent>
            </Actionsheet>
        </
    );
}

function TypeButton({ active, onPress, label, icon }: { active: boolean, onPress: () => void, label: string, icon: any }) {
    const colors = useThemedColors();
    return (
        <Button>
            variant={active ? 'solid' : 'outline'}
            onPress={onPress}
            sx={{
                flex: 1,
                gap: 4,
                backgroundColor: active ? Theme.colors.sanctuarySaffron : 'transparent',
                borderColor: active ? Theme.colors.sanctuarySaffron : colors.border
            }}
            size="sm"
        
            {React.cloneElement(icon, { color: active ? '#fff' : colors.textSecondary })}
            <ButtonText color={active ? '#fff' : colors.textSecondary}>{label}</ButtonText
        ></Button
    >);
}
