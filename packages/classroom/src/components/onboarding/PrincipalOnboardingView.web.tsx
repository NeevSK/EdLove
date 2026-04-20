import React from 'react';
import { 
    VStack, 
    HStack, 
    Box, 
    Text, 
    Heading, 
    Icon,
    Pressable
} from '@repo/ui';
import { 
    Plus, 
    Settings2, 
    Layout,
    Zap,
    Building2,
    ArrowRightCircle,
    Building
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
    
    const openFormBuilder = () => {
        // Open the builder in a new window/tab
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        if (baseUrl) {
            window.open(`${baseUrl}/classroom/FormBuilder`, '_blank');
        }
    };

    return (
        <VStack className="flex-1 bg-phase-canvas p-10 max-w-[1200px] self-center w-full gap-12">
            {/* Header */}
            <VStack className="gap-2 items-center">
                <Box className="p-4 rounded-generous bg-templeGold/10 mb-3">
                    <Icon as={Building2} className="text-templeGold" size="xl" />
                </Box>
                <Heading className="text-4xl font-black text-phaseText-primary text-center">
                    Welcome to Your Management Sanctuary
                </Heading>
                <Text className="text-phaseText-secondary text-lg max-w-[600px] text-center leading-relaxed font-medium">
                    Gurudevi provides principal-specific tools to monitor, manage, and grow your institutional resonance.
                </Text>
            </VStack>

            <HStack className="gap-8 flex-wrap justify-center">
                {/* Visual Form Builder Promotion */}
                <Box className="flex-1 min-w-[350px] p-8 bg-phase-surface rounded-generous border border-phase-canvas shadow-xl">
                    <VStack className="gap-6">
                        <HStack className="gap-4 items-center">
                            <Box className="p-3 bg-templeGold/10 rounded-comfortable">
                                <Icon as={Layout} className="text-templeGold" size="lg" />
                            </Box>
                            <Heading className="text-xl font-black text-phaseText-primary">Institutional Form Builder</Heading>
                        </HStack>
                        
                        <Text className="text-phaseText-secondary text-sm font-medium leading-relaxed">
                            Create bespoke data collection experiences for student registration, teacher feedback, and community polls. 
                            Professional, high-conversion forms that match your school's brand.
                        </Text>
                        
                        <Box className="p-4 bg-phase-canvas/50 rounded-comfortable border border-dashed border-phase-canvas flex-row items-center gap-3">
                            <Icon as={Zap} className="text-templeGold" size="xs" />
                            <Text className="text-xs text-phaseText-secondary font-black uppercase tracking-widest">
                                AI-powered curriculum alignment incoming
                            </Text>
                        </Box>

                        <Pressable 
                            onPress={openFormBuilder}
                            className="bg-templeGold h-14 rounded-full items-center justify-center shadow-lg shadow-templeGold/20 active:scale-95 transition-transform"
                        >
                            <HStack className="items-center gap-2">
                                <Plus color="white" size={20} />
                                <Text className="text-white font-black uppercase tracking-widest">Launch Visual Builder</Text>
                            </HStack>
                        </Pressable>
                    </VStack>
                </Box>

                {/* Core Onboarding Options */}
                <VStack className="flex-1 min-w-[350px] gap-6">
                    <Box className="p-8 bg-phase-surface rounded-generous border border-phase-canvas shadow-sm">
                        <VStack className="gap-6">
                            <Heading className="text-lg font-black text-phaseText-primary">Get Started</Heading>
                            <VStack className="gap-4">
                                <Pressable 
                                    onPress={onCreateSchool} 
                                    className="flex-row items-center p-4 bg-phase-canvas/50 rounded-comfortable border border-phase-canvas active:bg-phase-canvas transition-colors"
                                >
                                    <Icon as={Plus} className="mr-4 text-phaseText-primary" size="sm" />
                                    <Text className="text-phaseText-primary font-black">Create New School Profile</Text>
                                </Pressable>
                                
                                <Pressable 
                                    onPress={onJoinSchool} 
                                    className="flex-row items-center p-4 bg-phase-canvas/50 rounded-comfortable border border-phase-canvas active:bg-phase-canvas transition-colors"
                                >
                                    <Icon as={Settings2} className="mr-4 text-phaseText-primary" size="sm" />
                                    <Text className="text-phaseText-primary font-black">Claim Existing Institution</Text>
                                </Pressable>

                                <Pressable 
                                    onPress={onTryDemo}
                                    className="items-center p-4 active:opacity-60"
                                >
                                    <HStack className="items-center gap-2">
                                        <Text className="text-templeGold font-black uppercase tracking-widest text-sm">
                                            Explore Demo Sanctuary
                                        </Text>
                                        <ArrowRightCircle size={16} color="#D4843A" />
                                    </HStack>
                                </Pressable>
                            </VStack>
                        </VStack>
                    </Box>

                    <Box className="p-6 bg-phase-canvas/50 rounded-comfortable border border-phase-canvas">
                        <VStack className="gap-2">
                            <Heading className="text-sm font-black text-phaseText-primary uppercase tracking-widest">Platform Trust</Heading>
                            <Text className="text-[12px] text-phaseText-secondary font-medium leading-normal">
                                Your institutional data is protected by Gurudevi's sovereign encryption and local-first architecture.
                            </Text>
                        </VStack>
                    </Box>
                </VStack>
            </HStack>
        </VStack>
    );
}
