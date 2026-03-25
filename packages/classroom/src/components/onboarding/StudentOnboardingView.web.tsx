import React from 'react';
import { 
    VStack, 
    HStack, 
    Box, 
    Text, 
    Heading, 
    Button, 
    ButtonText, 
    Icon,
    useThemedColors,
    Theme
} from '@repo/ui';
import { 
    Search, 
    QrCode, 
    Sparkles, 
    GraduationCap,
    Zap,
    Layout
} from 'lucide-react-native';

interface StudentOnboardingViewProps {
    onTryDemo: () => void;
    onJoinClass: () => void;
    onFindSchool: () => void;
    isGuest: boolean;
}

export default function StudentOnboardingViewWeb({ 
    onTryDemo, 
    onJoinClass, 
    onFindSchool,
    isGuest 
}: StudentOnboardingViewProps) {
    const colors = useThemedColors();
    
    return (
        <VStack sx={{ 
            flex: 1, 
            backgroundColor: colors.backgroundDark, 
            padding: 40,
            maxWidth: 1200,
            alignSelf: 'center',
            width: '100%',
            gap: 48
        }}>
            {/* Header */}
            <VStack sx={{ gap: 8, alignItems: 'center', textAlign: 'center' }}>
                <Heading size="2xl">Your Learning Sanctuary Awaits</Heading>
                <Text sx={{ color: colors.textSecondary, maxWidth: 600 }}>
                    Join your classrooms, track your growth, and collaborate with your peers in a digitally empowered environment.
                </Text>
            </VStack>

            <HStack sx={{ gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
                {/* Digital Portfolio Promotion */}
                <Box sx={{ 
                    flex: 1, 
                    minWidth: 350,
                    padding: 32, 
                    backgroundColor: 'white', 
                    borderRadius: 32, 
                    borderWidth: 1, 
                    borderColor: colors.border,
                    ...Theme.shadows.lg,
                    gap: 20
                }}>
                    <HStack sx={{ gap: 12, alignItems: 'center' }}>
                        <Box sx={{ padding: 12, backgroundColor: Theme.colors.sanctuarySaffron + '22', borderRadius: 16 }}>
                            <Icon as={GraduationCap} color={Theme.colors.sanctuarySaffron} size={24} />
                        </Box>
                        <Heading size="md">Digital Portfolio & Growth</Heading>
                    </HStack>
                    
                    <Text sx={{ color: colors.textSecondary, fontSize: 14 }}>
                        Keep track of your achievements, submissions, and feedback in a beautiful digital portfolio. 
                        Watch your growth over time as you complete your learning quests.
                    </Text>

                    <Box sx={{ 
                        padding: 16, 
                        backgroundColor: colors.tertiary, 
                        borderRadius: 16,
                        borderStyle: 'dashed',
                        borderWidth: 1,
                        borderColor: colors.border
                    }}>
                        <HStack sx={{ gap: 12, alignItems: 'center' }}>
                            <Icon as={Sparkles} color={Theme.colors.amberGlow} size={16} />
                            <Text sx={{ fontSize: 13, color: colors.textSecondary, fontWeight: '500' }}>
                                Personalized learning paths coming soon...
                            </Text>
                        </HStack>
                    </Box>
                </Box>

                {/* Core Onboarding Options */}
                <VStack sx={{ flex: 1, minWidth: 350, gap: 16 }}>
                    <Box sx={{ 
                        padding: 24, 
                        backgroundColor: colors.tertiary, 
                        borderRadius: 24,
                        borderWidth: 1,
                        borderColor: colors.border,
                        gap: 16
                    }}>
                        <Heading size="sm">Get Started</Heading>
                        <VStack sx={{ gap: 12 }}>
                            <Button action="primary" onPress={onJoinClass} sx={{ borderRadius: 12, justifyContent: 'flex-start', backgroundColor: Theme.colors.sanctuarySaffron }}>
                                <Icon as={QrCode} color="white" sx={{ marginRight: 12 }} />
                                <ButtonText color="white">Join a Classroom</ButtonText>
                            </Button>
                            <Button variant="outline" onPress={onFindSchool} sx={{ borderRadius: 12, justifyContent: 'flex-start' }}>
                                <Icon as={Search} sx={{ marginRight: 12 }} />
                                <ButtonText>Find Your School</ButtonText>
                            </Button>
                            <Button variant="link" onPress={onTryDemo}>
                                <ButtonText sx={{ color: Theme.colors.sanctuarySaffron }}>Explore Student Sandbox</ButtonText>
                            </Button>
                        </VStack>
                    </Box>

                    <Box sx={{ 
                        padding: 24, 
                        backgroundColor: colors.tertiary, 
                        borderRadius: 24,
                        borderWidth: 1,
                        borderColor: colors.border,
                        gap: 12
                    }}>
                        <HStack sx={{ gap: 12, alignItems: 'center' }}>
                            <Icon as={Layout} color={colors.textSecondary} size={18} />
                            <Heading size="xs">Platform Sovereignty</Heading>
                        </HStack>
                        <Text sx={{ fontSize: 12, color: colors.textSecondary }}>
                            Your data and learning journey are yours. Gurudevi ensures a safe, private, and dignified environment for every student.
                        </Text>
                    </Box>
                </VStack>
            </HStack>
        </VStack>
    );
}
