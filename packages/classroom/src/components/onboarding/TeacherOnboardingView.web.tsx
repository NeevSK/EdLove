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
    Search, 
    BookOpen, 
    Users,
    Zap,
    Layout
} from 'lucide-react-native';

interface TeacherOnboardingViewProps {
    onTryDemo: () => void;
    onCreateClassroom: () => void;
    onJoinSchool: () => void;
    isGuest: boolean;
}

export default function TeacherOnboardingViewWeb({ 
    onTryDemo, 
    onCreateClassroom, 
    onJoinSchool,
    isGuest 
}: TeacherOnboardingViewProps) {
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
                <Heading size="2xl">Empower Your Teaching Sanctuary</Heading>
                <Text sx={{ color: colors.textSecondary, maxWidth: 600 }}>
                    Gurudevi provides teachers with AI-powered tools to manage classrooms, track student growth, and create engaging learning experiences.
                </Text>
            </VStack>

            <HStack sx={{ gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
                {/* Interactive Lesson Planner Promotion */}
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
                        <Box sx={{ padding: 12, backgroundColor: Theme.colors.gurudeviBlue + '22', borderRadius: 16 }}>
                            <Icon as={BookOpen} color={Theme.colors.gurudeviBlue} size={24} />
                        </Box>
                        <Heading size="md">Intelligent Lesson Planning</Heading>
                    </HStack>
                    
                    <Text sx={{ color: colors.textSecondary, fontSize: 14 }}>
                        Draft comprehensive lesson plans in seconds with AI assistance. 
                        Align your curriculum with national standards and generate interactive resources for your students.
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
                            <Icon as={Zap} color={Theme.colors.amberGlow} size={16} />
                            <Text sx={{ fontSize: 13, color: colors.textSecondary, fontWeight: '500' }}>
                                AI-powered curriculum alignment incoming...
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
                            <Button action="primary" onPress={onCreateClassroom} sx={{ borderRadius: 12, justifyContent: 'flex-start', backgroundColor: Theme.colors.gurudeviBlue }}>
                                <Icon as={Plus} color="white" sx={{ marginRight: 12 }} />
                                <ButtonText color="white">Create New Classroom</ButtonText>
                            </Button>
                            <Button variant="outline" onPress={onJoinSchool} sx={{ borderRadius: 12, justifyContent: 'flex-start' }}>
                                <Icon as={Search} sx={{ marginRight: 12 }} />
                                <ButtonText>Join Existing Sanctuary</ButtonText>
                            </Button>
                            <Button variant="link" onPress={onTryDemo}>
                                <ButtonText sx={{ color: Theme.colors.gurudeviBlue }}>Explore Teacher Sandbox</ButtonText>
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
                            <Icon as={Users} color={colors.textSecondary} size={18} />
                            <Heading size="xs">Community & Collaboration</Heading>
                        </HStack>
                        <Text sx={{ fontSize: 12, color: colors.textSecondary }}>
                            Connect with other educators in your sanctuary, share resources, and collaborate on institutional growth.
                        </Text>
                    </Box>
                </VStack>
            </HStack>
        </VStack>
    );
}
