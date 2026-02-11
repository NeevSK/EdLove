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
import { ChevronRight, ChevronDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
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

    const handleSkip = () => {
        if (!currentScreenData.skippable) return;
        hapticLight();
        handleComplete();
    };

    const handleComplete = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            // Update user profile with name, role, and onboarding status
            const { error } = await supabase
                .from('users')
                .update({
                    full_name: name,
                    role: role,
                    onboarding_completed: true,
                    onboarding_completed_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (error) throw error;

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
        <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
            {/* Progress Indicator */}
            <HStack space="xs" px="$6" pt="$12" pb="$4" justifyContent="center">
                {screens.map((_, index) => (
                    <Box
                        key={index}
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: index === currentScreen
                                ? Theme.colors.sanctuarySaffron
                                : Theme.colors.mistGray,
                            opacity: index === currentScreen ? 1 : 0.5,
                        }}
                    />
                ))}
            </HStack>

            {/* Content */}
            <ScrollView sx={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
                <VStack space="md" px="$6" pt="$6">
                    <Heading color={Theme.colors.sanctuarySaffron} size="2xl" textAlign="center">
                        {currentScreenData.title}
                    </Heading>
                    <Text color={Theme.colors.mistGray} size="md" textAlign="center">
                        {currentScreenData.subtitle}
                    </Text>
                    {currentScreenData.content}
                </VStack>
            </ScrollView>

            {/* Bottom Navigation */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: Theme.colors.deepIndigo,
                    padding: Theme.spacing.lg,
                    borderTopWidth: 1,
                    borderTopColor: Theme.colors.mistGray,
                }}
            >
                <HStack space="md" justifyContent="space-between" alignItems="center">
                    {/* Skip Button (only for skippable screens) */}
                    {currentScreenData.skippable ? (
                        <Pressable onPress={handleSkip}>
                            <Text color={Theme.colors.mistGray} size="md">
                                {t('onboarding.skip') || 'Skip'}
                            </Text>
                        </Pressable>
                    ) : (
                        <Box width={60} />
                    )}

                    {/* Screen Counter */}
                    <Text color={Theme.colors.mistGray} size="sm">
                        {currentScreen + 1} / {screens.length}
                    </Text>

                    {/* Next/Complete Button */}
                    <Button
                        size="md"
                        onPress={handleNext}
                        isDisabled={!canProceed}
                        sx={{
                            backgroundColor: canProceed
                                ? Theme.colors.sanctuarySaffron
                                : Theme.colors.mistGray,
                            borderRadius: Theme.corners.comfortable,
                            minWidth: 100,
                        }}
                    >
                        <ButtonText color={Theme.colors.white} fontWeight="$semibold">
                            {currentScreen === screens.length - 1
                                ? t('onboarding.complete') || 'Complete'
                                : t('onboarding.next') || 'Next'}
                        </ButtonText>
                        {currentScreen < screens.length - 1 && (
                            <ChevronRight size={18} color={Theme.colors.white} style={{ marginLeft: 4 }} />
                        )}
                    </Button>
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
                    {number}
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
            <Text fontSize={32}>{icon}</Text>
            <VStack space="xs" flex={1}>
                <Text color={Theme.colors.sanctuarySaffron} size="lg" fontWeight="$semibold">
                    {title}
                </Text>
                <Text color={Theme.colors.mistGray} size="md">
                    {description}
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
            <Text fontSize={24}>{icon}</Text>
            <VStack space="xs" flex={1}>
                <Text color={Theme.colors.sanctuarySaffron} size="md" fontWeight="$semibold">
                    {title}
                </Text>
                <Text color={Theme.colors.mistGray} size="sm">
                    {description}
                </Text>
            </VStack>
        </HStack>
    );
}
