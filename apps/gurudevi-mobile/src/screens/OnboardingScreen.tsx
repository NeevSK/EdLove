// Onboarding Screen - Screens 1-7 for new users
// Screens 1-2: Name + Role (NOT skippable)
// Screens 3-7: Philosophy, Five Sections, Ecology, Privacy, Navigation (SKIPPABLE)

import React, { useState, useRef, useMemo } from 'react';
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
    ScrollView,
    Pressable,
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
} from '@/ui';
import { ChevronRight, ChevronDown, ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../constants/Theme';
import { UserRole } from '../types/User';
import { supabase } from '../lib/supabase';
import { hapticLight, hapticSuccess } from '../utils/haptics';
import ScreenWrapper from '../components/shared/ScreenWrapper';
import { useThemedColors } from '../hooks/useThemedColors';

interface OnboardingScreenProps {
    onComplete: (name: string, role: UserRole) => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [currentScreen, setCurrentScreen] = useState(0);
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>('teacher');
    const [isLoading, setIsLoading] = useState(true);
    const toast = useToast();

    // Use useMemo for screens to avoid recreation on every render, 
    // especially since we need to pass dynamic colors now.
    const screens = useMemo(() => [
        // Screen 0: Name (NOT skippable)
        {
            skippable: false,
            title: t('onboarding.nameTitle') || 'Welcome! What should we call you?',
            subtitle: t('onboarding.nameSubtitle') || "Let's start with your name",
            content: (
                <VStack space="lg" mt="$6">
                    <Input
                        variant="outline"
                        size="xl"
                        sx={{
                            borderColor: colors.textTertiary,
                            borderRadius: Theme.corners.comfortable,
                            backgroundColor: colors.secondary,
                        }}
                    >
                        <InputField
                            placeholder={t('onboarding.namePlaceholder') || 'Enter your full name'}
                            value={name}
                            onChangeText={setName}
                            color={colors.text}
                            placeholderTextColor={colors.textTertiary}
                            fontSize={18}
                        />
                    </Input>
                    <Text color={colors.textSecondary} size="sm" textAlign="center">
                        {t('onboarding.nameHint') || "This is how you'll be known in the Gurudevi community"}
                    </Text>
                </VStack>
            ),
        },
        // Screen 1: Role (NOT skippable)
        {
            skippable: false,
            title: t('onboarding.roleTitle') || 'What is your role?',
            subtitle: t('onboarding.roleSubtitle') || 'This helps us personalize your experience',
            content: (
                <VStack space="lg" mt="$6">
                    <Select
                        selectedValue={role}
                        onValueChange={(value: string) => {
                            hapticLight();
                            setRole(value as UserRole);
                        }}
                    >
                        <SelectTrigger
                            variant="outline"
                            size="xl"
                            sx={{
                                borderColor: colors.textTertiary,
                                borderRadius: Theme.corners.comfortable,
                                backgroundColor: colors.secondary,
                            }}
                        >
                            <SelectInput
                                placeholder={t('onboarding.selectRole') || 'Select your role'}
                                color={colors.text}
                                fontSize={18}
                            />
                            <SelectIcon mr="$3" as={ChevronDown} color={colors.textTertiary} />
                        </SelectTrigger>
                        <SelectPortal>
                            <SelectBackdrop />
                            <SelectContent>
                                <SelectDragIndicatorWrapper>
                                    <SelectDragIndicator />
                                </SelectDragIndicatorWrapper>
                                <SelectItem label={t('auth.founder') || 'Founder'} value="founder" />
                                <SelectItem label={t('auth.admin') || 'Admin'} value="admin" />
                                <SelectItem label={t('auth.principal') || 'Principal'} value="principal" />
                                <SelectItem label={t('auth.sectionHead') || 'Section Head'} value="section_head" />
                                <SelectItem label={t('auth.gradeHead') || 'Grade Head'} value="grade_head" />
                                <SelectItem label={t('auth.teacher') || 'Teacher'} value="teacher" />
                                <SelectItem label={t('auth.student') || 'Student'} value="student" />
                            </SelectContent>
                        </SelectPortal>
                    </Select>
                    <Text color={colors.textTertiary} size="sm" textAlign="center">
                        {t('onboarding.roleHint') || "Don't worry, you can update this later in settings"}
                    </Text>
                </VStack>
            ),
        },
        // Screen 2: Welcome (SKIPPABLE)
        {
            skippable: true,
            title: t('onboarding.welcomeTitle') || 'Welcome to Gurudevi',
            subtitle: t('onboarding.welcomeSubtitle') || 'Education born from Love, built with Love',
            content: (
                <VStack space="md" mt="$6" px="$4">
                    <Text color={colors.textSecondary} size="md" textAlign="center" lineHeight="$xl">
                        Gurudevi is not surveillance. It's support.
                    </Text>
                    <Text color={colors.textSecondary} size="md" textAlign="center" lineHeight="$xl">
                        Not control. It's listening.
                    </Text>
                    <Text color={colors.textSecondary} size="md" textAlign="center" lineHeight="$xl">
                        It exists to repair broken feedback loops in education.
                    </Text>
                    <Box height={20} />
                    <Text color={colors.action} size="lg" textAlign="center" fontWeight="$semibold">
                        Education is a living ecology.
                    </Text>
                </VStack>
            ),
        },
        // Screen 3: Five Sections (SKIPPABLE)
        {
            skippable: true,
            title: t('onboarding.sectionsTitle') || 'Five Stable Sections',
            subtitle: t('onboarding.sectionsSubtitle') || 'Your compass through Gurudevi',
            content: (
                <VStack space="md" mt="$4" px="$2">
                    <SectionCard
                        number="1"
                        title="Self"
                        description="Your inner ecology. Reflection, journaling, personal growth."
                        color={colors.error} // EmberOrange approx
                        themeColors={colors}
                    />
                    <SectionCard
                        number="2"
                        title="Classroom"
                        description="Your operational ecology. Students, lessons, attendance."
                        color="#63AD33" // SageGreen approx
                        themeColors={colors}
                    />
                    <SectionCard
                        number="3"
                        title="Community"
                        description="Your relational ecology. Peer connections, discussions."
                        color="#4A90E2" // TwilightBlue approx
                        themeColors={colors}
                    />
                    <SectionCard
                        number="4"
                        title="Library"
                        description="Your knowledge ecology. Resources, references, sharing."
                        color="#9B51E0" // LavenderMist approx
                        themeColors={colors}
                    />
                    <SectionCard
                        number="5"
                        title="Profile"
                        description="Your identity. Settings, role, boundaries."
                        color={colors.action}
                        themeColors={colors}
                    />
                </VStack>
            ),
        },
        // Screen 4: Ecology (SKIPPABLE)
        {
            skippable: true,
            title: t('onboarding.ecologyTitle') || 'Educational Ecology',
            subtitle: t('onboarding.ecologySubtitle') || 'One reality, multiple lenses',
            content: (
                <VStack space="lg" mt="$6" px="$4">
                    <PhilosophyPoint
                        icon="🌱"
                        title="Polycentric"
                        description="No single center of authority. Every role matters."
                        themeColors={colors}
                    />
                    <PhilosophyPoint
                        icon="🔄"
                        title="Autopoietic"
                        description="Each level sustains itself. Self-organizing."
                        themeColors={colors}
                    />
                    <PhilosophyPoint
                        icon="✨"
                        title="Emergent"
                        description="Patterns arise from interactions. Not imposed."
                        themeColors={colors}
                    />
                    <PhilosophyPoint
                        icon="🎯"
                        title="Constraint-based"
                        description="Guided by boundaries, not instructions."
                        themeColors={colors}
                    />
                </VStack>
            ),
        },
        // Screen 5: Privacy (SKIPPABLE)
        {
            skippable: true,
            title: t('onboarding.privacyTitle') || 'Your Privacy, Protected',
            subtitle: t('onboarding.privacySubtitle') || 'These are our commitments to you',
            content: (
                <VStack space="lg" mt="$6" px="$4">
                    <CommitmentCard
                        icon="🚫"
                        title="No Surveillance"
                        description="We don't watch. We support."
                        themeColors={colors}
                    />
                    <CommitmentCard
                        icon="🤝"
                        title="No Forced Comparison"
                        description="Your journey is yours alone."
                        themeColors={colors}
                    />
                    <CommitmentCard
                        icon="🎁"
                        title="No Extractive Gamification"
                        description="No badges for badges' sake."
                        themeColors={colors}
                    />
                    <CommitmentCard
                        icon="🔒"
                        title="Individual Data Protected"
                        description="Private by default. Sharing is intentional."
                        themeColors={colors}
                    />
                </VStack>
            ),
        },
        // Screen 6: Navigation (SKIPPABLE)
        {
            skippable: true,
            title: t('onboarding.navigationTitle') || "You're All Set!",
            subtitle: t('onboarding.navigationSubtitle') || 'Ready to begin your journey',
            content: (
                <VStack space="lg" mt="$6" px="$4">
                    <Text color={colors.textSecondary} size="md" textAlign="center" lineHeight="$xl">
                        Use the tab bar at the bottom to navigate between sections.
                    </Text>
                    <Text color={colors.textSecondary} size="md" textAlign="center" lineHeight="$xl">
                        Start with <Text color={colors.action} fontWeight="$semibold">Self</Text> to explore your inner sanctuary.
                    </Text>
                    <Text color={colors.textSecondary} size="md" textAlign="center" lineHeight="$xl">
                        Visit <Text color={colors.action} fontWeight="$semibold">Classroom</Text> to begin working with students.
                    </Text>
                    <Box height={20} />
                    <Text color={colors.action} size="lg" textAlign="center" fontWeight="$semibold">
                        Welcome home. 🙏
                    </Text>
                </VStack>
            ),
        },
    ], [colors, name, role, t]);

    // Effect to load saved progress on mount (Failsafe Design)
    React.useEffect(() => {
        const loadProgress = async () => {
            try {
                const savedProgress = await AsyncStorage.getItem('onboarding_progress');
                if (savedProgress) {
                    const { screen, name: savedName, role: savedRole } = JSON.parse(savedProgress);
                    setCurrentScreen(screen);
                    setName(savedName);
                    setRole(savedRole);
                }
            } catch (error) {
                console.error('Error loading onboarding progress:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadProgress();
    }, []);

    // Effect to save progress whenever it changes (Failsafe Design)
    React.useEffect(() => {
        if (isLoading) return;
        const saveProgress = async () => {
            try {
                await AsyncStorage.setItem('onboarding_progress', JSON.stringify({
                    screen: currentScreen,
                    name,
                    role
                }));
            } catch (error) {
                console.error('Error saving onboarding progress:', error);
            }
        };
        saveProgress();
    }, [currentScreen, name, role, isLoading]);

    const currentScreenData = screens[currentScreen];
    const canProceed = currentScreen === 0
        ? name.trim().length > 0
        : currentScreen === 1
            ? !!role
            : true;

    const handleNext = () => {
        if (!canProceed) return;
        hapticLight();
        if (currentScreen < screens.length - 1) {
            setCurrentScreen(currentScreen + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentScreen > 0) {
            hapticLight();
            setCurrentScreen(currentScreen - 1);
        }
    };

    const handleReset = async () => {
        hapticLight();
        try {
            await AsyncStorage.removeItem('onboarding_progress');
            setCurrentScreen(0);
            setName('');
            setRole('teacher');
        } catch (error) {
            console.error('Error resetting onboarding:', error);
        }
    };

    const handleSkip = () => {
        if (!currentScreenData.skippable) return;
        hapticLight();
        handleComplete();
    };

    const handleComplete = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            // 1. Create a default school (Personal Workspace) if they don't have one
            // This ensures they can create classrooms immediately
            const schoolName = `${name}'s Workspace`;
            const schoolType = 'personal_workspace';

            const { data: schoolData, error: schoolError } = await supabase
                .from('schools')
                .insert({
                    name: schoolName,
                    type: schoolType,
                    created_by: user.id,
                })
                .select()
                .single();

            if (schoolError) {
                console.warn('⚠️ Onboarding: Failed to create default school (might already exist):', schoolError.message);
            }

            // 2. Update user profile
            const { error: profileError } = await supabase
                .from('users')
                .upsert({
                    id: user.id,
                    email: user.email,
                    full_name: name,
                    role: role,
                    school_id: schoolData?.id || null, // Best effort
                    onboarding_completed: true,
                    onboarding_completed_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (profileError) throw profileError;

            // Update local store if school was created
            if (schoolData) {
                const { setSchoolType } = useStore.getState();
                setSchoolType(schoolType as any);
            }

            await AsyncStorage.removeItem('onboarding_progress');
            hapticSuccess();
            onComplete(name, role);
        } catch (error) {
            console.error('Error completing onboarding:', error);
            toast.show({
                placement: 'bottom',
                render: ({ id }: { id: string }) => (
                    <Toast nativeID={id} action="error" variant="solid">
                        <ToastTitle>Failed to complete onboarding. Please try again.</ToastTitle>
                    </Toast>
                ),
            });
        }
    };

    return (
        <ScreenWrapper keyboardAvoiding={currentScreen <= 1}>
            {/* Header with Skip */}
            <Box
                sx={{
                    px: '$6',
                    pb: '$2',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Box width={40}>
                    <Pressable onPress={handleReset}>
                        <Text color={colors.textTertiary} size="xs" fontWeight="$medium">
                            {String(t('common.reset') || 'Reset')}
                        </Text>
                    </Pressable>
                </Box>

                <HStack space="xs" justifyContent="center">
                    {screens.map((_, index) => (
                        <Box
                            key={index}
                            sx={{
                                width: 6,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: index === currentScreen
                                    ? colors.action
                                    : colors.textTertiary,
                                opacity: index === currentScreen ? 1 : 0.3,
                            }}
                        />
                    ))}
                </HStack>

                <Box width={40}>
                    {currentScreenData.skippable && (
                        <Pressable onPress={handleSkip}>
                            <Text color={colors.textTertiary} size="sm" fontWeight="$medium">
                                {t('onboarding.skip') || 'Skip'}
                            </Text>
                        </Pressable>
                    )}
                </Box>
            </Box>

            {/* Content Container */}
            <ScrollView
                sx={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: 20,
                    paddingBottom: 120
                }}
            >
                <VStack space="md" px="$6">
                    <Heading color={colors.action} size="2xl" textAlign="center">
                        {currentScreenData.title}
                    </Heading>
                    <Text color={colors.textSecondary} size="md" textAlign="center">
                        {currentScreenData.subtitle}
                    </Text>
                    {currentScreenData.content}
                </VStack>
            </ScrollView>

            {/* Persistent Bottom Controls */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: colors.primary, // Using primary for bottom bar
                    opacity: 0.95,
                    paddingHorizontal: Theme.spacing.xl,
                    paddingVertical: Theme.spacing.lg,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                }}
            >
                <HStack justifyContent="space-between" alignItems="center">
                    <Box width={50}>
                        {currentScreen > 0 && (
                            <Pressable
                                onPress={handleBack}
                                sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 22,
                                    backgroundColor: colors.secondary,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <ChevronLeft size={24} color={colors.textSecondary} />
                            </Pressable>
                        )}
                    </Box>

                    <Text color={colors.textTertiary} size="xs" fontWeight="$medium">
                        {`${currentScreen + 1} of ${screens.length}`}
                    </Text>

                    <Box>
                        <Button
                            size="lg"
                            onPress={handleNext}
                            isDisabled={!canProceed}
                            sx={{
                                backgroundColor: canProceed
                                    ? colors.action
                                    : colors.textTertiary,
                                borderRadius: Theme.corners.comfortable,
                                px: currentScreen === screens.length - 1 ? '$6' : '$4',
                                height: 50,
                                minWidth: currentScreen === screens.length - 1 ? 140 : 50,
                            }}
                        >
                            {currentScreen === screens.length - 1 ? (
                                <ButtonText color={Theme.colors.white} fontWeight="$bold" size="lg">
                                    {t('onboarding.complete') || 'Complete'}
                                </ButtonText>
                            ) : (
                                <ChevronRight size={28} color={Theme.colors.white} />
                            )}
                        </Button>
                    </Box>
                </HStack>
            </Box>
        </ScreenWrapper>
    );
}

// Helper Components

function SectionCard({ number, title, description, color, themeColors }: {
    number: string;
    title: string;
    description: string;
    color: string;
    themeColors: any;
}) {
    return (
        <HStack
            space="md"
            p="$4"
            sx={{
                backgroundColor: themeColors.secondary,
                borderRadius: Theme.corners.comfortable,
                borderLeftWidth: 4,
                borderLeftColor: color,
            }}
        >
            <Box
                sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: color,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Text color={Theme.colors.white} size="lg" fontWeight="$bold">
                    {String(number)}
                </Text>
            </Box>
            <VStack space="xs" flex={1}>
                <Text color={themeColors.text} size="md" fontWeight="$semibold">
                    {title}
                </Text>
                <Text color={themeColors.textTertiary} size="sm">
                    {description}
                </Text>
            </VStack>
        </HStack>
    );
}

function PhilosophyPoint({ icon, title, description, themeColors }: {
    icon: string;
    title: string;
    description: string;
    themeColors: any;
}) {
    return (
        <HStack space="md" alignItems="flex-start">
            <Box px="$1">
                <Text sx={{ fontSize: 32 }}>{String(icon)}</Text>
            </Box>
            <VStack space="xs" flex={1}>
                <Text color={themeColors.action} size="lg" fontWeight="$semibold">
                    {String(title)}
                </Text>
                <Text color={themeColors.textTertiary} size="md">
                    {String(description)}
                </Text>
            </VStack>
        </HStack>
    );
}

function CommitmentCard({ icon, title, description, themeColors }: {
    icon: string;
    title: string;
    description: string;
    themeColors: any;
}) {
    return (
        <HStack
            space="md"
            p="$4"
            sx={{
                backgroundColor: themeColors.secondary,
                borderRadius: Theme.corners.comfortable,
            }}
        >
            <Box px="$1">
                <Text sx={{ fontSize: 24 }}>{String(icon)}</Text>
            </Box>
            <VStack space="xs" flex={1}>
                <Text color={themeColors.action} size="md" fontWeight="$semibold">
                    {String(title)}
                </Text>
                <Text color={themeColors.textTertiary} size="sm">
                    {String(description)}
                </Text>
            </VStack>
        </HStack>
    );
}
