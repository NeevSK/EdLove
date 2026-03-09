import React, { useState, useMemo } from 'react';
import { Box, VStack, HStack, Input, InputField, Button, ButtonText, Text, Heading, useToast, Toast, ToastTitle, Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator, SelectItem } from '@repo/ui';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '@repo/ui';
import { UserRole, supabase, identityAPI } from '@repo/core';
import { hapticLight, hapticSuccess, hapticError } from '@repo/ui';
import { ScreenWrapper } from '@repo/ui';
import { useThemedColors } from '@repo/ui';
import AuthScreen from './AuthScreen';
import { ProgressIndicator } from '@repo/ui';
import { OrientationCaptureStep } from '@repo/self';
import type { OrientationSeeds } from '@repo/profile';

interface OnboardingScreenProps {
    onComplete: (name: string, role: UserRole, wantsAccount?: boolean) => void;
    isAnonymous?: boolean;
}

export default function OnboardingScreen({ onComplete, isAnonymous = false }: OnboardingScreenProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [currentStep, setCurrentStep] = useState(0); // 0: Name, 1: Role, 2: Orientation (optional), 3-7: Tour, 8: Auth
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>('teacher');
    const [orientationSeeds, setOrientationSeeds] = useState<OrientationSeeds | null>(null);
    const [isCompleting, setIsCompleting] = useState(false);
    const toast = useToast();

    // Onboarding Sentinel: If a verified (non-anonymous) user re-enters onboarding
    // (e.g. via Google sign-in), pre-fill their name and skip the Name step.
    // Anonymous users always start at step 0 so they can enter their real name.
    React.useEffect(() => {
        const checkExistingAuth = async () => {
            const internalId = await identityAPI.getMyInternalId();
            if (!internalId) return;
            const { data: profile } = await supabase
                .from('users')
                .select('full_name, is_anonymous, role')
                .eq('id', internalId)
                .maybeSingle();
            if (!profile) return;

            // Only pre-fill for real (non-anonymous) users with a genuine name
            const PLACEHOLDER_NAMES = ['Guest User', 'Gurudevi User', 'Sanctuary User'];
            if (!profile.is_anonymous && profile.full_name && !PLACEHOLDER_NAMES.includes(profile.full_name)) {
                setName(profile.full_name);
                if (profile.role) setRole(profile.role as UserRole);
                setCurrentStep(1); // Skip Name step, land on Role selection
            }
        };
        checkExistingAuth();
    }, []);

    const tourScreens = useMemo(() => [
        {
            emoji: '🪷',
            title: t('onboarding.philosophyTitle'),
            subtitle: t('onboarding.philosophySubtitle'),
            content: t('onboarding.philosophyContent')
        },
        {
            emoji: '🏫',
            title: t('onboarding.sectionsTitle'),
            subtitle: t('onboarding.sectionsSubtitle'),
            content: t('onboarding.sectionsContent')
        },
        {
            emoji: '🌱',
            title: t('onboarding.ecologyTitle'),
            subtitle: t('onboarding.ecologySubtitle'),
            content: t('onboarding.ecologyContent')
        },
        {
            emoji: '🔒',
            title: t('onboarding.privacyTitle'),
            subtitle: t('onboarding.privacySubtitle'),
            content: t('onboarding.privacyContent')
        },
        {
            emoji: '🧭',
            title: t('onboarding.navigationTitle'),
            subtitle: t('onboarding.navigationSubtitle'),
            content: t('onboarding.navigationContent')
        }
    ], [t]);

    // Steps Logic
    // Step 0: Name (Required)
    // Step 1: Role (Required, default Teacher)
    // Step 2-6: Tour
    // Step 7: Auth Upgrade (or Continue as Guest)

    const canProceed = currentStep === 0 ? name.trim().length > 0 : true;

    const handleNext = () => {
        if (!canProceed) return;
        hapticLight();
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        hapticLight();
        setCurrentStep(prev => Math.max(0, prev - 1));
    };

    const handleSkipTour = () => {
        hapticLight();
        setCurrentStep(8); // Jump to Auth
    };
    const handleCompleteOnboarding = async () => {
        setIsCompleting(true);
        try {
            const internalId = await identityAPI.getMyInternalId();
            if (!internalId) throw new Error('Failed to resolve internal user ID during onboarding completion');

            hapticSuccess();

            // Check if user already exists in public.users to avoid overwriting critical data
            const { data: existingProfile } = await supabase
                .from('users')
                .select('school_id')
                .eq('id', internalId)
                .single();

            // 1. Create a default school (Personal Workspace) only if they don't have one
            let schoolId = existingProfile?.school_id;
            if (!schoolId) {
                const schoolName = `${name}'s Workspace`;
                const { data: schoolData, error: schoolError } = await supabase
                    .from('schools')
                    .insert({ name: schoolName, type: 'personal_workspace', created_by: internalId })
                    .select().single();
                if (schoolError) console.warn('Workspace creation failed:', schoolError);
                schoolId = schoolData?.id;
            }

            // 2. Update user profile
            const { error: profileError } = await supabase
                .from('users')
                .upsert({
                    id: internalId,
                    full_name: name || 'Gurudevi User',
                    role: role,
                    school_id: schoolId,
                    onboarding_completed: true,
                    onboarding_completed_at: new Date().toISOString(),
                    is_anonymous: isAnonymous,
                    ...(orientationSeeds ? { orientation_seeds: orientationSeeds } : {}),
                });

            if (profileError) throw profileError;

            await AsyncStorage.removeItem('onboarding_progress');
            onComplete(name, role, false);
        } catch (error) {
            console.error('Error completing onboarding:', error);
            hapticError();
            setIsCompleting(false);
            toast.show({
                placement: 'bottom',
                render: ({ id }) => (
                    <Toast nativeID={id} action="error" variant="solid">
                        <ToastTitle>Failed to save profile. Please try again.</ToastTitle>
                    </Toast>
                ),
            });
        }
    };

    // --- Renderers ---

    const renderNameStep = () => (
        <VStack space="xl" mt="$8" px="$6">
            <ProgressIndicator currentStep={0} totalSteps={9} />
            <Heading size="2xl" color={colors.action} textAlign="center">
                {t('onboarding.nameTitle') || 'Welcome! What should we call you?'}
            </Heading>
            <Text color={colors.textSecondary} textAlign="center">
                {t('onboarding.nameSubtitle') || "Let's start your journey with a name."}
            </Text>
            <Input variant="outline" size="xl" sx={{ borderColor: colors.textTertiary, borderRadius: Theme.corners.comfortable, mt: '$4' }}>
                <InputField
                    placeholder={t('onboarding.namePlaceholder')}
                    value={name}
                    onChangeText={setName}
                    color={colors.text}
                />
            </Input>
            <Button size="lg" onPress={handleNext} isDisabled={!canProceed} sx={{ backgroundColor: colors.action, mt: '$6' }}>
                <ButtonText color={Theme.colors.sacredWhite}>{t('onboarding.continue')}</ButtonText>
            </Button>
        </VStack>
    );

    const renderRoleStep = () => (
        <VStack space="xl" mt="$8" px="$6">
            <ProgressIndicator currentStep={1} totalSteps={9} />
            <Heading size="2xl" color={colors.action} textAlign="center">
                {t('onboarding.roleTitle') || 'What is your role?'}
            </Heading>
            <Select selectedValue={role} onValueChange={(val) => setRole(val as UserRole)}>
                <SelectTrigger variant="outline" size="xl" sx={{ borderRadius: Theme.corners.comfortable }}>
                    <SelectInput placeholder="Select your role" />
                    <SelectIcon mr="$2" as={ChevronDown} />
                </SelectTrigger>
                <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                        <SelectItem label={t('role.teacher')} value="teacher" />
                        <SelectItem label={t('role.student')} value="student" />
                        <SelectItem label={t('role.principal')} value="principal" />
                    </SelectContent>
                </SelectPortal>
            </Select>
            <HStack space="md" mt="$6">
                <Button variant="outline" onPress={handleBack} sx={{ flex: 1 }}>
                    <ButtonText color={colors.text}>{t('onboarding.back')}</ButtonText>
                </Button>
                <Button onPress={handleNext} sx={{ backgroundColor: colors.action, flex: 2 }}>
                    <ButtonText color={Theme.colors.sacredWhite}>{t('onboarding.continue')}</ButtonText>
                </Button>
            </HStack>
        </VStack>
    );

    const renderTourStep = (index: number) => {
        const tourIdx = index - 3; // steps 3-7 map to tour screens 0-4
        const screen = tourScreens[tourIdx];
        return (
            <VStack space="xl" mt="$8" px="$6" flex={1}>
                <ProgressIndicator currentStep={index} totalSteps={9} />
                {/* Tour content grouped as a single accessible unit */}
                <VStack
                    space="md"
                    alignItems="center"
                >
                    {/* Emoji Icon - decorative, hidden from screen readers */}
                    <Text
                        size="6xl"
                        textAlign="center"
                        sx={{ lineHeight: 80 }}
                        accessible={false}
                    >
                        {screen.emoji}
                    </Text>
                    <Heading
                        size="2xl"
                        color={colors.action}
                        textAlign="center"
                        accessibilityRole="header"
                    >
                        {screen.title}
                    </Heading>
                    <Text color={colors.textSecondary} textAlign="center" size="lg" fontWeight="$bold">{screen.subtitle}</Text>
                    <Box sx={{ flex: 1, justifyContent: 'center', py: '$4' }}>
                        <Text textAlign="center" color={colors.text} size="md" lineHeight="$xl">{screen.content}</Text>
                    </Box>
                </VStack>
                <VStack space="md" mt="$auto" pb="$4">
                    <HStack space="md">
                        <Button variant="outline" onPress={handleBack} sx={{ flex: 1 }}>
                            <ButtonText color={colors.text}>{t('onboarding.back')}</ButtonText>
                        </Button>
                        <Button onPress={handleNext} sx={{ backgroundColor: colors.action, flex: 2 }}>
                            <ButtonText color={Theme.colors.sacredWhite}>{t('onboarding.next')}</ButtonText>
                        </Button>
                    </HStack>
                    <Button variant="link" onPress={handleSkipTour}>
                        <ButtonText color={colors.textTertiary}>{t('onboarding.skip')}</ButtonText>
                    </Button>
                </VStack>
            </VStack>
        );
    };

    const renderAuthStep = () => (
        <AuthScreen
            onboardingData={{ name, role }}
            isAnonymous={isAnonymous}
            onContinueAsGuest={handleCompleteOnboarding}
            onSuccess={handleCompleteOnboarding}
        />
    );

    return (
        <ScreenWrapper>
            <VStack flex={1}>
                {currentStep === 0 && renderNameStep()}
                {currentStep === 1 && renderRoleStep()}
                {currentStep === 2 && (
                    <OrientationCaptureStep
                        currentStep={2}
                        totalSteps={9}
                        onComplete={(seeds) => {
                            setOrientationSeeds(seeds);
                            setCurrentStep(3);
                        }}
                        onSkip={() => setCurrentStep(3)}
                        onBack={() => setCurrentStep(1)}
                    />
                )}
                {currentStep >= 3 && currentStep <= 7 && renderTourStep(currentStep)}
                {currentStep === 8 && renderAuthStep()}
            </VStack>
        </ScreenWrapper>
    );
}
