// Onboarding Screen - Screens 1-7 for new users
// Screens 1-2: Name + Role (NOT skippable)
// Screens 3-7: Philosophy, Five Sections, Ecology, Privacy, Navigation (SKIPPABLE)

import React, { useState, useRef } from 'react';
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

interface OnboardingScreenProps {
    onComplete: (name: string, role: UserRole) => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const { t } = useTranslation();
    const [currentScreen, setCurrentScreen] = useState(0);
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>('teacher');
    const [isLoading, setIsLoading] = useState(true);
    const toast = useToast();

    const screens = [
        // Screen 0: Name (NOT skippable)
        {
            skippable: false,
            title: t('onboarding.nameTitle') || 'Welcome! What should we call you?',
            subtitle: t('onboarding.nameSubtitle') || 'Let\'s start with your name',
            content: (
                <VStack space="lg" mt="$6">
                    <Input
                        variant="outline"
                        size="xl"
                        sx={{
                            borderColor: Theme.colors.mistGray,
                            borderRadius: Theme.corners.comfortable,
                            backgroundColor: Theme.colors.deepIndigo,
                        }}
                    >
                        <InputField
                            placeholder={t('onboarding.namePlaceholder') || 'Enter your full name'}
                            value={name}
                            onChangeText={setName}
                            color={Theme.colors.sacredWhite}
                            placeholderTextColor={Theme.colors.dimGray}
                            fontSize={18}
                        />
                    </Input>
                    <Text color={Theme.colors.mistGray} size="sm" textAlign="center">
                        {t('onboarding.nameHint') || 'This is how you\'ll be known in the Gurudevi community'}
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
                                borderColor: Theme.colors.mistGray,
                                borderRadius: Theme.corners.comfortable,
                                backgroundColor: Theme.colors.deepIndigo,
                            }}
                        >
                            <SelectInput
                                placeholder={t('onboarding.selectRole') || 'Select your role'}
                                color={Theme.colors.sacredWhite}
                                fontSize={18}
                            />
                            <SelectIcon mr="$3" as={ChevronDown} color={Theme.colors.mistGray} />
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
                    <Text color={Theme.colors.mistGray} size="sm" textAlign="center">
                        {t('onboarding.roleHint') || 'Don\'t worry, you can update this later in settings'}
                    </Text>
                </VStack>
            ),
        },
        // Screen 2: Welcome to Gurudevi (SKIPPABLE)
        {
            skippable: true,
            title: t('onboarding.welcomeTitle') || 'Welcome to Gurudevi',
            subtitle: t('onboarding.welcomeSubtitle') || 'Education born from Love, built with Love',
            content: (
                <VStack space="md" mt="$6" px="$4">
                    <Text color={Theme.colors.pearlGray} size="md" textAlign="center" lineHeight="$xl">
                        Gurudevi is not surveillance. It's support.
                    </Text>
                    <Text color={Theme.colors.pearlGray} size="md" textAlign="center" lineHeight="$xl">
                        Not control. It's listening.
                    </Text>
                    <Text color={Theme.colors.pearlGray} size="md" textAlign="center" lineHeight="$xl">
                        It exists to repair broken feedback loops in education.
                    </Text>
                    <Box height={20} />
                    <Text color={Theme.colors.sanctuarySaffron} size="lg" textAlign="center" fontWeight="$semibold">
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
                        color={Theme.colors.emberOrange}
                    />
                    <SectionCard
                        number="2"
                        title="Classroom"
                        description="Your operational ecology. Students, lessons, attendance."
                        color={Theme.colors.sageGreen}
                    />
                    <SectionCard
                        number="3"
                        title="Community"
                        description="Your relational ecology. Peer connections, discussions."
                        color={Theme.colors.twilightBlue}
                    />
                    <SectionCard
                        number="4"
                        title="Library"
                        description="Your knowledge ecology. Resources, references, sharing."
                        color={Theme.colors.lavenderMist}
                    />
                    <SectionCard
                        number="5"
                        title="Profile"
                        description="Your identity. Settings, role, boundaries."
                        color={Theme.colors.sanctuarySaffron}
                    />
                </VStack>
            ),
        },
        // Screen 4: Educational Ecology (SKIPPABLE)
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
                    />
                    <PhilosophyPoint
                        icon="🔄"
                        title="Autopoietic"
                        description="Each level sustains itself. Self-organizing."
                    />
                    <PhilosophyPoint
                        icon="✨"
                        title="Emergent"
                        description="Patterns arise from interactions. Not imposed."
                    />
                    <PhilosophyPoint
                        icon="🎯"
                        title="Constraint-based"
                        description="Guided by boundaries, not instructions."
                    />
                </VStack>
            ),
        },
        // Screen 5: Privacy Commitment (SKIPPABLE)
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
                    />
                    <CommitmentCard
                        icon="🤝"
                        title="No Forced Comparison"
                        description="Your journey is yours alone."
                    />
                    <CommitmentCard
                        icon="🎁"
                        title="No Extractive Gamification"
                        description="No badges for badges' sake."
                    />
                    <CommitmentCard
                        icon="🔒"
                        title="Individual Data Protected"
                        description="Private by default. Sharing is intentional."
                    />
                </VStack>
            ),
        },
        // Screen 6: Navigation Guide (SKIPPABLE)
        {
            skippable: true,
            title: t('onboarding.navigationTitle') || 'You\'re All Set!',
            subtitle: t('onboarding.navigationSubtitle') || 'Ready to begin your journey',
            content: (
                <VStack space="lg" mt="$6" px="$4">
                    <Text color={Theme.colors.pearlGray} size="md" textAlign="center" lineHeight="$xl">
                        Use the tab bar at the bottom to navigate between sections.
                    </Text>
                    <Text color={Theme.colors.pearlGray} size="md" textAlign="center" lineHeight="$xl">
                        Start with <Text color={Theme.colors.sanctuarySaffron} fontWeight="$semibold">Self</Text> to explore your inner sanctuary.
                    </Text>
                    <Text color={Theme.colors.pearlGray} size="md" textAlign="center" lineHeight="$xl">
                        Visit <Text color={Theme.colors.sanctuarySaffron} fontWeight="$semibold">Classroom</Text> to begin working with students.
                    </Text>
                    <Box height={20} />
                    <Text color={Theme.colors.sanctuarySaffron} size="lg" textAlign="center" fontWeight="$semibold">
                        Welcome home. 🙏
                    </Text>
                </VStack>
            ),
        },
    ];

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
            console.log('Onboarding reset successfully');
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
        console.log('handleComplete triggered in OnboardingScreen');
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            console.log('Upserting user profile in Supabase...', { id: user.id, email: user.email, name, role });
            // Upsert user profile with id, email, name, role, and onboarding status
            // Using upsert ensures the row is created if it doesn't exist
            const { error } = await supabase
                .from('users')
                .upsert({
                    id: user.id,
                    email: user.email,
                    full_name: name,
                    role: role,
                    onboarding_completed: true,
                    onboarding_completed_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (error) {
                console.error('Supabase update error:', error);
                throw error;
            }

            console.log('User profile updated successfully in Supabase');

            // Clear local progress once finished
            await AsyncStorage.removeItem('onboarding_progress');
            console.log('Local progress cleared from AsyncStorage');

            hapticSuccess();
            console.log('Calling onComplete callback...');
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
        <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
            {/* Header with Skip */}
            <Box
                sx={{
                    pt: '$12',
                    px: '$6',
                    pb: '$2',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                {/* Top Left Reset Button (Debug/Dev Only) */}
                <Box width={40}>
                    <Pressable onPress={handleReset}>
                        <Text color={Theme.colors.dimGray} size="xs" fontWeight="$medium">
                            {String(t('common.reset') || 'Reset')}
                        </Text>
                    </Pressable>
                </Box>

                {/* Progress Dots integrated into header */}
                <HStack space="xs" justifyContent="center">
                    {screens.map((_, index) => (
                        <Box
                            key={index}
                            sx={{
                                width: 6,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: index === currentScreen
                                    ? Theme.colors.sanctuarySaffron
                                    : Theme.colors.mistGray,
                                opacity: index === currentScreen ? 1 : 0.3,
                            }}
                        />
                    ))}
                </HStack>

                {/* Top Right Skip Button */}
                <Box width={40}>
                    {currentScreenData.skippable && (
                        <Pressable onPress={handleSkip}>
                            <Text color={Theme.colors.mistGray} size="sm" fontWeight="$medium">
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
                    paddingBottom: 100
                }}
            >
                <VStack space="md" px="$6">
                    <Heading color={Theme.colors.sanctuarySaffron} size="2xl" textAlign="center">
                        {currentScreenData.title}
                    </Heading>
                    <Text color={Theme.colors.mistGray} size="md" textAlign="center">
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
                    backgroundColor: 'rgba(23, 23, 33, 0.95)', // Glass effect background
                    paddingHorizontal: Theme.spacing.xl,
                    paddingVertical: Theme.spacing.lg,
                    borderTopWidth: 1,
                    borderTopColor: 'rgba(255, 255, 255, 0.05)',
                }}
            >
                <HStack justifyContent="space-between" alignItems="center">
                    {/* Back Arrow Button */}
                    <Box width={50}>
                        {currentScreen > 0 && (
                            <Pressable
                                onPress={handleBack}
                                sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 22,
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <ChevronLeft size={24} color={Theme.colors.mistGray} />
                            </Pressable>
                        )}
                    </Box>

                    {/* Progress Text Helper */}
                    <Text color={Theme.colors.dimGray} size="xs" fontWeight="$medium">
                        {`${currentScreen + 1} of ${screens.length}`}
                    </Text>

                    {/* Next/Complete Button (Now an Arrow or Text for Complete) */}
                    <Box>
                        <Button
                            size="lg"
                            onPress={handleNext}
                            isDisabled={!canProceed}
                            sx={{
                                backgroundColor: canProceed
                                    ? Theme.colors.sanctuarySaffron
                                    : Theme.colors.mistGray,
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
        </Box>
    );
}

// Helper Components

function SectionCard({ number, title, description, color }: {
    number: string;
    title: string;
    description: string;
    color: string;
}) {
    return (
        <HStack
            space="md"
            p="$4"
            sx={{
                backgroundColor: Theme.colors.deepIndigo,
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
                <Text color={Theme.colors.sacredWhite} size="md" fontWeight="$semibold">
                    {title}
                </Text>
                <Text color={Theme.colors.mistGray} size="sm">
                    {description}
                </Text>
            </VStack>
        </HStack>
    );
}

function PhilosophyPoint({ icon, title, description }: {
    icon: string;
    title: string;
    description: string;
}) {
    return (
        <HStack space="md" alignItems="flex-start">
            <Box px="$1">
                <Text sx={{ fontSize: 32 }}>{String(icon)}</Text>
            </Box>
            <VStack space="xs" flex={1}>
                <Text color={Theme.colors.sanctuarySaffron} size="lg" fontWeight="$semibold">
                    {String(title)}
                </Text>
                <Text color={Theme.colors.mistGray} size="md">
                    {String(description)}
                </Text>
            </VStack>
        </HStack>
    );
}

function CommitmentCard({ icon, title, description }: {
    icon: string;
    title: string;
    description: string;
}) {
    return (
        <HStack
            space="md"
            p="$4"
            sx={{
                backgroundColor: Theme.colors.deepIndigo,
                borderRadius: Theme.corners.comfortable,
            }}
        >
            <Box px="$1">
                <Text sx={{ fontSize: 24 }}>{String(icon)}</Text>
            </Box>
            <VStack space="xs" flex={1}>
                <Text color={Theme.colors.sanctuarySaffron} size="md" fontWeight="$semibold">
                    {String(title)}
                </Text>
                <Text color={Theme.colors.mistGray} size="sm">
                    {String(description)}
                </Text>
            </VStack>
        </HStack>
    );
}
