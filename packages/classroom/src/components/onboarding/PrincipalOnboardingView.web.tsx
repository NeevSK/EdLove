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
    Plus, 
    Settings2, 
    Layout
} from 'lucide-react-native';

interface PrincipalOnboardingViewProps {
    onTryDemo: () => void;
    onCreateSchool: () => void;
    onJoinSchool: () => void;
    isGuest: boolean;
}

export default function PrincipalOnboardingViewWeb({ 
    onTryDemo, 
    onCreateSchool, 
    onJoinSchool,
    isGuest 
}: PrincipalOnboardingViewProps) {
    const colors = useThemedColors();
    
    const openFormBuilder = () => {
        // Open the builder in a new window/tab
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        if (baseUrl) {
            window.open(`${baseUrl}/classroom/FormBuilder`, '_blank');
        }
    };

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
            <VStack sx={{ gap: 8, alignItems: 'center' }}>
                <Heading size="2xl" sx={{ color: colors.text, textAlign: 'center' }}>Welcome to Your Management Sanctuary</Heading>
                <Text sx={{ color: colors.textSecondary, maxWidth: 600, textAlign: 'center' }}>
                    Gurudevi provides principal-specific tools to monitor, manage, and grow your institutional resonance.
                </Text>
            </VStack>

            <HStack sx={{ gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
                {/* Visual Form Builder Promotion */}
                <Box sx={{ 
                    flex: 1, 
                    minWidth: 350,
                    padding: 32, 
                    backgroundColor: 'white', 
                    borderRadius: 32, 
                    borderWidth: 1, 
                    borderColor: colors.border,
                    ...Theme.shadows.lg,
                }}>
                    <VStack sx={{ gap: 20 }}>
                        <HStack sx={{ gap: 12, alignItems: 'center' }}>
                            <Box sx={{ padding: 12, backgroundColor: Theme.colors.sanctuarySaffron + '22', borderRadius: 16 }}>
                                <Icon as={Layout} color={Theme.colors.sanctuarySaffron} size={24} />
                            </Box>
                            <Heading size="md" sx={{ color: colors.text }}>Institutional Form Builder</Heading>
                        </HStack>
                        
                        <Text sx={{ color: colors.textSecondary, fontSize: 14 }}>
                            Create bespoke data collection experiences for student registration, teacher feedback, and community polls. 
                            Professional, high-conversion forms that match your school's brand.
                        </Text>
                        
                        <Button 
                            action="primary" 
                            onPress={openFormBuilder}
                            sx={{ backgroundColor: Theme.colors.sanctuarySaffron, borderRadius: 16, height: 50 }}
                        >
                            <HStack sx={{ alignItems: 'center', gap: 8 }}>
                                <Icon as={Plus} color="white" />
                                <ButtonText sx={{ color: 'white' }}>Launch Visual Builder</ButtonText>
                            </HStack>
                        </Button>
                    </VStack>
                </Box>

                {/* Core Onboarding Options */}
                <VStack sx={{ flex: 1, minWidth: 350, gap: 16 }}>
                    <Box sx={{ 
                        padding: 24, 
                        backgroundColor: colors.tertiary, 
                        borderRadius: 24,
                        borderWidth: 1,
                        borderColor: colors.border,
                    }}>
                        <VStack sx={{ gap: 16 }}>
                            <Heading size="sm" sx={{ color: colors.text }}>Get Started</Heading>
                            <VStack sx={{ gap: 12 }}>
                                <Button variant="outline" onPress={onCreateSchool} sx={{ borderRadius: 12, justifyContent: 'flex-start', borderColor: colors.border }}>
                                    <Icon as={Plus} sx={{ marginRight: 12 }} />
                                    <ButtonText sx={{ color: colors.text }}>Create New School Profile</ButtonText>
                                </Button>
                                <Button variant="outline" onPress={onJoinSchool} sx={{ borderRadius: 12, justifyContent: 'flex-start', borderColor: colors.border }}>
                                    <Icon as={Settings2} sx={{ marginRight: 12 }} />
                                    <ButtonText sx={{ color: colors.text }}>Claim Existing Institution</ButtonText>
                                </Button>
                                <Button variant="link" onPress={onTryDemo}>
                                    <ButtonText sx={{ color: Theme.colors.sanctuarySaffron }}>Explore Demo Sanctuary</ButtonText>
                                </Button>
                            </VStack>
                        </VStack>
                    </Box>

                    <Box sx={{ 
                        padding: 24, 
                        backgroundColor: colors.tertiary, 
                        borderRadius: 24,
                        borderWidth: 1,
                        borderColor: colors.border,
                    }}>
                        <VStack sx={{ gap: 8 }}>
                            <Heading size="xs" sx={{ color: colors.text }}>Platform Trust</Heading>
                            <Text sx={{ fontSize: 12, color: colors.textSecondary }}>
                                Your institutional data is protected by Gurudevi's sovereign encryption and local-first architecture.
                            </Text>
                        </VStack>
                    </Box>
                </VStack>
            </HStack>
        </VStack>
    );
}
