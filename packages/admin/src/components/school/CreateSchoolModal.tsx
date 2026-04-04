import React, { useState, useMemo } from 'react';
import { TouchableOpacity, ScrollView } from 'react-native';
import {
    SanctuaryModal,
    useTheme,
    SanctuaryInput,
    VStack,
    HStack,
    Box,
    Text,
    Heading,
    Button,
    ButtonText,
    Spinner,
    Icon,
    Theme,
} from '@repo/ui';
import { 
    CheckCircle, 
    School as SchoolIcon, 
    MessageSquare, 
    Globe, 
    MapPin, 
    Users, 
    ChevronRight, 
    ChevronLeft,
    Building2,
    BookOpen
} from 'lucide-react-native';
import { 
    identityAPI, 
    communityAPI, 
    useSchoolCreation,
    useEntity,
    useStore,
    SRI_LANKAN_PROVINCES,
    SRI_LANKAN_DISTRICTS,
    SRI_LANKAN_SCHOOL_TYPES,
    STUDENT_TYPES,
    RELIGIOUS_AFFILIATIONS
} from '@repo/core';
import { hapticLight, hapticSuccess } from '@repo/ui';
import { useThemedColors } from '@repo/ui';
import { useNavigation } from '@react-navigation/native';

interface CreateSchoolModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (school: any) => void;
    initialData?: {
        id: string;
        name: string;
        handle?: string;
        type?: string;
    };
}

export default function CreateSchoolModal({
    isOpen,
    onClose,
    onSuccess,
    initialData,
}: CreateSchoolModalProps) {
    const navigation = useNavigation<any>();
    const user = useStore((state) => state.user);
    const setUser = useStore((state) => state.setUser);
    const colors = useThemedColors();
    const { glass } = useTheme();
    const isEdit = !!initialData;
    
    // Use unified entity hook for logic, but keep custom step state for the wizard UI
    const { 
        updateInstance,
        create
    } = useEntity({
        type: 'school',
        id: initialData?.id,
        mode: isEdit ? 'edit' : 'create'
    });

    const { 
        state, 
        updateStep, 
        updateBasicInfo, 
        updateLocation, 
        updateDemographics, 
        resetProgress 
    } = useSchoolCreation();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createdIds, setCreatedIds] = useState<{ schoolId: string; groupId?: string } | null>(null);

    // Derived Location Data
    const availableDistricts = useMemo(() => {
        if (!state.location.provinceId) return [];
        return SRI_LANKAN_DISTRICTS.filter(d => d.provinceId === state.location.provinceId);
    }, [state.location.provinceId]);

    const handleClose = () => {
        setError(null);
        if (!isEdit && state.step === 5) {
            resetProgress();
        }
        onClose();
    };

    const handleEnterDashboard = () => {
        if (!createdIds?.schoolId) return;
        const sId = createdIds.schoolId;
        handleClose();
        navigation.navigate('FounderSchoolDashboard' as never, {
            schoolId: sId,
            userId: user?.id ?? '',
        } as never);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);
        hapticLight();

        try {
            const userId = await identityAPI.getMyInternalId();
            if (!userId) throw new Error('Not authenticated');

            const payload: any = {
                name: state.basicInfo.name.trim(),
                handle: state.basicInfo.handle.trim(),
                official_type: state.basicInfo.officialType,
                province_id: state.location.provinceId,
                district_id: state.location.districtId,
                city: state.location.city,
                address: state.location.address,
                student_type: state.demographics.studentType,
                religious_affiliation: state.demographics.religiousAffiliation,
                student_count: parseInt(state.demographics.studentCount) || 0,
                type: (state.basicInfo.officialType || '').includes('Primary') ? 'primary' : 'mixed' as const, // Back-compat
            };

            let school;
            if (isEdit && initialData) {
                school = await updateInstance(payload);
                hapticSuccess();
                onSuccess(school);
                handleClose();
            } else {
                payload.created_by = userId;
                school = await create(payload);

                // Sync school_id to both Supabase profile and local store
                if (userId) {
                    await identityAPI.updateProfile(userId, { school_id: school.id });
                }
                if (user) {
                    setUser({ ...user, school_id: school.id } as any);
                }

                let communityGroupId: string | undefined;
                try {
                    const group = await communityAPI.createGroupWithOwner({
                        name: `${state.basicInfo.name.trim()} HQ`,
                        description: `Official community portal for ${state.basicInfo.name.trim()}`,
                        type: 'general',
                        join_policy: 'open',
                        school_id: school.id,
                    }, userId);
                    communityGroupId = group.id;
                } catch (groupErr) {
                    console.warn('Failed to create default group:', groupErr);
                }

                hapticSuccess();
                setCreatedIds({ schoolId: school.id, groupId: communityGroupId });
                updateStep(5); // Success step
                onSuccess(school);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to save school';
            console.error('Failed to save school:', err);
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderFooter = () => {
        if (state.step === 5) {
            return (
                <VStack sx={{ width: '100%', gap: Theme.spacing.md }}>
                    <Button
                        action="primary"
                        onPress={handleEnterDashboard}
                        sx={{ backgroundColor: Theme.colors.sanctuarySaffron }}
                    >
                        <ButtonText color={Theme.colors.sacredWhite}>Enter Dashboard</ButtonText>
                        <Icon as={ChevronRight} color={Theme.colors.sacredWhite} sx={{ marginLeft: 8 }} />
                    </Button>
                </VStack>
            );
        }

        return (
            <HStack sx={{ width: '100%', gap: Theme.spacing.md }}>
                {state.step > 1 && (
                    <Button
                        variant="outline"
                        onPress={() => updateStep(state.step - 1)}
                        sx={{ flex: 1, borderColor: colors.border }}
                    >
                        <Icon as={ChevronLeft} color={colors.textSecondary} sx={{ marginRight: 8 }} />
                        <ButtonText color={colors.textSecondary}>Back</ButtonText>
                    </Button>
                )}
                <Button
                    action="primary"
                    onPress={state.step === 4 ? handleSubmit : () => updateStep(state.step + 1)}
                    sx={{
                        flex: 2,
                        backgroundColor: Theme.colors.sanctuarySaffron,
                    }}
                    isDisabled={isSubmitting || (state.step === 1 && !state.basicInfo.name)}
                >
                    {isSubmitting ? (
                        <Spinner color={Theme.colors.sacredWhite} />
                    ) : (
                        <HStack alignItems="center">
                            <ButtonText color={Theme.colors.sacredWhite}>
                                {state.step === 4 ? 'Establish Sanctuary' : 'Next Step'}
                            </ButtonText>
                            {state.step < 4 && <Icon as={ChevronRight} color={Theme.colors.sacredWhite} sx={{ marginLeft: 8 }} />}
                        </HStack>
                    )}
                </Button>
            </HStack>
        );
    };

    return (
        <SanctuaryModal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEdit ? 'Refine Sanctuary' : 'Found New Sanctuary'}
            footer={renderFooter()}
        >
            <VStack sx={{ gap: Theme.spacing.lg }}>
                {state.step < 5 && (
                    <HStack sx={{ gap: 4, justifyContent: 'center' }}>
                        {[1, 2, 3, 4].map((s) => (
                            <Box
                                key={s}
                                sx={{
                                    height: 4,
                                    flex: 1,
                                    borderRadius: 2,
                                    backgroundColor: s <= state.step ? Theme.colors.sanctuarySaffron : colors.tertiary,
                                }}
                            />
                        ))}
                    </HStack>
                )}

                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
                    <VStack sx={{ gap: Theme.spacing.xl, paddingBottom: 20 }}>
                        {state.step === 1 && (
                            <VStack sx={{ gap: Theme.spacing.lg }}>
                                <Heading size="md" color={colors.text}>Identity & Calling</Heading>
                                <SanctuaryInput
                                    label="Sanctuary Name"
                                    placeholder="e.g. Nalanda College"
                                    value={state.basicInfo.name}
                                    onChangeText={(val) => {
                                        updateBasicInfo({ name: val });
                                        if (!isEdit) {
                                            updateBasicInfo({ handle: val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '') });
                                        }
                                    }}
                                    leftIcon={Building2}
                                />
                                <SanctuaryInput
                                    label="Unique Handle"
                                    value={state.basicInfo.handle}
                                    onChangeText={(val) => updateBasicInfo({ handle: val.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                                    leftIcon={Globe}
                                    helperText="Used for QR codes and deep links"
                                />
                                <VStack sx={{ gap: 8 }}>
                                    <Text sx={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary }}>Classification</Text>
                                    <HStack flexWrap="wrap" sx={{ gap: 8 }}>
                                        {Object.values(SRI_LANKAN_SCHOOL_TYPES).map((type) => (
                                            <TouchableOpacity 
                                                key={type.key}
                                                onPress={() => updateBasicInfo({ officialType: type.key })}
                                                accessibilityRole="button"
                                                accessibilityLabel={type.en}
                                                style={{
                                                    paddingHorizontal: 12,
                                                    paddingVertical: 8,
                                                    borderRadius: 20,
                                                    borderWidth: 1,
                                                    borderColor: state.basicInfo.officialType === type.key ? Theme.colors.sanctuarySaffron : colors.border,
                                                    backgroundColor: state.basicInfo.officialType === type.key ? 'rgba(212,132,58,0.1)' : 'transparent'
                                                }}
                                            >
                                                <Text sx={{ fontSize: 12, color: state.basicInfo.officialType === type.key ? Theme.colors.sanctuarySaffron : colors.text }}>
                                                    {type.en}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </HStack>
                                </VStack>
                            </VStack>
                        )}

                        {state.step === 2 && (
                            <VStack sx={{ gap: Theme.spacing.lg }}>
                                <Heading size="md" color={colors.text}>Sacred Geography</Heading>
                                <VStack sx={{ gap: 8 }}>
                                    <Text sx={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary }}>Province</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <HStack sx={{ gap: 8 }}>
                                            {SRI_LANKAN_PROVINCES.map((p) => (
                                                <TouchableOpacity 
                                                    key={p.id}
                                                    onPress={() => updateLocation({ provinceId: p.id, districtId: '' })}
                                                    accessibilityRole="button"
                                                    accessibilityLabel={p.en}
                                                    style={{
                                                        paddingHorizontal: 16,
                                                        paddingVertical: 10,
                                                        borderRadius: 12,
                                                        borderWidth: 1,
                                                        borderColor: state.location.provinceId === p.id ? Theme.colors.sanctuarySaffron : colors.border,
                                                        backgroundColor: state.location.provinceId === p.id ? 'rgba(212,132,58,0.1)' : colors.tertiary
                                                    }}
                                                >
                                                    <Text sx={{ fontWeight: '600', color: state.location.provinceId === p.id ? Theme.colors.sanctuarySaffron : colors.text }}>
                                                        {p.en}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </HStack>
                                    </ScrollView>
                                </VStack>

                                {state.location.provinceId && (
                                    <VStack sx={{ gap: 8 }}>
                                        <Text sx={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary }}>District</Text>
                                        <HStack flexWrap="wrap" sx={{ gap: 8 }}>
                                            {availableDistricts.map((d) => (
                                                <TouchableOpacity 
                                                    key={d.id}
                                                    onPress={() => updateLocation({ districtId: d.id })}
                                                    accessibilityRole="button"
                                                    accessibilityLabel={d.en}
                                                    style={{
                                                        paddingHorizontal: 12,
                                                        paddingVertical: 8,
                                                        borderRadius: 8,
                                                        borderWidth: 1,
                                                        borderColor: state.location.districtId === d.id ? Theme.colors.sanctuarySaffron : colors.border,
                                                        backgroundColor: state.location.districtId === d.id ? 'rgba(212,132,58,0.05)' : 'transparent'
                                                    }}
                                                >
                                                    <Text sx={{ fontSize: 13, color: state.location.districtId === d.id ? Theme.colors.sanctuarySaffron : colors.text }}>
                                                        {d.en}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </HStack>
                                    </VStack>
                                )}

                                <SanctuaryInput
                                    label="City / Town"
                                    placeholder="e.g. Colombo 07"
                                    value={state.location.city}
                                    onChangeText={(val) => updateLocation({ city: val })}
                                    leftIcon={MapPin}
                                />
                                <SanctuaryInput
                                    label="Full Address"
                                    placeholder="Number, Street details..."
                                    value={state.location.address}
                                    onChangeText={(val) => updateLocation({ address: val })}
                                    multiline
                                    numberOfLines={2}
                                />
                            </VStack>
                        )}

                        {state.step === 3 && (
                            <VStack sx={{ gap: Theme.spacing.lg }}>
                                <Heading size="md" color={colors.text}>Nature & Pulse</Heading>
                                <VStack sx={{ gap: 8 }}>
                                    <Text sx={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary }}>Student Demographic</Text>
                                    <HStack sx={{ gap: 12 }}>
                                        {STUDENT_TYPES.map((type) => (
                                            <TouchableOpacity 
                                                key={type.id}
                                                onPress={() => updateDemographics({ studentType: type.id as any })}
                                                accessibilityRole="button"
                                                accessibilityLabel={type.en}
                                                style={{
                                                    flex: 1,
                                                    padding: 16,
                                                    borderRadius: 16,
                                                    borderWidth: 2,
                                                    borderColor: state.demographics.studentType === type.id ? Theme.colors.sanctuarySaffron : colors.border,
                                                    backgroundColor: state.demographics.studentType === type.id ? 'rgba(212,132,58,0.05)' : colors.tertiary,
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Text sx={{ fontSize: 24, marginBottom: 4 }}>
                                                    {type.id === 'mixed' ? '\u1F46A' : type.id === 'boys' ? '\u1F466' : '\u1F467'}
                                                </Text>
                                                <Text sx={{ fontWeight: '700', textTransform: 'capitalize', color: colors.text }}>{type.en}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </HStack>
                                </VStack>

                                <VStack sx={{ gap: 8 }}>
                                    <Text sx={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary }}>Religious Affiliation</Text>
                                    <HStack flexWrap="wrap" sx={{ gap: 8 }}>
                                        {RELIGIOUS_AFFILIATIONS.map((r) => (
                                            <TouchableOpacity 
                                                key={r.id}
                                                onPress={() => updateDemographics({ religiousAffiliation: r.id })}
                                                accessibilityRole="button"
                                                accessibilityLabel={r.en}
                                                style={{
                                                    paddingHorizontal: 16,
                                                    paddingVertical: 10,
                                                    borderRadius: 12,
                                                    borderWidth: 1,
                                                    borderColor: state.demographics.religiousAffiliation === r.id ? Theme.colors.sanctuarySaffron : colors.border,
                                                    backgroundColor: state.demographics.religiousAffiliation === r.id ? 'rgba(212,132,58,0.1)' : 'transparent'
                                                }}
                                            >
                                                <Text sx={{ fontSize: 13, color: state.demographics.religiousAffiliation === r.id ? Theme.colors.sanctuarySaffron : colors.text }}>
                                                    {r.en}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </HStack>
                                </VStack>
                                <SanctuaryInput
                                    label="Estimated Student Count"
                                    placeholder="e.g. 1500"
                                    value={state.demographics.studentCount}
                                    onChangeText={(val) => updateDemographics({ studentCount: val })}
                                    keyboardType="numeric"
                                    leftIcon={Users}
                                />
                            </VStack>
                        )}

                        {state.step === 4 && (
                            <VStack sx={{ gap: Theme.spacing.lg }}>
                                <Heading size="md" color={colors.text}>Hierarchy & Vision</Heading>
                                <Box sx={{ 
                                    padding: 20, 
                                    borderRadius: 20, 
                                    backgroundColor: colors.tertiary,
                                    borderWidth: 1,
                                    borderColor: colors.border
                                }}>
                                    <VStack sx={{ gap: 16 }}>
                                        <HStack sx={{ gap: 12, alignItems: 'center' }}>
                                            <Box sx={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(212,132,58,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                                                <Icon as={SchoolIcon} color={Theme.colors.sanctuarySaffron} size={20} />
                                            </Box>
                                            <VStack>
                                                <Text sx={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{state.basicInfo.name}</Text>
                                                <Text sx={{ fontSize: 12, color: colors.textSecondary }}>@{state.basicInfo.handle}</Text>
                                            </VStack>
                                        </HStack>
                                        
                                        <HStack sx={{ justifyContent: 'space-between', borderTopWidth: 1, borderColor: colors.border, paddingTop: 12 }}>
                                            <VStack>
                                                <Text sx={{ fontSize: 11, color: colors.textTertiary }}>Classification</Text>
                                                <Text sx={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{state.basicInfo.officialType}</Text>
                                            </VStack>
                                            <VStack sx={{ alignItems: 'flex-end' }}>
                                                <Text sx={{ fontSize: 11, color: colors.textTertiary }}>Demographic</Text>
                                                <Text sx={{ fontSize: 13, fontWeight: '600', color: colors.text, textTransform: 'capitalize' }}>{state.demographics.studentType}</Text>
                                            </VStack>
                                        </HStack>
                                        <HStack sx={{ gap: 8, alignItems: 'center' }}>
                                            <Icon as={MapPin} size={14} color={colors.textSecondary} />
                                            <Text sx={{ fontSize: 13, color: colors.textSecondary, flex: 1 }}>
                                                {state.location.city}, {SRI_LANKAN_DISTRICTS.find(d => d.id === state.location.districtId)?.en}
                                            </Text>
                                        </HStack>
                                    </VStack>
                                </Box>
                                <Box sx={{ padding: 16, borderRadius: 16, backgroundColor: 'rgba(34,197,94,0.05)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)' }}>
                                    <HStack sx={{ gap: 12, alignItems: 'center' }}>
                                        <Icon as={CheckCircle} color="#22C55E" size={20} />
                                        <Text sx={{ fontSize: 12, color: colors.textSecondary, flex: 1 }}>
                                            Establishing this sanctuary will automatically create a Community HQ and assign you as the Principal.
                                        </Text>
                                    </HStack>
                                </Box>
                            </VStack>
                        )}

                        {state.step === 5 && (
                            <VStack sx={{ gap: Theme.spacing.xl, alignItems: 'center', paddingVertical: Theme.spacing.lg }}>
                                <Box sx={{ backgroundColor: 'rgba(34,197,94,0.1)', padding: 24, borderRadius: 60 }}>
                                    <Icon as={CheckCircle} color="#22C55E" size={64} />
                                </Box>
                                
                                <VStack sx={{ gap: Theme.spacing.sm, alignItems: 'center' }}>
                                    <Heading color={colors.text} size="xl" sx={{ textAlign: 'center' }}>
                                        Sanctuary Founded!
                                    </Heading>
                                    <Text sx={{ textAlign: 'center', color: colors.textSecondary }}>
                                        Your institution is now part of the Gurudevi ecosystem.
                                    </Text>
                                </VStack>

                                <Box sx={{ backgroundColor: colors.tertiary, padding: 16, borderRadius: 16, width: '100%' }}>
                                    <VStack sx={{ gap: 12 }}>
                                        <HStack sx={{ gap: 8, alignItems: 'center' }}>
                                            <Icon as={BookOpen} color={Theme.colors.sanctuarySaffron} size={16} />
                                            <Text sx={{ fontSize: 14 }}>Academic Cycle Initialized</Text>
                                        </HStack>
                                        <HStack sx={{ gap: 8, alignItems: 'center' }}>
                                            <Icon as={MessageSquare} color={Theme.colors.sanctuarySaffron} size={16} />
                                            <Text sx={{ fontSize: 14 }}>Community Space Ready</Text>
                                        </HStack>
                                    </VStack>
                                </Box>
                            </VStack>
                        )}
                    </VStack>
                </ScrollView>
                {error && (
                    <Box sx={{ padding: 12, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12 }}>
                        <Text sx={{ color: '#EF4444', fontSize: 13 }}>{error}</Text>
                    </Box>
                )}
            </VStack>
        </SanctuaryModal>
    );
}
