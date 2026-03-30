import React from 'react';
import { TouchableOpacity, ScrollView } from 'react-native';
import { 
    VStack, 
    HStack, 
    Box, 
    Text, 
    Heading, 
    Button, 
    ButtonText, 
    Icon, 
    useTheme,
    useThemedColors,
    Theme,
    hapticLight
} from '@repo/ui';
import { 
    Zap, 
    Plus, 
    Search, 
    ChevronRight, 
    ShieldCheck, 
    ArrowRightCircle,
    School
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface TeacherOnboardingViewProps {
    onTryDemo: () => void;
    onCreateClassroom: () => void;
    onJoinSchool: () => void;
    isGuest: boolean;
}

export default function TeacherOnboardingView({ 
    onTryDemo, 
    onCreateClassroom, 
    onJoinSchool,
    isGuest 
}: TeacherOnboardingViewProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const { glass } = useTheme();

    return (
        <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ 
                padding: Theme.spacing.lg, 
                maxWidth: 800, 
                alignSelf: 'center',
                width: '100%' 
            }}
                    <VStack sx={{ gap: Theme.spacing.xl, paddingVertical: 40 }}                {/* Welcome Header */}
                <VStack sx={{ gap: 8, alignItems: 'center' }}                    <Box sx={{ 
                        padding: 16, 
                        borderRadius: 24, 
                        backgroundColor: 'rgba(212,132,58,0.1)',
                        marginBottom: 12
                    }}                        <Icon as={School} color={Theme.colors.sanctuarySaffron} size={40} /                    ></Box                    <Heading size="xl" color={colors.text} sx={{ textAlign: 'center' }}                        Welcome, Teacher
                    </Heading                    <Text sx={{ 
                        textAlign: 'center', 
                        color: colors.textSecondary, 
                        fontSize: 16,
                        maxWidth: 500 
                    }}                        Lead your students with digital tools designed for holistic growth. Create your workbench to begin.
                    </Text                </VStack
                {/* Primary Actions Grid */}
                <VStack sx={{ gap: Theme.spacing.lg }}                    
                    {/* Create Classroom Card */}
                    <TouchableOpacity 
                        onPress={() => {
                            hapticLight();
                            onCreateClassroom();
                        }}
                        activeOpacity={0.8}
                        style={{ width: '100%' }}
                                            <Box sx={{ 
                            padding: 24, 
                            borderRadius: 24, 
                            backgroundColor: 'white',
                            borderWidth: 1,
                            borderColor: colors.border,
                            ...Theme.shadows.md
                        }}                            <HStack sx={{ gap: 20, alignItems: 'center' }}                                <Box sx={{ 
                                    width: 64, 
                                    height: 64, 
                                    borderRadius: 20, 
                                    backgroundColor: Theme.colors.sanctuarySaffron,
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                }}                                    <Icon as={Plus} color="white" size={32} /                                ></Box                                <VStack sx={{ flex: 1, gap: 4 }}                                    <Heading size="md" color={colors.text}>Create New Classroom</Heading                                    ><Text sx={{ color: colors.textSecondary, fontSize: 14 }}                                        Establish a personal sanctuary for your students, manage lessons, and track holistic growth.
                                    </Text                                    {isGuest && (
                                        <HStack sx={{ gap: 4, alignItems: 'center', marginTop: 4 }}                                            <Icon as={ShieldCheck} size={14} color={Theme.colors.sanctuarySaffron} /                                            ><Text sx={{ fontSize: 12, color: Theme.colors.sanctuarySaffron, fontWeight: '600' }}                                                Requires Signup
                                            </Text                                        </HStack                                    )}
                                </VStack                                <Icon as={ChevronRight} color={colors.textTertiary} /                            ></HStack                        </Box                    </TouchableOpacity
                    {/* Join School Card */}
                    <TouchableOpacity 
                        onPress={() => {
                            hapticLight();
                            onJoinSchool();
                        }}
                        activeOpacity={0.8}
                        style={{ width: '100%' }}
                                            <Box sx={{ 
                            padding: 24, 
                            borderRadius: 24, 
                            backgroundColor: colors.tertiary,
                            borderWidth: 1,
                            borderColor: colors.border
                        }}                            <HStack sx={{ gap: 20, alignItems: 'center' }}                                <Box sx={{ 
                                    width: 64, 
                                    height: 64, 
                                    borderRadius: 20, 
                                    backgroundColor: colors.border,
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                }}                                    <Icon as={Search} color={colors.textSecondary} size={32} /                                ></Box                                <VStack sx={{ flex: 1, gap: 4 }}                                    <Heading size="sm" color={colors.text}>Join or Search School</Heading                                    ><Text sx={{ color: colors.textSecondary, fontSize: 14 }}                                        Connect with your institution to access shared resources and school-wide dashboards.
                                    </Text                                </VStack                                <Icon as={ChevronRight} color={colors.textTertiary} /                            ></HStack                        </Box                    </TouchableOpacity
                    {/* Try Demo Banner */}
                    <Box sx={{ 
                        marginTop: Theme.spacing.xl,
                        padding: 32, 
                        borderRadius: 32, 
                        backgroundColor: '#1A1A1A', 
                        overflow: 'hidden',
                        position: 'relative'
                    }}                        <Box sx={{
                            position: 'absolute',
                            right: -20,
                            top: -20,
                            width: 150,
                            height: 150,
                            borderRadius: 75,
                            backgroundColor: 'rgba(212,132,58,0.15)',
                            zIndex: 0
                        }} /
                        ><VStack sx={{ gap: 20, zIndex: 1, alignItems: 'center' }}                            <Box sx={{ 
                                padding: 12, 
                                borderRadius: 16, 
                                backgroundColor: 'rgba(255,255,255,0.1)'
                            }}                                <Icon as={Zap} color={Theme.colors.sanctuarySaffron} size={28} /                            ></Box                            <VStack sx={{ gap: 8, alignItems: 'center' }}                                <Heading size="lg" color="white" sx={{ textAlign: 'center' }}                                    Explore the Experience
                                </Heading                                <Text sx={{ 
                                    color: 'rgba(255,255,255,0.7)', 
                                    fontSize: 15, 
                                    textAlign: 'center',
                                    maxWidth: 400 
                                }}                                    Launch a sample teacher dashboard to witness how Gurudevi simplifies classroom orchestration.
                                </Text                            </VStack                            
                            <Button 
                                action="primary" 
                                onPress={() => {
                                    hapticLight();
                                    onTryDemo();
                                }}
                                sx={{ 
                                    backgroundColor: Theme.colors.sanctuarySaffron,
                                    paddingHorizontal: 32,
                                    height: 54,
                                    borderRadius: 27
                                }}
                                                            <ButtonText sx={{ fontWeight: '700', fontSize: 16 }}                                    Launch Teacher Sandbox
                                </ButtonText                                <Icon as={ArrowRightCircle} sx={{ marginLeft: 8 }} size={20} color="white" /                            ></Button                        </VStack                    </Box
                </VStack
                <Text sx={{ 
                    textAlign: 'center', 
                    color: colors.textTertiary, 
                    fontSize: 12,
                    marginTop: 20 
                }}                    Gurudevi Workbenches are designed for intentional teaching.
                </Text            </VStack        </ScrollView    );
}
