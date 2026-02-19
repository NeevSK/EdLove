// Onboarding Screen - Screens 1-7 for new users
// Screens 1-2: Name + Role (NOT skippable)
// Screens 3-7: Philosophy, Five Sections, Ecology, Privacy, Navigation (SKIPPABLE)

// Onboarding Screen Redesign
import React, { useState, useMemo } from 'react';
import {
    Box,
    VStack,
    HStack,
    Input,
    InputField,
    Button,
    ButtonText,
    Text,
    Heading,
    useToast,
    Toast,
    ToastTitle,
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicatorWrapper,
    SelectDragIndicator,
    SelectItem,
} from '@repo/ui';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '@repo/ui';
import { UserRole, supabase, useStore } from '@repo/core';
import { hapticLight, hapticSuccess, hapticError } from '@repo/ui';
import { ScreenWrapper } from '@repo/ui';
import { useThemedColors } from '@repo/ui';
import AuthScreen from './AuthScreen';
import { ProgressIndicator } from '../components/ProgressIndicator';

interface OnboardingScreenProps {
    onComplete: (name: string, role: UserRole, wantsAccount?: boolean) => void;
    isAnonymous?: boolean;
}

export default function OnboardingScreen({ onComplete, isAnonymous = false }: OnboardingScreenProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [currentStep, setCurrentStep] = useState(0); // 0: Name, 1: Role, 2-6: Tour, 7: Auth
    console.log('🏁 Onboarding: Render', { currentStep, isAnonymous });
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>('teacher');
    const [isCompleting, setIsCompleting] = useState(false);
    const toast = useToast();

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
        setCurrentStep(7); // Jump to Auth
    };
    const handleCompleteOnboarding = async () => {
        console.log('🚀 Onboarding: Completing...', { name, role, isAnonymous });
        setIsCompleting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            console.log('👤 Onboarding: Auth user lookup', { userId: user?.id });
            if (!user) throw new Error('No user found');

            hapticSuccess();

            // Check if user already exists in public.users to avoid overwriting critical data
            const { data: existingProfile } = await supabase
                .from('users')
                .select('school_id')
                .eq('id', user.id)
                .single();

            // 1. Create a default school (Personal Workspace) only if they don't have one
            let schoolId = existingProfile?.school_id;
            if (!schoolId) {
                const schoolName = `${name}'s Workspace`;
                const { data: schoolData, error: schoolError } = await supabase
                    .from('schools')
                    .insert({ name: schoolName, type: 'personal_workspace', created_by: user.id })
                    .select().single();
                if (schoolError) console.warn('Workspace creation failed:', schoolError);
                schoolId = schoolData?.id;
            }

            // 2. Update user profile
            const { error: profileError } = await supabase
                .from('users')
                .upsert({
                    id: user.id,
                    full_name: name || user.user_metadata?.full_name || 'Sanctuary User',
                    role: role,
                    school_id: schoolId,
                    onboarding_completed: true,
                    onboarding_completed_at: new Date().toISOString(),
                    is_anonymous: isAnonymous,
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
            <ProgressIndicator currentStep={0} totalSteps={8} />
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
                <ButtonText color={Theme.colors.white}>{t('onboarding.continue')}</ButtonText>
            </Button>
        </VStack>
    );

    const renderRoleStep = () => (
        <VStack space="xl" mt="$8" px="$6">
            <ProgressIndicator currentStep={1} totalSteps={8} />
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
                        <SelectItem label={t('role.admin')} value="admin" />
                        <SelectItem label={t('role.founder')} value="founder" />
                    </SelectContent>
                </SelectPortal>
            </Select>
            <HStack space="md" mt="$6">
                <Button variant="outline" onPress={handleBack} sx={{ flex: 1 }}>
                    <ButtonText color={colors.text}>{t('onboarding.back')}</ButtonText>
                </Button>
                <Button onPress={handleNext} sx={{ backgroundColor: colors.action, flex: 2 }}>
                    <ButtonText color={Theme.colors.white}>{t('onboarding.continue')}</ButtonText>
                </Button>
            </HStack>
        </VStack>
    );

    const renderTourStep = (index: number) => {
        const tourIdx = index - 2;
        const screen = tourScreens[tourIdx];
        return (
            <VStack space="xl" mt="$8" px="$6" flex={1}>
                <ProgressIndicator currentStep={index} totalSteps={8} />
                {/* Emoji Icon */}
                <Text size="6xl" textAlign="center" sx={{ lineHeight: 80 }}>
                    {screen.emoji}
                </Text>
                <Heading size="2xl" color={colors.action} textAlign="center">{screen.title}</Heading>
                <Text color={colors.textSecondary} textAlign="center" size="lg" fontWeight="$bold">{screen.subtitle}</Text>
                <Box sx={{ flex: 1, justifyContent: 'center', py: '$4' }}>
                    <Text textAlign="center" color={colors.text} size="md" lineHeight="$xl">{screen.content}</Text>
                </Box>
                <VStack space="md" mt="$auto" pb="$4">
                    <HStack space="md">
                        <Button variant="outline" onPress={handleBack} sx={{ flex: 1 }}>
                            <ButtonText color={colors.text}>{t('onboarding.back')}</ButtonText>
                        </Button>
                        <Button onPress={handleNext} sx={{ backgroundColor: colors.action, flex: 2 }}>
                            <ButtonText color={Theme.colors.white}>{t('onboarding.next')}</ButtonText>
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
        />
    );

    return (
        <ScreenWrapper>
            <VStack flex={1}>
                {currentStep === 0 && renderNameStep()}
                {currentStep === 1 && renderRoleStep()}
                {currentStep >= 2 && currentStep <= 6 && renderTourStep(currentStep)}
                {currentStep === 7 && renderAuthStep()}
            </VStack>
        </ScreenWrapper>
    );
}
