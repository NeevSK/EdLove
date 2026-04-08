import React, { useState, useMemo, useEffect } from 'react';
import { 
    Box, 
    Pressable, 
    VStack, 
    HStack, 
    Input, 
    InputField, 
    Button, 
    ButtonText, 
    Text, 
    Heading, 
    Center 
} from '../gluestack';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../theme/Theme';
import { Role, supabase, identityAPI, authAPI } from '@repo/core';
import { hapticLight, hapticSuccess, hapticError } from '../utils/haptics';
import ScreenWrapper from '../components/ScreenWrapper';
import { useTheme } from '../hooks/useTheme';
import { useSanctuaryToast } from '../providers/ToastProvider';
import { ProgressIndicator } from '../components/ProgressIndicator';

const JOURNEY_PILLARS = ['Self', 'Classroom', 'Community', 'Library'];
const TOTAL_STEPS = 7;

interface OnboardingScreenProps {
    onComplete: (name: string, role: Role, wantsAccount?: boolean) => void;
    isAnonymous?: boolean;
}

export default function OnboardingScreen({ onComplete, isAnonymous = false }: OnboardingScreenProps) {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const theme = useTheme();
    const { accent, text, isDark } = theme;
    const [currentStep, setCurrentStep] = useState(0); // 0: Name, 1: Role, 2-6: Tour
    const [name, setName] = useState('');
    const [role, setRole] = useState<Role>('teacher');
    const [isCompleting, setIsCompleting] = useState(false);
    const toast = useSanctuaryToast();

    const StepShell = ({
        step,
        title,
        subtitle,
        children,
    }: {
        step: string;
        title: string;
        subtitle: string;
        children: React.ReactNode;
    }) => (
        <VStack className="flex-1 px-5 pt-5 pb-6">
            <Box
                className="rounded-generous border border-phase-border bg-phase-secondary overflow-hidden elevation-4"
                style={{
                  shadowColor: '#6B6480', // shadowViolet
                  shadowOffset: { width: 0, height: 14 },
                  shadowOpacity: 0.1,
                  shadowRadius: 24,
                }}
            >
                <Box
                    className="px-6 py-6 bg-phase-surface border-b border-phase-border"
                >
                    <VStack className="gap-4">
                        <HStack className="gap-2 flex-wrap">
                            {JOURNEY_PILLARS.map((pillar) => (
                                <Box
                                    key={pillar}
                                    className="px-3 py-1 rounded-full bg-phase-canvas border border-phase-border"
                                >
                                    <Text className="text-xs text-phase-text-secondary font-bold">
                                        {pillar}
                                    </Text>
                                </Box>
                            ))}
                        </HStack>
                        <ProgressIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
                        <VStack className="gap-1">
                            <Text className="text-xs text-phase-accent font-bold tracking-widest uppercase">
                                {step}
                            </Text>
                            <Heading size="2xl" className="text-phase-text-primary">
                                {title}
                            </Heading>
                            <Text className="text-phase-text-secondary">
                                {subtitle}
                            </Text>
                        </VStack>
                    </VStack>
                </Box>
                <Box className="px-6 py-8">
                    {children}
                </Box>
            </Box>
        </VStack>
    );

    // ── Restore saved progress or pre-fill from existing auth ──────────
    React.useEffect(() => {
        const initOnboarding = async () => {
            const internalId = await identityAPI.getMyInternalId();

            // Try to restore mid-flow progress for this user
            try {
                const saved = await AsyncStorage.getItem('onboarding_progress');
                if (saved) {
                    const progress = JSON.parse(saved);
                    if (!internalId || progress.userId === internalId) {
                        if (progress.name) setName(progress.name);
                        if (progress.role) setRole(progress.role as Role);
                        if (typeof progress.step === 'number' && progress.step >= 0 && progress.step < 7) {
                            setCurrentStep(progress.step);
                            return; 
                        }
                    }
                }
            } catch { /* ignore corrupt storage */ }

            // No saved progress — pre-fill for verified (non-anonymous) users with a real name
            if (!internalId) {
                // This is likely a deep-link where the session wasn't initialized yet.
                // We trigger an anonymous sign-in here to ensure the wizard has an ID.
                console.log('🧭 OnboardingScreen: No internalId found, initiating anonymous session...');
                await authAPI.signInAnonymously();
                // Re-run the initialization once signed in
                return initOnboarding();
            }
            const { data: profile } = await supabase
                .from('users')
                .select('full_name, is_anonymous, role, onboarding_completed')
                .eq('id', internalId)
                .maybeSingle();

            if (!profile) return;

            // Step 1.1: If already onboarded in DB, just finish locally
            if (profile.onboarding_completed && profile.role) {
                console.log('✅ Onboarding: Profile already marked as completed in DB, finalizing...');
                setName(profile.full_name || '');
                setRole(profile.role as Role);
                onComplete(profile.full_name || '', profile.role as Role, false);
                return;
            }

            const PLACEHOLDER_NAMES = ['Guest User', 'Gurudevi User', 'Sanctuary User'];
            if (!profile.is_anonymous && profile.full_name && !PLACEHOLDER_NAMES.includes(profile.full_name)) {
                setName(profile.full_name);
                if (profile.role) {
                    setRole(profile.role as Role);
                    setCurrentStep(1);
                } else {
                    setCurrentStep(1);
                }
            }
        };
        initOnboarding();
    }, []);

    const tourScreens = useMemo(() => [
        {
            emoji: '💠',
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

    // Steps: 0-Name, 1-Role, 2-6-Tour

    const canProceed = currentStep === 0 ? name.trim().length > 0 : true;

    // Save progress whenever step/name/role/seeds change (so app-close resumes correctly)
    React.useEffect(() => {
        if (currentStep === 0 && !name) return; // Nothing to save yet
        identityAPI.getMyInternalId().then((userId) => {
            AsyncStorage.setItem('onboarding_progress', JSON.stringify({
                userId,
                step: currentStep,
                name,
                role,
            })).catch(() => {/* silent */ });
        });
    }, [currentStep, name, role]);

    const handleNext = async () => {
        if (!canProceed) return;
        hapticLight();

        // If tour completed, finish onboarding
        if (currentStep === 6) {
            handleCompleteOnboarding();
            return;
        }

        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        hapticLight();
        setCurrentStep(prev => Math.max(0, prev - 1));
    };

    const handleSkipTour = () => {
        hapticLight();
        handleCompleteOnboarding();
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
                const schoolName = `${name || 'My'}'s Workspace`;
                
                // Note: The schools table currently has a broken trigger referencing 
                // \"create_personal_workspace_unified()\". We wrap this in a try/catch-style 
                // logic to ensure onboarding completes even if workspace creation fails.
                const { data: schoolData, error: schoolError } = await supabase
                    .from('schools')
                    .insert({ 
                        name: schoolName, 
                        type: 'personal_workspace', 
                        created_by: internalId 
                    })
                    .select()
                    .single();
                
                if (schoolError) {
                    console.warn('⚠️ [Onboarding] Workspace creation failed (likely broken DB trigger):', schoolError.message);
                    // We continue with schoolId = null. The app will render the \"Guest Gate\" 
                    // (Join/Create Workspace) as a fallback, which is a stable state.
                } else {
                    schoolId = schoolData?.id;
                    console.log('✅ [Onboarding] Personal workspace created:', schoolId);
                }
            }

            // 2. Update user profile
            const currentSession = await authAPI.getSession().catch(() => null);
            const actuallyAnonymous = currentSession?.user?.is_anonymous ?? true;

            const { error: profileError } = await supabase
                .from('users')
                .upsert({
                    id: internalId,
                    full_name: name || 'Gurudevi User',
                    role: role,
                    school_id: schoolId,
                    onboarding_completed: true,
                    onboarding_completed_at: new Date().toISOString(),
                    is_anonymous: actuallyAnonymous,
                });

            if (profileError) {
                console.error('❌ Onboarding: Profile upsert failed:', profileError.message);
                throw profileError;
            }
            
            console.log('✅ Onboarding: Profile successfully synced to DB.');

            await AsyncStorage.removeItem('onboarding_progress');
            onComplete(name, role, false);
        } catch (error) {
            console.error('Error completing onboarding:', error);
            hapticError();
            setIsCompleting(false);
            toast.showToast({ message: 'Failed to save profile. Please try again.', type: 'error' });
        }
    };

    // --- Renderers ---

    const renderNameStep = () => (
        <StepShell
            step="STEP 1 · ARRIVAL"
            title={t('onboarding.nameTitle') || 'Welcome! What should we call you?'}
            subtitle={t('onboarding.nameSubtitle') || "Let's start your journey with a name."}
        >
            <VStack className="gap-6">
                <Input className="rounded-comfortable border-phase-text-tertiary">
                    <InputField
                        placeholder={t('onboarding.namePlaceholder')}
                        value={name}
                        onChangeText={setName}
                        className="text-phase-text-primary"
                    />
                </Input>
                <Text className="text-phase-text-secondary text-sm">
                    This name becomes the gentle way Gurudevi addresses you across your sanctuary surfaces.
                </Text>
                <Button size="lg" onPress={handleNext} isDisabled={!canProceed} className="bg-phase-accent mt-2">
                    <ButtonText className="text-phase-text-on-accent font-bold">{t('onboarding.continue')}</ButtonText>
                </Button>
                <Button
                    variant="ghost"
                    onPress={() => {
                        hapticLight();
                        if (navigation.canGoBack()) {
                            navigation.goBack();
                        } else {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Welcome' }],
                            });
                        }
                    }}
                    className="mt-1"
                >
                    <ButtonText className="text-phase-text-tertiary">{t('onboarding.backToWelcome') || 'Back to Welcome'}</ButtonText>
                </Button>
            </VStack>
        </StepShell>
    );

    const ROLE_OPTIONS: Array<{ value: Role; emoji: string; descKey: string }> = [
        { value: 'teacher', emoji: '🧑‍🏫', descKey: 'onboarding.roleDesc.teacher' },
        { value: 'student', emoji: '🎒', descKey: 'onboarding.roleDesc.student' },
        { value: 'principal', emoji: '🏫', descKey: 'onboarding.roleDesc.principal' },
    ];

    const renderRoleStep = () => (
        <VStack className="gap-6 mt-8 px-6">
            <ProgressIndicator currentStep={1} totalSteps={TOTAL_STEPS} />
            <Heading size="2xl" className="text-phase-accent text-center">
                {t('onboarding.roleTitle')}
            </Heading>
            <Text className="text-md text-phase-text-secondary text-center">
                {t('onboarding.roleSubtitle')}
            </Text>
            <VStack className="gap-4">
                {ROLE_OPTIONS.map((r) => {
                    const selected = role === r.value;
                    return (
                        <Pressable
                            key={r.value}
                            onPress={() => { setRole(r.value); hapticLight(); }}
                            accessibilityRole="radio"
                            accessibilityState={{ selected }}
                            className={`
                                border-2 rounded-comfortable p-4 flex-row items-center
                                ${selected ? 'border-phase-accent bg-phase-accent/10' : 'border-phase-border bg-phase-secondary'}
                            `}
                        >
                            <Text className="text-2xl mr-3">{r.emoji}</Text>
                            <VStack className="flex-1">
                                <Text
                                    className={`text-md font-bold ${selected ? 'text-phase-accent' : 'text-phase-text-primary'}`}
                                >
                                    {t(`role.${r.value}`)}
                                </Text>
                                <Text className="text-sm text-phase-text-secondary">
                                    {t(r.descKey)}
                                </Text>
                            </VStack>
                            {selected && (
                                <Box
                                    className="w-5.5 h-5.5 rounded-full bg-phase-accent items-center justify-center"
                                >
                                    <Text className="text-xs text-phase-text-on-accent">✓</Text>
                                </Box>
                            )}
                        </Pressable>
                    );
                })}
            </VStack>
            <HStack className="gap-4 mt-6">
                <Button variant="outline" onPress={handleBack} className="flex-1 border-phase-border">
                    <ButtonText className="text-phase-text-primary">{t('onboarding.back')}</ButtonText>
                </Button>
                <Button onPress={handleNext} className="bg-phase-accent flex-[2]">
                    <ButtonText className="text-phase-text-on-accent font-bold">{t('onboarding.continue')}</ButtonText>
                </Button>
            </HStack>
        </VStack>
    );

    const renderTourStep = (index: number) => {
        const tourIdx = index - 2; // steps 2-6 map to tour screens 0-4
        const screen = tourScreens[tourIdx];
        if (!screen) return null;

        return (
            <VStack className="gap-6 mt-8 px-6 flex-1">
                <ProgressIndicator currentStep={index} totalSteps={TOTAL_STEPS} />
                <VStack
                    className="gap-4 items-center"
                >
                    <Text
                        className="text-6xl text-center leading-[80px]"
                        accessible={false}
                    >
                        {screen.emoji}
                    </Text>
                    <Heading
                        size="2xl"
                        className="text-phase-accent text-center"
                        accessibilityRole="header"
                    >
                        {screen.title}
                    </Heading>
                    <Text className="text-phase-text-secondary text-center text-lg font-bold">{screen.subtitle}</Text>
                    <Box className="flex-1 justify-center py-4">
                        <Text className="text-center text-phase-text-primary text-md leading-relaxed">{screen.content}</Text>
                    </Box>
                </VStack>
                <VStack className="gap-4 mt-auto pb-6">
                    <HStack className="gap-4">
                        <Button variant="outline" onPress={handleBack} className="flex-1 border-phase-border">
                            <ButtonText className="text-phase-text-primary">{t('onboarding.back')}</ButtonText>
                        </Button>
                        <Button onPress={handleNext} className="bg-phase-accent flex-[2]">
                            <ButtonText className="text-phase-text-on-accent font-bold">{index === 6 ? t('onboarding.finish') : t('onboarding.next')}</ButtonText>
                        </Button>
                    </HStack>
                    <Button variant="ghost" onPress={handleSkipTour}>
                        <ButtonText className="text-phase-text-tertiary">{t('onboarding.skip')}</ButtonText>
                    </Button>
                </VStack>
            </VStack>
        );
    };

    return (
        <ScreenWrapper>
            <Box className="flex-1 bg-phase-world">
                {/* Decorative Elements */}
                <Box
                    className="absolute -top-12 -right-10 w-44 h-44 rounded-full bg-phase-accent/10"
                />
                <Box
                    className="absolute -left-5 bottom-24 w-40 h-40 rounded-full bg-gurudeviBlue/10"
                />
                
                <VStack className="flex-1">
                    <VStack className="px-6 pt-5 pb-2 gap-2">
                        <HStack className="gap-2 flex-wrap">
                            {JOURNEY_PILLARS.map((pillar) => (
                                <Box
                                    key={pillar}
                                    className="px-3 py-1 rounded-full bg-phase-secondary/80 border border-phase-border"
                                >
                                    <Text className="text-xs text-phase-text-secondary font-bold">
                                        {pillar}
                                    </Text>
                                </Box>
                            ))}
                        </HStack>
                        <Text className="text-xs text-phase-accent font-bold tracking-widest uppercase">
                            SANCTUARY JOURNEY
                        </Text>
                    </VStack>
                    
                    {isCompleting ? (
                        <Center className="flex-1">
                            <Text className="text-phase-text-primary">Finalizing your sanctuary...</Text>
                        </Center>
                    ) : (
                        <>
                            {currentStep === 0 && renderNameStep()}
                            {currentStep === 1 && renderRoleStep()}
                            {currentStep >= 2 && currentStep <= 6 && renderTourStep(currentStep)}
                        </>
                    )}
                </VStack>
            </Box>
        </ScreenWrapper>
    );
}
